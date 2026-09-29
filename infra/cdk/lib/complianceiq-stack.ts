import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export interface ComplianceIqStackProps extends cdk.StackProps {
  envName: string;
  imageUri: string;
  internalDomainName: string;
  bedrockModelId: string;
  awsRegionForApp: string;
  cpu: number;
  memoryMiB: number;
}

/**
 * ComplianceIQ — PRIVATE single-instance deployment (no public access).
 *
 * Topology:
 *   VPC (private + isolated subnets, no NAT needed for the internal path;
 *        NAT is included so the task can reach Bedrock/Tavily on the internet)
 *     └─ Internal Application Load Balancer (scheme=internal)  ← reachable only
 *        from inside the VPC / connected networks (VPN / Direct Connect / peering)
 *          └─ ECS Fargate Service (desiredCount=1, NO autoscaling this phase)
 *               • Task IAM role → bedrock:InvokeModel (no static AWS keys)
 *               • Tavily key injected from Secrets Manager
 *               • EFS mounted at /app/data (DATA_DIR) so admin edits persist
 *          └─ Route 53 PRIVATE hosted zone → friendly internal hostname
 *   CloudWatch Logs for the container.
 */
export class ComplianceIqStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComplianceIqStackProps) {
    super(scope, id, props);

    const {
      envName,
      imageUri,
      internalDomainName,
      bedrockModelId,
      awsRegionForApp,
      cpu,
      memoryMiB,
    } = props;

    // ---------------------------------------------------------------------
    // 1. Network — a VPC with private subnets. The ALB is INTERNAL (private).
    //    NAT gateways let the Fargate task reach Bedrock & Tavily (egress only);
    //    there is NO inbound path from the internet.
    // ---------------------------------------------------------------------
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1, // egress for the task to reach Bedrock/Tavily; set 0 if using VPC endpoints only
      subnetConfiguration: [
        { name: 'private-app', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
        { name: 'isolated-data', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });

    // ---------------------------------------------------------------------
    // 2. Secrets — the Tavily API key. Create the secret shell here; you set
    //    the actual value once via the AWS CLI/console (never in code/repo).
    // ---------------------------------------------------------------------
    const tavilySecret = new secretsmanager.Secret(this, 'TavilyApiKey', {
      secretName: `complianceiq/${envName}/tavily-api-key`,
      description: 'Tavily Search API key for ComplianceIQ web search / news',
    });

    // ---------------------------------------------------------------------
    // 3. Persistent data — EFS mounted at /app/data so admin edits to region
    //    JSON survive container restarts/redeploys.
    // ---------------------------------------------------------------------
    const fileSystem = new efs.FileSystem(this, 'DataFs', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      encrypted: true,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // keep data if the stack is deleted
      enableAutomaticBackups: true, // AWS Backup daily snapshots
    });

    const accessPoint = fileSystem.addAccessPoint('DataAp', {
      path: '/data',
      createAcl: { ownerGid: '1000', ownerUid: '1000', permissions: '750' },
      posixUser: { gid: '1000', uid: '1000' },
    });

    // ---------------------------------------------------------------------
    // 4. ECS cluster + Fargate task definition.
    // ---------------------------------------------------------------------
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsights: true,
    });

    const logGroup = new logs.LogGroup(this, 'AppLogs', {
      logGroupName: `/complianceiq/${envName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'ComplianceIQ task role — Bedrock invoke + read its own secret',
    });

    // Least-privilege: only Bedrock InvokeModel (and streaming variant).
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'BedrockInvoke',
        actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
        resources: ['*'], // Bedrock model ARNs vary by region/model; scope down if desired
      })
    );
    tavilySecret.grantRead(taskRole);

    const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      cpu,
      memoryLimitMiB: memoryMiB,
      taskRole,
      // executionRole is auto-created; it pulls the image from ECR + writes logs.
    });

    // Attach the EFS volume to the task definition.
    const volumeName = 'data';
    taskDef.addVolume({
      name: volumeName,
      efsVolumeConfiguration: {
        fileSystemId: fileSystem.fileSystemId,
        transitEncryption: 'ENABLED',
        authorizationConfig: { accessPointId: accessPoint.accessPointId, iam: 'ENABLED' },
      },
    });

    const container = taskDef.addContainer('App', {
      image: ecs.ContainerImage.fromRegistry(imageUri),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'app', logGroup }),
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        REGION: 'menat',
        DATA_DIR: '/app/data', // matches the volume mount + regionLoader resolution
        BEDROCK_MODEL_ID: bedrockModelId,
        AWS_REGION: awsRegionForApp,
      },
      secrets: {
        TAVILY_API_KEY: ecs.Secret.fromSecretsManager(tavilySecret),
      },
      portMappings: [{ containerPort: 3000 }],
    });

    container.addMountPoints({
      containerPath: '/app/data',
      sourceVolume: volumeName,
      readOnly: false,
    });

    // ---------------------------------------------------------------------
    // 5. Internal ALB (private) + Fargate service (single task).
    // ---------------------------------------------------------------------
    const albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc,
      description: 'ComplianceIQ internal ALB SG',
      allowAllOutbound: true,
    });
    // Allow HTTP(S) from within the VPC only (no internet). Adjust the CIDR to
    // your connected network range (VPN/Direct Connect) if narrower is desired.
    albSg.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(80), 'HTTP from within VPC');

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: false, // <-- PRIVATE / internal
      securityGroup: albSg,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1, // single instance — NO autoscaling this phase
      assignPublicIp: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      minHealthyPercent: 0, // single task: allow full replace on deploy
      maxHealthyPercent: 200,
      circuitBreaker: { rollback: true },
    });

    // Let the task's EFS mount + ALB traffic through security groups.
    fileSystem.connections.allowDefaultPortFrom(service);
    service.connections.allowFrom(alb, ec2.Port.tcp(3000), 'ALB to task');

    const listener = alb.addListener('Http', { port: 80, open: false });
    listener.addTargets('AppTarget', {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: '/api/health',
        healthyHttpCodes: '200',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
      },
      deregistrationDelay: cdk.Duration.seconds(15),
    });

    // ---------------------------------------------------------------------
    // 6. Route 53 PRIVATE hosted zone → friendly internal hostname.
    //    Resolvable only inside this VPC (and peered/VPN-connected networks).
    // ---------------------------------------------------------------------
    const zoneName = internalDomainName.split('.').slice(1).join('.') || 'internal';
    const privateZone = new route53.PrivateHostedZone(this, 'PrivateZone', {
      zoneName,
      vpc,
    });

    new route53.ARecord(this, 'AppRecord', {
      zone: privateZone,
      recordName: internalDomainName,
      target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(alb)),
    });

    // ---------------------------------------------------------------------
    // 7. Outputs — what you need after deploy.
    // ---------------------------------------------------------------------
    new cdk.CfnOutput(this, 'InternalAlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'Private ALB DNS name (reachable inside the VPC)',
    });
    new cdk.CfnOutput(this, 'InternalUrl', {
      value: `http://${internalDomainName}/`,
      description: 'Friendly internal URL (via Route53 private zone)',
    });
    new cdk.CfnOutput(this, 'TavilySecretName', {
      value: tavilySecret.secretName,
      description: 'Set the Tavily key here: aws secretsmanager put-secret-value',
    });
    new cdk.CfnOutput(this, 'EfsFileSystemId', {
      value: fileSystem.fileSystemId,
      description: 'EFS holding persistent /app/data',
    });
    new cdk.CfnOutput(this, 'VpcId', { value: vpc.vpcId });
  }
}

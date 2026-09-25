import { Regulation, SectorType, RegulatoryCategory } from './regulatory';

export type UserRoleType = 'admin' | 'compliance_officer' | 'risk_analyst' | 'auditor' | 'guest';

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRoleType;
  roleLabel: string;
  isAdmin: boolean;
  avatarInitials: string;
  jobTitle: string;
  organization: string;
  jurisdiction: string;
  countryFlag: string;
  status: 'active' | 'suspended';
  lastActive: string;
  dateCreated: string;
  permissions: {
    canTriggerScraper: boolean;
    canManageWatchlist: boolean;
    canExportReports: boolean;
    canEditControls: boolean;
    canAccessAdminPanel: boolean;
    canManageRegulations: boolean;
    canToggleFeatures: boolean;
    canManageUsers: boolean;
  };
}

export interface FeatureFlags {
  regulatoryFeed: boolean;
  aiCopilot: boolean;
  maturityHeatmap: boolean;
  regulatoryRoadmap: boolean;
  regulatoryTimeline: boolean;
  versionDiffs: boolean;
  controlsCrosswalk: boolean;
  regulationComparator: boolean;
  controlInterpreter: boolean;
  aiRedlining: boolean;
  sectorMatrix: boolean;
  sourcesManager: boolean;
  exportReports: boolean;
  watchlistAlerts: boolean;
  systemBroadcast: boolean;
  smartInsights: boolean;
}

export interface LinkSuggestion {
  id: string;
  regulationId: string;
  regulationCode: string;
  regulationName: string;
  linkType: 'officialUrl' | 'documentPdfUrl';
  currentUrl: string;
  suggestedUrl: string;
  notes?: string;
  submittedByUserId: string;
  submittedByUserName: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface SystemBroadcast {
  enabled: boolean;
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  author: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  actionType:
    | 'REGULATION_CREATED'
    | 'REGULATION_UPDATED'
    | 'REGULATION_DELETED'
    | 'REGULATION_LINK_UPDATED'
    | 'COUNTRY_CREATED'
    | 'COUNTRY_UPDATED'
    | 'COUNTRY_DELETED'
    | 'COUNTRIES_RESET'
    | 'FEATURE_TOGGLED'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_STATUS_CHANGED'
    | 'USER_SWITCHED'
    | 'BROADCAST_UPDATED'
    | 'BACKUP_EXPORTED'
    | 'BACKUP_RESTORED'
    | 'REGULATIONS_RESET'
    | 'SCRAPER_SOURCE_ADDED'
    | 'SCRAPER_TRIGGERED'
    | 'LINK_AUDIT_TRIGGERED'
    | 'REGULATORY_DOWNLOAD'
    | 'POLICY_REDLINING'
    | 'TIMELINE_EVENT_CREATED'
    | 'TIMELINE_EVENT_UPDATED'
    | 'TIMELINE_EVENT_DELETED'
    | 'TIMELINE_EVENTS_RESET'
    | 'TIMELINE_BATCH_APPLIED'
    | 'SYSTEM_CONFIG_UPDATED';
  targetEntity: string;
  details: string;
}

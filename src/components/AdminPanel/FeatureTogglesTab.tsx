import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FeatureFlags } from '../../types/admin';
import {
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Radio,
  Flame,
  TrendingUp,
  CalendarClock,
  GitCompare,
  Layers,
  Scale,
  Grid,
  Database,
  Download,
  BookmarkCheck,
  Megaphone,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  PenTool,
  BookOpen,
} from 'lucide-react';

interface FeatureMetadata {
  key: keyof FeatureFlags;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'Intelligence & AI' | 'Core Analytics' | 'Navigation & Discovery' | 'Operational & Exports';
  affectedViews: string[];
}

const FEATURE_METADATA_LIST: FeatureMetadata[] = [
  {
    key: 'regulatoryFeed',
    title: 'Live Regulatory Radar & News Grounding Feed',
    description:
      'Enables the real-time MENAT radar scanner, official gazette feeds, and Google Search Grounded regulatory intelligence streams.',
    icon: <Radio className="w-5 h-5 text-amber-400" />,
    category: 'Intelligence & AI',
    affectedViews: ['Navbar Radar Tab', 'RegulatoryRadar Component', 'Live Feeds'],
  },
  {
    key: 'geminiCopilot',
    title: 'Gemini AI Regulatory Copilot',
    description:
      'Provides conversational AI compliance advisory powered by Gemini 2.5 with live search grounding across 24 MENAT jurisdictions.',
    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
    category: 'Intelligence & AI',
    affectedViews: ['Navbar AI Copilot Button', 'GeminiComplianceChatbot Modal', 'Card Quick Explanations'],
  },
  {
    key: 'maturityHeatmap',
    title: 'Compliance Maturity Heatmap (D3.js)',
    description:
      'Interactive D3 cross-country heatmap charting cybersecurity, AI, data privacy, and operational resilience maturity scores.',
    icon: <Flame className="w-5 h-5 text-orange-400" />,
    category: 'Core Analytics',
    affectedViews: ['Navbar Heatmap Tab', 'ComplianceMaturityHeatmap View'],
  },
  {
    key: 'regulatoryRoadmap',
    title: 'Regulatory Roadmap & Investment Model',
    description:
      'Quarterly multi-year implementation progression visualizer and compliance capital expenditure (CapEx / OpEx) forecasting engine.',
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    category: 'Core Analytics',
    affectedViews: ['Navbar Roadmap Tab', 'RegulatoryRoadmap View', 'Quarterly Projections'],
  },
  {
    key: 'controlsCrosswalk',
    title: 'NIST CSF, ISO 27001 & CSA CCM Controls Crosswalk',
    description:
      'Side-by-side control mapping aligning MENAT statutory frameworks (NCA ECC, SAMA, CBUAE, etc.) with international baselines.',
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
    category: 'Core Analytics',
    affectedViews: ['Navbar Controls Tab', 'ControlsCrosswalk Component'],
  },
  {
    key: 'regulationComparator',
    title: 'Cross-Regulation Overlap & LOE Comparator',
    description:
      'Enables side-by-side comparison between 2 regulations to compute rough order of magnitude overlap, LOE assessment effort, similar controls count, and unrelated domain alerts.',
    icon: <Scale className="w-5 h-5 text-indigo-400" />,
    category: 'Core Analytics',
    affectedViews: ['Navbar Compare Tab', 'RegulationComparator View', 'Card Quick Compare'],
  },
  {
    key: 'controlInterpreter',
    title: 'Control & Sub-Control Interpreter',
    description:
      'Breaks down statutory control requirements into People, Process, and Technical checks, with multi-standard crosswalks (NIST 800-53, CSF v2, ISO 27001, CIS, CSA CCM v4.1).',
    icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
    category: 'Intelligence & AI',
    affectedViews: ['Navbar Interpreter Tab', 'ControlInterpreter View', 'RegulationCard Interpret Clause Action'],
  },
  {
    key: 'aiRedlining',
    title: 'AI Policy Redlining & Gap Detection Engine',
    description:
      'Uploads draft internal compliance policies and compares against statutory controls in real time to identify, highlight, and rewrite non-compliant or missing clauses.',
    icon: <PenTool className="w-5 h-5 text-rose-400" />,
    category: 'Intelligence & AI',
    affectedViews: ['Navbar AI Redlining Tab', 'AIRedliningComponent View', 'Policy Gap Analysis'],
  },
  {
    key: 'sectorMatrix',
    title: 'Cross-Sector Compliance Matrix',
    description:
      'Sectoral coverage grid analyzing Banking, FinTech, Critical Infrastructure, Telco, Energy, and Government statutory exposure.',
    icon: <Grid className="w-5 h-5 text-teal-400" />,
    category: 'Core Analytics',
    affectedViews: ['Navbar Sectors Tab', 'SectorMatrix View'],
  },
  {
    key: 'regulatoryTimeline',
    title: 'Regulatory Timeline & Statutory Milestones',
    description:
      'Chronological milestone roadmap of passed laws, transitional grace periods, and upcoming mandatory enforcement deadlines.',
    icon: <CalendarClock className="w-5 h-5 text-purple-400" />,
    category: 'Navigation & Discovery',
    affectedViews: ['Navbar Timeline Tab', 'RegulatoryTimeline Component'],
  },
  {
    key: 'versionDiffs',
    title: 'Regulatory Version Diffs & Change Log Engine',
    description:
      'Side-by-side delta comparator analyzing statutory amendments (e.g. SAMA Cybersecurity Framework v1 vs v2, Saudi PDPL iterations).',
    icon: <GitCompare className="w-5 h-5 text-cyan-400" />,
    category: 'Navigation & Discovery',
    affectedViews: ['Navbar Version Diffs Tab', 'VersionDiffViewer Component'],
  },
  {
    key: 'sourcesManager',
    title: 'Official Gazette Sources & Scraper Crawler',
    description:
      'Registry of tracked official ministerial gazettes, central banks, and automated 48-hour compliance crawling schedules.',
    icon: <Database className="w-5 h-5 text-sky-400" />,
    category: 'Operational & Exports',
    affectedViews: ['Navbar Sources Tab', 'TrackedSourcesManager View', 'Manual Sync Button'],
  },
  {
    key: 'exportReports',
    title: 'Compliance Dossier Export (PDF / CSV / JSON)',
    description:
      'Executive reporting engine generating multi-jurisdiction compliance attestation documents, spreadsheets, and data feeds.',
    icon: <Download className="w-5 h-5 text-emerald-400" />,
    category: 'Operational & Exports',
    affectedViews: ['Navbar Export Button', 'ExportModal Component'],
  },
  {
    key: 'watchlistAlerts',
    title: 'Personalized Watchlist & Pinned Regulations',
    description:
      'Allows compliance officers to pin statutory instruments, customize notification urgency thresholds, and monitor updates.',
    icon: <BookmarkCheck className="w-5 h-5 text-amber-400" />,
    category: 'Operational & Exports',
    affectedViews: ['Navbar Watchlist Tab', 'Watchlist Notification Bell', 'Card Pin Controls'],
  },
  {
    key: 'systemBroadcast',
    title: 'Global System Advisory Banner',
    description:
      'Top-level broadcast banner broadcasting statutory audit deadlines, urgent ministerial circulars, or maintenance notifications.',
    icon: <Megaphone className="w-5 h-5 text-rose-400" />,
    category: 'Operational & Exports',
    affectedViews: ['Top SystemBroadcastBanner across all screens'],
  },
];

export const FeatureTogglesTab: React.FC = () => {
  const { featureFlags, toggleFeature, resetFeatureFlags } = useAdmin();

  const enabledCount = Object.values(featureFlags).filter(Boolean).length;
  const totalCount = Object.keys(featureFlags).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Modular Platform Feature Toggles</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {enabledCount} of {totalCount} Enabled
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Control platform capabilities in real time. Disabling a feature removes its navigation
            link, shortcuts, and modal triggers across all user sessions instantly.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={resetFeatureFlags}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset All to Default</span>
          </button>
        </div>
      </div>

      {/* Grid of Feature Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURE_METADATA_LIST.map((meta) => {
          const isEnabled = featureFlags[meta.key];

          return (
            <div
              key={meta.key}
              className={`p-4 rounded-xl border transition-all ${
                isEnabled
                  ? 'bg-slate-900/90 border-slate-700 shadow-xs'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      isEnabled
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {meta.title}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isEnabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isEnabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle Button */}
                <button
                  onClick={() => toggleFeature(meta.key)}
                  className={`p-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                    isEnabled
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                  title={isEnabled ? `Disable ${meta.title}` : `Enable ${meta.title}`}
                >
                  {isEnabled ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* Affected views pill row */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono">Category: {meta.category}</span>
                <span className="truncate ml-2 text-slate-400">
                  Target: {meta.affectedViews[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

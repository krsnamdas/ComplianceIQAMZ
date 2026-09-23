import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Download,
  Radio,
  Globe2,
  BookOpen,
  Layers,
  GitCompare,
  Scale,
  Database,
  CalendarClock,
  BookmarkCheck,
  Bell,
  Flame,
  Sparkles,
  Lock,
  TrendingUp,
  Sliders,
  ShieldAlert,
  PenTool,
} from 'lucide-react';
import { useRBAC } from '../context/RBACContext';
import { useAdmin } from '../context/AdminContext';
import { UserAccountSwitcher } from './UserAccountSwitcher';
import { ComplianceIQLogo } from './ComplianceIQLogo';

export type NavigationTab =
  | 'overview'
  | 'regulations'
  | 'interpreter'
  | 'ai_redline'
  | 'compare'
  | 'maturity_heatmap'
  | 'watchlist'
  | 'roadmap'
  | 'timeline'
  | 'version_diffs'
  | 'controls'
  | 'radar'
  | 'sectors'
  | 'sources'
  | 'admin';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onTriggerScrape: () => void;
  onOpenExport: () => void;
  onOpenAIChat?: () => void;
  isScraping: boolean;
  totalRegulations: number;
  watchlistCount?: number;
  unreadNotificationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onTriggerScrape,
  onOpenExport,
  onOpenAIChat,
  isScraping,
  totalRegulations,
  watchlistCount = 0,
  unreadNotificationsCount = 0,
}) => {
  const { canTriggerScraper, triggerRestrictedAction } = useRBAC();
  const { featureFlags, isCurrentUserAdmin, currentUser } = useAdmin();

  const handleScrapeClick = () => {
    if (!canTriggerScraper) {
      triggerRestrictedAction(
        'Trigger Official Portal Crawler',
        'Executing on-demand regulatory web scraper requests is restricted to Compliance Managers and Administrators to prevent unauthorized portal traffic. Switch account to run manual syncs.'
      );
      return;
    }
    onTriggerScrape();
  };

  const handleExportClick = () => {
    onOpenExport();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('overview')}
            title="ComplianceIQ - Return to Jurisdictions Overview"
          >
            <ComplianceIQLogo size={38} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Compliance<span className="text-cyan-400">IQ</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider font-mono">
                  Advisory
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Middle East, North Africa &amp; Türkiye Regulations &amp; Controls 
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Jurisdictions</span>
            </button>

            <button
              onClick={() => setActiveTab('regulations')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'regulations'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Registry</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                {totalRegulations}
              </span>
            </button>

            {/* CONTROL INTERPRETER (Requirement Breakdown & NIST / ISO / CIS / CCM Alignment) */}
            {featureFlags.controlInterpreter !== false && (
              <button
                onClick={() => setActiveTab('interpreter')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'interpreter'
                    ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/60 shadow-sm'
                    : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40 border border-indigo-500/20'
                }`}
                title="Interactive Control & Sub-Control Interpreter"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interpreter</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 uppercase font-mono font-bold">
                  AI
                </span>
              </button>
            )}

            {/* AI POLICY REDLINING & GAP DETECTION (Gated by Feature Flag) */}
            {featureFlags.aiRedlining !== false && (
              <button
                onClick={() => setActiveTab('ai_redline')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'ai_redline'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-sm'
                    : 'text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-500/20'
                }`}
                title="Upload draft policy and benchmark against statutory controls in real time"
              >
                <PenTool className="w-3.5 h-3.5 text-rose-400" />
                <span>AI Redlining</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 uppercase font-mono font-bold">
                  NEW
                </span>
              </button>
            )}

            {/* COMPLIANCE MATURITY HEATMAP (Gated by Feature Flag) */}
            {featureFlags.maturityHeatmap && (
              <button
                onClick={() => setActiveTab('maturity_heatmap')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'maturity_heatmap'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Flame
                  className={`w-3.5 h-3.5 ${
                    activeTab === 'maturity_heatmap' ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>Heatmap</span>
              </button>
            )}

            {/* WATCHLIST (Gated by Feature Flag) */}
            {featureFlags.watchlistAlerts && (
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 relative cursor-pointer ${
                  activeTab === 'watchlist'
                    ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BookmarkCheck
                  className={`w-3.5 h-3.5 ${
                    activeTab === 'watchlist' ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>Watchlist</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {watchlistCount}
                </span>
                {unreadNotificationsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                )}
              </button>
            )}

            {/* REGULATORY ROADMAP (Gated by Feature Flag) */}
            {featureFlags.regulatoryRoadmap && (
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'roadmap'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <TrendingUp
                  className={`w-3.5 h-3.5 ${
                    activeTab === 'roadmap' ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>Roadmap</span>
              </button>
            )}

            {/* TIMELINE (Gated by Feature Flag) */}
            {featureFlags.regulatoryTimeline && (
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Timeline</span>
              </button>
            )}

            {/* VERSION DIFFS (Gated by Feature Flag) */}
            {featureFlags.versionDiffs && (
              <button
                onClick={() => setActiveTab('version_diffs')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'version_diffs'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Diffs</span>
              </button>
            )}

            {/* CONTROLS CROSSWALK (Gated by Feature Flag) */}
            {featureFlags.controlsCrosswalk && (
              <button
                onClick={() => setActiveTab('controls')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'controls'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Controls</span>
              </button>
            )}

            {/* CROSS-REGULATION COMPARATOR (Gated by Feature Flag) */}
            {featureFlags.regulationComparator !== false && (
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'compare'
                    ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
                title="Cross-Regulation Overlap & Assessment LOE Comparator"
              >
                <Scale
                  className={`w-3.5 h-3.5 ${
                    activeTab === 'compare' ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                <span>Compare</span>
              </button>
            )}

            {/* SECTORS (Gated by Feature Flag) */}
            {featureFlags.sectorMatrix && (
              <button
                onClick={() => setActiveTab('sectors')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'sectors'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>Sectors</span>
              </button>
            )}

            {/* REGULATORY FEED / RADAR (Gated by Feature Flag) */}
            {featureFlags.regulatoryFeed && (
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'radar'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Radar</span>
              </button>
            )}

            {/* SOURCES (Gated by Feature Flag) */}
            {featureFlags.sourcesManager && (
              <button
                onClick={() => setActiveTab('sources')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'sources'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sources</span>
              </button>
            )}

            {/* BACKEND ADMIN CONSOLE TAB BUTTON */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-500/60 shadow-sm'
                  : isCurrentUserAdmin
                  ? 'bg-amber-950/30 text-amber-400 hover:bg-amber-950/60 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Open Backend Admin Console (Regulations, Toggles, Users, Advisories)"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Console</span>
              {isCurrentUserAdmin && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Action Buttons & Simulated IAM User Switcher */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* User Account Switcher Dropdown (4 Normal + 2 Admin) */}
            <UserAccountSwitcher onOpenAdminPanel={() => setActiveTab('admin')} />

            {/* Watchlist Alerts Bell Shortcut */}
            {featureFlags.watchlistAlerts && (
              <button
                onClick={() => setActiveTab('watchlist')}
                className="relative p-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="View Watchlist Specialized Alerts"
              >
                <Bell className="w-4 h-4 text-indigo-400" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold border border-slate-900 animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Scraper Sync Button (Gated by Feature Flag & Permissions) */}
            {featureFlags.sourcesManager && (
              <button
                onClick={handleScrapeClick}
                disabled={isScraping}
                title={
                  !canTriggerScraper
                    ? 'Scraper triggering restricted to Compliance Officers & Admins'
                    : 'Execute immediate check on official regulatory portals'
                }
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                  !canTriggerScraper
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-700/80 hover:border-amber-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                } disabled:opacity-50`}
              >
                {!canTriggerScraper ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isScraping ? 'animate-spin text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                )}
                <span className="hidden sm:inline">
                  {isScraping ? 'Syncing...' : canTriggerScraper ? 'Sync' : 'Locked'}
                </span>
              </button>
            )}

            {/* Gemini Copilot (Gated by Feature Flag) */}
            {featureFlags.geminiCopilot && onOpenAIChat && (
              <button
                onClick={onOpenAIChat}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                title="Launch Gemini Regulatory AI Copilot (Google Search Grounded)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>
            )}

            {/* Export Button (Gated by Feature Flag) */}
            {featureFlags.exportReports && (
              <button
                onClick={handleExportClick}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                title="Bulk Export Compliance Report (PDF / CSV / JSON)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="xl:hidden flex border-t border-slate-800 overflow-x-auto px-4 py-2 space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          Jurisdictions
        </button>

        <button
          onClick={() => setActiveTab('regulations')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'regulations'
              ? 'bg-slate-800 text-emerald-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          Registry
        </button>

        {featureFlags.controlInterpreter !== false && (
          <button
            onClick={() => setActiveTab('interpreter')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer font-bold ${
              activeTab === 'interpreter'
                ? 'bg-indigo-900/80 text-indigo-300 font-bold'
                : 'text-indigo-400'
            }`}
          >
            ✨ Interpreter
          </button>
        )}

        {featureFlags.aiRedlining !== false && (
          <button
            onClick={() => setActiveTab('ai_redline')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer font-bold ${
              activeTab === 'ai_redline'
                ? 'bg-rose-950/90 text-rose-300 font-bold border border-rose-500/50'
                : 'text-rose-400'
            }`}
          >
            🖋️ AI Redlining
          </button>
        )}

        {featureFlags.maturityHeatmap && (
          <button
            onClick={() => setActiveTab('maturity_heatmap')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-semibold flex items-center space-x-1 cursor-pointer ${
              activeTab === 'maturity_heatmap'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            <Flame className="w-3 h-3 text-emerald-400" />
            <span>Heatmap</span>
          </button>
        )}

        {featureFlags.watchlistAlerts && (
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-semibold flex items-center space-x-1 cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-slate-800 text-amber-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            <span>Watchlist</span>
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
              {watchlistCount}
            </span>
          </button>
        )}

        {featureFlags.regulatoryRoadmap && (
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-semibold flex items-center space-x-1 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Roadmap</span>
          </button>
        )}

        {featureFlags.regulatoryTimeline && (
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            Timeline
          </button>
        )}

        {featureFlags.versionDiffs && (
          <button
            onClick={() => setActiveTab('version_diffs')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
              activeTab === 'version_diffs'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            Diffs
          </button>
        )}

        {featureFlags.controlsCrosswalk && (
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            Controls
          </button>
        )}

        {featureFlags.regulationComparator !== false && (
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-semibold cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-slate-800 text-indigo-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            Compare
          </button>
        )}

        {featureFlags.sectorMatrix && (
          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
              activeTab === 'sectors'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            Sectors
          </button>
        )}

        {featureFlags.regulatoryFeed && (
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-semibold flex items-center space-x-1 cursor-pointer ${
              activeTab === 'radar' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Radar</span>
          </button>
        )}

        {featureFlags.sourcesManager && (
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
              activeTab === 'sources'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            Sources
          </button>
        )}

        {/* Admin Console in mobile bar */}
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-bold flex items-center space-x-1 cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-amber-900/60 text-amber-300 border border-amber-500/50'
              : 'text-amber-400 bg-amber-950/30'
          }`}
        >
          <Sliders className="w-3 h-3 text-amber-400" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};

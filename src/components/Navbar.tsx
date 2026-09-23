import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
  HelpCircle,
  BellRing,
} from 'lucide-react';
import { useRBAC } from '../context/RBACContext';
import { useAdmin } from '../context/AdminContext';
import { UserAccountSwitcher } from './UserAccountSwitcher';
import { ComplianceIQLogo } from './ComplianceIQLogo';
import { ScraperStatus } from '../types/regulatory';

export type NavigationTab =
  | 'overview'
  | 'digest'
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
  onRequestLogin?: (targetTab: NavigationTab) => void;
  onTriggerScrape: () => void;
  onOpenExport: () => void;
  onOpenAIChat?: () => void;
  isScraping: boolean;
  totalRegulations: number;
  watchlistCount?: number;
  unreadNotificationsCount?: number;
  scraperStatus?: ScraperStatus;
}

interface MenuItemDef {
  id: NavigationTab;
  label: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  enabled?: boolean;
}

interface MenuGroupDef {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItemDef[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRequestLogin,
  onTriggerScrape,
  onOpenExport,
  onOpenAIChat,
  isScraping,
  totalRegulations,
  watchlistCount = 0,
  unreadNotificationsCount = 0,
  scraperStatus,
}) => {
  const { canTriggerScraper, triggerRestrictedAction } = useRBAC();
  const { featureFlags, isCurrentUserAdmin, isAuthenticated } = useAdmin();

  // Active open dropdown in desktop menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<NavigationTab | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Define hierarchical menu categories
  const menuGroups: MenuGroupDef[] = [
    {
      id: 'coverage',
      title: 'Coverage & Registry',
      shortTitle: 'Registry',
      icon: Globe2,
      items: [
        {
          id: 'overview',
          label: 'Jurisdictions Map & Matrix',
          badge: '24 Nations',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: Globe2,
          description: 'Interactive MENAT coverage map, sovereign authorities, and statutory readiness index.',
          enabled: true,
        },
        {
          id: 'regulations',
          label: 'Statutory Registry',
          badge: `${totalRegulations} Acts`,
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          icon: BookOpen,
          description: 'Comprehensive repository of active cybersecurity, privacy, and fintech laws.',
          enabled: true,
        },
        {
          id: 'sectors',
          label: 'Sectoral Matrix',
          badge: 'Sectors',
          badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
          icon: Layers,
          description: 'Cross-sector breakdown across Banking, Healthcare, Telecom, Cloud & Gov.',
          enabled: featureFlags.sectorMatrix !== false,
        },
      ],
    },
    {
      id: 'audit',
      title: 'AI & Audit Tools',
      shortTitle: 'AI & Audit',
      icon: Sparkles,
      items: [
        {
          id: 'ai_redline',
          label: 'AI Policy Redlining',
          badge: 'NEW',
          badgeColor: 'bg-rose-500/25 text-rose-300 border-rose-500/40 font-bold',
          icon: PenTool,
          description: 'Upload draft internal policies to identify gaps and missing clauses against official regulations in real time.',
          enabled: featureFlags.aiRedlining !== false,
        },
        {
          id: 'interpreter',
          label: 'Control Interpreter',
          badge: 'AI',
          badgeColor: 'bg-indigo-500/25 text-indigo-300 border-indigo-500/40 font-bold',
          icon: Sparkles,
          description: 'Interactive breakdown of regulatory sub-controls aligned to NIST CSF, ISO 27001, CIS & CCM.',
          enabled: featureFlags.controlInterpreter !== false,
        },
        {
          id: 'compare',
          label: 'Cross-Regulation Comparator',
          badge: 'Compare',
          badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
          icon: Scale,
          description: 'Side-by-side assessment of control overlap percentages and audit Level of Effort (LOE).',
          enabled: featureFlags.regulationComparator !== false,
        },
        {
          id: 'controls',
          label: 'Unified Controls Catalog',
          badge: 'Crosswalk',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: ShieldAlert,
          description: 'Master crosswalk of statutory controls, implementation baselines & guidance.',
          enabled: featureFlags.controlsCrosswalk !== false,
        },
      ],
    },
    {
      id: 'intelligence',
      title: 'Intelligence & Radar',
      shortTitle: 'Intelligence',
      icon: Radio,
      items: [
        {
          id: 'digest',
          label: 'Regional Regulatory Digest',
          badge: 'ALERTS',
          badgeColor: 'bg-rose-500/25 text-rose-300 border-rose-500/40 font-bold',
          icon: BellRing,
          description: 'Personalized high-priority alerts for your subscribed MENAT jurisdictions and industry sectors.',
          enabled: true,
        },
        {
          id: 'radar',
          label: 'Regulatory Radar & Feed',
          badge: 'LIVE',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
          icon: Radio,
          description: 'Continuous gazette monitoring, ministerial circular feeds, and enforcement intelligence.',
          enabled: featureFlags.regulatoryFeed !== false,
        },
        {
          id: 'maturity_heatmap',
          label: 'Compliance Maturity Heatmap',
          badge: 'Heatmap',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: Flame,
          description: 'National cybersecurity governance and data privacy readiness benchmarks across 24 countries.',
          enabled: featureFlags.maturityHeatmap !== false,
        },
        {
          id: 'watchlist',
          label: 'Watchlist & Trackers',
          badge: watchlistCount > 0 ? `${watchlistCount} tracked` : 'Trackers',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: BookmarkCheck,
          description: 'Personalized regulation trackers with instant alerts for amendments and enforcement deadlines.',
          enabled: featureFlags.watchlistAlerts !== false,
        },
        {
          id: 'roadmap',
          label: 'Enactment Roadmap',
          badge: 'Deadlines',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
          icon: TrendingUp,
          description: 'Strategic compliance countdowns, enforcement milestones, and grace period roadmaps.',
          enabled: featureFlags.regulatoryRoadmap !== false,
        },
        {
          id: 'timeline',
          label: 'Legislative Timeline',
          badge: 'History',
          badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
          icon: CalendarClock,
          description: 'Chronological enactment milestones, royal decrees, and historical statutory versions.',
          enabled: featureFlags.regulatoryTimeline !== false,
        },
        {
          id: 'version_diffs',
          label: 'Statutory Version Diffs',
          badge: 'Diffs',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          icon: GitCompare,
          description: 'Line-by-line statutory revision comparison showing added, deleted, and modified articles.',
          enabled: featureFlags.versionDiffs !== false,
        },
      ],
    },
    {
      id: 'governance',
      title: 'Sources & Governance',
      shortTitle: 'Sources & Admin',
      icon: Database,
      items: [
        {
          id: 'sources',
          label: 'Tracked Official Sources',
          badge: '67+ Portals',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          icon: Database,
          description: 'Directory of verified national gazettes, central bank portals, and crawler status.',
          enabled: featureFlags.sourcesManager !== false,
        },
        {
          id: 'admin',
          label: 'Admin Console & Toggles',
          badge: isCurrentUserAdmin ? 'ADMIN' : 'IAM',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
          icon: Sliders,
          description: 'System feature toggles, live regulation CMS editor, role permissions (RBAC), and crawler controls.',
          enabled: true,
        },
      ],
    },
  ];

  // Helper to determine if a group contains the currently active tab
  const isGroupActive = (group: MenuGroupDef) => {
    return group.items.some((item) => item.enabled !== false && item.id === activeTab);
  };

  const handleSelectTab = (tab: NavigationTab) => {
    if (!isAuthenticated && tab !== 'overview') {
      setOpenDropdown(null);
      setMobileMenuOpen(false);
      if (onRequestLogin) {
        onRequestLogin(tab);
      }
      return;
    }
    setActiveTab(tab);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => handleSelectTab('overview')}
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
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Middle East, North Africa &amp; Türkiye Regulations &amp; Controls
              </p>
            </div>
          </div>

          {/* Desktop Hierarchical Dropdown Navigation */}
          <nav ref={navRef} className="hidden lg:flex items-center space-x-1.5 relative">
            {menuGroups.map((group) => {
              const active = isGroupActive(group);
              const isOpen = openDropdown === group.id;
              const GroupIcon = group.icon;
              const visibleItems = group.items.filter((item) => item.enabled !== false);

              if (visibleItems.length === 0) return null;

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(group.id)}
                  onMouseLeave={() => {
                    setOpenDropdown(null);
                    setHoveredItem(null);
                  }}
                >
                  {/* Top-Level Group Button */}
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    aria-expanded={isOpen}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer border ${
                      active
                        ? 'bg-slate-800 text-emerald-400 border-slate-700 shadow-sm'
                        : isOpen
                        ? 'bg-slate-800/80 text-white border-slate-700'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
                    }`}
                  >
                    <GroupIcon
                      className={`w-3.5 h-3.5 ${
                        active ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{group.title}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* Hierarchical Dropdown Menu */}
                  {isOpen && (
                    <div
                      className="absolute left-0 mt-1 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
                      role="menu"
                    >
                      {/* Menu Header with Category Hint */}
                      <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <GroupIcon className="w-3 h-3 text-cyan-400" />
                          <span>{group.title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {visibleItems.length} modules
                        </span>
                      </div>

                      {/* Dropdown Items List */}
                      <div className="py-1 space-y-1">
                        {visibleItems.map((item) => {
                          const isItemActive = activeTab === item.id;
                          const ItemIcon = item.icon;
                          const isHovered = hoveredItem === item.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectTab(item.id)}
                              onMouseEnter={() => setHoveredItem(item.id)}
                              className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start space-x-3 cursor-pointer group border ${
                                isItemActive
                                  ? 'bg-slate-800/90 text-white border-slate-700 shadow-sm'
                                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border-transparent'
                              }`}
                              title={item.description}
                            >
                              <div
                                className={`p-1.5 rounded-md shrink-0 mt-0.5 transition-colors ${
                                  isItemActive
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-800 text-slate-400 group-hover:text-emerald-300 group-hover:bg-slate-700'
                                }`}
                              >
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className={`text-xs font-semibold truncate ${
                                      isItemActive ? 'text-emerald-400 font-bold' : 'text-slate-200'
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.2 rounded border font-mono shrink-0 ${
                                        item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {/* Brief Explanation directly visible */}
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug group-hover:text-slate-300">
                                  {item.description}
                                </p>
                              </div>
                              {isItemActive && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Interactive Explanation Box at bottom of dropdown for highlighted item */}
                      {hoveredItem && (
                        <div className="mt-1 pt-2 px-3 py-2 border-t border-slate-800/80 bg-slate-950/60 rounded-b-lg">
                          <div className="flex items-start space-x-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-cyan-200/90 leading-relaxed font-medium">
                              {visibleItems.find((i) => i.id === hoveredItem)?.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Action Buttons & Simulated IAM User Switcher */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* User Account Switcher Dropdown or Guest Sign In */}
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => onRequestLogin ? onRequestLogin('regulations') : handleSelectTab('regulations')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Sign in with user credentials"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <UserAccountSwitcher onOpenAdminPanel={() => handleSelectTab('admin')} />
            )}

            {/* Watchlist Alerts Bell Shortcut */}
            {featureFlags.watchlistAlerts && (
              <button
                type="button"
                onClick={() => handleSelectTab('watchlist')}
                className="relative p-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="View Watchlist Specialized Alerts & Trackers"
              >
                <Bell className="w-4 h-4 text-indigo-400" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold border border-slate-900 animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Scraper Sync Button & Live Status */}
            {featureFlags.sourcesManager && (
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleScrapeClick}
                  disabled={isScraping}
                  title={
                    !canTriggerScraper
                      ? 'Scraper triggering restricted to Compliance Officers & Admins'
                      : `Weekly Automated Scraper Active. Last Scraped: ${
                          scraperStatus?.lastRegulationsScrapeTime
                            ? new Date(scraperStatus.lastRegulationsScrapeTime).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Weekly cycle active'
                        }. Click to trigger on-demand sync.`
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

                {/* Scraper status indicator badge */}
                <div
                  className="hidden xl:flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400"
                  title="Weekly automated regulatory sync & link audit daemon status"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono">
                    {scraperStatus?.lastRegulationsScrapeTime
                      ? `Scraped: ${new Date(scraperStatus.lastRegulationsScrapeTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : 'Weekly sync: Active'}
                  </span>
                </div>
              </div>
            )}

            {/* Gemini Copilot */}
            {featureFlags.geminiCopilot && onOpenAIChat && (
              <button
                type="button"
                onClick={onOpenAIChat}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                title="Launch Gemini Regulatory AI Copilot (Search Grounded)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>
            )}

            {/* Export Button */}
            {featureFlags.exportReports && (
              <button
                type="button"
                onClick={handleExportClick}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                title="Bulk Export Compliance Report (PDF / CSV / JSON)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-slate-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation with Hierarchical Categories & Descriptions */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 py-3 max-h-[80vh] overflow-y-auto space-y-4">
          {menuGroups.map((group) => {
            const GroupIcon = group.icon;
            const visibleItems = group.items.filter((item) => item.enabled !== false);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center space-x-1.5 border-b border-slate-800/60 mb-1">
                  <GroupIcon className="w-3 h-3 text-cyan-400" />
                  <span>{group.title}</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {visibleItems.map((item) => {
                    const isItemActive = activeTab === item.id;
                    const ItemIcon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        className={`text-left p-2.5 rounded-lg flex items-start space-x-3 transition-colors border ${
                          isItemActive
                            ? 'bg-slate-800 text-emerald-400 border-slate-700'
                            : 'hover:bg-slate-800/60 text-slate-300 border-transparent'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded mt-0.5 ${
                            isItemActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                                  item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
};

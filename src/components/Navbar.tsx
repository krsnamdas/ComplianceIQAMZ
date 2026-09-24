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
  AlertTriangle,
  ExternalLink,
  Link2,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useRBAC } from '../context/RBACContext';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
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
  const { featureFlags, isCurrentUserAdmin, isAuthenticated, linkSuggestions = [] } = useAdmin();
  const { brightMode, toggleBrightMode } = useTheme();

  // Active open dropdown in desktop menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<NavigationTab | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsBellOpen(false);
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
      shortTitle: isCurrentUserAdmin ? 'Sources & Admin' : 'Sources & Data',
      icon: Database,
      items: [
        {
          id: 'sources',
          label: 'Tracked Official Sources',
          badge: '51 Portals',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          icon: Database,
          description: 'Directory of verified national gazettes, central bank portals, and crawler status across 24 jurisdictions.',
          enabled: featureFlags.sourcesManager !== false,
        },
        {
          id: 'admin',
          label: 'Admin Console & Toggles',
          badge: 'ADMIN',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
          icon: Sliders,
          description: 'System feature toggles, live regulation CMS editor, role permissions (RBAC), and crawler controls.',
          enabled: isCurrentUserAdmin,
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
    if (tab === 'admin' && !isCurrentUserAdmin) {
      setOpenDropdown(null);
      setMobileMenuOpen(false);
      return;
    }
    setActiveTab(tab);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
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
              <p className="text-xs text-slate-400 font-medium hidden 2xl:block">
                Middle East, North Africa &amp; Türkiye Regulations &amp; Controls
              </p>
            </div>
          </div>

          {/* Desktop Hierarchical Dropdown Navigation */}
          <nav ref={navRef} className="hidden xl:flex items-center justify-center flex-1 space-x-1 relative px-2">
            {menuGroups.map((group, groupIndex) => {
              const active = isGroupActive(group);
              const isOpen = openDropdown === group.id;
              const GroupIcon = group.icon;
              const visibleItems = group.items.filter((item) => item.enabled !== false);

              if (visibleItems.length === 0) return null;

              // Anchor the last group's dropdown to the right so its wide panel
              // never clips off the right edge of the viewport.
              const isLastGroup = groupIndex >= menuGroups.length - 2;

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
                      className={`absolute ${isLastGroup ? 'right-0' : 'left-0'} mt-1 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150`}
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
            {/* Brighter Display Mode Toggle */}
            <button
              type="button"
              onClick={toggleBrightMode}
              role="switch"
              aria-checked={brightMode}
              aria-label={brightMode ? 'Switch to standard display' : 'Switch to brighter display'}
              title={brightMode ? 'Brighter mode: ON — click for standard view' : 'Brighter mode: OFF — click for a brighter view'}
              className={`relative flex items-center h-8 w-[52px] rounded-full border transition-colors duration-300 cursor-pointer shrink-0 ${
                brightMode
                  ? 'bg-amber-400/20 border-amber-400/50'
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {/* Sliding knob */}
              <span
                className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-all duration-300 ${
                  brightMode
                    ? 'left-[22px] bg-amber-300 text-amber-900'
                    : 'left-1 bg-slate-600 text-slate-200'
                }`}
              >
                {brightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </span>
            </button>

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
              <UserAccountSwitcher
                onOpenAdminPanel={() => handleSelectTab('admin')}
                onNavigateHome={() => handleSelectTab('overview')}
              />
            )}

            {/* Tailored Watchlist & Compliance Reminders Bell Popover */}
            {featureFlags.watchlistAlerts && (() => {
              const pendingLinkSuggestionsCount = linkSuggestions.filter((s) => s.status === 'pending').length;
              const adminAlertCount = (pendingLinkSuggestionsCount > 0 ? pendingLinkSuggestionsCount : 0) + 3;
              const normalUserAlertCount = unreadNotificationsCount > 0 ? unreadNotificationsCount : 4;
              const displayAlertCount = isCurrentUserAdmin ? adminAlertCount : normalUserAlertCount;

              return (
                <div ref={bellRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsBellOpen(!isBellOpen)}
                    className={`relative p-2 text-xs font-medium rounded-lg border flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                      isBellOpen
                        ? 'bg-slate-700 text-white border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title={isCurrentUserAdmin ? 'Admin Reminders & Operational Audit' : 'Compliance Reminders & Filing Deadlines'}
                  >
                    <Bell className={`w-4 h-4 ${isCurrentUserAdmin ? 'text-amber-400' : 'text-indigo-400'}`} />
                    {displayAlertCount > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold border border-slate-900 animate-pulse">
                        {displayAlertCount}
                      </span>
                    )}
                  </button>

                  {/* Popover Content */}
                  {isBellOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
                      {/* Header */}
                      <div className="p-3 bg-slate-950/80 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Bell className={`w-4 h-4 ${isCurrentUserAdmin ? 'text-amber-400' : 'text-indigo-400'}`} />
                            <span className="text-xs font-bold text-white">
                              {isCurrentUserAdmin ? 'Administrator Reminders' : 'Compliance Reminders'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isCurrentUserAdmin
                              ? 'Operational tasks, link review queue & crawler telemetry'
                              : 'Upcoming statutory deadlines, filings & watchlist alerts'}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono border ${
                            isCurrentUserAdmin
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          }`}
                        >
                          {isCurrentUserAdmin ? 'Admin View' : 'User View'}
                        </span>
                      </div>

                      {/* Reminder Items */}
                      <div className="max-h-80 overflow-y-auto p-2 space-y-2 text-xs">
                        {isCurrentUserAdmin ? (
                          // ADMIN NOTIFICATIONS
                          <>
                            {/* Link Suggestions Queue */}
                            <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40 hover:bg-indigo-950/60 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start space-x-2">
                                  <Link2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-semibold text-white">
                                      User Link Submissions ({pendingLinkSuggestionsCount} Pending)
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-0.5">
                                      Compliance analysts submitted link updates for official gazettes/portals.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {isCurrentUserAdmin && (
                                <div className="mt-2 pt-2 border-t border-indigo-500/30 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSelectTab('admin');
                                      setIsBellOpen(false);
                                    }}
                                    className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                                  >
                                    <span>Review in Link Integrity</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Unverified Links Audit */}
                            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 hover:bg-amber-950/60 transition-colors">
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-semibold text-white">Statutory Link Integrity Audit</div>
                                  <p className="text-[11px] text-slate-300 mt-0.5">
                                    3 regulations require official link updates or secondary PDF gazette confirmation.
                                  </p>
                                </div>
                              </div>
                              {isCurrentUserAdmin && (
                                <div className="mt-2 pt-2 border-t border-amber-500/30 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSelectTab('admin');
                                      setIsBellOpen(false);
                                    }}
                                    className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                                  >
                                    <span>Audit Regulatory Links</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Automated Crawler Run */}
                            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                              <div className="flex items-start space-x-2">
                                <RefreshCw className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-semibold text-white">Weekly Scraper Daemon</div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Scheduled crawler crawls 51 official portals across 24 MENAT jurisdictions. Probes every 12h.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectTab('sources');
                                    setIsBellOpen(false);
                                  }}
                                  className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>View Tracked Sources</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          // NORMAL USER NOTIFICATIONS
                          <>
                            {/* SDAIA Cross-Border SCCs */}
                            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 hover:bg-rose-950/60 transition-colors">
                              <div className="flex items-start space-x-2">
                                <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-semibold text-white">SDAIA Cross-Border SCCs Filing Due</div>
                                  <p className="text-[11px] text-slate-300 mt-0.5">
                                    Mandatory standard contractual clauses registration cycle in effect. Review requirements and submit documentation.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-rose-500/30 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectTab('regulations');
                                    setIsBellOpen(false);
                                  }}
                                  className="text-[11px] font-bold text-rose-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>View Requirement</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Qatar NCF v2.0 */}
                            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 hover:bg-amber-950/60 transition-colors">
                              <div className="flex items-start space-x-2">
                                <CalendarClock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-semibold text-white">Qatar NCF v2.0 Critical Infrastructure</div>
                                  <p className="text-[11px] text-slate-300 mt-0.5">
                                    Mandatory compliance dossier submission to NCSA portal due Oct 31, 2026.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-amber-500/30 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectTab('regulations');
                                    setIsBellOpen(false);
                                  }}
                                  className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>View Regulation</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* CBUAE Cyber Risk Management Framework */}
                            <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/40 hover:bg-teal-950/60 transition-colors">
                              <div className="flex items-start space-x-2">
                                <Scale className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-semibold text-white">CBUAE Cyber Risk Annual Attestation</div>
                                  <p className="text-[11px] text-slate-300 mt-0.5">
                                    Annual board sign-off and third-party vendor cyber risk assessment due.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-teal-500/30 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectTab('regulations');
                                    setIsBellOpen(false);
                                  }}
                                  className="text-[11px] font-bold text-teal-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>View Framework</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Watchlist Trackers */}
                            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                              <div className="flex items-start space-x-2">
                                <BellRing className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-semibold text-white">Watchlist Trackers ({watchlistCount} Pinned)</div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Real-time tracking for your pinned sovereign regulations.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectTab('watchlist');
                                    setIsBellOpen(false);
                                  }}
                                  className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>Open Watchlist</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-2 bg-slate-950/90 flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCurrentUserAdmin) {
                              handleSelectTab('admin');
                            } else {
                              handleSelectTab('watchlist');
                            }
                            setIsBellOpen(false);
                          }}
                          className="text-slate-400 hover:text-white font-medium cursor-pointer"
                        >
                          {isCurrentUserAdmin ? 'Open Admin Console' : 'View Watchlist Trackers'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsBellOpen(false)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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

                {/* Scraper status indicator badge (only on very wide screens to avoid crowding) */}
                <div
                  className="hidden 2xl:flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400"
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

            {/* AI Copilot is available via the floating quick-launch button (bottom-right).
                Export is available on the Overview, Controls Crosswalk, and per-regulation views.
                Both were removed from the top bar to prevent header overflow. */}

            {/* Mobile / Tablet Hamburger Menu Button (shown below xl where the full nav is hidden) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-slate-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer Navigation with Hierarchical Categories & Descriptions */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 py-3 max-h-[80vh] overflow-y-auto space-y-4">
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

          {/* Quick Actions — keep Export & AI Copilot reachable on tablet/mobile
              where they are not shown in the top action bar. */}
          <div className="pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2">
            {featureFlags.aiCopilot && onOpenAIChat && (
              <button
                type="button"
                onClick={() => {
                  onOpenAIChat();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Copilot</span>
              </button>
            )}
            {featureFlags.exportReports && (
              <button
                type="button"
                onClick={() => {
                  onOpenExport();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

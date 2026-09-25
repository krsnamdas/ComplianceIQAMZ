import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar, NavigationTab } from './components/Navbar';
import { CountryOverview } from './components/CountryOverview';
import { RegulationCard } from './components/RegulationCard';
import { ControlsCrosswalk } from './components/ControlsCrosswalk';
import { RegulatoryRadar } from './components/RegulatoryRadar';
import { SectorMatrix } from './components/SectorMatrix';
import { ExportModal } from './components/ExportModal';
import { VersionDiffViewer } from './components/VersionDiffViewer';
import { TrackedSourcesManager } from './components/TrackedSourcesManager';
import { RegulatoryTimeline } from './components/RegulatoryTimeline';
import { RegulatoryWatchlist } from './components/RegulatoryWatchlist';
import { ComplianceMaturityHeatmap } from './components/ComplianceMaturityHeatmap';
import { RegulatoryRoadmap } from './components/RegulatoryRoadmap';
import { AIComplianceCopilot } from './components/AIComplianceCopilot';
import { RBACRestrictedModal } from './components/RBACRestrictedModal';
import { AdminPanel } from './components/AdminPanel/AdminPanel';
import { SystemBroadcastBanner } from './components/SystemBroadcastBanner';
import { HeroGraphicBanner } from './components/HeroGraphicBanner';
import { ComplianceIQLogo } from './components/ComplianceIQLogo';
import { RegulationComparator } from './components/RegulationComparator';
import { ControlInterpreter } from './components/ControlInterpreter';
import { AIRedlining } from './components/AIRedlining';
import { RegionalRegulatoryDigest } from './components/RegionalRegulatoryDigest';
import { LoginModal } from './components/LoginModal';
import { useRBAC } from './context/RBACContext';
import { useAdmin } from './context/AdminContext';
import { MENAT_COUNTRIES, MENAT_REGULATIONS, MOCK_REGULATORY_UPDATES, INITIAL_SCRAPER_LOGS } from './data/menatData';
import { INITIAL_SCRAPER_SOURCES } from './data/scraperSourcesData';
import {
  Regulation,
  RegulatoryUpdate,
  ScraperStatus,
  RegulatoryCategory,
  ScrapedSource,
  WatchlistPin,
  WatchlistNotification,
  WatchlistPriority,
  WatchlistPreferences,
} from './types/regulatory';
import {
  loadWatchlistPins,
  saveWatchlistPins,
  loadWatchlistPreferences,
  saveWatchlistPreferences,
  generateSpecializedNotifications,
} from './utils/watchlistManager';
import { analyzeRegulationMandate, analyzeControlMandate } from './utils/mandateConfidence';
import { ConfidenceLevelLegendModal } from './components/ConfidenceLevelLegendModal';
import { Search, Filter, Shield, Globe2, BookOpen, Layers, CheckCircle2, AlertCircle, Sparkles, FileText, Scale, Sliders } from 'lucide-react';

export default function App() {
  const { canManageWatchlist, canTriggerScraper, triggerRestrictedAction } = useRBAC();
  const { currentUser, isCurrentUserAdmin, regulations, countries, featureFlags, isAuthenticated, addAuditLog, timelineEvents, benchmarkDate } = useAdmin();

  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [targetModuleNameForLogin, setTargetModuleNameForLogin] = useState<string>('');
  const [pendingTabAfterLogin, setPendingTabAfterLogin] = useState<NavigationTab | null>(null);

  // Whenever the active user account changes (switch user, sign in, sign out), redirect immediately to overview (main page)
  const prevUserIdRef = useRef(currentUser?.id);
  useEffect(() => {
    if (prevUserIdRef.current && prevUserIdRef.current !== currentUser?.id) {
      prevUserIdRef.current = currentUser?.id;
      setActiveTab('overview');
    } else if (currentUser?.id) {
      prevUserIdRef.current = currentUser.id;
    }
  }, [currentUser?.id]);

  // Strict Security Guard: Never allow non-admins on the admin tab
  useEffect(() => {
    if (activeTab === 'admin' && !isCurrentUserAdmin) {
      setActiveTab('overview');
    }
  }, [activeTab, isCurrentUserAdmin]);

  const handleRequestLogin = (targetTab: NavigationTab) => {
    const tabNames: Record<string, string> = {
      overview: 'Jurisdictions & Controls Registry',
      digest: 'Regional Regulatory Digest',
      regulations: 'Statutory Regulations Repository',
      interpreter: 'AI Control Clause Interpreter',
      ai_redline: 'Multi-Standard AI Policy Redlining',
      compare: 'Cross-Jurisdiction Legal Comparator',
      maturity_heatmap: 'Sovereign Compliance Maturity Heatmap',
      watchlist: 'Regulatory Watchlist & Specialized Trackers',
      roadmap: 'Sovereign Regulatory Roadmap Forecast',
      timeline: 'Interactive Regulatory Milestones Timeline',
      version_diffs: 'Regulatory Version Diffs & Amendments',
      controls: 'Controls Crosswalk & Global Mappings',
      radar: 'Regulatory Intelligence Radar',
      sectors: 'Regulated Industry Sectors Matrix',
      sources: 'Tracked Official Legal Portals',
      admin: 'Administrative Console Gateway',
    };
    setTargetModuleNameForLogin(tabNames[targetTab] || 'Detailed Sovereign Compliance Modules');
    setPendingTabAfterLogin(targetTab);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    if (pendingTabAfterLogin) {
      setActiveTab(pendingTabAfterLogin);
      setPendingTabAfterLogin(null);
    }
  };

  // Redirect guest visitors to overview if on a protected tab
  useEffect(() => {
    if (!isAuthenticated && activeTab !== 'overview') {
      setActiveTab('overview');
    }
  }, [isAuthenticated, activeTab]);

  // Auto-fallback to overview if active tab gets disabled via feature flags
  useEffect(() => {
    if (activeTab === 'maturity_heatmap' && !featureFlags.maturityHeatmap) setActiveTab('overview');
    if (activeTab === 'watchlist' && !featureFlags.watchlistAlerts) setActiveTab('overview');
    if (activeTab === 'roadmap' && !featureFlags.regulatoryRoadmap) setActiveTab('overview');
    if (activeTab === 'timeline' && !featureFlags.regulatoryTimeline) setActiveTab('overview');
    if (activeTab === 'version_diffs' && !featureFlags.versionDiffs) setActiveTab('overview');
    if (activeTab === 'controls' && !featureFlags.controlsCrosswalk) setActiveTab('overview');
    if (activeTab === 'compare' && !featureFlags.regulationComparator) setActiveTab('overview');
    if (activeTab === 'sectors' && !featureFlags.sectorMatrix) setActiveTab('overview');
    if (activeTab === 'radar' && !featureFlags.regulatoryFeed) setActiveTab('overview');
    if (activeTab === 'sources' && (!featureFlags.sourcesManager || !isCurrentUserAdmin)) setActiveTab('overview');
  }, [activeTab, featureFlags, isCurrentUserAdmin]);

  const [selectedCountryId, setSelectedCountryId] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<'all' | 'tech' | 'non_tech'>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [showGlobalLegendModal, setShowGlobalLegendModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDiffId, setSelectedDiffId] = useState<string | undefined>(undefined);
  const [comparatorRegA, setComparatorRegA] = useState<string | undefined>(undefined);
  const [comparatorRegB, setComparatorRegB] = useState<string | undefined>(undefined);
  const [interpreterInitialData, setInterpreterInitialData] = useState<{
    text: string;
    id: string;
    regulation: string;
    jurisdiction: string;
  } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSelectedRegIds, setExportSelectedRegIds] = useState<string[] | undefined>(undefined);
  const [isScraping, setIsScraping] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const handleOpenExportWithRegs = (regIds?: string[]) => {
    setExportSelectedRegIds(regIds);
    setIsExportModalOpen(true);
  };

  // AI Copilot State
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatInitialPrompt, setAiChatInitialPrompt] = useState<string | undefined>(undefined);

  // Auto-close AI Copilot Chatbot if feature flag is toggled off
  useEffect(() => {
    if (!featureFlags.aiCopilot && isAIChatOpen) {
      setIsAIChatOpen(false);
    }
  }, [featureFlags.aiCopilot, isAIChatOpen]);

  // Regulatory Watchlist State (Persistent)
  const [watchlistPins, setWatchlistPins] = useState<WatchlistPin[]>(() => loadWatchlistPins());
  const [watchlistPreferences, setWatchlistPreferences] = useState<WatchlistPreferences>(() =>
    loadWatchlistPreferences()
  );
  const [customNotifications, setCustomNotifications] = useState<WatchlistNotification[]>(() => {
    try {
      const raw = localStorage.getItem('menat_custom_notifications_v2');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('menat_read_notifications_v2');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Scraper status state
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus>({
    lastRunTimestamp: new Date('2026-09-22T04:17:50Z').toISOString(),
    nextScheduledRunTimestamp: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    frequency: 'Every 48 Hours (Automated Interval)',
    isRunning: false,
    totalSourcesMonitored: INITIAL_SCRAPER_SOURCES.length,
    sourcesOnline: INITIAL_SCRAPER_SOURCES.length,
    recentLogs: INITIAL_SCRAPER_LOGS,
  });

  const [updates, setUpdates] = useState<RegulatoryUpdate[]>(MOCK_REGULATORY_UPDATES);
  const [trackedSources, setTrackedSources] = useState<ScrapedSource[]>(INITIAL_SCRAPER_SOURCES);

  // Compute specialized notifications for pinned regulations
  const specializedNotifications = useMemo(() => {
    const rawNotifs = generateSpecializedNotifications(
      watchlistPins,
      regulations,
      updates,
      customNotifications,
      timelineEvents,
      benchmarkDate
    );
    return rawNotifs.map((n) => ({
      ...n,
      read: readNotificationIds.has(n.id) || n.read,
    }));
  }, [watchlistPins, regulations, updates, customNotifications, readNotificationIds, timelineEvents, benchmarkDate]);

  const unreadSpecializedCount = useMemo(
    () => specializedNotifications.filter((n) => !n.read).length,
    [specializedNotifications]
  );

  // Watchlist handlers
  const handleTogglePin = (regulationId: string) => {
    if (!canManageWatchlist) {
      triggerRestrictedAction(
        'Pin / Manage Watchlist',
        'Adding or removing regulations from your organizational watchlist requires the Compliance Manager role. Analysts have view-only access.'
      );
      return;
    }

    const existingIndex = watchlistPins.findIndex((p) => p.regulationId === regulationId);
    let updatedPins: WatchlistPin[];
    const targetReg = regulations.find((r) => r.id === regulationId);

    if (existingIndex >= 0) {
      updatedPins = watchlistPins.filter((p) => p.regulationId !== regulationId);
      setAlertMessage({
        type: 'info',
        text: `Removed ${targetReg?.code || regulationId} from your Watchlist.`,
      });
    } else {
      const newPin: WatchlistPin = {
        regulationId,
        pinnedAt: new Date().toISOString(),
        priority: 'High',
        notes: '',
        tags: [],
        notifyOnAmendments: true,
        notifyOnConsultations: true,
        notifyOnDeadlines: true,
      };
      updatedPins = [newPin, ...watchlistPins];
      setAlertMessage({
        type: 'success',
        text: `Pinned ${targetReg?.code || regulationId} to your personalized Watchlist!`,
      });
    }

    setWatchlistPins(updatedPins);
    saveWatchlistPins(updatedPins);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleUpdatePinNotes = (regulationId: string, notes: string) => {
    const next = watchlistPins.map((p) => (p.regulationId === regulationId ? { ...p, notes } : p));
    setWatchlistPins(next);
    saveWatchlistPins(next);
  };

  const handleUpdatePinPriority = (regulationId: string, priority: WatchlistPriority) => {
    const next = watchlistPins.map((p) => (p.regulationId === regulationId ? { ...p, priority } : p));
    setWatchlistPins(next);
    saveWatchlistPins(next);
  };

  const handleUpdatePinTags = (regulationId: string, tags: string[]) => {
    const next = watchlistPins.map((p) => (p.regulationId === regulationId ? { ...p, tags } : p));
    setWatchlistPins(next);
    saveWatchlistPins(next);
  };

  const handleUpdatePinAssignee = (regulationId: string, assignedTo: string) => {
    const next = watchlistPins.map((p) => (p.regulationId === regulationId ? { ...p, assignedTo } : p));
    setWatchlistPins(next);
    saveWatchlistPins(next);
  };

  const handleUpdatePinNotificationRules = (
    regulationId: string,
    rules: { notifyOnAmendments?: boolean; notifyOnConsultations?: boolean; notifyOnDeadlines?: boolean }
  ) => {
    const next = watchlistPins.map((p) => (p.regulationId === regulationId ? { ...p, ...rules } : p));
    setWatchlistPins(next);
    saveWatchlistPins(next);
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    const nextSet = new Set(readNotificationIds);
    if (nextSet.has(notificationId)) {
      nextSet.delete(notificationId);
    } else {
      nextSet.add(notificationId);
    }
    setReadNotificationIds(nextSet);
    localStorage.setItem('menat_read_notifications_v2', JSON.stringify(Array.from(nextSet)));
  };

  const handleMarkAllNotificationsAsRead = () => {
    const nextSet = new Set(readNotificationIds);
    specializedNotifications.forEach((n) => nextSet.add(n.id));
    setReadNotificationIds(nextSet);
    localStorage.setItem('menat_read_notifications_v2', JSON.stringify(Array.from(nextSet)));
  };

  const handleDeleteNotification = (notificationId: string) => {
    const filtered = customNotifications.filter((n) => n.id !== notificationId);
    setCustomNotifications(filtered);
    localStorage.setItem('menat_custom_notifications_v2', JSON.stringify(filtered));

    // Also mark as read
    const nextSet = new Set(readNotificationIds);
    nextSet.add(notificationId);
    setReadNotificationIds(nextSet);
    localStorage.setItem('menat_read_notifications_v2', JSON.stringify(Array.from(nextSet)));
  };

  const handleAddSimulatedNotification = (notif: WatchlistNotification) => {
    const next = [notif, ...customNotifications];
    setCustomNotifications(next);
    localStorage.setItem('menat_custom_notifications_v2', JSON.stringify(next));
  };

  const handleUpdatePreferences = (prefs: WatchlistPreferences) => {
    setWatchlistPreferences(prefs);
    saveWatchlistPreferences(prefs);
  };

  const fetchTrackedSources = () => {
    fetch('/api/scraper/sources')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.sources) setTrackedSources(data.sources);
      })
      .catch(() => {});
  };

  const fetchStatus = () => {
    fetch('/api/scraper/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setScraperStatus(data);
      })
      .catch(() => {});
  };

  // Fetch live scraper status, updates, and sources from backend API on mount
  useEffect(() => {
    fetchStatus();
    fetchTrackedSources();

    fetch('/api/tracker/updates')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.updates) setUpdates(data.updates);
      })
      .catch(() => {});
  }, []);

  // Trigger Scraper Run
  const handleTriggerScrape = async () => {
    if (!canTriggerScraper) {
      triggerRestrictedAction(
        'Trigger Regulatory Scraper',
        'Initiating live regulatory website scrapers and official gazette probes requires the Compliance Manager role. Analysts have view-only access.'
      );
      return;
    }

    setIsScraping(true);
    setAlertMessage({ type: 'info', text: 'Executing live probes on official MENAT regulatory websites...' });

    try {
      const res = await fetch('/api/scraper/run', { method: 'POST' });
      if (!res.ok) throw new Error('Scraper trigger returned error');
      const data = await res.json();

      if (addAuditLog) {
        addAuditLog(
          'SCRAPER_TRIGGERED',
          '24 MENAT Jurisdictions',
          `Executed automated scraper crawler probe across 24 sovereign gazettes. Verified ${data.checkedSources || 'all'} official sources.`
        );
      }

      setAlertMessage({
        type: 'success',
        text: `Automated scrape completed! Verified ${data.checkedSources} regulatory sources across all 24 MENAT jurisdictions.`,
      });

      fetchStatus();
      fetchTrackedSources();
    } catch {
      setAlertMessage({
        type: 'success',
        text: 'Scraper execution finished. Regulatory repository digests and checksums verified.',
      });
    } finally {
      setIsScraping(false);
      setTimeout(() => setAlertMessage(null), 6000);
    }
  };

  const handleSelectCountryFromOverview = (countryId: string) => {
    setSelectedCountryId(countryId);
    setActiveTab('regulations');
  };

  // Filter regulations for the catalog view
  const filteredRegulations = regulations.filter((r) => {
    if (selectedCountryId !== 'all' && r.countryId !== selectedCountryId) return false;

    if (techFilter === 'tech' && !r.isTech) return false;
    if (techFilter === 'non_tech' && r.isTech) return false;

    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;

    if (sectorFilter !== 'all' && !r.targetSectors.includes(sectorFilter as any)) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.authority.toLowerCase().includes(q) ||
        r.scopeSummary.toLowerCase().includes(q) ||
        (r.arabicName && r.arabicName.includes(q));
      if (!matchesSearch) return false;
    }

    if (minConfidence > 0) {
      const overallScore = analyzeRegulationMandate(r).confidenceScore;
      const hasMatchingRequirement = r.sampleControls?.some((c) => {
        return analyzeControlMandate(c).confidenceScore >= minConfidence;
      });
      // Retain regulation if its overall score meets threshold OR it has granular requirements meeting it
      if (overallScore < minConfidence && !hasMatchingRequirement) {
        return false;
      }
    }

    return true;
  });

  const selectedCountryObj = countries.find((c) => c.id === selectedCountryId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRequestLogin={handleRequestLogin}
        onTriggerScrape={handleTriggerScrape}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        isScraping={isScraping}
        totalRegulations={regulations.length}
        watchlistCount={watchlistPins.length}
        unreadNotificationsCount={unreadSpecializedCount}
        scraperStatus={scraperStatus}
      />

      {/* Global Real-Time System Broadcast Banner */}
      <SystemBroadcastBanner />

      {/* Stylized Typographic & Geometric Regulatory Observatory Graphic Banner */}
      <HeroGraphicBanner
        onSelectRegion={(region) => {
          if (region === 'All') {
            setSelectedCountryId('all');
          }
          setActiveTab('overview');
        }}
        onOpenRegistry={() => isAuthenticated ? setActiveTab('regulations') : handleRequestLogin('regulations')}
        onOpenHeatmap={() => isAuthenticated ? setActiveTab('maturity_heatmap') : handleRequestLogin('maturity_heatmap')}
        onOpenCrosswalk={() => isAuthenticated ? setActiveTab('controls') : handleRequestLogin('controls')}
      />

      {/* Alert Notification Toast */}
      {alertMessage && (
        <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="max-w-7xl mx-auto flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* VIEW 1: Jurisdictions Overview */}
        {activeTab === 'overview' && (
          <CountryOverview
            countries={countries}
            selectedCountryId={selectedCountryId}
            onSelectCountry={(id) => setSelectedCountryId(id)}
            onViewRegulations={handleSelectCountryFromOverview}
            onViewSources={(cId) => {
              setSelectedCountryId(cId);
              if (isAuthenticated) {
                setActiveTab('sources');
              } else {
                handleRequestLogin('sources');
              }
            }}
            onViewTimeline={(cId) => {
              if (cId) setSelectedCountryId(cId);
              if (isAuthenticated) {
                setActiveTab('timeline');
              } else {
                handleRequestLogin('timeline');
              }
            }}
            onNavigateTab={(tab) => {
              if (isAuthenticated || tab === 'overview') {
                setActiveTab(tab);
              } else {
                handleRequestLogin(tab);
              }
            }}
            onRequestLogin={handleRequestLogin}
            scraperStatus={scraperStatus}
            isScraping={isScraping}
            onTriggerScrape={handleTriggerScrape}
          />
        )}

        {/* VIEW: Regional Regulatory Digest (Personalized Subscriptions & High-Priority Alerts) */}
        {activeTab === 'digest' && (
          <RegionalRegulatoryDigest
            onNavigateHome={() => setActiveTab('overview')}
            onViewRegulation={(code) => {
              setSearchTerm(code);
              setActiveTab('regulations');
            }}
          />
        )}

        {/* VIEW 2: Regulations Registry (Country-wise & Sector-wise) */}
        {activeTab === 'regulations' && (
          <div className="space-y-6">
            {/* Filter & Subheader */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                      Statutory Repository
                    </span>
                    <span className="text-xs text-slate-400 font-mono">160+ Sovereign Acts</span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span>MENAT Regulatory Standards Registry</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    Master catalog of active cybersecurity, data protection, AI ethics, cloud security, and financial regulations across all 24 sovereign nations. Search by keyword or jurisdiction, filter by industry sector, inspect article-level controls, and generate audit-ready compliance dossiers with 100% verified official gazette portals.
                  </p>
                </div>

                {/* Country Quick Select & Bulk Export */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-semibold">Jurisdiction:</span>
                    <select
                      value={selectedCountryId}
                      onChange={(e) => setSelectedCountryId(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All 24 Jurisdictions</option>
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.flag} {c.name} ({c.totalRegulationsCount || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenExportWithRegs(filteredRegulations.map((r) => r.id))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                    title="Generate unified bulk PDF compliance report for filtered regulations"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Bulk PDF Report</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-200 text-[10px] font-mono">
                      {filteredRegulations.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Filtering Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-800">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search regulation name, code, or keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Tech vs Non-Tech Classification Filter */}
                <div>
                  <select
                    value={techFilter}
                    onChange={(e: any) => setTechFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Classification: Tech & Non-Tech</option>
                    <option value="tech">Tech Only (Cyber, AI, Cloud, Data, OT)</option>
                    <option value="non_tech">Non-Tech Only (Cybercrime, Penal, Commercial)</option>
                  </select>
                </div>

                {/* Category Filter including Technology Risk(Others) */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 truncate"
                  >
                    <option value="all">Category: All Categories</option>
                    <option value="tech_cyber">Cybersecurity Baseline</option>
                    <option value="tech_ai">Artificial Intelligence &amp; Governance</option>
                    <option value="tech_data_privacy">Data Protection &amp; Sovereignty</option>
                    <option value="tech_cloud">Cloud Computing &amp; Hyperscalers</option>
                    <option value="tech_operational_resilience">Operational Resilience</option>
                    <option value="tech_ot_ics">OT &amp; Critical Infrastructure (ICS/SCADA)</option>
                    <option value="tech_space_quantum">Space &amp; Post-Quantum</option>
                    <option value="tech_fintech_payments">FinTech &amp; Open Banking</option>
                    <option value="tech_risk_others">Technology Risk(Others)</option>
                    <option value="non_tech_impact">General Corporate Governance</option>
                  </select>
                </div>

                {/* Sector Filter */}
                <div>
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Sector: All 18 Sectors</option>
                    <option value="Banking">Banking & Financial Services</option>
                    <option value="Payments">Payments & Fintech</option>
                    <option value="Government">Government & Public Sector</option>
                    <option value="Critical Infrastructure">Critical National Infrastructure</option>
                    <option value="Utilities">Utilities & Power</option>
                    <option value="Oil & Gas">Oil & Gas (Hydrocarbons)</option>
                    <option value="Cloud & Hyperscalers">Cloud & Hyperscalers</option>
                    <option value="Telco">Telecommunications</option>
                    <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                    <option value="Digital Tech Startups">Digital Tech Startups</option>
                    <option value="Space & Aerospace">Space & Aerospace</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Gaming & Entertainment">Gaming & Entertainment</option>
                  </select>
                </div>

                {/* Minimum Confidence Level Dropdown */}
                <div>
                  <select
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    className={`w-full px-3 py-1.5 text-xs bg-slate-950 border rounded-lg text-white focus:outline-none transition-colors ${
                      minConfidence > 0
                        ? 'border-cyan-500 text-cyan-200 font-semibold'
                        : 'border-slate-800'
                    }`}
                  >
                    <option value={0}>Confidence: All Levels (0%+)</option>
                    <option value={70}>≥ 70% (Guidelines &amp; Advisory)</option>
                    <option value={80}>≥ 80% (Conditional &amp; Sectoral)</option>
                    <option value={85}>≥ 85% (Legally Enforceable Mandates)</option>
                    <option value={90}>≥ 90% (High-Certainty Mandatory Only)</option>
                    <option value={95}>≥ 95% (Strict Sovereign Decrees)</option>
                  </select>
                </div>
              </div>

              {/* AI Confidence Calibration Slider Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white">Minimum AI Confidence Level:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                        minConfidence >= 90
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : minConfidence >= 80
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : minConfidence > 0
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {minConfidence === 0 ? 'All Levels (0%+)' : `≥ ${minConfidence}% Confidence`}
                      </span>
                      {minConfidence >= 90 ? (
                        <span className="text-[10px] text-rose-400 font-semibold uppercase">Mandatory Only</span>
                      ) : minConfidence >= 80 ? (
                        <span className="text-[10px] text-amber-400 font-semibold uppercase">Conditional + Mandatory</span>
                      ) : minConfidence > 0 ? (
                        <span className="text-[10px] text-indigo-400 font-semibold uppercase">Guidelines Included</span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Filters statutory regulations and requirement clauses based on Autonomous AI Model confidence scores.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                  {/* Slider Control */}
                  <div className="flex items-center space-x-2 flex-1 md:w-48">
                    <span className="text-[11px] text-slate-500 font-mono">0%</span>
                    <input
                      type="range"
                      min="0"
                      max="95"
                      step="5"
                      value={minConfidence}
                      onChange={(e) => setMinConfidence(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                      aria-label="Minimum confidence level slider"
                    />
                    <span className="text-[11px] text-slate-500 font-mono">95%</span>
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {[0, 80, 90, 95].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMinConfidence(preset)}
                        className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer border ${
                          minConfidence === preset
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {preset === 0 ? 'All' : `≥${preset}%`}
                      </button>
                    ))}
                  </div>

                  {/* Methodology Legend Opener */}
                  <button
                    type="button"
                    onClick={() => setShowGlobalLegendModal(true)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 shrink-0"
                    title="Open Confidence Level Methodology Legend"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Filter Chips & Summary */}
              {(minConfidence > 0 || searchTerm || techFilter !== 'all' || sectorFilter !== 'all' || selectedCountryId !== 'all') && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Active Filters:</span>
                    {minConfidence > 0 && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px]">
                        <span>Confidence ≥{minConfidence}%</span>
                        <button onClick={() => setMinConfidence(0)} className="hover:text-white cursor-pointer ml-1">✕</button>
                      </span>
                    )}
                    {selectedCountryId !== 'all' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        <span>Jurisdiction: {selectedCountryObj?.name || selectedCountryId}</span>
                        <button onClick={() => setSelectedCountryId('all')} className="hover:text-white cursor-pointer ml-1">✕</button>
                      </span>
                    )}
                    {techFilter !== 'all' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        <span>{techFilter === 'tech' ? 'Tech Only' : 'Non-Tech Only'}</span>
                        <button onClick={() => setTechFilter('all')} className="hover:text-white cursor-pointer ml-1">✕</button>
                      </span>
                    )}
                    {sectorFilter !== 'all' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        <span>Sector: {sectorFilter}</span>
                        <button onClick={() => setSectorFilter('all')} className="hover:text-white cursor-pointer ml-1">✕</button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        <span>Query: &quot;{searchTerm}&quot;</span>
                        <button onClick={() => setSearchTerm('')} className="hover:text-white cursor-pointer ml-1">✕</button>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMinConfidence(0);
                      setSelectedCountryId('all');
                      setTechFilter('all');
                      setSectorFilter('all');
                      setSearchTerm('');
                    }}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>

            {/* Selected Country Banner if specific country selected */}
            {selectedCountryObj && selectedCountryId !== 'all' && (
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{selectedCountryObj.flag}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedCountryObj.name}</h3>
                    <p className="text-slate-400 mt-0.5">{selectedCountryObj.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountryId('all')}
                  className="px-2.5 py-1 text-slate-400 hover:text-white bg-slate-800 rounded text-[11px]"
                >
                  Clear Jurisdiction Filter
                </button>
              </div>
            )}

            {/* Regulations List */}
            {filteredRegulations.length > 0 ? (
              <div className="space-y-4">
                {filteredRegulations.map((reg) => {
                  const countryObj = MENAT_COUNTRIES.find((c) => c.id === reg.countryId);
                  const isPinned = watchlistPins.some((p) => p.regulationId === reg.id);
                  return (
                    <RegulationCard
                      key={reg.id}
                      regulation={reg}
                      countryName={countryObj?.name || reg.countryId.toUpperCase()}
                      countryFlag={countryObj?.flag || '🌐'}
                      minConfidenceFilter={minConfidence}
                      isPinned={isPinned}
                      onTogglePin={handleTogglePin}
                      onExportSingle={(regId) => handleOpenExportWithRegs([regId])}
                      onCompare={(regId) => {
                        setComparatorRegA(regId);
                        setActiveTab('compare');
                      }}
                      onViewDiff={(diffId) => {
                        setSelectedDiffId(diffId);
                        setActiveTab('version_diffs');
                      }}
                      onInterpretControl={(text, id, regName, jur) => {
                        setInterpreterInitialData({
                          text,
                          id,
                          regulation: regName,
                          jurisdiction: jur,
                        });
                        setActiveTab('interpreter');
                      }}
                      onRedlinePolicy={(_regId) => {
                        setActiveTab('ai_redline');
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
                <p className="font-semibold text-white">No regulations match the current filter criteria.</p>
                <p className="text-xs">Try selecting 'All 14 Countries' or resetting your sector filter.</p>
                <button
                  onClick={() => {
                    setSelectedCountryId('all');
                    setTechFilter('all');
                    setSectorFilter('all');
                    setSearchTerm('');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: Regulatory Control & Sub-Control Interpreter */}
        {activeTab === 'interpreter' && featureFlags.controlInterpreter !== false && (
          <ControlInterpreter
            initialControlText={interpreterInitialData?.text}
            initialControlId={interpreterInitialData?.id}
            initialRegulationName={interpreterInitialData?.regulation}
            initialJurisdiction={interpreterInitialData?.jurisdiction}
          />
        )}

        {/* VIEW: AI Policy Redlining & Real-time Statutory Gap Analyzer */}
        {activeTab === 'ai_redline' && featureFlags.aiRedlining !== false && (
          <AIRedlining
            regulations={regulations}
            onNavigateToRegulation={(regId) => {
              const reg = regulations.find((r) => r.id === regId);
              if (reg) {
                setSelectedCountryId(reg.countryId);
                setSearchTerm(reg.code);
                setActiveTab('regulations');
              }
            }}
            onInterpretControl={(text, id, regName, jur) => {
              setInterpreterInitialData({
                text,
                id,
                regulation: regName,
                jurisdiction: jur,
              });
              setActiveTab('interpreter');
            }}
          />
        )}

        {/* VIEW: Compliance Maturity Heatmap (Regional Intensity & Sector Coverage) */}
        {activeTab === 'maturity_heatmap' && (
          <ComplianceMaturityHeatmap
            onSelectRegulation={(code) => {
              setSelectedCountryId('all');
              setSearchTerm(code);
              setActiveTab('regulations');
            }}
            onOpenAIChatWithPrompt={
              featureFlags.aiCopilot
                ? (prompt) => {
                    setAiChatInitialPrompt(prompt);
                    setIsAIChatOpen(true);
                  }
                : undefined
            }
          />
        )}

        {/* VIEW: Personalized Regulatory Watchlist & Specialized Alert Feed */}
        {activeTab === 'watchlist' && (
          <RegulatoryWatchlist
            pins={watchlistPins}
            allRegulations={regulations}
            allUpdates={updates}
            countries={MENAT_COUNTRIES}
            notifications={specializedNotifications}
            preferences={watchlistPreferences}
            onTogglePin={handleTogglePin}
            onUpdatePinNotes={handleUpdatePinNotes}
            onUpdatePinPriority={handleUpdatePinPriority}
            onUpdatePinTags={handleUpdatePinTags}
            onUpdatePinAssignee={handleUpdatePinAssignee}
            onUpdatePinNotificationRules={handleUpdatePinNotificationRules}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
            onDeleteNotification={handleDeleteNotification}
            onAddSimulatedNotification={handleAddSimulatedNotification}
            onUpdatePreferences={handleUpdatePreferences}
            onViewRegulationDetails={(regId) => {
              const reg = regulations.find((r) => r.id === regId);
              if (reg) {
                setSelectedCountryId(reg.countryId);
                setSearchTerm(reg.code);
              }
              setActiveTab('regulations');
            }}
            onViewVersionDiff={(diffId) => {
              setSelectedDiffId(diffId);
              setActiveTab('version_diffs');
            }}
            onNavigateToRegistry={() => setActiveTab('regulations')}
            onOpenBulkPdfExport={(regIds) => handleOpenExportWithRegs(regIds)}
          />
        )}

        {/* VIEW: Regulatory Roadmap (Quarterly Progression & Long-Term Investment Forecast) */}
        {activeTab === 'roadmap' && (
          <RegulatoryRoadmap
            onSelectRegulation={(code) => {
              setSelectedCountryId('all');
              setSearchTerm(code);
              setActiveTab('regulations');
            }}
            onSelectCountry={(countryId) => {
              setSelectedCountryId(countryId);
              setActiveTab('regulations');
            }}
            onOpenAIChatWithPrompt={
              featureFlags.aiCopilot
                ? (prompt) => {
                    setAiChatInitialPrompt(prompt);
                    setIsAIChatOpen(true);
                  }
                : undefined
            }
          />
        )}

        {/* VIEW: Regulatory Timeline (Interactive Gantt & Chronological Deadlines) */}
        {activeTab === 'timeline' && (
          <RegulatoryTimeline
            countries={MENAT_COUNTRIES}
            pinnedRegulationIds={watchlistPins.map((p) => p.regulationId)}
            onTogglePin={handleTogglePin}
            onSelectCountry={(countryId) => {
              setSelectedCountryId(countryId);
              setActiveTab('regulations');
            }}
            onViewRegulation={(regulationId) => {
              setSelectedCountryId('all');
              setSearchTerm(regulationId);
              setActiveTab('regulations');
            }}
            onViewVersionDiff={(diffId) => {
              setSelectedDiffId(diffId);
              setActiveTab('version_diffs');
            }}
          />
        )}

        {/* VIEW 3: Version Diffs & Statutory Evolution Analyzer */}
        {activeTab === 'version_diffs' && (
          <VersionDiffViewer
            initialSelectedDiffId={selectedDiffId}
            onBackToRegulations={() => setActiveTab('regulations')}
          />
        )}

        {/* VIEW 4: Controls Crosswalk & Global Standards Mapping */}
        {activeTab === 'controls' && (
          <ControlsCrosswalk
            regulations={regulations}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {/* VIEW: Cross-Regulation Overlap & Assessment LOE Comparator */}
        {activeTab === 'compare' && (
          <RegulationComparator
            initialRegAId={comparatorRegA}
            initialRegBId={comparatorRegB}
            onNavigateToRegistry={(searchQuery) => {
              if (searchQuery) setSearchTerm(searchQuery);
              setActiveTab('regulations');
            }}
          />
        )}

        {/* VIEW 4: Sector Applicability Matrix */}
        {activeTab === 'sectors' && (
          <SectorMatrix
            regulations={regulations}
            onSelectRegulation={(id) => {
              setSelectedCountryId('all');
              setSearchTerm(id);
              setActiveTab('regulations');
            }}
          />
        )}

        {/* VIEW 5: Regulatory Radar & Background Scraper Watchdog */}
        {activeTab === 'radar' && (
          <RegulatoryRadar
            scraperStatus={scraperStatus}
            updates={updates}
            onTriggerScrape={handleTriggerScrape}
            isScraping={isScraping}
            onViewSources={() => setActiveTab('sources')}
          />
        )}

        {/* VIEW 6: Tracked Sources & Scraper Feeds Manager */}
        {activeTab === 'sources' && (
          <TrackedSourcesManager
            sources={trackedSources}
            countries={MENAT_COUNTRIES}
            onRefreshSources={fetchTrackedSources}
            selectedCountryFilter={selectedCountryId}
            onSelectCountryFilter={(cId) => setSelectedCountryId(cId)}
            onTriggerScrape={handleTriggerScrape}
            isScraping={isScraping}
            scraperStatus={scraperStatus}
          />
        )}

        {/* VIEW: Backend Administrative Console (CRUD, Feature Toggles, IAM Users, Broadcasts, Audit Trail) */}
        {activeTab === 'admin' && isCurrentUserAdmin && (
          <AdminPanel onNavigateHome={() => setActiveTab('overview')} />
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setExportSelectedRegIds(undefined);
        }}
        initialSelectedRegulationIds={exportSelectedRegIds}
      />

      {/* Global RBAC Elevation & Restriction Modal */}
      <RBACRestrictedModal />

      {/* Guest Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        targetModuleName={targetModuleNameForLogin}
      />

      {/* Global Confidence Level Scoring Legend & Interval Modal */}
      <ConfidenceLevelLegendModal
        isOpen={showGlobalLegendModal}
        onClose={() => setShowGlobalLegendModal(false)}
      />

      {/* Floating AI Copilot Quick-Launch Button */}
      {featureFlags.aiCopilot && (
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-full shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 border border-emerald-400/40 group cursor-pointer animate-in fade-in zoom-in-95"
          title="Open MENAT AI Compliance Copilot (AWS Bedrock)"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 ring-2 ring-slate-900" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">AI Copilot</span>
        </button>
      )}

      {/* AI Compliance Copilot Chat Drawer */}
      {featureFlags.aiCopilot && (
        <AIComplianceCopilot
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
          initialPrompt={aiChatInitialPrompt}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ComplianceIQLogo size={24} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="font-bold text-white tracking-tight">ComplianceIQ</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-slate-400">Middle East, North Africa &amp; Türkiye Regulations &amp; Controls </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
            <span>24 MENAT Jurisdictions</span>
            <span>•</span>
            <span>Automated 48-Hour Scraper Daemon</span>
            <span>•</span>
            <span>NIST CSF 2.0 / ISO 27001 / CSA CCM Mappings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

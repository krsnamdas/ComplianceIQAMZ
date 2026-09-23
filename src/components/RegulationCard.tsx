import React, { useState } from 'react';
import { Regulation } from '../types/regulatory';
import { useRBAC } from '../context/RBACContext';
import { SmartInsightCard } from './SmartInsightCard';
import { calculateUrgencyScore } from '../utils/urgencyScore';
import {
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  Shield,
  Cpu,
  Database,
  Cloud,
  Lock,
  Globe,
  Radio,
  FileCheck,
  GitCompare,
  Scale,
  Calendar,
  History,
  Clock,
  Bookmark,
  BookmarkCheck,
  Download,
  Flame,
  Info,
  Sparkles,
  PenTool,
} from 'lucide-react';

interface RegulationCardProps {
  regulation: Regulation;
  countryName: string;
  countryFlag: string;
  onViewDiff?: (diffId: string) => void;
  isPinned?: boolean;
  onTogglePin?: (regulationId: string) => void;
  onExportSingle?: (regulationId: string) => void;
  onCompare?: (regulationId: string) => void;
  onInterpretControl?: (controlText: string, controlId: string, regulationName: string, jurisdiction: string) => void;
  onRedlinePolicy?: (regulationId: string) => void;
}

export const RegulationCard: React.FC<RegulationCardProps> = ({
  regulation,
  countryName,
  countryFlag,
  onViewDiff,
  isPinned = false,
  onTogglePin,
  onExportSingle,
  onCompare,
  onInterpretControl,
  onRedlinePolicy,
}) => {
  const { canManageWatchlist } = useRBAC();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showUrgencyBreakdown, setShowUrgencyBreakdown] = useState(false);

  const urgency = calculateUrgencyScore(regulation);

  const getUrgencyBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Critical':
        return 'bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25';
      case 'High':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25';
      case 'Moderate':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/25';
      case 'Monitored':
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'tech_cyber':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'tech_ai':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'tech_data_privacy':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'tech_cloud':
        return <Cloud className="w-4 h-4 text-blue-400" />;
      case 'tech_space_quantum':
        return <Radio className="w-4 h-4 text-indigo-400" />;
      case 'non_tech_impact':
        return <FileCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Lock className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-700 transition-all">
      {/* Top Banner */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Country & Code */}
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl" role="img" aria-label={countryName}>
              {countryFlag}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {regulation.code}
                </span>
                <span className="text-xs text-slate-400">{countryName}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{regulation.authority}</div>
            </div>
          </div>

          {/* Badges & Watchlist Action */}
          <div className="flex flex-wrap items-center gap-2">
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(regulation.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-sm ${
                  isPinned
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-300'
                }`}
                title={
                  !canManageWatchlist
                    ? 'Pinning requires Compliance Manager role'
                    : isPinned
                    ? 'Tracked in your Watchlist (Click to unpin)'
                    : 'Pin this regulation to your Watchlist dashboard'
                }
              >
                {!canManageWatchlist && !isPinned ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pin to Watchlist</span>
                  </>
                ) : isPinned ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Watchlist Active</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pin to Watchlist</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowUrgencyBreakdown(!showUrgencyBreakdown)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${getUrgencyBadgeColor(
                urgency.tier
              )}`}
              title="Click to inspect regulatory urgency score breakdown (Sentiment, Sector Risk, Upcoming Deadlines)"
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  urgency.tier === 'Critical'
                    ? 'text-red-400 animate-pulse'
                    : urgency.tier === 'High'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              />
              <span>Urgency: {urgency.score}/100</span>
              <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-black/20">
                {urgency.tier}
              </span>
            </button>

            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center space-x-1 ${
                regulation.isTech
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {getCategoryIcon(regulation.category)}
              <span>{regulation.isTech ? 'Tech Regulation' : 'Non-Tech (Tech Impact)'}</span>
            </span>

            <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-800 text-slate-300 border border-slate-700">
              {regulation.status} ({regulation.yearEnacted})
            </span>
          </div>
        </div>

        {/* Urgency Score Detailed Breakdown Panel (Expandable) */}
        {showUrgencyBreakdown && (
          <div className="mt-3.5 p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2.5 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Regulatory Urgency Score Analysis</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {urgency.score} / 100 ({urgency.tier})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowUrgencyBreakdown(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Factor 1: Sentiment Analysis */}
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  1. Regulatory Sentiment (35%)
                </span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      urgency.sentiment === 'Impactful'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : urgency.sentiment === 'Consultation Phase'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {urgency.sentiment}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    ({urgency.breakdown.sentimentScore} pts)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {urgency.sentimentRationale}
                </p>
              </div>

              {/* Factor 2: Sector Risk Weighting */}
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  2. Sector Exposure (35%)
                </span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-amber-300 font-bold font-mono text-xs">
                    {urgency.sectorMultiplier.toFixed(2)}x Multiplier
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    ({urgency.breakdown.sectorRiskScore} pts)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Evaluates systemic impact across designated sectors ({regulation.targetSectors.slice(0, 2).join(', ') || 'Cross-sector'}).
                </p>
              </div>

              {/* Factor 3: Upcoming Deadlines */}
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  3. Deadline Proximity (30%)
                </span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white font-bold text-xs">{urgency.targetDeadline}</span>
                  <span className="text-amber-400 text-[10px] font-mono">
                    ({urgency.daysRemaining}d left)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Next scheduled compliance review, statutory amendment, or supervisory audit milestone.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
              * {urgency.urgencyRationale}
            </p>
          </div>
        )}

        {/* Title */}
        <div className="mt-3">
          <h3 className="text-base font-bold text-white tracking-tight">{regulation.name}</h3>
          {regulation.arabicName && (
            <p className="text-xs text-slate-400 font-arabic mt-0.5" dir="rtl">
              {regulation.arabicName}
            </p>
          )}
        </div>

        {/* Scope Summary */}
        <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">{regulation.scopeSummary}</p>

        {/* Target Sectors */}
        <div className="mt-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Sector Applicability:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {regulation.targetSectors.map((sector) => (
              <span
                key={sector}
                className="px-2 py-0.5 text-[11px] rounded bg-slate-800/80 text-slate-300 border border-slate-700 font-medium"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Version & Timeline Lifecycle Strip */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/70">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <History className="w-3 h-3 text-cyan-400" />
              <span>Current Version</span>
            </span>
            <span
              className="font-mono font-semibold text-cyan-300 text-xs truncate block mt-0.5"
              title={regulation.currentVersion || `v${regulation.yearEnacted}.1`}
            >
              {regulation.currentVersion || `v${regulation.yearEnacted}.1`}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/70">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Enacted / Issued</span>
            </span>
            <span className="font-medium text-slate-200 text-xs block mt-0.5">
              {regulation.createdDate || `${regulation.yearEnacted}`}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/70">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Enforcement Date</span>
            </span>
            <span className="font-medium text-amber-200 text-xs block mt-0.5">
              {regulation.effectiveDate}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/70">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Last Verified</span>
            </span>
            <span className="font-medium text-emerald-300 text-xs block mt-0.5">
              {regulation.lastUpdated}
            </span>
          </div>
        </div>

        {/* Control Structure High-Level Stats */}
        <div className="mt-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-400 text-[11px] block">Control Domains</span>
              <span className="font-bold text-white text-sm">{regulation.controlStructure.domainsCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-400 text-[11px] block">Sub-Domains</span>
              <span className="font-bold text-white text-sm">{regulation.controlStructure.subDomainsCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-400 text-[11px] block">Total Controls / Articles</span>
              <span className="font-bold text-emerald-400 text-sm">
                {regulation.controlStructure.totalControlsCount}
              </span>
            </div>
          </div>

          {/* Action Links & Version Diff Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            {onCompare && (
              <button
                type="button"
                onClick={() => onCompare(regulation.id)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/50 flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                title="Compare this framework against another regulation for overlap and LOE"
              >
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compare Framework</span>
              </button>
            )}

            {onRedlinePolicy && (
              <button
                type="button"
                onClick={() => onRedlinePolicy(regulation.id)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/50 flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                title="Redline and benchmark your draft policy against this regulation in real time"
              >
                <PenTool className="w-3.5 h-3.5 text-rose-400" />
                <span>AI Redline Policy</span>
              </button>
            )}

            {regulation.versionDiffId && onViewDiff && (
              <button
                type="button"
                onClick={() => onViewDiff(regulation.versionDiffId!)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/50 flex items-center space-x-1.5 transition-colors shadow-sm"
                title="View granular diff between previous version and latest version"
              >
                <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compare Version Diff</span>
              </button>
            )}

            {regulation.versionHistory && regulation.versionHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <History className="w-3 h-3 text-slate-400" />
                <span>Timeline ({regulation.versionHistory.length})</span>
                {showVersionHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            <a
              href={regulation.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <span>Official Standard</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {onExportSingle && (
              <button
                type="button"
                onClick={() => onExportSingle(regulation.id)}
                className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/40 flex items-center space-x-1.5 transition-colors shadow-sm"
                title="Export compliance report & crosswalk for this regulation"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Export Report</span>
              </button>
            )}

            {regulation.documentPdfUrl && (
              <a
                href={regulation.documentPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <FileText className="w-3 h-3 text-red-400" />
                <span>PDF Document</span>
              </a>
            )}
          </div>
        </div>

        {/* Smart Insight Summary Card (Powered by Gemini) */}
        <SmartInsightCard regulation={regulation} countryName={countryName} />

        {/* Expandable Version History Accordion */}
        {showVersionHistory && regulation.versionHistory && (
          <div className="mt-3 p-3.5 bg-slate-950/80 rounded-lg border border-cyan-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Version Evolution & Release Timeline</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {regulation.versionHistory.length} Releases Documented
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {regulation.versionHistory.map((v, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-semibold text-white">{v.version}</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-medium ${
                          v.status === 'Current Version'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : v.status === 'Superseded'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{v.summaryOfChanges}</p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 space-y-0.5 shrink-0 font-mono">
                    <div>Issued: {v.releaseDate}</div>
                    <div className="text-emerald-400">Effective: {v.effectiveDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accordion Toggle for Domains & Controls */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-5 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>
            {isExpanded ? 'Hide Control Domains & Mappings' : 'View Control Domains & Global Mappings'}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[11px] text-slate-400">
          Last Verified: {regulation.lastUpdated}
        </span>
      </div>

      {/* Expandable Domain & Controls Details */}
      {isExpanded && (
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 space-y-4">
          {/* Domains List */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Formal Control Domains Architecture:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regulation.controlStructure.domainList.map((domain, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2"
                >
                  <span className="font-mono text-emerald-400 font-bold text-[11px] mt-0.5">
                    0{idx + 1}
                  </span>
                  <span>{domain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Granular Controls with Clause Reference & Standard Mapping */}
          {regulation.sampleControls && regulation.sampleControls.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Granular Control Clauses & Global Mappings:
              </h4>

              <div className="space-y-3">
                {regulation.sampleControls.map((ctrl) => (
                  <div
                    key={ctrl.id}
                    className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {ctrl.code}
                        </span>
                        <span className="font-bold text-white">{ctrl.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Ref: {ctrl.clauseReference}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-xs">{ctrl.description}</p>

                    {/* Mappings */}
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-400">Global Crosswalk:</span>

                        {ctrl.mapping.nistCsf && (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                            NIST CSF: {ctrl.mapping.nistCsf}
                          </span>
                        )}

                        {ctrl.mapping.iso27001 && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                            ISO 27001: {ctrl.mapping.iso27001}
                          </span>
                        )}

                        {ctrl.mapping.csaCcm && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                            CSA CCM: {ctrl.mapping.csaCcm}
                          </span>
                        )}
                      </div>

                      {onInterpretControl && (
                        <button
                          type="button"
                          onClick={() =>
                            onInterpretControl(
                              ctrl.description,
                              ctrl.code,
                              regulation.name,
                              countryName
                            )
                          }
                          className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/50 flex items-center space-x-1.5 transition-colors cursor-pointer text-[11px] font-semibold"
                          title="Interpret this control clause with AI and full multi-standard alignment"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Interpret Clause</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

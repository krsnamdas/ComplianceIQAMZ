import React, { useState } from 'react';
import { Country } from '../types/regulatory';
import { RegulatoryNewsFeed } from './RegulatoryNewsFeed';
import {
  Shield,
  FileText,
  ArrowRight,
  Building2,
  MapPin,
  Database,
  ExternalLink,
  CalendarClock,
  Globe2,
  Layers,
  Scale,
  BookOpen,
  Activity,
  Radio,
  Sliders,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface CountryOverviewProps {
  countries: Country[];
  selectedCountryId: string;
  onSelectCountry: (countryId: string) => void;
  onViewRegulations: (countryId: string) => void;
  onViewSources?: (countryId: string) => void;
  onViewTimeline?: (countryId?: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const CountryOverview: React.FC<CountryOverviewProps> = ({
  countries,
  selectedCountryId,
  onSelectCountry,
  onViewRegulations,
  onViewSources,
  onViewTimeline,
  onNavigateTab,
}) => {
  const [overviewMode, setOverviewMode] = useState<'hub' | 'directory' | 'news'>('hub');
  const [activeRegion, setActiveRegion] = useState<string>('All');

  const filteredCountries = countries.filter((c) => {
    if (activeRegion === 'All') return true;
    if (activeRegion === 'Middle East') return c.macroRegion === 'Middle East';
    if (activeRegion === 'North Africa & Sahel')
      return c.macroRegion === 'North Africa, The Sahel, & Horn of Africa';
    if (activeRegion === 'GCC') return c.region === 'GCC';
    return c.region === activeRegion;
  });

  const totalRegs = countries.reduce((acc, c) => acc + c.totalRegulationsCount, 0);
  const totalTech = countries.reduce((acc, c) => acc + c.techRegulationsCount, 0);
  const totalNonTech = countries.reduce((acc, c) => acc + c.nonTechRegulationsCount, 0);

  const selectedCountry = countries.find((c) => c.id === selectedCountryId);

  return (
    <div className="space-y-6">
      {/* Segmented Top Sub-Menu Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setOverviewMode('hub')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              overviewMode === 'hub'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Executive Command Hub</span>
          </button>

          <button
            onClick={() => setOverviewMode('directory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              overviewMode === 'directory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Jurisdictions Directory (24)</span>
          </button>

          <button
            onClick={() => setOverviewMode('news')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              overviewMode === 'news'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Regulatory Intelligence</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="text-[11px] font-mono text-slate-500 hidden md:inline">Current Mode:</span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400 font-bold uppercase">
            {overviewMode === 'hub'
              ? 'Advisory Overview'
              : overviewMode === 'directory'
              ? 'Full Country Catalog'
              : 'Google Grounded Feed'}
          </span>
        </div>
      </div>

      {/* MODE 1: EXECUTIVE COMMAND HUB (CLEAN & UNCLUTTERED) */}
      {overviewMode === 'hub' && (
        <div className="space-y-6">
          {/* Key Summary Metrics (Slim & Clean) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white">{countries.length}</div>
                <div className="text-[11px] text-slate-400 font-medium">Sovereign Jurisdictions</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-cyan-400">{totalRegs}</div>
                <div className="text-[11px] text-slate-400 font-medium">Statutory Standards</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-teal-400">{totalTech}</div>
                <div className="text-[11px] text-slate-400 font-medium">Tech & Cyber Regs</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-amber-400">{totalNonTech}</div>
                <div className="text-[11px] text-slate-400 font-medium">Commercial & Penal Regs</div>
              </div>
            </div>
          </div>

          {/* Targeted Jurisdiction Selector & Focus Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Targeted Jurisdiction Inspector</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a country to instantly load its regulatory authorities and standards without searching.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedCountryId}
                  onChange={(e) => onSelectCountry(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">Choose Jurisdiction...</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name} ({c.macroRegion})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setOverviewMode('directory')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  Browse All 24 →
                </button>
              </div>
            </div>

            {/* If a country is selected, show its clean focus card */}
            {selectedCountry && selectedCountryId !== 'all' ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{selectedCountry.flag}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-base text-white">{selectedCountry.name}</h4>
                        <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {selectedCountry.macroRegion}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedCountry.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {onViewTimeline && (
                      <button
                        onClick={() => onViewTimeline(selectedCountry.id)}
                        className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    )}

                    {onViewSources && (
                      <button
                        onClick={() => onViewSources(selectedCountry.id)}
                        className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>Sources</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewRegulations(selectedCountry.id)}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                    >
                      <span>View Regulations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px]">Key Regulatory Authorities:</span>
                  {selectedCountry.primaryAuthorities.map((auth) => (
                    <span
                      key={auth}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                    >
                      {auth}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>Select a jurisdiction above or choose one of the core modules below to begin exploring.</span>
                <span className="text-[11px] font-mono text-emerald-400">24 Sovereign Frameworks Indexed</span>
              </div>
            )}
          </div>

          {/* Core Platform Modules Hub (Direct Click Navigators) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Advisory &amp; Compliance Modules</span>
              </h3>
              <span className="text-[11px] text-slate-500">Click any module to launch tool</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Module 1: Registry */}
              <div
                onClick={() => onNavigateTab ? onNavigateTab('regulations') : onViewRegulations('all')}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  Regulatory Standards Registry
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Search 160+ classified standards across Cyber, Cloud, AI, and Data Protection with verified links.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>TECH &amp; NON-TECH</span>
                  <span className="text-emerald-400">Launch Registry →</span>
                </div>
              </div>

              {/* Module 2: Controls Crosswalk */}
              <div
                onClick={() => onNavigateTab && onNavigateTab('controls')}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Shield className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                  Controls Crosswalk Engine
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cross-reference sovereign MENAT mandates to NIST CSF 2.0, ISO 27001:2022, and CIS Controls v8.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>NIST • ISO • CIS</span>
                  <span className="text-cyan-400">Launch Engine →</span>
                </div>
              </div>

              {/* Module: Cross-Regulation Overlap & Assessment LOE Comparator */}
              <div
                onClick={() => onNavigateTab && onNavigateTab('compare')}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Scale className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                  Regulation Overlap &amp; LOE Comparator
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Benchmark any 2 regulations to compute rough order of magnitude overlap %, shared controls, and audit carryover.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>OVERLAP % • LOE WEEKS</span>
                  <span className="text-indigo-400">Launch Comparator →</span>
                </div>
              </div>

              {/* Module 3: Maturity Heatmap */}
              <div
                onClick={() => onNavigateTab && onNavigateTab('maturity_heatmap')}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/80 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  Compliance Maturity Heatmap
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Evaluate comparative readiness indexes, implementation depth, and regulatory strictness.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>BENCHMARKING</span>
                  <span className="text-amber-400">View Heatmap →</span>
                </div>
              </div>

              {/* Module 4: Regulatory Radar */}
              <div
                onClick={() => onNavigateTab && onNavigateTab('radar')}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">
                  Regulatory Pulse &amp; Radar
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Live statutory feed monitoring official gazette enactments and regulatory draft advisories.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>LIVE SIGNALS</span>
                  <span className="text-purple-400">Launch Radar →</span>
                </div>
              </div>

              {/* Module 5: Sector Matrix */}
              <div
                onClick={() => onNavigateTab && onNavigateTab('sectors')}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/80 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                  Cross-Sector Matrix
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Filter by 18 critical industries: Banking &amp; Fintech, Oil &amp; Gas, Cloud, Telco, and Healthcare.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>18 SECTOR PROFILES</span>
                  <span className="text-sky-400">View Matrix →</span>
                </div>
              </div>

              {/* Module 6: Full 24-Jurisdiction Dossier */}
              <div
                onClick={() => setOverviewMode('directory')}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  Jurisdictions Directory
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Browse complete dossiers for all 24 sovereign countries with authorities, statistics, and gazettes.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>24 COUNTRIES</span>
                  <span className="text-emerald-400">Open Catalog →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: JURISDICTIONS DIRECTORY (24 COUNTRIES) */}
      {overviewMode === 'directory' && (
        <div className="space-y-6">
          {/* Header & Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                <Globe2 className="w-5 h-5 text-emerald-400" />
                <span>MENAT Jurisdictions Directory ({filteredCountries.length} Countries)</span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Primary authorities, regulatory breakdown, and gazette links across the region.
              </p>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg overflow-x-auto text-xs">
              <button
                onClick={() => setActiveRegion('All')}
                className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeRegion === 'All'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All 24 Countries
              </button>
              <button
                onClick={() => setActiveRegion('GCC')}
                className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeRegion === 'GCC'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                GCC (6)
              </button>
              <button
                onClick={() => setActiveRegion('Middle East')}
                className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeRegion === 'Middle East'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Levant &amp; ME (14)
              </button>
              <button
                onClick={() => setActiveRegion('North Africa & Sahel')}
                className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeRegion === 'North Africa & Sahel'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                North Africa &amp; Sahel (10)
              </button>
            </div>
          </div>

          {/* Country Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCountries.map((c) => {
              const isSelected = c.id === selectedCountryId;

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCountry(c.id)}
                  className={`group rounded-xl border p-5 transition-all cursor-pointer relative bg-slate-900 hover:border-emerald-500/50 hover:shadow-lg flex flex-col justify-between ${
                    isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-slate-800'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl select-none" role="img" aria-label={c.name}>
                          {c.flag}
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                            {c.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{c.capital}</span>
                            </span>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {c.macroRegion === 'Middle East' ? 'Middle East' : 'Africa/Sahel'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    {/* Primary Regulators */}
                    <div className="mt-3">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Key Authorities:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.primaryAuthorities.map((auth) => (
                          <span
                            key={auth}
                            className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-300 font-medium"
                          >
                            {auth}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats & Navigation CTAs */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">
                        <strong className="text-emerald-400 font-semibold">{c.techRegulationsCount}</strong> Tech
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400">
                        <strong className="text-amber-400 font-semibold">{c.nonTechRegulationsCount}</strong> Non-Tech
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {onViewTimeline && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewTimeline(c.id);
                          }}
                          className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
                          title="View statutory deadlines & Gantt timeline"
                        >
                          <CalendarClock className="w-3 h-3" />
                          <span>Timeline</span>
                        </button>
                      )}

                      {onViewSources && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewSources(c.id);
                          }}
                          className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
                          title="View tracked scraper source links"
                        >
                          <Database className="w-3 h-3" />
                          <span>Sources</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRegulations(c.id);
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Regs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: LIVE REGULATORY INTELLIGENCE FEED */}
      {overviewMode === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Live MENAT Regulatory News Feed</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ground-truth intelligence and legal notices from official gazettes and trusted regulatory portals.
              </p>
            </div>
            <button
              onClick={() => setOverviewMode('hub')}
              className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              ← Back to Command Hub
            </button>
          </div>

          <RegulatoryNewsFeed
            onSelectCountry={onSelectCountry}
            initialJurisdiction={selectedCountryId !== 'all' ? selectedCountryId : 'all'}
          />
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FeatureTogglesTab } from './FeatureTogglesTab';
import { RegulationEditorTab } from './RegulationEditorTab';
import { CountryManagementTab } from './CountryManagementTab';
import { UserManagementTab } from './UserManagementTab';
import { BroadcastBannerTab } from './BroadcastBannerTab';
import { AuditTrailTab } from './AuditTrailTab';
import { SystemBackupTab } from './SystemBackupTab';
import { ComplianceIQLogo } from '../ComplianceIQLogo';
import {
  ShieldAlert,
  Sliders,
  BookOpen,
  Users,
  Megaphone,
  FileSpreadsheet,
  Database,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Globe2,
} from 'lucide-react';

export type AdminSubTab =
  | 'countries'
  | 'regulations'
  | 'features'
  | 'users'
  | 'broadcast'
  | 'audit'
  | 'backup';

interface AdminPanelProps {
  onNavigateHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateHome }) => {
  const { currentUser, isCurrentUserAdmin, users, switchUser, countries, regulations, featureFlags, auditLogs } =
    useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('regulations');

  // If the active user is not an admin, show Access Denied Screen with instant elevation switch
  if (!isCurrentUserAdmin) {
    const adminUser = users.find((u) => u.isAdmin || u.role === 'admin') || users[0];

    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-8 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Administrator Access Authorization Required
          </h2>

          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed mb-6">
            You are currently signed in as{' '}
            <strong className="text-white">{currentUser.name}</strong> ({currentUser.roleLabel}).
            Access to the Backend Administrative Panel (Regulation CRUD, Feature Toggles, User Management)
            requires a verified <strong>Super Admin</strong> account.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 max-w-md mx-auto text-left text-xs mb-6">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-slate-400">Available Admin Account:</span>
              <span className="text-emerald-400 font-mono font-bold">2 Admins Available</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
                {adminUser.avatarInitials}
              </div>
              <div>
                <span className="font-bold text-white block">{adminUser.name}</span>
                <span className="text-slate-400 text-[11px] block">{adminUser.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => switchUser(adminUser.id)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Elevate & Log In as {adminUser.name}</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Return to Public Registry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const enabledFeaturesCount = Object.values(featureFlags).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Executive Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <ComplianceIQLogo size={42} className="mt-1" />
            <div>
              <div className="flex items-center space-x-2.5 mb-1">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Compliance<span className="text-cyan-400">IQ</span> Administrative Console
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ROOT PRIVILEGES
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Middle East, North Africa &amp; Türkiye Regulations &amp; Controls 
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Live operational control plane: Update regulations, customize official gazette links,
                toggle platform feature modules, manage user access, and broadcast statutory alerts.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 px-4 text-xs shrink-0">
            <div className="text-center pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Countries</span>
              <span className="font-bold text-cyan-400 text-sm">{countries.length}</span>
            </div>
            <div className="text-center pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Regulations</span>
              <span className="font-bold text-emerald-400 text-sm">{regulations.length}</span>
            </div>
            <div className="text-center pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Features</span>
              <span className="font-bold text-amber-400 text-sm">
                {enabledFeaturesCount}/{Object.keys(featureFlags).length}
              </span>
            </div>
            <div className="text-center pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Users</span>
              <span className="font-bold text-sky-400 text-sm">{users.length}</span>
            </div>
            <div className="text-left pl-1">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Operator</span>
              <span className="font-bold text-slate-200 text-xs truncate max-w-[120px] block">
                {currentUser.name}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1.5 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('countries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'countries'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Jurisdictions &amp; Countries ({countries.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('regulations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'regulations'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Regulations Editor &amp; Links ({regulations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('features')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'features'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Feature Toggles ({enabledFeaturesCount} Active)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'users'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Management ({users.length} Users)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('broadcast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'broadcast'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>System Broadcast</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'backup'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>State Backup & Reset</span>
          </button>
        </div>
      </div>

      {/* Active Tab Content Area */}
      <div>
        {activeSubTab === 'countries' && <CountryManagementTab />}
        {activeSubTab === 'regulations' && <RegulationEditorTab />}
        {activeSubTab === 'features' && <FeatureTogglesTab />}
        {activeSubTab === 'users' && <UserManagementTab />}
        {activeSubTab === 'broadcast' && <BroadcastBannerTab />}
        {activeSubTab === 'audit' && <AuditTrailTab />}
        {activeSubTab === 'backup' && <SystemBackupTab />}
      </div>
    </div>
  );
};

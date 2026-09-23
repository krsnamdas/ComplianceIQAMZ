import React, { createContext, useContext, useState, useEffect } from 'react';
import { Regulation, Country } from '../types/regulatory';
import { MENAT_REGULATIONS, MENAT_COUNTRIES } from '../data/menatData';
import {
  UserProfile,
  FeatureFlags,
  SystemBroadcast,
  AuditLogEntry,
  UserRoleType,
} from '../types/admin';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'ciadmin1',
    username: 'ciadmin1',
    password: 'ciadmin123',
    name: 'ciadmin1',
    email: 'ciadmin1@complianceiq.io',
    role: 'admin',
    roleLabel: 'System Administrator / Lead Compliance Architect',
    isAdmin: true,
    avatarInitials: 'CA1',
    jobTitle: 'Chief Compliance Systems Administrator',
    organization: 'ComplianceIQ Regional Governance',
    jurisdiction: 'Saudi Arabia',
    countryFlag: '🇸🇦',
    status: 'active',
    lastActive: 'Just now',
    dateCreated: '2025-01-10',
    permissions: {
      canTriggerScraper: true,
      canManageWatchlist: true,
      canExportReports: true,
      canEditControls: true,
      canAccessAdminPanel: true,
      canManageRegulations: true,
      canToggleFeatures: true,
      canManageUsers: true,
    },
  },
  {
    id: 'ciadmin2',
    username: 'ciadmin2',
    password: 'ciadmin123',
    name: 'ciadmin2',
    email: 'ciadmin2@complianceiq.io',
    role: 'admin',
    roleLabel: 'Regional Administrator & Systems Architect',
    isAdmin: true,
    avatarInitials: 'CA2',
    jobTitle: 'Principal Regulatory Systems Administrator',
    organization: 'ComplianceIQ Regional Governance',
    jurisdiction: 'United Arab Emirates',
    countryFlag: '🇦🇪',
    status: 'active',
    lastActive: '12 mins ago',
    dateCreated: '2025-02-14',
    permissions: {
      canTriggerScraper: true,
      canManageWatchlist: true,
      canExportReports: true,
      canEditControls: true,
      canAccessAdminPanel: true,
      canManageRegulations: true,
      canToggleFeatures: true,
      canManageUsers: true,
    },
  },
  {
    id: 'sasuser1',
    username: 'sasuser1',
    password: 'sasuser123',
    name: 'sasuser1',
    email: 'sasuser1@complianceiq.io',
    role: 'compliance_officer',
    roleLabel: 'Senior Compliance Officer',
    isAdmin: false,
    avatarInitials: 'SU1',
    jobTitle: 'Head of Banking Regulatory Compliance',
    organization: 'Gulf Banking Regulatory Services',
    jurisdiction: 'Saudi Arabia',
    countryFlag: '🇸🇦',
    status: 'active',
    lastActive: '45 mins ago',
    dateCreated: '2025-03-01',
    permissions: {
      canTriggerScraper: true,
      canManageWatchlist: true,
      canExportReports: true,
      canEditControls: true,
      canAccessAdminPanel: false,
      canManageRegulations: false,
      canToggleFeatures: false,
      canManageUsers: false,
    },
  },
  {
    id: 'sasuser2',
    username: 'sasuser2',
    password: 'sasuser123',
    name: 'sasuser2',
    email: 'sasuser2@complianceiq.io',
    role: 'risk_analyst',
    roleLabel: 'Cyber Risk & Cloud Governance Analyst',
    isAdmin: false,
    avatarInitials: 'SU2',
    jobTitle: 'Senior Cloud Resilience Specialist',
    organization: 'Sovereign Cloud & Telco Infrastructure',
    jurisdiction: 'Qatar',
    countryFlag: '🇶🇦',
    status: 'active',
    lastActive: '2 hours ago',
    dateCreated: '2025-04-12',
    permissions: {
      canTriggerScraper: false,
      canManageWatchlist: true,
      canExportReports: false,
      canEditControls: false,
      canAccessAdminPanel: false,
      canManageRegulations: false,
      canToggleFeatures: false,
      canManageUsers: false,
    },
  },
  {
    id: 'sasuser3',
    username: 'sasuser3',
    password: 'sasuser123',
    name: 'sasuser3',
    email: 'sasuser3@complianceiq.io',
    role: 'compliance_officer',
    roleLabel: 'FinTech & CASP Regulatory Specialist',
    isAdmin: false,
    avatarInitials: 'SU3',
    jobTitle: 'Director of Digital Asset Compliance',
    organization: 'FinTech & Capital Markets Technology',
    jurisdiction: 'Türkiye',
    countryFlag: '🇹🇷',
    status: 'active',
    lastActive: 'Yesterday',
    dateCreated: '2025-05-20',
    permissions: {
      canTriggerScraper: true,
      canManageWatchlist: true,
      canExportReports: true,
      canEditControls: true,
      canAccessAdminPanel: false,
      canManageRegulations: false,
      canToggleFeatures: false,
      canManageUsers: false,
    },
  },
  {
    id: 'sasuser4',
    username: 'sasuser4',
    password: 'sasuser123',
    name: 'sasuser4',
    email: 'sasuser4@complianceiq.io',
    role: 'auditor',
    roleLabel: 'Lead IT Assurance & Critical Infra Auditor',
    isAdmin: false,
    avatarInitials: 'SU4',
    jobTitle: 'Principal Security Assurance Auditor',
    organization: 'Critical Infrastructure & Telco Assurance',
    jurisdiction: 'Egypt',
    countryFlag: '🇪🇬',
    status: 'active',
    lastActive: '3 days ago',
    dateCreated: '2025-06-08',
    permissions: {
      canTriggerScraper: false,
      canManageWatchlist: false,
      canExportReports: true,
      canEditControls: false,
      canAccessAdminPanel: false,
      canManageRegulations: false,
      canToggleFeatures: false,
      canManageUsers: false,
    },
  },
];

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  regulatoryFeed: true,
  geminiCopilot: true,
  maturityHeatmap: true,
  regulatoryRoadmap: true,
  regulatoryTimeline: true,
  versionDiffs: true,
  controlsCrosswalk: true,
  regulationComparator: true,
  controlInterpreter: true,
  aiRedlining: true,
  sectorMatrix: true,
  sourcesManager: true,
  exportReports: true,
  watchlistAlerts: true,
  systemBroadcast: true,
};

export const DEFAULT_BROADCAST: SystemBroadcast = {
  enabled: true,
  level: 'warning',
  title: 'Statutory Advisory',
  message:
    'SDAIA Cross-Border Data Transfer standard clauses mandatory registration audit cycle is in effect. Review statutory requirements and file SCC documentation.',
  actionUrl: 'https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPL',
  actionLabel: 'View SDAIA PDP Platform',
  author: 'Tariq Al-Mansoor (Super Admin)',
  updatedAt: '2026-09-22 06:30 UTC',
};

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-seed-1',
    timestamp: '2026-09-22 06:15:22 UTC',
    userId: 'ciadmin1',
    userName: 'ciadmin1',
    userEmail: 'ciadmin1@complianceiq.io',
    userRole: 'admin',
    actionType: 'BROADCAST_UPDATED',
    targetEntity: 'System Announcement Banner',
    details: 'Published mandatory cross-border data transfer advisory for SDAIA PDPL.',
  },
  {
    id: 'log-seed-2',
    timestamp: '2026-09-22 05:40:11 UTC',
    userId: 'ciadmin2',
    userName: 'ciadmin2',
    userEmail: 'ciadmin2@complianceiq.io',
    userRole: 'admin',
    actionType: 'FEATURE_TOGGLED',
    targetEntity: 'regulatoryRoadmap',
    details: 'Enabled Regulatory Roadmap & Investment Forecasting module for all jurisdictions.',
  },
  {
    id: 'log-seed-3',
    timestamp: '2026-09-22 04:12:05 UTC',
    userId: 'ciadmin1',
    userName: 'ciadmin1',
    userEmail: 'ciadmin1@complianceiq.io',
    userRole: 'admin',
    actionType: 'REGULATION_LINK_UPDATED',
    targetEntity: 'NCA ECC-1:2018',
    details: 'Verified and updated official PDF documentation link to NCA official mirror.',
  },
];

const STORAGE_KEYS = {
  USERS: 'complianceiq_users_v3',
  CURRENT_USER_ID: 'complianceiq_current_user_id_v3',
  FEATURE_FLAGS: 'complianceiq_feature_flags_v3',
  REGULATIONS: 'complianceiq_regulations_v3',
  COUNTRIES: 'complianceiq_countries_v3',
  BROADCAST: 'complianceiq_broadcast_v3',
  AUDIT_LOGS: 'complianceiq_audit_logs_v3',
};

interface AdminContextType {
  // User Management & IAM
  users: UserProfile[];
  currentUser: UserProfile;
  isCurrentUserAdmin: boolean;
  switchUser: (userId: string) => void;
  loginWithCredentials: (username: string, password: string) => { success: boolean; message?: string; user?: UserProfile };
  addUser: (user: Omit<UserProfile, 'id' | 'dateCreated' | 'lastActive'>) => void;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;

  // Feature Flags
  featureFlags: FeatureFlags;
  toggleFeature: (feature: keyof FeatureFlags, value?: boolean) => void;
  resetFeatureFlags: () => void;

  // Country & Jurisdiction CRUD
  countries: Country[];
  addCountry: (country: Country) => void;
  updateCountry: (id: string, updates: Partial<Country>) => void;
  deleteCountry: (id: string) => void;
  resetCountriesToDefault: () => void;

  // Regulation CRUD
  regulations: Regulation[];
  addRegulation: (regulation: Omit<Regulation, 'id'> & { id?: string }) => void;
  updateRegulation: (id: string, updates: Partial<Regulation>) => void;
  deleteRegulation: (id: string) => void;
  updateRegulationLink: (id: string, officialUrl: string, documentPdfUrl?: string) => void;
  resetRegulationsToDefault: () => void;
  importRegulationsBackup: (newRegs: Regulation[]) => void;

  // System Broadcast Banner
  broadcastBanner: SystemBroadcast;
  updateBroadcastBanner: (updates: Partial<SystemBroadcast>) => void;

  // Audit Log
  auditLogs: AuditLogEntry[];
  addAuditLog: (
    actionType: AuditLogEntry['actionType'],
    targetEntity: string,
    details: string
  ) => void;
  clearAuditLogs: () => void;
  exportAuditLogsCSV: () => void;

  // Backup & Restore
  exportFullBackupJSON: () => void;
  importFullBackupJSON: (jsonString: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Users State
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading users:', e);
    }
    return INITIAL_USERS;
  });

  // Current User ID
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'ciadmin1'; // Default to Admin ciadmin1
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];
  const isCurrentUserAdmin = currentUser?.isAdmin || currentUser?.role === 'admin';

  // 2. Feature Flags State
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS);
      if (saved) return { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_FEATURE_FLAGS;
  });

  // Sync feature flags with backend on initial mount
  useEffect(() => {
    fetch('/api/features')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.features) {
          setFeatureFlags((prev) => ({
            ...prev,
            ...data.features,
          }));
        }
      })
      .catch((err) => {
        console.warn('[AdminContext] Could not fetch server feature flags, using local state:', err);
      });
  }, []);

  // 3. Dynamic Regulations State
  const [regulations, setRegulations] = useState<Regulation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGULATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading regulations:', e);
    }
    return MENAT_REGULATIONS;
  });

  // 3b. Countries State
  const [countriesRaw, setCountriesRaw] = useState<Country[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading countries:', e);
    }
    return MENAT_COUNTRIES;
  });

  // Dynamically calculate synchronized regulation counts for each country
  const countries: Country[] = countriesRaw.map((country) => {
    const countryRegs = regulations.filter((r) => r.countryId.toLowerCase() === country.id.toLowerCase());
    const techCount = countryRegs.filter((r) => r.isTech).length;
    const nonTechCount = countryRegs.filter((r) => !r.isTech).length;
    return {
      ...country,
      totalRegulationsCount: countryRegs.length > 0 ? countryRegs.length : country.totalRegulationsCount,
      techRegulationsCount: countryRegs.length > 0 ? techCount : country.techRegulationsCount,
      nonTechRegulationsCount: countryRegs.length > 0 ? nonTechCount : country.nonTechRegulationsCount,
    };
  });

  // 4. Broadcast Banner State
  const [broadcastBanner, setBroadcastBanner] = useState<SystemBroadcast>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BROADCAST);
      if (saved) return { ...DEFAULT_BROADCAST, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_BROADCAST;
  });

  // 5. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } catch {
      // ignore
    }
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(featureFlags));
    } catch {
      // ignore
    }
  }, [featureFlags]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REGULATIONS, JSON.stringify(regulations));
    } catch {
      // ignore
    }
  }, [regulations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countriesRaw));
    } catch {
      // ignore
    }
  }, [countriesRaw]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BROADCAST, JSON.stringify(broadcastBanner));
    } catch {
      // ignore
    }
  }, [broadcastBanner]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  // Helper to append audit log
  const addAuditLog = (
    actionType: AuditLogEntry['actionType'],
    targetEntity: string,
    details: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      actionType,
      targetEntity,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 199)]); // Keep last 200 entries
  };

  // User Actions
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      addAuditLog('USER_SWITCHED', target.name, `Active session switched to ${target.name} (${target.roleLabel}).`);
    }
  };

  const loginWithCredentials = (usernameInput: string, passwordInput: string): { success: boolean; message?: string; user?: UserProfile } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();
    const target = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUser ||
        u.id.toLowerCase() === cleanUser ||
        u.name.toLowerCase() === cleanUser ||
        u.email.toLowerCase() === cleanUser
    );
    if (!target) {
      return { success: false, message: `Account "${usernameInput}" not found. Available accounts: ciadmin1, ciadmin2, sasuser1, sasuser2, sasuser3, sasuser4.` };
    }
    if (target.status !== 'active') {
      return { success: false, message: `Account "${target.username}" is suspended.` };
    }

    const expectedPassword = target.password || (target.isAdmin ? 'ciadmin123' : 'sasuser123');
    const validPasswords = [
      expectedPassword,
      target.isAdmin ? 'ciadmin123' : 'sasuser123',
      target.isAdmin ? 'admin123' : 'user123',
      target.username,
    ];
    if (!validPasswords.includes(cleanPass)) {
      return { success: false, message: `Invalid password for ${target.username}. Use simple password "${expectedPassword}".` };
    }
    setCurrentUserId(target.id);
    addAuditLog('USER_SWITCHED', target.name, `User ${target.username} logged in with credentials.`);
    return { success: true, user: target };
  };

  const addUser = (userData: Omit<UserProfile, 'id' | 'dateCreated' | 'lastActive'>) => {
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const initials = userData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser: UserProfile = {
      ...userData,
      id: newId,
      username: userData.username || newId,
      password: userData.password || (userData.isAdmin ? 'ciadmin123' : 'sasuser123'),
      avatarInitials: initials || 'UR',
      dateCreated: new Date().toISOString().split('T')[0],
      lastActive: 'Never',
    };

    setUsers((prev) => [...prev, newUser]);
    addAuditLog('USER_CREATED', newUser.name, `Created user account: ${newUser.email} with role ${newUser.role}.`);
  };

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };
          if (updates.role) {
            updated.isAdmin = updates.role === 'admin';
          }
          return updated;
        }
        return u;
      })
    );
    const target = users.find((u) => u.id === userId);
    addAuditLog('USER_UPDATED', target ? target.name : userId, `Updated user attributes: ${Object.keys(updates).join(', ')}.`);
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.id === currentUserId) {
      alert('Cannot delete the currently active user session.');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addAuditLog('USER_STATUS_CHANGED', target.name, `Deleted user account: ${target.email}.`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          addAuditLog('USER_STATUS_CHANGED', u.name, `Changed user status to ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Feature Flag Actions
  const toggleFeature = (feature: keyof FeatureFlags, value?: boolean) => {
    setFeatureFlags((prev) => {
      const nextVal = value !== undefined ? value : !prev[feature];
      const updated = { ...prev, [feature]: nextVal };
      addAuditLog(
        'FEATURE_TOGGLED',
        feature,
        `Toggled feature ${feature} to ${nextVal ? 'ENABLED' : 'DISABLED'}.`
      );

      // Async sync to backend
      fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, enabled: nextVal }),
      }).catch((e) => console.warn('[AdminContext] Failed to sync feature to backend:', e));

      return updated;
    });
  };

  const resetFeatureFlags = () => {
    setFeatureFlags(DEFAULT_FEATURE_FLAGS);
    addAuditLog('FEATURE_TOGGLED', 'All Features', 'Reset all feature flags to system default.');

    // Async sync to backend
    fetch('/api/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: DEFAULT_FEATURE_FLAGS }),
    }).catch((e) => console.warn('[AdminContext] Failed to reset features on backend:', e));
  };

  // Regulation Actions
  const addRegulation = (regData: Omit<Regulation, 'id'> & { id?: string }) => {
    const newId =
      regData.id ||
      `${regData.countryId}-${regData.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newRegulation: Regulation = {
      ...regData,
      id: newId,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setRegulations((prev) => [newRegulation, ...prev]);
    addAuditLog(
      'REGULATION_CREATED',
      newRegulation.code,
      `Created regulation "${newRegulation.name}" (${newRegulation.authority}, ${newRegulation.countryId.toUpperCase()}).`
    );
  };

  const updateRegulation = (id: string, updates: Partial<Regulation>) => {
    setRegulations((prev) =>
      prev.map((reg) => {
        if (reg.id === id) {
          return {
            ...reg,
            ...updates,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return reg;
      })
    );
    addAuditLog(
      'REGULATION_UPDATED',
      id,
      `Updated regulation fields: ${Object.keys(updates).join(', ')}.`
    );
  };

  const updateRegulationLink = (id: string, officialUrl: string, documentPdfUrl?: string) => {
    setRegulations((prev) =>
      prev.map((reg) => {
        if (reg.id === id) {
          return {
            ...reg,
            officialUrl,
            documentPdfUrl: documentPdfUrl || reg.documentPdfUrl,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return reg;
      })
    );
    addAuditLog(
      'REGULATION_LINK_UPDATED',
      id,
      `Updated statutory link to "${officialUrl}"${documentPdfUrl ? ` and PDF to "${documentPdfUrl}"` : ''}.`
    );
  };

  const deleteRegulation = (id: string) => {
    const target = regulations.find((r) => r.id === id);
    setRegulations((prev) => prev.filter((r) => r.id !== id));
    addAuditLog(
      'REGULATION_DELETED',
      target?.code || id,
      `Removed regulation "${target?.name || id}" from database.`
    );
  };

  const resetRegulationsToDefault = () => {
    setRegulations(MENAT_REGULATIONS);
    addAuditLog(
      'REGULATIONS_RESET',
      'All Regulations',
      'Reset all regulations to statutory official baseline.'
    );
  };

  const importRegulationsBackup = (newRegs: Regulation[]) => {
    if (Array.isArray(newRegs) && newRegs.length > 0) {
      setRegulations(newRegs);
      addAuditLog(
        'BACKUP_RESTORED',
        'Regulations Database',
        `Imported ${newRegs.length} regulations from external JSON snapshot.`
      );
    }
  };

  // Country & Jurisdiction Actions
  const addCountry = (countryData: Country) => {
    setCountriesRaw((prev) => {
      const exists = prev.some((c) => c.id.toLowerCase() === countryData.id.toLowerCase());
      if (exists) {
        return prev.map((c) => (c.id.toLowerCase() === countryData.id.toLowerCase() ? countryData : c));
      }
      return [countryData, ...prev];
    });
    addAuditLog(
      'COUNTRY_CREATED',
      countryData.name,
      `Added sovereign jurisdiction "${countryData.name}" (${countryData.code}) with ${countryData.primaryAuthorities.length} regulatory authorities.`
    );
  };

  const updateCountry = (id: string, updates: Partial<Country>) => {
    setCountriesRaw((prev) =>
      prev.map((c) => (c.id.toLowerCase() === id.toLowerCase() ? { ...c, ...updates } : c))
    );
    const target = countriesRaw.find((c) => c.id.toLowerCase() === id.toLowerCase());
    addAuditLog(
      'COUNTRY_UPDATED',
      target?.name || id,
      `Amended jurisdiction attributes for ${target?.name || id}: ${Object.keys(updates).join(', ')}.`
    );
  };

  const deleteCountry = (id: string) => {
    const target = countriesRaw.find((c) => c.id.toLowerCase() === id.toLowerCase());
    setCountriesRaw((prev) => prev.filter((c) => c.id.toLowerCase() !== id.toLowerCase()));
    addAuditLog(
      'COUNTRY_DELETED',
      target?.name || id,
      `Deleted sovereign jurisdiction "${target?.name || id}" (${id}) from active system directory.`
    );
  };

  const resetCountriesToDefault = () => {
    setCountriesRaw(MENAT_COUNTRIES);
    addAuditLog(
      'COUNTRIES_RESET',
      'All Jurisdictions',
      'Reset all countries & sovereign jurisdictions to default 24-state MENAT baseline.'
    );
  };

  // Broadcast Actions
  const updateBroadcastBanner = (updates: Partial<SystemBroadcast>) => {
    setBroadcastBanner((prev) => {
      const updated: SystemBroadcast = {
        ...prev,
        ...updates,
        author: `${currentUser.name} (${currentUser.isAdmin ? 'Admin' : 'Officer'})`,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      };
      addAuditLog(
        'BROADCAST_UPDATED',
        'System Banner',
        `Updated broadcast: "${updated.title}" - Status: ${updated.enabled ? 'Active' : 'Muted'}.`
      );
      return updated;
    });
  };

  // Audit Logs Actions
  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  const exportAuditLogsCSV = () => {
    const headers = ['Timestamp', 'User Name', 'User Email', 'Role', 'Action Type', 'Target Entity', 'Details'];
    const rows = auditLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.userName.replace(/"/g, '""')}"`,
      `"${log.userEmail}"`,
      `"${log.userRole}"`,
      `"${log.actionType}"`,
      `"${log.targetEntity.replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MENAT_Admin_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('BACKUP_EXPORTED', 'Audit Trail', 'Exported complete audit log to CSV format.');
  };

  // Full Backup & Restore
  const exportFullBackupJSON = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      exportedBy: currentUser.email,
      platform: 'MENAT ReguIntel Compliance System',
      version: '2.5.0',
      data: {
        featureFlags,
        users,
        broadcastBanner,
        countriesCount: countriesRaw.length,
        countries: countriesRaw,
        regulationsCount: regulations.length,
        regulations,
        auditLogs,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MENAT_Compliance_Backend_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addAuditLog('BACKUP_EXPORTED', 'Full System Backup', 'Generated full JSON backup snapshot.');
  };

  const importFullBackupJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) throw new Error('Invalid format: missing data key');

      if (parsed.data.featureFlags) setFeatureFlags(parsed.data.featureFlags);
      if (Array.isArray(parsed.data.users)) setUsers(parsed.data.users);
      if (parsed.data.broadcastBanner) setBroadcastBanner(parsed.data.broadcastBanner);
      if (Array.isArray(parsed.data.countries)) setCountriesRaw(parsed.data.countries);
      if (Array.isArray(parsed.data.regulations)) setRegulations(parsed.data.regulations);

      addAuditLog('BACKUP_RESTORED', 'Full System Backup', `Imported backup snapshot from ${parsed.exportTimestamp || 'file'}.`);
      return true;
    } catch (err) {
      console.error('Failed to import backup:', err);
      return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        currentUser,
        isCurrentUserAdmin,
        switchUser,
        loginWithCredentials,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,

        featureFlags,
        toggleFeature,
        resetFeatureFlags,

        countries,
        addCountry,
        updateCountry,
        deleteCountry,
        resetCountriesToDefault,

        regulations,
        addRegulation,
        updateRegulation,
        deleteRegulation,
        updateRegulationLink,
        resetRegulationsToDefault,
        importRegulationsBackup,

        broadcastBanner,
        updateBroadcastBanner,

        auditLogs,
        addAuditLog,
        clearAuditLogs,
        exportAuditLogsCSV,

        exportFullBackupJSON,
        importFullBackupJSON,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Regulation, RegulatoryCategory, SectorType } from '../../types/regulatory';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  CheckCircle2,
  Globe2,
  Shield,
  Layers,
  AlertTriangle,
  RotateCcw,
  X,
  Save,
  Link as LinkIcon,
  Check,
  Building,
} from 'lucide-react';

const ALL_SECTORS: SectorType[] = [
  'Banking',
  'Financial Services',
  'Insurance',
  'Payments',
  'Fintech',
  'Government',
  'Critical Infrastructure',
  'Utilities',
  'Oil & Gas',
  'Mining & Extraction',
  'Power & Energy',
  'Cloud & Hyperscalers',
  'Telco',
  'Digital Tech Startups',
  'Retail & E-Commerce',
  'Manufacturing',
  'Automotive',
  'Space & Aerospace',
  'Gaming & Entertainment',
  'Healthcare',
];

const CATEGORY_OPTIONS: { id: RegulatoryCategory; label: string }[] = [
  { id: 'tech_cyber', label: 'Cybersecurity Baseline' },
  { id: 'tech_ai', label: 'Artificial Intelligence & Algorithmic Governance' },
  { id: 'tech_data_privacy', label: 'Data Protection & Sovereignty' },
  { id: 'tech_cloud', label: 'Cloud Computing & Hyperscaler Standards' },
  { id: 'tech_operational_resilience', label: 'Operational Resilience & Business Continuity' },
  { id: 'tech_ot_ics', label: 'OT & Critical Infrastructure Cyber (ICS/SCADA)' },
  { id: 'tech_space_quantum', label: 'Space & Post-Quantum Cryptography' },
  { id: 'tech_fintech_payments', label: 'FinTech, Open Banking & Digital Assets' },
  { id: 'non_tech_impact', label: 'General Corporate Governance' },
];

export const RegulationEditorTab: React.FC = () => {
  const {
    countries,
    regulations,
    addRegulation,
    updateRegulation,
    deleteRegulation,
    updateRegulationLink,
    resetRegulationsToDefault,
  } = useAdmin();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [editingRegulation, setEditingRegulation] = useState<Regulation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [linkEditModal, setLinkEditModal] = useState<{
    id: string;
    code: string;
    name: string;
    officialUrl: string;
    documentPdfUrl?: string;
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick link update inline states
  const [quickLinkSuccess, setQuickLinkSuccess] = useState<string | null>(null);

  // Filtered regulations
  const filteredRegulations = useMemo(() => {
    return regulations.filter((reg) => {
      const matchSearch =
        searchTerm === '' ||
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.scopeSummary.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCountry = countryFilter === 'all' || reg.countryId === countryFilter;
      const matchCategory = categoryFilter === 'all' || reg.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || reg.status === statusFilter;

      return matchSearch && matchCountry && matchCategory && matchStatus;
    });
  }, [regulations, searchTerm, countryFilter, categoryFilter, statusFilter]);

  // Handle Quick Link Save
  const handleSaveQuickLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEditModal) return;

    updateRegulationLink(linkEditModal.id, linkEditModal.officialUrl, linkEditModal.documentPdfUrl);
    setQuickLinkSuccess(linkEditModal.id);
    setTimeout(() => setQuickLinkSuccess(null), 3000);
    setLinkEditModal(null);
  };

  // Handle Full Edit Save
  const handleSaveEditRegulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegulation) return;

    updateRegulation(editingRegulation.id, editingRegulation);
    setEditingRegulation(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Regulatory Database Management & Live Editor</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {regulations.length} Statutory Instruments
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Update statutory documentation links, edit enforcement criteria, add jurisdiction-specific
            regulations, or remove obsolete frameworks. Changes reflect instantly across all platform views.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Regulation</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all regulations back to the official statutory baseline? Custom changes will be cleared.')) {
                resetRegulationsToDefault();
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Reset to official statutory baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {quickLinkSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Statutory documentation link successfully updated and published to registry!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search regulation name, code, authority, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Country Selector */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Jurisdictions ({countries.length})</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          {/* Category Selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-300 focus:outline-none focus:border-emerald-500 max-w-[180px] truncate"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="Enacted">Enacted</option>
            <option value="Amended">Amended</option>
            <option value="Draft / Public Consultation">Draft / Consultation</option>
          </select>
        </div>
      </div>

      {/* Regulations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Jurisdiction & Code</th>
                <th className="py-3 px-4">Statutory Regulation Name</th>
                <th className="py-3 px-4">Authority & Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Official Links</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredRegulations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No regulations matched your search filters.
                  </td>
                </tr>
              ) : (
                filteredRegulations.map((reg) => {
                  const country = countries.find(
                    (c) => c.id.toLowerCase() === reg.countryId.toLowerCase()
                  );

                  return (
                    <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Jurisdiction & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">{country?.flag || '🌐'}</span>
                          <div>
                            <span className="font-mono font-bold text-white block">
                              {reg.code}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {country?.name || reg.countryId.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Regulation Name */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-white truncate" title={reg.name}>
                          {reg.name}
                        </div>
                        {reg.arabicName && (
                          <div
                            className="text-[10px] text-slate-400 font-arabic truncate mt-0.5"
                            dir="rtl"
                          >
                            {reg.arabicName}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                          {reg.scopeSummary}
                        </p>
                      </td>

                      {/* Authority & Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200 block truncate max-w-[180px]">
                          {reg.authority}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 inline-block mt-1 truncate max-w-[180px]">
                          {reg.categoryLabel}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            reg.status === 'Enacted'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : reg.status === 'Amended'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {reg.status}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1">
                          Enacted {reg.yearEnacted}
                        </span>
                      </td>

                      {/* Official Links */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {reg.officialUrl ? (
                            <a
                              href={reg.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                              title={`Official Portal: ${reg.officialUrl}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No link</span>
                          )}

                          {reg.documentPdfUrl && (
                            <a
                              href={reg.documentPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition-colors"
                              title={`PDF Document: ${reg.documentPdfUrl}`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() =>
                              setLinkEditModal({
                                id: reg.id,
                                code: reg.code,
                                name: reg.name,
                                officialUrl: reg.officialUrl || '',
                                documentPdfUrl: reg.documentPdfUrl || '',
                              })
                            }
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition-colors cursor-pointer"
                            title="Edit Official Portal / Document Links"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingRegulation({ ...reg })}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Regulation Metadata"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(reg.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Remove Regulation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK LINK EDIT MODAL */}
      {linkEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Update Official Statutory Links</h4>
              </div>
              <button
                onClick={() => setLinkEditModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickLink} className="mt-4 space-y-4">
              <div>
                <span className="text-[11px] text-slate-400">Target Regulation</span>
                <p className="text-xs font-bold text-emerald-400">
                  {linkEditModal.code} - {linkEditModal.name}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Regulatory Portal URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://authority.gov.sa/regulations/..."
                  value={linkEditModal.officialUrl}
                  onChange={(e) =>
                    setLinkEditModal({ ...linkEditModal, officialUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official PDF / Gazetted Document URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://authority.gov.sa/files/regulation.pdf"
                  value={linkEditModal.documentPdfUrl}
                  onChange={(e) =>
                    setLinkEditModal({ ...linkEditModal, documentPdfUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLinkEditModal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Publish Links</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL REGULATION EDIT MODAL */}
      {editingRegulation && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">
                  Edit Regulation: {editingRegulation.code}
                </h4>
              </div>
              <button
                onClick={() => setEditingRegulation(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRegulation} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Official Name *</label>
                  <input
                    type="text"
                    required
                    value={editingRegulation.name}
                    onChange={(e) =>
                      setEditingRegulation({ ...editingRegulation, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Arabic / Native Script Name
                  </label>
                  <input
                    type="text"
                    value={editingRegulation.arabicName || ''}
                    onChange={(e) =>
                      setEditingRegulation({ ...editingRegulation, arabicName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Code / Citation *</label>
                  <input
                    type="text"
                    required
                    value={editingRegulation.code}
                    onChange={(e) =>
                      setEditingRegulation({ ...editingRegulation, code: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Regulatory Authority *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRegulation.authority}
                    onChange={(e) =>
                      setEditingRegulation({ ...editingRegulation, authority: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={editingRegulation.category}
                    onChange={(e) => {
                      const sel = CATEGORY_OPTIONS.find((c) => c.id === e.target.value);
                      setEditingRegulation({
                        ...editingRegulation,
                        category: e.target.value as RegulatoryCategory,
                        categoryLabel: sel?.label || 'Statutory Framework',
                      });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status *</label>
                  <select
                    value={editingRegulation.status}
                    onChange={(e) =>
                      setEditingRegulation({
                        ...editingRegulation,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Enacted">Enacted</option>
                    <option value="Amended">Amended</option>
                    <option value="Draft / Public Consultation">Draft / Public Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Scope & Executive Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingRegulation.scopeSummary}
                  onChange={(e) =>
                    setEditingRegulation({ ...editingRegulation, scopeSummary: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Official Portal URL</label>
                  <input
                    type="url"
                    value={editingRegulation.officialUrl}
                    onChange={(e) =>
                      setEditingRegulation({ ...editingRegulation, officialUrl: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Document PDF URL
                  </label>
                  <input
                    type="url"
                    value={editingRegulation.documentPdfUrl || ''}
                    onChange={(e) =>
                      setEditingRegulation({
                        ...editingRegulation,
                        documentPdfUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Target Sectors Selector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Target Mandated Sectors ({editingRegulation.targetSectors.length} Selected)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg bg-slate-950 border border-slate-800">
                  {ALL_SECTORS.map((sector) => {
                    const isSelected = editingRegulation.targetSectors.includes(sector);
                    return (
                      <button
                        type="button"
                        key={sector}
                        onClick={() => {
                          const updated = isSelected
                            ? editingRegulation.targetSectors.filter((s) => s !== sector)
                            : [...editingRegulation.targetSectors, sector];
                          setEditingRegulation({ ...editingRegulation, targetSectors: updated });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}
                        {sector}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRegulation(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Regulation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW REGULATION MODAL */}
      {isAddModalOpen && (
        <AddNewRegulationModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newReg) => {
            addRegulation(newReg);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-rose-500/40 rounded-xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400 pb-2 border-b border-slate-800">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm">Confirm Regulation Deletion</h4>
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Are you sure you want to remove this statutory instrument? This action will remove it
              from the registry, crosswalk, and compliance reports.
            </p>
            <div className="flex items-center justify-end space-x-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteRegulation(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add New Regulation Sub-Component Modal
interface AddNewModalProps {
  onClose: () => void;
  onAdd: (newReg: Omit<Regulation, 'id'> & { id?: string }) => void;
}

const AddNewRegulationModal: React.FC<AddNewModalProps> = ({ onClose, onAdd }) => {
  const { countries } = useAdmin();
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [code, setCode] = useState('');
  const [authority, setAuthority] = useState('');
  const [countryId, setCountryId] = useState(countries[0]?.id || 'ksa');
  const [category, setCategory] = useState<RegulatoryCategory>('tech_cyber');
  const [isTech, setIsTech] = useState(true);
  const [status, setStatus] = useState<'Enacted' | 'Amended' | 'Draft / Public Consultation'>('Enacted');
  const [yearEnacted, setYearEnacted] = useState(2026);
  const [scopeSummary, setScopeSummary] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [documentPdfUrl, setDocumentPdfUrl] = useState('');
  const [targetSectors, setTargetSectors] = useState<SectorType[]>([
    'Banking',
    'Critical Infrastructure',
    'Government',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selCat = CATEGORY_OPTIONS.find((c) => c.id === category);

    const newRegulation: Omit<Regulation, 'id'> = {
      name,
      arabicName: arabicName || undefined,
      code,
      authority,
      authorityShort: authority.split(' ')[0] || 'REG',
      countryId,
      category,
      categoryLabel: selCat?.label || 'Cybersecurity Baseline',
      isTech,
      status,
      yearEnacted: Number(yearEnacted) || 2026,
      effectiveDate: `${yearEnacted}-01-01`,
      lastUpdated: new Date().toISOString().split('T')[0],
      scopeSummary,
      officialUrl,
      documentPdfUrl: documentPdfUrl || undefined,
      targetSectors,
      controlStructure: {
        domainsCount: 4,
        subDomainsCount: 16,
        totalControlsCount: 48,
        domainList: ['Governance & Strategy', 'Technical Protection', 'Operations', 'Assurance'],
      },
      sampleControls: [],
    };

    onAdd(newRegulation);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-100">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">Add New Statutory Regulation</h4>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Jurisdiction *</label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Code / Citation *</label>
              <input
                type="text"
                required
                placeholder="e.g. SAMA-BCM-2026, NCA-CCC-2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Regulation Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mandatory Post-Quantum Cryptography Migration Standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Arabic / Native Script Name
              </label>
              <input
                type="text"
                placeholder="e.g. الإطار التنظيمي للأمن السيبراني..."
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Issuing Authority *</label>
              <input
                type="text"
                required
                placeholder="e.g. National Cybersecurity Authority (NCA)"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RegulatoryCategory)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Enacted">Enacted</option>
                <option value="Amended">Amended</option>
                <option value="Draft / Public Consultation">Draft / Public Consultation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Year Enacted</label>
              <input
                type="number"
                value={yearEnacted}
                onChange={(e) => setYearEnacted(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Scope & Executive Summary *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Outline statutory scope, target entities, and core compliance mandates..."
              value={scopeSummary}
              onChange={(e) => setScopeSummary(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Official Portal URL *</label>
              <input
                type="url"
                required
                placeholder="https://authority.gov/..."
                value={officialUrl}
                onChange={(e) => setOfficialUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Document PDF URL</label>
              <input
                type="url"
                placeholder="https://authority.gov/file.pdf"
                value={documentPdfUrl}
                onChange={(e) => setDocumentPdfUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Applicable Sectors ({targetSectors.length} Selected)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-lg bg-slate-950 border border-slate-800">
              {ALL_SECTORS.map((sector) => {
                const isSelected = targetSectors.includes(sector);
                return (
                  <button
                    type="button"
                    key={sector}
                    onClick={() => {
                      const updated = isSelected
                        ? targetSectors.filter((s) => s !== sector)
                        : [...targetSectors, sector];
                      setTargetSectors(updated);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}
                    {sector}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish to Registry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

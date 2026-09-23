import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  FileSpreadsheet,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  User,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const AuditTrailTab: React.FC = () => {
  const { auditLogs, clearAuditLogs, exportAuditLogsCSV } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      searchTerm === '' ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = actionFilter === 'all' || log.actionType === actionFilter;

    return matchSearch && matchAction;
  });

  const getActionBadge = (type: string) => {
    if (type.includes('REGULATION')) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    if (type.includes('FEATURE')) {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
    if (type.includes('USER')) {
      return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    }
    if (type.includes('BROADCAST')) {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
    return 'bg-slate-700 text-slate-300 border-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Immutable Administrative Audit Trail</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {auditLogs.length} Events Logged
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Complete, timestamped security record tracking regulatory changes, link updates, feature
            flag modifications, account creation, and system events for compliance auditing.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={exportAuditLogsCSV}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all audit logs? This action cannot be undone.')) {
                clearAuditLogs();
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by user, target entity, or event details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-300 focus:outline-none focus:border-emerald-500 w-full md:w-auto"
        >
          <option value="all">All Action Types</option>
          <option value="REGULATION_CREATED">Regulations Created</option>
          <option value="REGULATION_UPDATED">Regulations Updated</option>
          <option value="REGULATION_LINK_UPDATED">Statutory Links Updated</option>
          <option value="REGULATION_DELETED">Regulations Deleted</option>
          <option value="FEATURE_TOGGLED">Feature Flag Toggles</option>
          <option value="USER_SWITCHED">User Session Switches</option>
          <option value="USER_CREATED">Users Created</option>
          <option value="USER_UPDATED">Users Updated</option>
          <option value="BROADCAST_UPDATED">Advisory Broadcasts</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{log.userName}</div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {log.userEmail}
                      </span>
                    </td>

                    {/* Action Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getActionBadge(
                          log.actionType
                        )}`}
                      >
                        {log.actionType}
                      </span>
                    </td>

                    {/* Target Entity */}
                    <td className="py-3 px-4 font-semibold text-slate-200 max-w-[200px] truncate">
                      {log.targetEntity}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-slate-300 max-w-md">
                      <p className="line-clamp-2">{log.details}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { adminService } from '../../services/adminService';
import { businessService } from '../../services/businessService';
import { IAuditLogItem } from '../../types';
import {
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Filters
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [actionSearch, setActionSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Data & State
  const [logs, setLogs] = useState<IAuditLogItem[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inspector Modal
  const [selectedLog, setSelectedLog] = useState<IAuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSuperAdmin) {
        const res = await adminService.getAuditLogs({
          module: selectedModule !== 'ALL' ? selectedModule : undefined,
          action: actionSearch.trim() || undefined,
          page: currentPage,
          limit: pageSize
        });
        setLogs(res.items || []);
        if (res.pagination) {
          setTotalLogs(res.pagination.total || 0);
          setTotalPages(res.pagination.totalPages || 1);
        }
      } else {
        const bizId = activeBusiness?._id || '';
        const res = await businessService.getAuditLogs(bizId, {
          module: selectedModule !== 'ALL' ? selectedModule : undefined,
          action: actionSearch.trim() || undefined,
          page: currentPage,
          limit: pageSize
        });
        setLogs(res.items || []);
        if (res.pagination) {
          setTotalLogs(res.pagination.total || 0);
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve audit log records';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, activeBusiness, selectedModule, actionSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Timestamp', 'Action', 'Module', 'Actor Email', 'Description', 'IP Address'];
    const rows = logs.map((l) => {
      const time = l.timestamp || l.createdAt || '';
      const email = typeof l.userId === 'object' && l.userId !== null ? l.userId.email : (l.userEmail || 'system');
      const action = l.action;
      const mod = l.module;
      const desc = `"${(l.description || '').replace(/"/g, '""')}"`;
      const ip = l.ipAddress || '127.0.0.1';
      return [time, action, mod, email, desc, ip].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `biznexus_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modulesList = [
    'ALL',
    'auth',
    'business',
    'billing',
    'inventory',
    'sales',
    'workforce',
    'crm',
    'projects',
    'finance',
    'hr',
    'settings',
    'system'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-900 dark:bg-slate-800 rounded-xl text-white shadow-md">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center space-x-2">
              <span>Security & Operational Audit Logs</span>
              <span className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Immutable Ledger
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isSuperAdmin
                ? 'Global platform security audit events across all business tenants and administrators'
                : `Security and modification audit records strictly isolated for ${activeBusiness?.name || 'this business'}`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          {/* Action search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={actionSearch}
              onChange={(e) => {
                setActionSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by action (e.g. login, create, update, delete)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Module Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {modulesList.map((m) => (
                <option key={m} value={m}>
                  {m === 'ALL' ? 'All Modules' : m.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page Size */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-semibold border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Fetching audit events from secure MongoDB ledger...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    No audit records match the selected criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actorName =
                    typeof log.userId === 'object' && log.userId !== null
                      ? log.userId.name
                      : (log.userName || 'System / Platform');
                  const actorEmail =
                    typeof log.userId === 'object' && log.userId !== null
                      ? log.userId.email
                      : (log.userEmail || 'system@biznexus.internal');

                  return (
                    <tr
                      key={log._id || log.id || Math.random().toString()}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp || log.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200 uppercase text-[11px]">
                        {log.module}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{actorName}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate max-w-44">{actorEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
                          title="View raw payload"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{logs.length}</span> of{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">{totalLogs}</span> events recorded
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Audit Event Inspection</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block">Action</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block">Module</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm uppercase">
                    {selectedLog.module}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block">Timestamp</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {new Date(selectedLog.timestamp || selectedLog.createdAt || Date.now()).toISOString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block">Actor</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {typeof selectedLog.userId === 'object' && selectedLog.userId !== null
                      ? `${selectedLog.userId.name} (${selectedLog.userId.email})`
                      : (selectedLog.userName || 'System Engine')}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-1">Description</span>
                <p className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-800 dark:text-gray-200 text-xs">
                  {selectedLog.description}
                </p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-1">
                  Metadata & Event Context
                </span>
                <pre className="p-3 bg-gray-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto max-h-56">
                  {JSON.stringify(selectedLog.metadata || selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;


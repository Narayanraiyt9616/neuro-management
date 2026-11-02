import React from 'react';
import { useApiHealth } from '../../hooks/useApiHealth';
import { Activity, Database, Server, RefreshCw } from 'lucide-react';
import { HealthIndicatorBadgeProps } from '../../types';

export const HealthIndicatorBadge: React.FC<HealthIndicatorBadgeProps> = ({
  compact = false,
  showDetails = false
}) => {
  const { data, loading, isHealthy, refetch } = useApiHealth(30000); // 30s poll

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200/80"
        onClick={() => { refetch(); }}
        title="Click to refresh system health check"
      >
        <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : loading ? 'bg-amber-400' : 'bg-rose-500'}`} />
        <span className="text-slate-700 font-mono text-[11px]">
          {loading ? 'Checking API...' : isHealthy ? 'API Online' : 'API Standby'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Infrastructure Health</span>
        </div>
        <button
          onClick={() => { refetch(); }}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
          <Server className="w-4 h-4 text-slate-500" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Backend API</div>
            <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5 truncate">
              <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {loading ? 'Probing...' : isHealthy ? 'Port 5000 (Active)' : 'Standby / Connecting'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
          <Database className="w-4 h-4 text-slate-500" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">MongoDB Atlas</div>
            <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5 truncate">
              <span className={`w-1.5 h-1.5 rounded-full ${data?.database?.isHealthy ? 'bg-emerald-500' : 'bg-blue-400'}`}></span>
              {data?.database?.state || 'Resilient Mode'}
            </div>
          </div>
        </div>
      </div>

      {showDetails && data && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Uptime: {data.uptime?.human || '0s'}</span>
          <span>Environment: {data.environment || 'development'}</span>
        </div>
      )}
    </div>
  );
};

export default HealthIndicatorBadge;


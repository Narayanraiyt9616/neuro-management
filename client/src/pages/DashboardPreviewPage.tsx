import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export const DashboardPreviewPage: React.FC = () => {
  const location = useLocation();
  const { activeBusiness } = useBusiness();

  // Extract module name from path, e.g. /app/employees -> Employees
  const segment = location.pathname.split('/').filter(Boolean).pop() || 'Module';
  const moduleTitle = segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner: Multi-Business Context Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Organization
            </span>
            <Badge color="blue" size="xs">
              {activeBusiness?.plan || 'Enterprise'}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {activeBusiness?.name || 'Nexus Technologies Inc.'}
          </h2>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>Currency: <strong>{activeBusiness?.currency || 'USD'}</strong></span>
            <span>•</span>
            <span>Category: {activeBusiness?.category || activeBusiness?.industry || 'Technology'}</span>
          </div>
        </div>

        <Link to="/app/owner">
          <Button variant="primary" size="sm" iconLeft={LayoutDashboard}>
            Back to Executive Overview
          </Button>
        </Link>
      </div>

      {/* Module Overview Card */}
      <Card className="p-8 sm:p-12 border-slate-200 text-center max-w-3xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Module Navigation Prepared
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {moduleTitle} Operations Hub
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          The <span className="font-semibold text-slate-900">{moduleTitle}</span> module architecture has been provisioned for {activeBusiness?.name}. Dedicated granular management views for this vertical are scheduled in the upcoming implementation phases.
        </p>

        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-md mx-auto space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Multi-Tenant Enterprise Isolation Enforced</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            All records in this module will be strictly scoped to organization partition ID:
          </p>
          <div className="p-2 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 truncate">
            {activeBusiness?.id || activeBusiness?._id || '60d0fe4f5311236168a109ca'}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/app/owner" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" iconRight={ArrowRight} className="w-full">
              Open Live Executive Dashboard
            </Button>
          </Link>
          <Link to="/contact?subject=Module%20Feedback" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full">
              Request Expedited Provisioning
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPreviewPage;

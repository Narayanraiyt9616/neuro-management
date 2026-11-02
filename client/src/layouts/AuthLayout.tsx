import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers, ShieldCheck, Building2 } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full px-4">
        {/* Top Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-blue-400 shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-950">
              {APP_NAME}
            </span>
          </Link>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
            Enterprise Cloud Management
          </div>
        </div>

        {/* Content Outlet */}
        <Outlet />

        {/* Footer Security Badges */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-bit TLS Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>Multi-Tenant Partitioned Architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;


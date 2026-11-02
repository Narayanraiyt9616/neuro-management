import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Database, GitBranch } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';

const currentYear = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise multi-tenant business management system engineered for scalable companies, multi-entity conglomerates, and transparent operational intelligence.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Fabricated Data Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Tenant-Isolated Schemas</span>
              </div>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Multi-Entity Ledger
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Smart Invoicing
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Multi-Warehouse Inventory
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Role-Based Access (RBAC)
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Live Dashboard Preview →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions & Pricing */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Commercial
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Plan Comparison Matrix
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  14-Day Free Evaluation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Enterprise Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Governance & Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About BizNexus
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Architecture & Security
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  System Health API
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} {APP_NAME} SaaS Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Node.js • Express • MongoDB • React 19 • TypeScript</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <GitBranch className="w-3.5 h-3.5" /> TypeScript Edition
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


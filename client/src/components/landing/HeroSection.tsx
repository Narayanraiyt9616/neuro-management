import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ArrowRight, CheckCircle2, Shield, Zap, Building2, BarChart3, Database } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-linear-to-b from-white via-slate-50 to-slate-100">
      {/* Background glow and subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute -top-40 right-1/2 translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Release & Governance Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 shadow-xs backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
            <span className="text-xs font-semibold text-blue-900">
              BizNexus Platform 1.0 Release
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-blue-700 flex items-center gap-1 font-medium">
              Multi-Tenant Architecture Ready
            </span>
          </div>
        </div>

        {/* Hero Headlines */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
            Smart Business Management <br />
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Engineered for Multi-Entity Growth
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Consolidate your branches, legal entities, inventory, automated ledgers, and team governance into one unified, enterprise-grade cloud operating system.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              to="/register"
              variant="primary"
              size="lg"
              iconRight={ArrowRight}
              className="w-full sm:w-auto shadow-md shadow-blue-500/20"
            >
              Start Free 14-Day Trial
            </Button>
            <Button
              to="/app"
              variant="secondary"
              size="lg"
              icon={BarChart3}
              className="w-full sm:w-auto"
            >
              Interactive Dashboard Preview
            </Button>
            <Button
              to="/contact"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Contact Sales
            </Button>
          </div>

          {/* Key Value Guarantees */}
          <div className="mt-10 pt-6 border-t border-slate-200/70 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full Multi-Tenant Database Isolation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Credit Card Required to Evaluate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Auditable Role-Based Permissions (RBAC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>RESTful API with Webhook Connectivity</span>
            </div>
          </div>
        </div>

        {/* Hero Visual: SaaS Dashboard Mockup Container */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-300/80 bg-slate-900 p-2 sm:p-3 shadow-2xl ring-1 ring-slate-950/10">
            {/* Window bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="ml-2 font-mono text-[11px] text-slate-400 hidden sm:inline">
                  https://app.biznexus.io/nexus-tech-labs/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                  Active Entity: Nexus Tech Labs Ltd
                </span>
              </div>
            </div>

            {/* Dashboard Visual Interior */}
            <div className="bg-slate-100 rounded-b-xl overflow-hidden p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Mini sidebar representation */}
              <div className="hidden md:flex flex-col bg-slate-950 rounded-xl p-4 text-slate-300 space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    B
                  </div>
                  <span className="text-xs font-semibold text-white">BizNexus OS</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-400 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Entities</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-400 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Invoicing</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Compliance</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content preview */}
              <div className="col-span-1 md:col-span-3 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Operating Entities</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">3 Active</div>
                    <div className="text-[11px] text-emerald-600 mt-1">100% Isolated Schemas</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Monthly Cash Flow</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">Multi-Currency</div>
                    <div className="text-[11px] text-blue-600 mt-1">USD, EUR, GBP Supported</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Governance Level</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">Tier 1 RBAC</div>
                    <div className="text-[11px] text-purple-600 mt-1">Granular Audit Trail</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Database className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Unified Multi-Tenant Control Room</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    Experience smooth switching between organizations without repeated re-authentications.
                  </p>
                  <Link
                    to="/app"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                  >
                    Open Live Interactive Dashboard Environment →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


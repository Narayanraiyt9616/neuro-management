import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Briefcase, Store, Laptop, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

interface ISolutionItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  roleTag: string;
  heading: string;
  body: string;
  points: string[];
}

const solutions: ISolutionItem[] = [
  {
    id: 'holding',
    icon: Globe,
    title: 'Holding Groups & Serial Founders',
    roleTag: 'Consolidated Governance',
    heading: 'Oversee 5+ distinct companies without signing in and out',
    body: 'Centralize board-level financials while maintaining legally separate books and localized tax credentials for each subsidiary.',
    points: [
      'Separate P&L statements per business registration',
      'Unified executive cockpit with single master credential',
      'Inter-company invoice transfers and cost allocation'
    ]
  },
  {
    id: 'franchise',
    icon: Store,
    title: 'Franchisors & Retail Chains',
    roleTag: 'Multi-Location Sync',
    heading: 'Sync inventory across flagship stores and regional branches',
    body: 'Grant branch managers access strictly to their physical store while leadership tracks inventory turnover nationwide.',
    points: [
      'Multi-warehouse stock reservation and automated replenishment',
      'Localized currencies, receipts, and VAT / Sales Tax rules',
      'Audit logs tracking every stock adjustment and register balance'
    ]
  },
  {
    id: 'agency',
    icon: Briefcase,
    title: 'Agencies & Client Service Studios',
    roleTag: 'Client Data Segregation',
    heading: 'Maintain complete data confidentiality between customer accounts',
    body: 'Provide team members role-based access to specific client workspaces with zero risk of cross-pollinating proprietary information.',
    points: [
      'Granular project-level and workspace-level permission gates',
      'Automated time tracking translation into client billing',
      'Client portal with custom branding and payment links'
    ]
  },
  {
    id: 'digital',
    icon: Laptop,
    title: 'Digital & Cloud-Native Ventures',
    roleTag: 'High Velocity Operations',
    heading: 'Automate billing, recurring retainers, and API integrations',
    body: 'Programmatically interact with BizNexus via REST APIs to synchronize Stripe webhooks, CRM leads, and fulfillment status in real time.',
    points: [
      'Webhook-driven event stream for external services',
      'Automated subscription dunning and overdue reminders',
      'Modern REST endpoints documented with clean response payloads'
    ]
  }
];

export const BusinessSolutions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(solutions[0].id);
  const activeSolution = solutions.find((s) => s.id === activeTab) || solutions[0];
  const ActiveIcon = activeSolution.icon;

  return (
    <section className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Tailored Industry Frameworks
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-4 tracking-tight">
            How forward-thinking organizations run on BizNexus
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Select your operational model to see how multi-tenant isolation and automated ledgers fit your business.
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {solutions.map((item) => {
            const Icon = item.icon;
            const isSelected = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Solution Display Card */}
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
                <ActiveIcon className="w-4 h-4" />
                <span>{activeSolution.roleTag}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                {activeSolution.heading}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                {activeSolution.body}
              </p>

              <div className="space-y-3 mb-8">
                {activeSolution.points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button to="/register" variant="primary" size="md" iconRight={ArrowRight}>
                  Deploy For Your Organization
                </Button>
                <Button to="/contact" variant="outline" size="md" className="border-slate-700 text-white hover:bg-slate-800">
                  Speak With an Architect
                </Button>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl md:w-72 shrink-0">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                Tenancy Topology
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700/60 text-slate-200">
                  <div className="font-semibold text-blue-300">Data Isolation: 100%</div>
                  <div className="text-[11px] text-slate-400">Scoped MongoDB Collections</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700/60 text-slate-200">
                  <div className="font-semibold text-emerald-300">Failover: Instantaneous</div>
                  <div className="text-[11px] text-slate-400">Multi-region persistence</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700/60 text-slate-200">
                  <div className="font-semibold text-purple-300">API Latency SLA</div>
                  <div className="text-[11px] text-slate-400">&lt; 100ms internal response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessSolutions;


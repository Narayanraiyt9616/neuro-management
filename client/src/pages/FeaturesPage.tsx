import React, { useState } from 'react';
import { SYSTEM_MODULES } from '../utils/constants';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Building2,
  Receipt,
  Boxes,
  ShieldCheck,
  BarChart3,
  Lock,
  Check,
  ArrowRight
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Receipt,
  Boxes,
  ShieldCheck,
  BarChart3,
  Lock
};

interface ISpecItem {
  title: string;
  desc: string;
}

const moduleSpecs: Record<string, ISpecItem[]> = {
  'multi-tenant': [
    { title: 'Isolated Collections', desc: 'Every record is scoped with businessId indexes in MongoDB for strict physical/logical segregation.' },
    { title: 'Cross-Tenant Switching', desc: 'Seamlessly switch context in frontend state without resetting user authentication credentials.' },
    { title: 'Custom Tenant Branding', desc: 'Support for distinct logos, invoicing addresses, and currency settings per entity.' }
  ],
  'financial-ledger': [
    { title: 'Automated Invoicing', desc: 'Generate PDF and digital invoices with custom tax rates, payment terms, and status tracking.' },
    { title: 'Multi-Currency Support', desc: 'Handle transactions in USD, EUR, GBP, CAD, AUD, and regional currencies.' },
    { title: 'Payment Gateways Ready', desc: 'Designed for Stripe, PayPal, and bank wire transfers integration in Part 2.' }
  ],
  'inventory-ops': [
    { title: 'Multi-Location Warehouses', desc: 'Track stock across central fulfillment centers, retail floors, and in-transit transfers.' },
    { title: 'Automated Reorder Thresholds', desc: 'Receive real-time notifications when SKU counts fall below minimum reserve requirements.' },
    { title: 'Valuation Tracking', desc: 'Support FIFO and Weighted Average cost calculation methodology.' }
  ],
  'workforce-rbac': [
    { title: 'Role Hierarchy', desc: 'Granular roles: Superadmin, Business Owner, Manager, Accountant, Inventory Clerk, Employee.' },
    { title: 'Tamper-Evident Audit Log', desc: 'Captures actor userId, action verb, timestamp, IP address, and changed entity details.' },
    { title: 'Session Security', desc: 'Configurable token expiry, device fingerprinting, and rapid session revocation.' }
  ],
  'analytics-engine': [
    { title: 'Interactive Recharts Charts', desc: 'Native vector charts for revenue trajectories, expense categorization, and cash burn.' },
    { title: 'Custom Date Ranges', desc: 'Filter financial summaries by Fiscal Quarter, Month-to-Date, or customized intervals.' },
    { title: 'Consolidated Reporting', desc: 'Aggregate metrics across all subsidiary entities into a single executive briefing.' }
  ],
  'security-compliance': [
    { title: 'TLS 1.3 Encryption', desc: 'All API communications are protected by standard TLS and security headers via Helmet.' },
    { title: 'Centralized Error Masking', desc: 'Database connection strings and internal stack traces are strictly hidden from clients.' },
    { title: 'Zero Fake Metrics', desc: 'System counters and operational reports reflect mathematically verifiable database truth.' }
  ]
};

export const FeaturesPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const filteredModules = selectedModule === 'all'
    ? SYSTEM_MODULES
    : SYSTEM_MODULES.filter(m => m.id === selectedModule);

  return (
    <div className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge color="blue" size="sm" className="mb-4">
            Platform Specifications
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            Engineered for Modern Enterprise Operations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            BizNexus provides a unified operational canvas engineered to replace fragmented legacy tools with a cohesive, multi-tenant cloud architecture.
          </p>

          {/* Module Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedModule('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedModule === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Modules ({SYSTEM_MODULES.length})
            </button>
            {SYSTEM_MODULES.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedModule === m.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Breakdown */}
        <div className="space-y-12">
          {filteredModules.map((mod) => {
            const Icon = iconMap[mod.iconName] || Building2;
            const specs = moduleSpecs[mod.id] || [];

            return (
              <div
                key={mod.id}
                id={mod.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{mod.title}</h2>
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                          {mod.subtitle}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                      {mod.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge color="slate">Mongoose Model Prepared</Badge>
                      <Badge color="emerald">REST Endpoint Hooked</Badge>
                      <Badge color="indigo">Tenant-Scoped</Badge>
                    </div>
                  </div>

                  {/* Architectural Specs List */}
                  <div className="lg:w-96 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200">
                      Engineering Specifications
                    </div>
                    {specs.map((spec, i) => (
                      <div key={i} className="space-y-1 text-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                          <span>{spec.title}</span>
                        </div>
                        <div className="text-slate-500 pl-5 leading-normal">
                          {spec.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-slate-900 rounded-2xl p-10 text-white">
          <h3 className="text-2xl font-bold mb-3">Experience These Modules in the Live Console</h3>
          <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6">
            Explore how the dark navy sidebar, white cards, and multi-tenant switcher function together in real time.
          </p>
          <Button to="/app" variant="primary" size="lg" iconRight={ArrowRight}>
            Launch Live Dashboard Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;


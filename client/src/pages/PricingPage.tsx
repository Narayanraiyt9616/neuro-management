import React, { useState } from 'react';
import { PLANS } from '../utils/constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';

interface IComparisonRow {
  feature: string;
  starter: string;
  growth: string;
  enterprise: string;
}

const COMPARISON_ROWS: IComparisonRow[] = [
  { feature: 'Operating Business Entities', starter: '1 Entity', growth: 'Up to 3 Entities', enterprise: 'Unlimited' },
  { feature: 'Included User Seats', starter: '3 Users', growth: '15 Users', enterprise: 'Unlimited' },
  { feature: 'Role-Based Access Control (RBAC)', starter: 'Standard (3 roles)', growth: 'Customized (6 roles)', enterprise: 'Granular Matrix' },
  { feature: 'Invoicing & Quotations', starter: '100 / month', growth: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Multi-Warehouse Inventory', starter: 'Single Location', growth: 'Up to 5 Locations', enterprise: 'Unlimited' },
  { feature: 'Multi-Currency Support', starter: 'Standard USD/EUR', growth: 'Full Multi-Currency', enterprise: 'Full + Custom FX' },
  { feature: 'Audit & Activity Logs', starter: '7-day retention', growth: '90-day retention', enterprise: '365-day + SIEM Export' },
  { feature: 'RESTful API & Webhooks', starter: 'Read-only', growth: 'Full Access (100 req/min)', enterprise: 'Dedicated Burst SLA' },
  { feature: 'Support Level', starter: 'Email (24h)', growth: 'Priority Chat (4h)', enterprise: 'Dedicated Manager (1h SLA)' }
];

interface IFaqItem {
  q: string;
  a: string;
}

const FAQS: IFaqItem[] = [
  {
    q: 'Can I switch between business entities without logging out?',
    a: 'Yes. BizNexus uses a multi-tenant session architecture where a single authenticated user can switch between their registered businesses seamlessly through the top navigation switcher.'
  },
  {
    q: 'How does the 14-day free trial work?',
    a: 'You get full, unrestricted access to the selected plan tier for 14 days. No credit card is required upfront to evaluate the system.'
  },
  {
    q: 'Is my data isolated from other businesses on the platform?',
    a: 'Absolutely. Every database query in our backend includes tenant indexing and businessId validation. Enterprise plans also offer dedicated isolated database instances upon request.'
  },
  {
    q: 'Can I upgrade, downgrade, or cancel at any time?',
    a: 'Yes, subscription changes take effect at the next billing cycle. If you cancel, your data remains accessible in read-only export format for 60 days.'
  }
];

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge color="blue" size="sm" className="mb-4">
            Transparent SaaS Tiers
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            Predictable Pricing for Growing Enterprises
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Choose a plan calibrated for your current entity footprint. Upgrade as you add new branches, subsidiaries, or legal entities.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-200/80 rounded-full border border-slate-300">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-24">
          {PLANS.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            return (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between relative transition-all duration-200 ${
                  plan.highlight
                    ? 'ring-2 ring-blue-600 shadow-xl border-blue-600'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                    <Badge color={plan.highlight ? 'blue' : 'slate'}>{plan.badge}</Badge>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 min-h-10 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-5 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-950">${price}</span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {billingCycle === 'annual' ? `Billed annually ($${price * 12}/yr)` : 'Billed monthly, cancel anytime'}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Key Highlights
                    </div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Button
                    to={plan.ctaLink}
                    variant={plan.highlight ? 'primary' : 'outline'}
                    size="md"
                    className="w-full"
                    iconRight={ArrowRight}
                  >
                    {plan.ctaText}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 mb-24 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Detailed Capability Matrix</h2>
          <p className="text-xs text-slate-500 mb-8">Direct side-by-side technical breakdown across tiers</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Feature & Limit</th>
                  <th className="py-3 px-4">Starter Tier</th>
                  <th className="py-3 px-4 text-blue-600">Growth Tier</th>
                  <th className="py-3 px-4">Enterprise Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{row.feature}</td>
                    <td className="py-3.5 px-4 text-slate-600">{row.starter}</td>
                    <td className="py-3.5 px-4 font-medium text-blue-700">{row.growth}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 mt-1">Clear answers regarding subscriptions and data governance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;


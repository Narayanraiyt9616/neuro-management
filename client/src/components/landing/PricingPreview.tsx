import React, { useState } from 'react';
import { PLANS } from '../../utils/constants';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingPreview: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">
            Predictable Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-4 tracking-tight">
            Transparent plans that scale with your entity footprint
          </h2>
          <p className="mt-3 text-base text-slate-600">
            No surprise per-invoice surcharges or artificial throttling. Every plan includes full access to our multi-tenant core.
          </p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-200/80 rounded-full border border-slate-300">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                Save ~20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
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
                      Recommended For Multi-Entity
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
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
                      Included Capabilities
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

        <div className="mt-12 text-center">
          <Link
            to="/pricing"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            View full 30+ feature comparison matrix and enterprise FAQ →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;


import React from 'react';
import { EmptyState } from '../common/EmptyState';
import { MessageSquareQuote, ShieldAlert, Award, FileCheck2 } from 'lucide-react';
import { Button } from '../common/Button';

export const CustomerTestimonials: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Real Feedback Policy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-4 tracking-tight">
            Customer Testimonials & Case Studies
          </h2>
          <p className="mt-3 text-base text-slate-600">
            We hold our platform to the highest ethical standard: no artificial reviews, no fabricated quotes, and no simulated logo walls.
          </p>
        </div>

        {/* Attractive Empty State adhering strictly to rules */}
        <EmptyState
          icon={MessageSquareQuote}
          badgeText="Verified Cohort Policy"
          title="Founding Enterprise Cohort in Onboarding"
          description="BizNexus is currently onboarding its initial cohort of multi-entity pilot organizations. In adherence with our authentic governance guidelines, verified testimonials and audited ROI case studies will be published here upon cohort completion."
          actionLabel="Apply for the Pilot Cohort"
          actionTo="/contact?subject=Pilot%20Cohort%20Application"
          secondaryAction={
            <Button to="/about" variant="outline" size="md">
              Read Governance Charter
            </Button>
          }
        />

        {/* 3 Transparency Commitments */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">100% Verified Quotes</div>
              <div className="text-xs text-slate-500 mt-1">
                Every testimonial published is tied to a verified business registry and signed consent.
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">No Paid Endorsements</div>
              <div className="text-xs text-slate-500 mt-1">
                Feedback reflects authentic operational usage without promotional incentives.
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Zero Fabricated Logos</div>
              <div className="text-xs text-slate-500 mt-1">
                We respect trademark integrity and never showcase Fortune 500 logos without licensing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;


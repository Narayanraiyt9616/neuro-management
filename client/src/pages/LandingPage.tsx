import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import ProductIntro from '../components/landing/ProductIntro';
import MainFeatures from '../components/landing/MainFeatures';
import BusinessSolutions from '../components/landing/BusinessSolutions';
import PricingPreview from '../components/landing/PricingPreview';
import CustomerTestimonials from '../components/landing/CustomerTestimonials';
import { HealthIndicatorBadge } from '../components/common/HealthIndicatorBadge';
import { Button } from '../components/common/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Product Introduction */}
      <ProductIntro />

      {/* Main Features */}
      <MainFeatures />

      {/* Business Solutions for Industries */}
      <BusinessSolutions />

      {/* Pricing Preview */}
      <PricingPreview />

      {/* Customer Testimonials & Transparency Policy */}
      <CustomerTestimonials />

      {/* Bottom CTA & Live Node Connectivity Strip */}
      <section className="bg-slate-900 py-16 border-t border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-r from-blue-900/60 via-slate-900 to-indigo-950/70 rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Generation SaaS Foundation</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                Ready to orchestrate your business entities with precision?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Join forward-thinking enterprise leaders evaluating BizNexus. Launch your workspace in less than 2 minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              <Button to="/register" variant="primary" size="lg" iconRight={ArrowRight}>
                Get Started Free
              </Button>
              <Button to="/app" variant="secondary" size="lg">
                View Live Dashboard
              </Button>
            </div>
          </div>

          <div className="mt-8 max-w-xl mx-auto">
            <HealthIndicatorBadge showDetails />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;


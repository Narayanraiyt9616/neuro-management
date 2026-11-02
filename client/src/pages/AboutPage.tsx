import React from 'react';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  ShieldCheck,
  Cpu,
  Database,
  Code2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface IStackItem {
  name: string;
  role: string;
  desc: string;
}

export const AboutPage: React.FC = () => {
  const stackItems: IStackItem[] = [
    { name: 'React 19 & TypeScript', role: 'Reactive Frontend Framework', desc: 'Type-safe component tree with strict interfaces and zero runtime property mismatches.' },
    { name: 'Tailwind CSS v4 & Vite 8', role: 'Enterprise Design & Build Engine', desc: 'Engineered with custom color tokens, modern typography, and optimized bundle output.' },
    { name: 'Node.js, Express & TypeScript', role: 'Type-Safe API Gateway Runtime', desc: 'Asynchronous, non-blocking REST services handling routing, centralized validation, and CORS.' },
    { name: 'MongoDB Atlas & Mongoose', role: 'Multi-Tenant Database Core', desc: 'High-availability document store with schema indexing, strict isolation, and automatic audit expiration.' }
  ];

  return (
    <div className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge color="blue" size="sm" className="mb-4">
            Our Purpose & Architecture
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            Building the Transparent Operating System for Modern Commerce
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            BizNexus was created to eliminate the friction that growing companies experience when operating across multiple businesses, legal entities, and warehouse nodes.
          </p>
        </div>

        {/* The Zero-Fake-Metrics Charter */}
        <div className="mb-20 bg-linear-to-r from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Core Operational Principle</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              The Zero Fabricated Data Guarantee
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              In an industry plagued by synthetic reviews, fictional testimonials, and vanity statistics like "Over 500,000 businesses trust us!", BizNexus takes an uncompromising stance:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-white mb-1">Authentic Testimonials Only</div>
                <div className="text-slate-400">We display empty states until real enterprise pilots complete audit verifications.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-white mb-1">Mathematical Accuracy</div>
                <div className="text-slate-400">All analytics charts reflect genuine ledger transactions rather than hardcoded mock figures.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-white mb-1">Zero Vanity Counters</div>
                <div className="text-slate-400">No fabricated $4B processed banners. Only verifiable uptime and system diagnostics.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Architectural Principles */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">Architectural Principles</h2>
            <p className="text-sm text-slate-600 mt-2">How we design software that can support multi-company scale</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Partitioned Tenancy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                By maintaining strict indexes on businessId throughout our Mongoose schemas, no user can ever access data belonging to an entity they lack explicit RBAC membership for.
              </p>
            </Card>

            <Card hover className="p-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Defense in Depth</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Security headers configured with Helmet, JSON payload size validation, strict CORS origin filtering, and environment variable isolation for all secrets.
              </p>
            </Card>

            <Card hover className="p-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">API First Contract</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standardized JSON response formats with uniform success flags, timestamps, and descriptive error structures for both internal React clients and external webhooks.
              </p>
            </Card>
          </div>
        </div>

        {/* Technology Foundation */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 mb-16 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Technology Foundation
              </span>
              <h2 className="text-2xl font-bold text-slate-950 mt-1">Full-Stack TypeScript Architecture</h2>
            </div>
            <Badge color="blue">TypeScript 5 Strict</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stackItems.map((tech, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{tech.name}</div>
                  <div className="text-xs font-semibold text-blue-600 mb-1">{tech.role}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button to="/contact" variant="primary" size="lg" iconRight={ArrowRight}>
            Connect With the BizNexus Engineering Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;


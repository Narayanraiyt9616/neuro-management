import React from 'react';
import { ShieldCheck, Cpu, SplitSquareVertical } from 'lucide-react';
import { Card } from '../common/Card';

interface IPillar {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tag: string;
}

export const ProductIntro: React.FC = () => {
  const pillars: IPillar[] = [
    {
      icon: SplitSquareVertical,
      title: 'Unified Multi-Entity Partitioning',
      description: 'Run multiple LLCs, subsidiary brands, or franchise locations under one login with mathematically partitioned tenancy in MongoDB.',
      tag: 'Multi-Tenant'
    },
    {
      icon: Cpu,
      title: 'Automated Financial Operations',
      description: 'Streamline double-entry ledgers, dynamic tax calculation, multi-currency invoicing, and receipt reconciliation without human latency.',
      tag: 'Automation'
    },
    {
      icon: ShieldCheck,
      title: 'Granular Governance & Audit Logs',
      description: 'Strict Role-Based Access Control (RBAC) with detailed action-level activity logging to meet enterprise compliance standards.',
      tag: 'Security'
    }
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Modern Architectural Paradigm
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-4 tracking-tight">
            Built from the ground up for companies operating more than just one business
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Legacy business software was engineered in an era where an entrepreneur ran a single physical shop. Today's founders manage multiple subsidiaries, e-commerce brands, and agency clients simultaneously. BizNexus provides the missing multi-tenant operational fabric.
          </p>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card key={idx} hover className="relative flex flex-col justify-between border-slate-200 p-8">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center mb-6 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    {pillar.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>TypeScript Ready</span>
                  <span className="text-blue-600 font-semibold">Active Module</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductIntro;


import React from 'react';
import { SYSTEM_MODULES } from '../../utils/constants';
import { Card } from '../common/Card';
import { Building2, Receipt, Boxes, ShieldCheck, BarChart3, Lock, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Receipt,
  Boxes,
  ShieldCheck,
  BarChart3,
  Lock
};

export const MainFeatures: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">
              Full Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-4 tracking-tight">
              Enterprise management without enterprise complexity
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Each module connects seamlessly to your multi-business workspace, giving you real-time visibility across all operational nodes.
            </p>
          </div>
          <Link
            to="/features"
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 underline shrink-0"
          >
            Explore all architectural specifications →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SYSTEM_MODULES.map((mod) => {
            const Icon = iconMap[mod.iconName] || Building2;
            return (
              <Card key={mod.id} hover className="p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {mod.title}
                  </h3>
                  <div className="text-xs font-semibold text-blue-600 mb-3">
                    {mod.subtitle}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Core Feature
                  </span>
                  <Link to={`/features#${mod.id}`} className="text-xs font-semibold text-slate-500 hover:text-blue-600">
                    Learn details →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MainFeatures;


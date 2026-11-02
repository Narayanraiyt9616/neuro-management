import React from 'react';
import { Card } from '../common/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricCardProps } from '../../types';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  subtitle,
  icon: Icon,
  iconColor = 'blue'
}) => {
  const iconColorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColorStyles[iconColor] || iconColorStyles.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trendValue && (
            <div
              className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                trend === 'up'
                  ? 'text-emerald-700'
                  : trend === 'down'
                  ? 'text-rose-700'
                  : 'text-slate-600'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{trendValue}</span>
            </div>
          )}
          {subtitle && <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};

export default MetricCard;


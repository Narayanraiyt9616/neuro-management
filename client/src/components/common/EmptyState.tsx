import React from 'react';
import Button from './Button';
import { EmptyStateProps } from '../../types';

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  secondaryAction,
  badgeText = 'Authentic Data Governance',
  className = ''
}) => {
  return (
    <div className={`p-8 md:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 backdrop-blur-xs flex flex-col items-center max-w-2xl mx-auto ${className}`}>
      {badgeText && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {badgeText}
        </span>
      )}

      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 ring-8 ring-blue-50/50">
          <Icon className="w-8 h-8" strokeWidth={1.75} />
        </div>
      )}

      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (
          <Button
            variant="primary"
            onClick={onAction}
            to={actionTo}
          >
            {actionLabel}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
};

export default EmptyState;


import React from 'react';
import { BadgeProps, BadgeColor } from '../../types';

const colorStyles: Record<BadgeColor, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20',
  rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
};

const variantToColor: Record<string, BadgeColor> = {
  success: 'emerald',
  warning: 'amber',
  danger: 'rose',
  info: 'blue',
  primary: 'blue',
  default: 'slate'
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  color,
  variant,
  size = 'sm',
  className = ''
}) => {
  const resolvedColor = color || (variant ? variantToColor[variant] || 'blue' : 'blue');
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const style = colorStyles[resolvedColor] || colorStyles.blue;

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${style} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;


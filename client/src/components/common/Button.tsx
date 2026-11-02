import React from 'react';
import { Link } from 'react-router-dom';
import { ButtonProps, ButtonVariant, ButtonSize } from '../../types';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150',
  secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150',
  outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs hover:border-slate-400 active:scale-[0.98] transition-all duration-150',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 transition-colors',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-md',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-lg',
  lg: 'px-5 py-3 text-base font-semibold rounded-xl'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  to,
  href,
  disabled = false,
  loading = false,
  type = 'button',
  icon: IconProp,
  iconLeft,
  iconRight: IconRight,
  onClick,
  ...props
}) => {
  const Icon = iconLeft || IconProp;
  const baseClasses = `inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {!loading && Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={baseClasses} disabled={disabled || loading} onClick={onClick} {...props}>
      {content}
    </button>
  );
};

export default Button;


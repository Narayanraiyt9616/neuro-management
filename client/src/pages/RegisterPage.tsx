import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Shield
} from 'lucide-react';
import { registerFormSchema } from '../validators/authSchemas';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    role: 'BUSINESS_OWNER' as UserRole
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register, getRoleDashboardPath } = useAuth();
  const { addBusiness } = useBusiness();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error when user modifies
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRegister = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side Zod validation
    const validation = registerFormSchema.safeParse(formData);
    if (!validation.success) {
      const issues = validation.error.issues;
      const mapped: Record<string, string> = {};
      issues.forEach((issue) => {
        const key = issue.path[0] ? String(issue.path[0]) : 'general';
        if (!mapped[key]) mapped[key] = issue.message;
      });
      setFieldErrors(mapped);
      setError(issues[0]?.message || 'Please correct errors in the registration form.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        businessName: formData.businessName || 'My Organization',
        role: formData.role
      });

      if (formData.businessName) {
        addBusiness({
          name: formData.businessName,
          slug: formData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          industry: 'Enterprise Software & Services',
          plan: 'Growth & Multi-Branch'
        });
      }

      const targetPath = getRoleDashboardPath(res.user.role);
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err);
      setError(msg || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full py-4">
      <Card className="p-8 sm:p-10 shadow-lg border-slate-200">
        <div className="text-center mb-6">
          <Badge variant="primary" className="mb-2">Enterprise SaaS Platform</Badge>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Register Your Organization
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deploy your secure multi-tenant operational hub in 60 seconds
          </p>
        </div>

        <div className="mb-6 p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Need full 12-field corporate registration with GSTIN & plan provisioning?</span>
          </div>
          <Link
            to="/register-business"
            className="font-bold text-blue-700 hover:text-blue-900 underline whitespace-nowrap"
          >
            Apply Here →
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Julian Vance"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-hidden text-slate-900 ${
                    fieldErrors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.name}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-hidden text-slate-900 ${
                    fieldErrors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.phone}</span>
              )}
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Work Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="founder@neworganization.com"
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-hidden text-slate-900 ${
                  fieldErrors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.email}</span>
            )}
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Organization / Business Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Vanguard Global Systems"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-hidden text-slate-900 ${
                    fieldErrors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.password}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-lg focus:outline-hidden text-slate-900 ${
                    fieldErrors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Passphrase must contain at least 8 chars, 1 uppercase, and 1 number.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
            iconRight={ArrowRight}
          >
            Create Organization & Launch
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          <span>Already have an active account? </span>
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in to your organization
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;

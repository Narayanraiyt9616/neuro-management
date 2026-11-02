import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { loginFormSchema } from '../validators/authSchemas';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { login, quickDemoLogin, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const validation = loginFormSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please check your login details.');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      const targetPath = getRoleDashboardPath(res.user.role);
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err);
      setError(msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      const authed = await quickDemoLogin(role);
      const targetPath = getRoleDashboardPath(authed.role);
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err);
      setError(msg || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <Card className="p-8 sm:p-10 shadow-lg border-slate-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to BizNexus
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your multi-tenant organizations & operations
          </p>
        </div>

        {/* 1-Click Evaluation Shortcuts for 5 Core Roles */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1-Click Evaluation by Role
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Select any role to test authentication & dedicated dashboard redirect:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('SUPER_ADMIN')}
              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('BUSINESS_OWNER')}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer"
            >
              🏢 Business Owner
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('MANAGER')}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer"
            >
              📋 Operations Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('EMPLOYEE')}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer"
            >
              💼 Staff Employee
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              className="col-span-2 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold text-center transition-colors cursor-pointer"
            >
              🛍️ Client Co. Customer Portal
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@nexuscorp.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember session on this device</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
            iconRight={ArrowRight}
          >
            Sign In & Open Workspace
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          <span>Don't have a registered entity? </span>
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create an organization
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

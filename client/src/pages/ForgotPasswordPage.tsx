import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { forgotPasswordFormSchema } from '../validators/authSchemas';
import authService, { IForgotPasswordResult } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IForgotPasswordResult | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const validation = forgotPasswordFormSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.forgotPassword(email);
      setResult(data);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err);
      setError(msg || 'Failed to dispatch reset request. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <Card className="p-8 sm:p-10 shadow-lg border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reset Account Password
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your verified email to receive cryptographic reset instructions
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reset Instructions Dispatched</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                If an active account exists for <span className="font-semibold text-emerald-900">{result.email}</span>, a secure password reset link has been issued.
              </p>
            </div>

            {/* Dev Mode Instant Evaluation Helper */}
            {result.previewToken && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Development Preview Token Generated</span>
                </div>
                <p className="text-[11px] text-blue-700">
                  Because development mode is active, you can test the reset workflow immediately without waiting for SMTP:
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/reset-password/${result.previewToken}`)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  Proceed to Reset Password Page
                </button>
              </div>
            )}

            <div className="pt-4 text-center">
              <Link to="/login" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Registered Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@nexuscorp.io"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 text-slate-900"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              iconRight={ArrowRight}
            >
              Send Reset Link
            </Button>

            <div className="pt-4 text-center">
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;


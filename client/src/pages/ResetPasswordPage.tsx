import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import { resetPasswordFormSchema } from '../validators/authSchemas';
import authService from '../services/authService';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token) {
        if (isMounted) {
          setChecking(false);
          setTokenValid(false);
          setError('No reset token provided in URL.');
        }
        return;
      }

      try {
        await authService.verifyResetToken(token);
        if (isMounted) {
          setTokenValid(true);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setTokenValid(false);
          const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : '';
          setError(msg || 'This reset token has expired or is invalid. Please request a new link.');
        }
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const validation = resetPasswordFormSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please check password requirements.');
      return;
    }

    if (!token) {
      setError('Invalid reset token.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password, confirmPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : '';
      setError(msg || 'Failed to reset password. The token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="max-w-md mx-auto w-full">
        <Card className="p-8 sm:p-10 shadow-lg border-slate-200 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Verifying Reset Token...</h2>
          <p className="text-xs text-slate-500 mt-1">Confirming cryptographic token validity</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <Card className="p-8 sm:p-10 shadow-lg border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create New Password
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose a strong password with uppercase, lowercase, and numbers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password Successfully Reset</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Your credentials have been securely updated. You can now log into your BizNexus account.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/login')}
              iconRight={ArrowRight}
            >
              Sign In to Your Workspace
            </Button>
          </div>
        ) : !tokenValid ? (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-600">
              The reset token provided in this link is either expired or has already been used.
            </p>
            <Link to="/forgot-password">
              <Button variant="primary" size="md" className="w-full">
                Request New Password Reset Link
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                New Password (min 8 chars, 1 uppercase, 1 number)
              </label>
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
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
              Reset Password & Continue
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;


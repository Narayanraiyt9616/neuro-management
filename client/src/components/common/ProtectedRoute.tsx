import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, getRoleDashboardPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Verifying Security Credentials...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are mandated, check role permission
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role.toUpperCase() as UserRole;
    const isAllowed = allowedRoles.some((r) => r.toUpperCase() === userRole);

    if (!isAllowed) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-8 text-center border-slate-200 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Access Restricted (403)
            </h2>
            <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
              Your account role (<span className="font-bold text-slate-800">{user.role}</span>) does not
              have authorization to access this operational module. Please contact your organization administrator.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 font-mono mb-6 border border-slate-200">
              Required Roles: {allowedRoles.join(', ')}
            </div>
            <Link to={getRoleDashboardPath(user.role)}>
              <Button variant="primary" size="md" className="w-full" iconLeft={ArrowLeft}>
                Return to My Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      );
    }
  }

  return children ? <>{children}</> : null;
};

export default ProtectedRoute;


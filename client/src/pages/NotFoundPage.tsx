import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 ring-8 ring-blue-50/60 shadow-xs">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-200 text-slate-700 mb-3">
          HTTP 404 - Resource Not Located
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
          Page or Tenant Workspace Not Found
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-8">
          The requested URL path does not correspond to an active public page or enterprise tenant route on the BizNexus system.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            to="/"
            variant="primary"
            size="md"
            icon={Home}
          >
            Return to Homepage
          </Button>
          <Button
            to="/app"
            variant="secondary"
            size="md"
          >
            Open Dashboard
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-400">
          BizNexus Smart Business Management System • Enterprise Cloud Gateway
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;


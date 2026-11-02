import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { NAV_LINKS, APP_NAME } from '../../utils/constants';
import { Button } from './Button';
import { HealthIndicatorBadge } from './HealthIndicatorBadge';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Layers, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-blue-400 shadow-xs ring-1 ring-slate-800 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-950 group-hover:text-blue-600 transition-colors">
                {APP_NAME}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 -mt-1">
                Enterprise Cloud
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/70">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <HealthIndicatorBadge compact />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button to="/app" variant="secondary" size="sm" icon={LayoutDashboard}>
                  Dashboard
                </Button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button to="/login" variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button to="/register" variant="primary" size="sm" iconRight={ArrowRight}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <HealthIndicatorBadge compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-1 text-xs text-slate-500">
                  Signed in as <strong className="text-slate-900">{user?.name}</strong>
                </div>
                <Button to="/app" variant="primary" size="md" icon={LayoutDashboard} onClick={() => setMobileMenuOpen(false)}>
                  Open Dashboard
                </Button>
                <Button variant="outline" size="md" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="outline" size="md" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Button>
                <Button to="/register" variant="primary" size="md" iconRight={ArrowRight} onClick={() => setMobileMenuOpen(false)}>
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;


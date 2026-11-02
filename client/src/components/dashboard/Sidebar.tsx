import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { SidebarProps, UserRole } from '../../types';
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Boxes,
  Users,
  History,
  Settings,
  CreditCard,
  ChevronDown,
  LogOut,
  Layers,
  ExternalLink,
  ShieldCheck,
  ClipboardCheck,
  UserCheck,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  FolderKanban,
  Briefcase,
  ShoppingCart,
  GitBranch,
  Scan
} from 'lucide-react';

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { businesses, activeBusiness, switchBusiness } = useBusiness();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const role = (user?.role?.toUpperCase() || 'BUSINESS_OWNER') as UserRole;

  // Build role-tailored navigation items
  const getNavItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Platform Console', path: '/app/super-admin', icon: ShieldCheck },
          { label: 'All Tenant Hubs', path: '/app/entities', icon: Building2 },
          { label: 'Branch Management', path: '/app/branches', icon: GitBranch },
          { label: 'POS Terminal', path: '/app/pos', icon: Scan },
          { label: 'Platform Subscriptions', path: '/app/billing', icon: CreditCard },
          { label: 'Global Audit Logs', path: '/app/audit', icon: History },
          { label: 'Platform Settings', path: '/app/settings', icon: Settings }
        ];

      case 'MANAGER':
        return [
          { label: 'Operations Dashboard', path: '/app/manager', icon: ClipboardCheck },
          { label: 'POS Terminal', path: '/app/pos', icon: Scan },
          { label: 'Branch Network', path: '/app/branches', icon: GitBranch },
          { label: 'Projects & Tasks', path: '/app/projects', icon: FolderKanban },
          { label: 'Employees', path: '/app/employees', icon: Users },
          { label: 'HR Management', path: '/app/hr', icon: Briefcase },
          { label: 'Customers', path: '/app/customers', icon: Building2 },
          { label: 'CRM Leads', path: '/app/crm', icon: Layers },
          { label: 'Sales Orders', path: '/app/sales', icon: TrendingUp },
          { label: 'Inventory', path: '/app/inventory', icon: Boxes },
          { label: 'Purchasing', path: '/app/purchase', icon: ShoppingCart },
          { label: 'Requisitions & Invoices', path: '/app/invoicing', icon: Receipt },
          { label: 'Department Audit', path: '/app/audit', icon: History }
        ];

      case 'EMPLOYEE':
        return [
          { label: 'My Workspace', path: '/app/employee', icon: UserCheck },
          { label: 'POS Terminal', path: '/app/pos', icon: Scan },
          { label: 'Projects & Tasks', path: '/app/projects', icon: FolderKanban },
          { label: 'Customers', path: '/app/customers', icon: Building2 },
          { label: 'CRM Leads', path: '/app/crm', icon: Layers },
          { label: 'Inventory Log', path: '/app/inventory', icon: Boxes },
          { label: 'Activity Feed', path: '/app/audit', icon: History }
        ];

      case 'CUSTOMER':
        return [
          { label: 'Client Portal', path: '/app/customer', icon: ShoppingBag },
          { label: 'My Sales Orders', path: '/app/sales', icon: TrendingUp },
          { label: 'Billing & Invoices', path: '/app/invoicing', icon: Receipt }
        ];

      case 'BUSINESS_OWNER':
      default:
        return [
          { label: 'Overview', path: '/app/owner', icon: LayoutDashboard },
          { label: 'POS Terminal', path: '/app/pos', icon: Scan },
          { label: 'Branches', path: '/app/branches', icon: GitBranch },
          { label: 'Employees', path: '/app/employees', icon: Users },
          { label: 'HR Management', path: '/app/hr', icon: Briefcase },
          { label: 'Customers', path: '/app/customers', icon: Building2 },
          { label: 'CRM', path: '/app/crm', icon: Layers },
          { label: 'Sales', path: '/app/sales', icon: TrendingUp },
          { label: 'Inventory', path: '/app/inventory', icon: Boxes },
          { label: 'Purchase', path: '/app/purchase', icon: ShoppingCart },
          { label: 'Finance & P&L', path: '/app/finance', icon: CreditCard },
          { label: 'Invoicing & GST', path: '/app/invoicing', icon: Receipt },
          { label: 'Projects', path: '/app/projects', icon: FolderKanban },
          { label: 'Reports', path: '/app/reports', icon: BarChart3 },
          { label: 'Settings', path: '/app/settings', icon: Settings }
        ];
    }
  };

  const navItems = getNavItems();

  const content = (
    <div className="h-full flex flex-col justify-between bg-slate-950 text-slate-300 border-r border-slate-900 select-none">
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-900">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight">BizNexus</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">SaaS Operating System</span>
            </div>
          </Link>
          <Link
            to="/"
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            title="Public Site"
          >
            <span>Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Business Tenant Switcher - Shown for business owners and platform admins */}
        {role !== 'CUSTOMER' && (
          <div className="p-3">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 px-1">
                Active Organization
              </div>
              <div className="relative">
                <select
                  aria-label="Active Organization"
                  value={activeBusiness?.id}
                  onChange={(e) => switchBusiness(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs font-semibold rounded-lg px-2.5 py-2 border border-slate-700/80 focus:outline-hidden focus:border-blue-500 cursor-pointer appearance-none truncate pr-7"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.currency})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="mt-1.5 px-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{activeBusiness?.industry}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-950 text-blue-300 font-semibold uppercase border border-blue-800">
                  {activeBusiness?.plan?.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <nav className="px-3 py-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{role.replace('_', ' ')} Navigation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Section with Direct Link to Profile */}
      <div className="p-3 border-t border-slate-900">
        <div className="p-2.5 rounded-xl bg-slate-900/60 flex items-center justify-between">
          <Link
            to="/app/profile"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
            title="Manage Profile & Security"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-blue-400 font-semibold uppercase truncate">
                {user?.role || 'BUSINESS_OWNER'}
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Sign out of BizNexus"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Common Components
import ProtectedRoute from '../components/common/ProtectedRoute';

// Public Pages
import LandingPage from '../pages/LandingPage';
import FeaturesPage from '../pages/FeaturesPage';
import PricingPage from '../pages/PricingPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import NotFoundPage from '../pages/NotFoundPage';
import BusinessRegistrationPage from '../pages/BusinessRegistrationPage';

// Authentication Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Profile Page
import ProfilePage from '../pages/ProfilePage';

// Role-Based Dashboards
import SuperAdminDashboard from '../pages/dashboards/SuperAdminDashboard';
import BusinessOwnerDashboard from '../pages/dashboards/BusinessOwnerDashboard';
import ManagerDashboard from '../pages/dashboards/ManagerDashboard';
import EmployeeDashboard from '../pages/dashboards/EmployeeDashboard';
import CustomerDashboard from '../pages/dashboards/CustomerDashboard';

// Part 5 HR Modules
import EmployeeManagementPage from '../pages/employees/EmployeeManagementPage';
import HRManagementPage from '../pages/hr/HRManagementPage';

// Part 6 CRM & Sales Modules
import CustomerManagementPage from '../pages/customers/CustomerManagementPage';
import CRMLeadsPage from '../pages/crm/CRMLeadsPage';
import SalesOrdersPage from '../pages/sales/SalesOrdersPage';

// Part 7 Inventory & Purchase Modules
import InventoryManagementPage from '../pages/inventory/InventoryManagementPage';
import PurchaseManagementPage from '../pages/purchase/PurchaseManagementPage';

// Part 8 Finance & Invoicing Modules
import FinanceDashboardPage from '../pages/finance/FinanceDashboardPage';
import InvoicingManagementPage from '../pages/finance/InvoicingManagementPage';

// Part 9 Projects, Kanban, Collaboration & Calendar
import ProjectsManagementPage from '../pages/projects/ProjectsManagementPage';

// Part 10 Executive Intelligence, Analytics, Billing, Settings & Audit
import ReportsAnalyticsPage from '../pages/reports/ReportsAnalyticsPage';
import BillingSubscriptionPage from '../pages/billing/BillingSubscriptionPage';
import BusinessSettingsPage from '../pages/settings/BusinessSettingsPage';
import AuditLogsPage from '../pages/audit/AuditLogsPage';

// Enterprise Transformations
import BranchManagementPage from '../pages/branches/BranchManagementPage';
import PointOfSalePage from '../pages/pos/PointOfSalePage';

/**
 * Intelligent redirection component to steer user to their role-specific dashboard
 */
const RoleDashboardRedirect: React.FC = () => {
  const { user, getRoleDashboardPath } = useAuth();
  const target = getRoleDashboardPath(user?.role);
  return <Navigate to={target} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with Standard Header/Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/register-business" element={<BusinessRegistrationPage />} />
      </Route>

      {/* Authentication Pages (Split Screen Clean Layout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />
      </Route>

      {/* Authenticated Dashboard Pages (Protected by JWT & Roles) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dynamic Root Redirection */}
        <Route index element={<RoleDashboardRedirect />} />

        {/* 5 Distinct Role Dashboards */}
        <Route
          path="super-admin"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER']}>
              <BusinessOwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="manager"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="employee"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="customer"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* User Profile & Security */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Enterprise Operations Modules */}
        <Route
          path="employees"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER']}>
              <EmployeeManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER']}>
              <HRManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE']}>
              <CustomerManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="crm"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE']}>
              <CRMLeadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="sales"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER']}>
              <SalesOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE']}>
              <InventoryManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="branches"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER']}>
              <BranchManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pos"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE']}>
              <PointOfSalePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER']}>
              <PurchaseManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER']}>
              <FinanceDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE']}>
              <ProjectsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER']}>
              <ReportsAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="entities" element={<Navigate to="/app/super-admin" replace />} />
        <Route
          path="invoicing"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER']}>
              <InvoicingManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="team" element={<Navigate to="/app/employees" replace />} />
        <Route
          path="audit"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER']}>
              <BillingSubscriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_OWNER']}>
              <BusinessSettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Dashboard alias */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />

      {/* 404 Catch-All Page */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

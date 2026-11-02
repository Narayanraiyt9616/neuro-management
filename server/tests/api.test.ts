import crypto from 'crypto';
import request from 'supertest';
import { app } from '../src/server';

// Import all required models to verify schema construction
import User from '../src/models/User';
import Business from '../src/models/Business';
import Subscription from '../src/models/Subscription';
import SubscriptionPlan from '../src/models/SubscriptionPlan';
import ActivityLog from '../src/models/ActivityLog';
import PlatformSettings from '../src/models/PlatformSettings';
import PasswordResetToken from '../src/models/PasswordResetToken';
import Customer from '../src/models/Customer';
import Order from '../src/models/Order';
import Invoice from '../src/models/Invoice';
import Expense from '../src/models/Expense';
import Product from '../src/models/Product';
import Project from '../src/models/Project';
import Department from '../src/models/Department';
import Employee from '../src/models/Employee';
import Attendance from '../src/models/Attendance';
import LeavePolicy from '../src/models/LeavePolicy';
import LeaveRequest from '../src/models/LeaveRequest';
import JobOpening from '../src/models/JobOpening';
import JobApplication from '../src/models/JobApplication';
import SalaryStructure from '../src/models/SalaryStructure';
import Payroll from '../src/models/Payroll';
import Payslip from '../src/models/Payslip';
import Notification from '../src/models/Notification';
import ProductCategory from '../src/models/ProductCategory';
import Warehouse from '../src/models/Warehouse';
import Inventory from '../src/models/Inventory';
import StockLedger from '../src/models/StockLedger';
import StockTransfer from '../src/models/StockTransfer';
import Supplier from '../src/models/Supplier';
import PurchaseOrder from '../src/models/PurchaseOrder';
import Income from '../src/models/Income';
import ExpenseCategory from '../src/models/ExpenseCategory';
import Payment from '../src/models/Payment';
import Refund from '../src/models/Refund';
import FinancialTransaction from '../src/models/FinancialTransaction';
import ProjectMember from '../src/models/ProjectMember';
import Task from '../src/models/Task';
import TaskComment from '../src/models/TaskComment';
import ProjectMilestone from '../src/models/ProjectMilestone';
import ProjectDocument from '../src/models/ProjectDocument';
import BusinessEvent from '../src/models/BusinessEvent';
import Branch from '../src/models/Branch';
import PosSession from '../src/models/PosSession';
import SupportTicket from '../src/models/SupportTicket';

async function runTests(): Promise<void> {
  console.log('\n======================================================');
  console.log('   BIZNEXUS PART 3: SUPER ADMIN, RBAC & PLATFORM TEST');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: string): void => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Verify Mongoose Models
    console.log('--- 1. Checking TypeScript Mongoose Models ---');
    assert(User.modelName === 'User', 'User model is registered');
    assert(Business.modelName === 'Business', 'Business model is registered');
    assert(Subscription.modelName === 'Subscription', 'Subscription model is registered');
    assert(SubscriptionPlan.modelName === 'SubscriptionPlan', 'SubscriptionPlan model is registered');
    assert(ActivityLog.modelName === 'ActivityLog', 'ActivityLog model is registered');
    assert(PlatformSettings.modelName === 'PlatformSettings', 'PlatformSettings model is registered');
    assert(PasswordResetToken.modelName === 'PasswordResetToken', 'PasswordResetToken model is registered');
    assert(Customer.modelName === 'Customer', 'Customer model is registered');
    assert(Order.modelName === 'Order', 'Order model is registered');
    assert(Invoice.modelName === 'Invoice', 'Invoice model is registered');
    assert(Expense.modelName === 'Expense', 'Expense model is registered');
    assert(Product.modelName === 'Product', 'Product model is registered');
    assert(Project.modelName === 'Project', 'Project model is registered');
    assert(Department.modelName === 'Department', 'Department model is registered');
    assert(Employee.modelName === 'Employee', 'Employee model is registered');
    assert(Attendance.modelName === 'Attendance', 'Attendance model is registered');
    assert(LeavePolicy.modelName === 'LeavePolicy', 'LeavePolicy model is registered');
    assert(LeaveRequest.modelName === 'LeaveRequest', 'LeaveRequest model is registered');
    assert(JobOpening.modelName === 'JobOpening', 'JobOpening model is registered');
    assert(JobApplication.modelName === 'JobApplication', 'JobApplication model is registered');
    assert(SalaryStructure.modelName === 'SalaryStructure', 'SalaryStructure model is registered');
    assert(Payroll.modelName === 'Payroll', 'Payroll model is registered');
    assert(Payslip.modelName === 'Payslip', 'Payslip model is registered');
    assert(Notification.modelName === 'Notification', 'Notification model is registered');
    assert(ProductCategory.modelName === 'ProductCategory', 'ProductCategory model is registered');
    assert(Warehouse.modelName === 'Warehouse', 'Warehouse model is registered');
    assert(Inventory.modelName === 'Inventory', 'Inventory model is registered');
    assert(StockLedger.modelName === 'StockLedger', 'StockLedger model is registered');
    assert(StockTransfer.modelName === 'StockTransfer', 'StockTransfer model is registered');
    assert(Supplier.modelName === 'Supplier', 'Supplier model is registered');
    assert(PurchaseOrder.modelName === 'PurchaseOrder', 'PurchaseOrder model is registered');
    assert(Income.modelName === 'Income', 'Income model is registered');
    assert(ExpenseCategory.modelName === 'ExpenseCategory', 'ExpenseCategory model is registered');
    assert(Payment.modelName === 'Payment', 'Payment model is registered');
    assert(Refund.modelName === 'Refund', 'Refund model is registered');
    assert(FinancialTransaction.modelName === 'FinancialTransaction', 'FinancialTransaction model is registered');
    assert(ProjectMember.modelName === 'ProjectMember', 'ProjectMember model is registered');
    assert(Task.modelName === 'Task', 'Task model is registered');
    assert(TaskComment.modelName === 'TaskComment', 'TaskComment model is registered');
    assert(ProjectMilestone.modelName === 'ProjectMilestone', 'ProjectMilestone model is registered');
    assert(ProjectDocument.modelName === 'ProjectDocument', 'ProjectDocument model is registered');
    assert(BusinessEvent.modelName === 'BusinessEvent', 'BusinessEvent model is registered');
    assert(Branch.modelName === 'Branch', 'Branch model is registered');
    assert(PosSession.modelName === 'PosSession', 'PosSession model is registered');
    assert(SupportTicket.modelName === 'SupportTicket', 'SupportTicket model is registered');

    // 2. Health & Base Endpoints
    console.log('\n--- 2. Checking Base & Health Endpoints ---');
    const rootRes = await request(app).get('/');
    assert(rootRes.status === 200, 'GET / returns 200 OK');

    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthRes.body.success === true, 'GET /api/health success is true');

    // 3. User Registration (Part 2)
    console.log('\n--- 3. Testing User Registration ---');
    const uniqueEmail = `test.founder.${Date.now()}@biznexus-test.com`;
    const regPayload = {
      name: 'Julian Montgomery',
      email: uniqueEmail,
      phone: '+1 (555) 777-8888',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      role: 'BUSINESS_OWNER',
      businessName: 'Vanguard Aerospace'
    };

    const regRes = await request(app).post('/api/auth/register').send(regPayload);
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(Boolean(regRes.body.data?.token), 'POST /api/auth/register returns JWT token');
    const newOwnerToken = regRes.body.data?.token;
    const newOwnerBusinessId = regRes.body.data?.user?.businessId;

    // 4. Pre-seeded Core Roles Login
    console.log('\n--- 4. Authenticating Roles for Administration & Testing ---');
    const superAdminRes = await request(app).post('/api/auth/login').send({
      email: 'superadmin@biznexus.com',
      password: 'BizNexus2026!'
    });
    assert(superAdminRes.status === 200, 'SUPER_ADMIN logs in successfully');
    const superAdminToken = superAdminRes.body.data.token;

    const ownerRes = await request(app).post('/api/auth/login').send({
      email: 'owner@nexuscorp.com',
      password: 'BizNexus2026!'
    });
    assert(ownerRes.status === 200, 'BUSINESS_OWNER logs in successfully');
    const ownerToken = ownerRes.body.data.token;
    const ownerBusinessId = ownerRes.body.data.user.businessId;

    const employeeRes = await request(app).post('/api/auth/login').send({
      email: 'employee@nexuscorp.com',
      password: 'BizNexus2026!'
    });
    assert(employeeRes.status === 200, 'EMPLOYEE logs in successfully');
    const employeeToken = employeeRes.body.data.token;

    // 5. Super Admin Overview Statistics (Part 3)
    console.log('\n--- 5. Testing Platform Overview Database Statistics ---');
    const statsRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(statsRes.status === 200, 'GET /api/admin/stats returns 200 OK');
    assert(typeof statsRes.body.data.totalBusinesses === 'number', 'Total Businesses stat is numeric');
    assert(typeof statsRes.body.data.activeBusinesses === 'number', 'Active Businesses stat is numeric');
    assert(typeof statsRes.body.data.pendingBusinesses === 'number', 'Pending Businesses stat is numeric');
    assert(typeof statsRes.body.data.suspendedBusinesses === 'number', 'Suspended Businesses stat is numeric');
    assert(typeof statsRes.body.data.totalUsers === 'number', 'Total Users stat is numeric');
    assert(typeof statsRes.body.data.activeSubscriptions === 'number', 'Active Subscriptions stat is numeric');
    assert(typeof statsRes.body.data.expiredSubscriptions === 'number', 'Expired Subscriptions stat is numeric');
    assert(typeof statsRes.body.data.recordedPlatformRevenue === 'number', 'Platform Revenue stat is numeric');

    // Security check: non-superadmin forbidden from accessing stats
    const forbiddenStatsRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(forbiddenStatsRes.status === 403, 'Non-admin accessing /api/admin/stats is blocked (403 Forbidden)');

    // 6. Business Registration System (Part 3)
    console.log('\n--- 6. Testing Complete Business Registration System ---');
    const newBizEmail = `contact.apex.${Date.now()}@apexcloud.org`;
    const newBizPayload = {
      name: 'Apex HyperCloud Systems',
      businessEmail: newBizEmail,
      phone: '+1 (555) 345-6789',
      address: {
        street: '100 Innovation Way',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'US'
      },
      category: 'Cloud Infrastructure & DevOps',
      registrationNumber: `REG-WA-${Date.now().toString().slice(-6)}`,
      gstin: 'GSTIN-WA-884102',
      website: 'https://apexcloud.org',
      description: 'Enterprise Kubernetes management, bare-metal orchestration, and edge infrastructure.',
      ownerName: 'Dominic Sterling',
      ownerEmail: `dominic.${Date.now()}@apexcloud.org`,
      planCode: 'PROFESSIONAL'
    };

    const bizRegRes = await request(app).post('/api/business/register').send(newBizPayload);
    assert(bizRegRes.status === 201, 'POST /api/business/register returns 201 Created');
    assert(bizRegRes.body.data.status === 'PENDING', 'New registered business status defaults to PENDING');
    const pendingBizId = bizRegRes.body.data._id;

    // 7. Super Admin Business Management (Search, Filter, Details)
    console.log('\n--- 7. Testing Super Admin Business Management ---');
    const allBizRes = await request(app)
      .get('/api/admin/businesses?status=ALL')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(allBizRes.status === 200, 'GET /api/admin/businesses returns 200 OK');
    assert(Array.isArray(allBizRes.body.data.items), 'Businesses response contains items array');

    const pendingFilterRes = await request(app)
      .get('/api/admin/businesses?status=PENDING')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(pendingFilterRes.status === 200, 'Filter businesses by PENDING returns 200 OK');

    const singleBizRes = await request(app)
      .get(`/api/admin/businesses/${pendingBizId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(singleBizRes.status === 200, 'GET /api/admin/businesses/:id returns business details');
    assert(singleBizRes.body.data.name === newBizPayload.name, 'Retrieved business name matches');

    // 8. Business Approval & Activation Workflow
    console.log('\n--- 8. Testing Business Approval & Activation Workflow ---');
    const approveRes = await request(app)
      .patch(`/api/admin/businesses/${pendingBizId}/approve`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({});
    assert(approveRes.status === 200, 'PATCH /api/admin/businesses/:id/approve returns 200 OK');
    assert(approveRes.body.data.status === 'ACTIVE', 'Business status transitioned to ACTIVE on approval');

    // 9. Business Suspension & Reactivation
    console.log('\n--- 9. Testing Business Suspension & Reactivation ---');
    const suspendRes = await request(app)
      .patch(`/api/admin/businesses/${pendingBizId}/suspend`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ reason: 'Compliance audit pending' });
    assert(suspendRes.status === 200, 'PATCH /api/admin/businesses/:id/suspend returns 200 OK');
    assert(suspendRes.body.data.status === 'SUSPENDED', 'Business status transitioned to SUSPENDED');

    const reactivateRes = await request(app)
      .patch(`/api/admin/businesses/${pendingBizId}/reactivate`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({});
    assert(reactivateRes.status === 200, 'PATCH /api/admin/businesses/:id/reactivate returns 200 OK');
    assert(reactivateRes.body.data.status === 'ACTIVE', 'Business status transitioned back to ACTIVE');

    // 9b. Edit Business Info
    const editBizRes = await request(app)
      .put(`/api/admin/businesses/${pendingBizId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ phone: '+1 (555) 999-0000', category: 'DevOps & SRE Systems' });
    assert(editBizRes.status === 200, 'PUT /api/admin/businesses/:id returns 200 OK');
    assert(editBizRes.body.data.phone === '+1 (555) 999-0000', 'Business phone updated');

    // 10. Subscription Plans Management (FREE, STARTER, PROFESSIONAL, ENTERPRISE)
    console.log('\n--- 10. Testing Subscription Plans Management ---');
    const plansRes = await request(app)
      .get('/api/admin/plans')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(plansRes.status === 200, 'GET /api/admin/plans returns 200 OK');
    assert(plansRes.body.data.length >= 4, 'All 4 subscription tiers available (FREE, STARTER, PROFESSIONAL, ENTERPRISE)');

    // Update subscription plan pricing
    const planToUpdate = plansRes.body.data[1]; // STARTER
    const updatePlanRes = await request(app)
      .put(`/api/admin/plans/${planToUpdate._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ monthlyPrice: 35, yearlyPrice: 350 });
    assert(updatePlanRes.status === 200, 'PUT /api/admin/plans/:id updates plan pricing');
    assert(updatePlanRes.body.data.monthlyPrice === 35, 'Plan monthly price updated to 35');

    // List subscriptions
    const subsRes = await request(app)
      .get('/api/admin/subscriptions')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(subsRes.status === 200, 'GET /api/admin/subscriptions returns 200 OK');

    // 11. Payment Gateway Integration Architecture
    console.log('\n--- 11. Testing Payment Gateway Integration Architecture ---');
    const paymentIntentRes = await request(app)
      .post('/api/admin/subscriptions/payment-gateway-intent')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        businessId: ownerBusinessId,
        planCode: 'PROFESSIONAL',
        billingCycle: 'monthly',
        provider: 'stripe'
      });
    assert(paymentIntentRes.status === 200, 'POST /api/admin/subscriptions/payment-gateway-intent returns 200 OK');
    assert(paymentIntentRes.body.data.provider === 'stripe', 'Payment intent configured for Stripe');
    assert(Boolean(paymentIntentRes.body.data.clientSecret), 'Payment intent provides clientSecret');
    assert(Boolean(paymentIntentRes.body.data.orderId), 'Payment intent provides orderId');

    // 12. Super Admin User Management
    console.log('\n--- 12. Testing Super Admin User Management ---');
    const usersListRes = await request(app)
      .get('/api/admin/users?role=ALL')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(usersListRes.status === 200, 'GET /api/admin/users returns 200 OK');
    assert(Array.isArray(usersListRes.body.data.items), 'Users response contains items');

    // Update user status
    const targetUser = usersListRes.body.data.items.find((u: any) => u.email === 'employee@nexuscorp.com');
    if (targetUser) {
      const toggleUserRes = await request(app)
        .patch(`/api/admin/users/${targetUser._id}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'inactive' });
      assert(toggleUserRes.status === 200, 'PATCH /api/admin/users/:id/status updates status to inactive');

      // Reactivate
      await request(app)
        .patch(`/api/admin/users/${targetUser._id}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'active' });
    }

    // 13. Audit Logging
    console.log('\n--- 13. Testing Audit Logging ---');
    const auditRes = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(auditRes.status === 200, 'GET /api/admin/audit-logs returns 200 OK');
    assert(Array.isArray(auditRes.body.data.items), 'Audit logs contains items');

    // 14. Admin Platform Settings
    console.log('\n--- 14. Testing Admin Platform Settings ---');
    const settingsRes = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert(settingsRes.status === 200, 'GET /api/admin/settings returns 200 OK');
    assert(Boolean(settingsRes.body.data.platformName), 'Settings contains platformName');

    const updateSettingsRes = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ platformName: 'BizNexus Enterprise Cloud 2026' });
    assert(updateSettingsRes.status === 200, 'PUT /api/admin/settings returns 200 OK');
    assert(updateSettingsRes.body.data.platformName === 'BizNexus Enterprise Cloud 2026', 'Platform name updated');

    // 15. Multi-Tenant Business Isolation (Part 2 & Part 3)
    console.log('\n--- 15. Verifying Strict Business Isolation ---');
    const ownBizRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/overview`)
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(ownBizRes.status === 200, 'Business Owner can access their own business overview');

    const alienBizRes = await request(app)
      .get('/api/business/60d0fe4f5311236168a109cb/overview')
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(alienBizRes.status === 403, 'Business Owner cross-tenant attempt is blocked (403 Forbidden)');

    // =========================================================================
    // 16. PART 4: BUSINESS OWNER DASHBOARD, ANALYTICS & QUICK ACTIONS
    // =========================================================================
    console.log('\n--- 16. Testing Business Owner 10 Real Dashboard Statistics ---');
    const ownerStatsRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/stats`)
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(ownerStatsRes.status === 200, 'GET /dashboard/stats returns 200 OK');
    const sData = ownerStatsRes.body.data;
    assert(typeof sData.totalEmployees === 'number', 'Stat 1: Total Employees is numeric');
    assert(typeof sData.totalCustomers === 'number', 'Stat 2: Total Customers is numeric');
    assert(typeof sData.totalSales === 'number', 'Stat 3: Total Sales is numeric');
    assert(typeof sData.totalOrders === 'number', 'Stat 4: Total Orders is numeric');
    assert(typeof sData.totalRevenue === 'number', 'Stat 5: Total Revenue is numeric');
    assert(typeof sData.totalExpenses === 'number', 'Stat 6: Total Expenses is numeric');
    assert(typeof sData.netProfit === 'number', 'Stat 7: Net Profit is numeric');
    assert(typeof sData.pendingPayments === 'number', 'Stat 8: Pending Payments is numeric');
    assert(typeof sData.lowStockProducts === 'number', 'Stat 9: Low Stock Products is numeric');
    assert(typeof sData.activeProjects === 'number', 'Stat 10: Active Projects is numeric');
    assert(Boolean(sData.currency), 'Dashboard currency is defined');

    // Date Filters
    console.log('\n--- 17. Testing Dashboard Date Filtering ---');
    const todayRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/stats?period=today`)
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(todayRes.status === 200, 'Filter: Today returns 200 OK');

    const sevenDaysRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/stats?period=7d`)
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(sevenDaysRes.status === 200, 'Filter: Last 7 Days returns 200 OK');

    const thisMonthRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/stats?period=this_month`)
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(thisMonthRes.status === 200, 'Filter: This Month returns 200 OK');

    const customDateRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/stats?period=custom&startDate=2026-01-01&endDate=2026-12-31`)
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(customDateRes.status === 200, 'Filter: Custom Date Range returns 200 OK');

    // Analytics: 6 Interactive Charts
    console.log('\n--- 18. Testing Analytics Data for 6 Interactive Charts ---');
    const analyticsRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/analytics`)
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(analyticsRes.status === 200, 'GET /dashboard/analytics returns 200 OK');
    const aData = analyticsRes.body.data;
    assert(Array.isArray(aData.monthlyRevenue), 'Chart 1: Monthly Revenue dataset is array');
    assert(Array.isArray(aData.monthlyExpenses), 'Chart 2: Monthly Expenses dataset is array');
    assert(Array.isArray(aData.profitAndLoss), 'Chart 3: Profit & Loss dataset is array');
    assert(Array.isArray(aData.salesPerformance), 'Chart 4: Sales Performance dataset is array');
    assert(Array.isArray(aData.orderStatistics.statusBreakdown), 'Chart 5: Order Statistics breakdown is array');
    assert(Array.isArray(aData.employeeStatistics.departmentDistribution), 'Chart 6: Employee Statistics distribution is array');

    // Recent Activities Feed
    console.log('\n--- 19. Testing Recent Activities Feed from ActivityLog ---');
    const activitiesRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/activities?limit=10`)
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(activitiesRes.status === 200, 'GET /dashboard/activities returns 200 OK');
    assert(Array.isArray(activitiesRes.body.data), 'Recent activities returns array');

    // Business Switching
    console.log('\n--- 20. Testing Multi-Business Switching ---');
    const myBusinessesRes = await request(app)
      .get('/api/business/my-businesses')
      .set('Authorization', `Bearer ${ownerToken}`);
    assert(myBusinessesRes.status === 200, 'GET /api/business/my-businesses returns 200 OK');
    assert(Array.isArray(myBusinessesRes.body.data), 'User accessible businesses returns array');

    // Business Profile Update
    console.log('\n--- 21. Testing Business Profile Updates ---');
    const updateProfileRes = await request(app)
      .put(`/api/business/${ownerBusinessId}/profile`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Nexus Technologies Enterprise Inc.',
        website: 'https://nexustech-enterprise.com',
        phone: '+1 (555) 234-9900',
        description: 'Updated enterprise mission and operational scope.'
      });
    assert(updateProfileRes.status === 200, 'PUT /api/business/:id/profile returns 200 OK');
    assert(updateProfileRes.body.data.name === 'Nexus Technologies Enterprise Inc.', 'Business profile name updated');

    // Business Operational Settings Update
    console.log('\n--- 22. Testing Business Settings Updates ---');
    const updateSettingsData = {
      currency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'DD/MM/YYYY',
      invoiceSettings: {
        prefix: 'NXT-',
        nextNumber: 5001,
        paymentTermsDays: 45
      },
      notificationPreferences: {
        emailOnOrder: true,
        emailOnPayment: true,
        lowStockAlerts: true,
        weeklyDigest: true
      },
      workingHours: {
        start: '08:30',
        end: '17:30',
        workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    };
    const updateSettingsResponse = await request(app)
      .put(`/api/business/${ownerBusinessId}/settings`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(updateSettingsData);
    assert(updateSettingsResponse.status === 200, 'PUT /api/business/:id/settings returns 200 OK');

    // Quick Actions
    console.log('\n--- 23. Testing Executive Quick Actions ---');
    // QA 1: Add Employee
    const qaEmpRes = await request(app)
      .post(`/api/business/${ownerBusinessId}/quick-actions/employee`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Elena Rostova',
        email: `elena.${Date.now()}@nexuscorp.com`,
        phone: '+1 (555) 334-1122',
        role: 'EMPLOYEE',
        department: 'Operations & Logistics'
      });
    assert(qaEmpRes.status === 201, 'Quick Action: Add Employee returns 201 Created');

    // QA 2: Add Customer
    const qaCustRes = await request(app)
      .post(`/api/business/${ownerBusinessId}/quick-actions/customer`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Quantum BioLabs LLC',
        email: `orders.${Date.now()}@quantumbio.com`,
        phone: '+1 (555) 445-6677',
        companyName: 'Quantum BioLabs'
      });
    assert(qaCustRes.status === 201, 'Quick Action: Add Customer returns 201 Created');

    // QA 3: Create Invoice
    const qaInvRes = await request(app)
      .post(`/api/business/${ownerBusinessId}/quick-actions/invoice`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        customerName: 'Quantum BioLabs LLC',
        customerEmail: 'orders@quantumbio.com',
        amount: 3200,
        dueDate: '2026-12-15',
        notes: 'Initial enterprise laboratory setup.'
      });
    assert(qaInvRes.status === 201, 'Quick Action: Create Invoice returns 201 Created');

    // QA 4: Add Product
    const qaProdRes = await request(app)
      .post(`/api/business/${ownerBusinessId}/quick-actions/product`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Ultra-Low Latency PCIe NIC 200G',
        sku: `NIC-200G-${Date.now().toString().slice(-4)}`,
        category: 'Networking',
        price: 799,
        cost: 380,
        stockQuantity: 18,
        reorderPoint: 5
      });
    assert(qaProdRes.status === 201, 'Quick Action: Add Product returns 201 Created');

    // QA 5: Create Purchase Order
    const qaPoRes = await request(app)
      .post(`/api/business/${ownerBusinessId}/quick-actions/purchase-order`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Bulk Fiber Patch Cables',
        vendor: 'Belden Optical Components',
        amount: 4800,
        paymentMethod: 'Corporate ACH',
        reference: `PO-BLD-${Date.now().toString().slice(-4)}`
      });
    assert(qaPoRes.status === 201, 'Quick Action: Purchase Order returns 201 Created');

    // QA 6: Create Project
    const qaPrjRes = await request(app)
      .post(`/api/business/${ownerBusinessId}/quick-actions/project`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'BioLabs Data Center Interconnect',
        client: 'Quantum BioLabs LLC',
        budget: 45000,
        startDate: '2026-11-15',
        description: 'Point-to-point dark fiber connectivity between lab branches.'
      });
    assert(qaPrjRes.status === 201, 'Quick Action: Create Project returns 201 Created');

    // API Authorization Checks
    console.log('\n--- 24. Testing API Authorization & Role Enforcement ---');
    const unauthorizedAccessRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/stats`);
    assert(unauthorizedAccessRes.status === 401, 'Unauthenticated request to owner stats is blocked (401)');

    const employeeAccessRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/dashboard/stats`)
      .set('Authorization', `Bearer ${employeeToken}`);
    assert(employeeAccessRes.status === 403, 'Employee role attempting to access owner stats is blocked (403)');

    // =========================================================================
    // PART 5: HR & WORKFORCE MANAGEMENT 11-STEP WORKFLOW TESTS
    // =========================================================================
    console.log('\n======================================================');
    console.log('   BIZNEXUS PART 5: COMPLETE HR & WORKFORCE WORKFLOW');
    console.log('======================================================');

    // 1. Owner adds employee
    console.log('\n--- 25. Workflow Step 1: Owner Adds Employee ---');
    const newEmpEmail = `alex.chen.${Date.now()}@biznexus-test.com`;
    const addEmpRes = await request(app)
      .post('/api/hr/employees')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        fullName: 'Alex Chen',
        email: newEmpEmail,
        phone: '+1 (555) 789-0123',
        designation: 'Senior Cloud Architect',
        employmentType: 'FULL_TIME',
        salary: {
          basicSalary: 95000,
          currency: 'INR'
        },
        joiningDate: '2026-01-15',
        dateOfBirth: '1992-06-10',
        emergencyContact: {
          name: 'Sarah Chen',
          relationship: 'Spouse',
          phone: '+1 (555) 789-9999'
        },
        address: {
          street: '450 Innovation Parkway',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560100',
          country: 'India'
        },
        initialPassword: 'Password123!'
      });

    assert(addEmpRes.status === 201, 'Owner adds employee returns 201 Created');
    assert(addEmpRes.body.success === true, 'Response indicates success');
    assert(Boolean(addEmpRes.body.data?._id), 'Created employee has MongoDB ID');
    assert(addEmpRes.body.data?.employeeId?.startsWith('EMP-'), 'Employee ID is auto-generated (EMP-xxxx)');
    const createdEmployeeId = addEmpRes.body.data?._id;

    // 2. Employee account created with credentials
    console.log('\n--- 26. Workflow Step 2: Employee Account Provisioning Verification ---');
    assert(Boolean(addEmpRes.body.data?.userId), 'Employee profile has linked User ID');

    // 3. Employee logs in
    console.log('\n--- 27. Workflow Step 3: Employee Logs In with Provisioned Credentials ---');
    const newEmpLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: newEmpEmail,
        password: 'Password123!'
      });

    assert(newEmpLoginRes.status === 200, 'Employee logs in returns 200 OK');
    assert(Boolean(newEmpLoginRes.body.data?.token), 'Employee receives valid JWT session token');
    assert(newEmpLoginRes.body.data?.user?.role === 'EMPLOYEE', 'User role is correctly set to EMPLOYEE');
    const newEmpToken = newEmpLoginRes.body.data?.token;

    // 4. Employee checks in
    console.log('\n--- 28. Workflow Step 4: Employee Checks In & Duplicate Prevention ---');
    const checkInRes = await request(app)
      .post('/api/hr/attendance/check-in')
      .set('Authorization', `Bearer ${newEmpToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ notes: 'Mobile check-in' });

    assert(checkInRes.status === 200, 'Employee check-in returns 200 OK');
    assert(Boolean(checkInRes.body.data?.checkIn), 'Server-side check-in timestamp recorded');
    assert(['PRESENT', 'LATE'].includes(checkInRes.body.data?.status), 'Attendance status set to PRESENT or LATE');

    // Duplicate check-in prevention test
    const dupCheckInRes = await request(app)
      .post('/api/hr/attendance/check-in')
      .set('Authorization', `Bearer ${newEmpToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ notes: 'Second check-in attempt' });

    assert(dupCheckInRes.status === 500 || dupCheckInRes.status === 400, 'Duplicate check-in on the same day is rejected');

    // 5. Employee checks out
    console.log('\n--- 29. Workflow Step 5: Employee Checks Out ---');
    const checkOutRes = await request(app)
      .post('/api/hr/attendance/check-out')
      .set('Authorization', `Bearer ${newEmpToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ notes: 'Standard shift departure' });

    assert(checkOutRes.status === 200, 'Employee check-out returns 200 OK');
    assert(Boolean(checkOutRes.body.data?.checkOut), 'Server-side checkout timestamp recorded');
    assert(typeof checkOutRes.body.data?.workingHours === 'number', 'Working hours calculated numerically');

    // 6. Employee applies for leave
    console.log('\n--- 30. Workflow Step 6: Employee Applies for Leave ---');
    const leaveApplyRes = await request(app)
      .post('/api/hr/leaves')
      .set('Authorization', `Bearer ${newEmpToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        leaveType: 'CASUAL_LEAVE',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        reason: 'Family event and personal travel'
      });

    assert(leaveApplyRes.status === 201, 'Leave application returns 201 Created');
    assert(leaveApplyRes.body.data?.status === 'PENDING', 'Leave request status starts as PENDING');
    assert(leaveApplyRes.body.data?.daysCount === 3, 'Leave days count accurately calculated (3 days)');
    const leaveRequestId = leaveApplyRes.body.data?._id;

    // 7. Manager/Owner approves leave
    console.log('\n--- 31. Workflow Step 7: Manager/Owner Approves Leave ---');
    const leaveReviewRes = await request(app)
      .patch(`/api/hr/leaves/${leaveRequestId}/review`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ action: 'APPROVE' });

    assert(leaveReviewRes.status === 200, 'Leave review returns 200 OK');
    assert(leaveReviewRes.body.data?.status === 'APPROVED', 'Leave request status transitions to APPROVED');

    // 8. Attendance & leave records update
    console.log('\n--- 32. Workflow Step 8: Attendance & Leave Records Update Verification ---');
    const leaveListRes = await request(app)
      .get('/api/hr/leaves')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(leaveListRes.status === 200, 'GET /api/hr/leaves returns 200 OK');
    const approvedLeave = leaveListRes.body.data?.find((l: any) => l._id === leaveRequestId);
    assert(approvedLeave?.status === 'APPROVED', 'Approved leave record persisted in database');

    // 9. Owner generates monthly payroll
    console.log('\n--- 33. Workflow Step 9: Monthly Payroll Generation & Duplicate Prevention ---');
    const payrollPeriodMonth = 11;
    const payrollPeriodYear = 2026;
    const generatePayrollRes = await request(app)
      .post('/api/hr/payroll/generate')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        month: payrollPeriodMonth,
        year: payrollPeriodYear,
        notes: 'Monthly disbursement run'
      });

    assert(generatePayrollRes.status === 201, 'Payroll generation returns 201 Created');
    assert(Boolean(generatePayrollRes.body.data?.payroll?._id), 'Payroll record created');
    assert(generatePayrollRes.body.data?.payroll?.payrollPeriod === `${payrollPeriodYear}-${payrollPeriodMonth}`, 'Payroll period formatted correctly');
    assert(generatePayrollRes.body.data?.payroll?.totalNetSalary > 0, 'Net salary total calculated');
    const createdPayrollId = generatePayrollRes.body.data?.payroll?._id;

    // Duplicate payroll prevention test
    const dupPayrollRes = await request(app)
      .post('/api/hr/payroll/generate')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        month: payrollPeriodMonth,
        year: payrollPeriodYear
      });

    assert(dupPayrollRes.status === 500 || dupPayrollRes.status === 400, 'Duplicate payroll generation for same period is rejected');

    // 10. Employee downloads/inspects payslip
    console.log('\n--- 34. Workflow Step 10: Employee Inspects / Downloads Payslip ---');
    const myPayslipsRes = await request(app)
      .get('/api/hr/payroll/employee/payslips')
      .set('Authorization', `Bearer ${newEmpToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(myPayslipsRes.status === 200, 'Employee fetches payslips returns 200 OK');
    assert(Array.isArray(myPayslipsRes.body.data), 'Payslips array returned');
    if (myPayslipsRes.body.data?.length > 0) {
      const ps = myPayslipsRes.body.data[0];
      assert(typeof ps.basicSalary === 'number', 'Payslip includes basic salary');
      assert(typeof ps.netSalary === 'number', 'Payslip includes net salary');
      assert(Boolean(ps.attendanceSummary), 'Payslip includes attendance summary');
    }

    // 11. HR exports reports
    console.log('\n--- 35. Workflow Step 11: HR Exports Reports (CSV & Data) ---');
    const exportEmpsRes = await request(app)
      .get('/api/hr/employees/export')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(exportEmpsRes.status === 200, 'GET /api/hr/employees/export returns 200 OK');
    assert(exportEmpsRes.headers['content-type']?.includes('text/csv'), 'Employees export returns text/csv header');

    const exportDeptsRes = await request(app)
      .get('/api/hr/reports/export?type=DEPARTMENT')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(exportDeptsRes.status === 200, 'GET /api/hr/reports/export?type=DEPARTMENT returns 200 OK');
    assert(exportDeptsRes.headers['content-type']?.includes('text/csv'), 'Department report returns text/csv');

    const exportPayrollRes = await request(app)
      .get('/api/hr/reports/export?type=PAYROLL')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(exportPayrollRes.status === 200, 'GET /api/hr/reports/export?type=PAYROLL returns 200 OK');

    const hrReportsOverviewRes = await request(app)
      .get('/api/hr/reports')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(hrReportsOverviewRes.status === 200, 'GET /api/hr/reports returns 200 OK');
    assert(Boolean(hrReportsOverviewRes.body.data?.totalEmployeeReport), 'Report 1: Total Employee Report present');
    assert(Boolean(hrReportsOverviewRes.body.data?.departmentWiseReport), 'Report 2: Department-wise Report present');
    assert(Boolean(hrReportsOverviewRes.body.data?.dailyAttendanceReport), 'Report 3: Daily Attendance Report present');
    assert(Boolean(hrReportsOverviewRes.body.data?.monthlyAttendanceReport), 'Report 4: Monthly Attendance Report present');
    assert(Boolean(hrReportsOverviewRes.body.data?.leaveStatisticsReport), 'Report 5: Leave Statistics Report present');
    assert(Boolean(hrReportsOverviewRes.body.data?.payrollSummaryReport), 'Report 6: Payroll Summary Report present');
    assert(Boolean(hrReportsOverviewRes.body.data?.recruitmentStatisticsReport), 'Report 7: Recruitment Statistics Report present');

    // 12. Employee Deletion Safeguard
    console.log('\n--- 36. Employee Deletion Safeguard Enforcement ---');
    const deleteBlockedRes = await request(app)
      .delete(`/api/hr/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(deleteBlockedRes.status === 500 || deleteBlockedRes.status === 400, 'Employee with attendance/payroll history cannot be deleted (Safeguard blocked)');

    // 13. Payroll Status Transition to PAID
    console.log('\n--- 37. Payroll Status Transition to PAID ---');
    const markPaidRes = await request(app)
      .patch(`/api/hr/payroll/${createdPayrollId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ status: 'PAID', paymentDate: new Date().toISOString() });

    assert(markPaidRes.status === 200, 'Payroll status transition to PAID returns 200 OK');
    assert(markPaidRes.body.data?.status === 'PAID', 'Payroll status verified as PAID');

    // =========================================================================
    // PART 6: COMPLETE CRM & SALES MANAGEMENT WORKFLOW
    // =========================================================================
    console.log('\n======================================================');
    console.log('   BIZNEXUS PART 6: COMPLETE CRM & SALES WORKFLOW');
    console.log('======================================================');

    // 1. Create Customer with all 10 fields
    console.log('\n--- 38. Workflow Step 1: Create Customer Profile with 10 Fields ---');
    const custEmail = `sarah.jenkins.${Date.now()}@apexcorp.com`;
    const createCustRes = await request(app)
      .post('/api/crm/customers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        fullName: 'Sarah Jenkins',
        email: custEmail,
        phone: '+1 (555) 432-8765',
        companyName: 'Apex Industrial Systems',
        address: {
          street: '120 Technology Way',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        },
        customerType: 'ENTERPRISE',
        status: 'ACTIVE',
        notes: 'Strategic account with annual support requirements.'
      });

    assert(createCustRes.status === 201, 'POST /api/crm/customers returns 201 Created');
    assert(createCustRes.body.success === true, 'Response indicates success');
    assert(Boolean(createCustRes.body.data?._id), 'Created customer has MongoDB ID');
    assert(createCustRes.body.data?.customerId?.startsWith('CUST-'), 'Customer ID auto-generated (CUST-xxxx)');
    assert(createCustRes.body.data?.customerType === 'ENTERPRISE', 'Customer type accurately persisted');
    const createdCustomerId = createCustRes.body.data?._id;

    // 2. Fetch Customer by ID and Update Customer
    console.log('\n--- 39. Workflow Step 2: Fetch and Update Customer ---');
    const getCustRes = await request(app)
      .get(`/api/crm/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(getCustRes.status === 200, 'GET /api/crm/customers/:id returns 200 OK');
    assert(getCustRes.body.data?.email === custEmail, 'Customer email verified');

    const updateCustRes = await request(app)
      .put(`/api/crm/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        notes: 'Updated SLA agreement valid until 2028.'
      });

    assert(updateCustRes.status === 200, 'PUT /api/crm/customers/:id returns 200 OK');
    assert(updateCustRes.body.data?.notes === 'Updated SLA agreement valid until 2028.', 'Customer notes updated');

    // 3. Export Customers CSV
    console.log('\n--- 40. Workflow Step 3: Export Customers CSV ---');
    const exportCustRes = await request(app)
      .get('/api/crm/customers/export')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(exportCustRes.status === 200, 'GET /api/crm/customers/export returns 200 OK');
    assert(exportCustRes.headers['content-type']?.includes('text/csv'), 'Customers export returns text/csv header');

    // 4. Create CRM Lead & Advance Pipeline Stages
    console.log('\n--- 41. Workflow Step 4: Create Lead & Progress Pipeline Stages ---');
    const leadEmail = `inquiries.${Date.now()}@quantumdynamics.io`;
    const createLeadRes = await request(app)
      .post('/api/crm/leads')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        leadName: 'Quantum Dynamics Tech',
        email: leadEmail,
        phone: '+1 (555) 777-9900',
        company: 'Quantum Dynamics',
        source: 'Website',
        leadValue: 45000,
        expectedClosingDate: '2026-12-15',
        notes: 'Inquiry for high-throughput computing licenses.',
        status: 'NEW'
      });

    assert(createLeadRes.status === 201, 'POST /api/crm/leads returns 201 Created');
    assert(Boolean(createLeadRes.body.data?._id), 'Created lead has MongoDB ID');
    assert(createLeadRes.body.data?.leadId?.startsWith('LEAD-'), 'Lead ID auto-generated (LEAD-xxxx)');
    const createdLeadId = createLeadRes.body.data?._id;

    // Advance Stage to QUALIFIED
    const updateLeadStatusRes = await request(app)
      .patch(`/api/crm/leads/${createdLeadId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ status: 'QUALIFIED' });

    assert(updateLeadStatusRes.status === 200, 'PATCH /api/crm/leads/:id/status returns 200 OK');
    assert(updateLeadStatusRes.body.data?.status === 'QUALIFIED', 'Lead status updated to QUALIFIED');

    // 5. Follow-Up Scheduling & Reminder System
    console.log('\n--- 42. Workflow Step 5: Schedule Follow-Up & Dispatch Reminder ---');
    const createFollowUpRes = await request(app)
      .post('/api/crm/follow-ups')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        title: 'Q4 Cloud Infrastructure Demo',
        type: 'DEMO',
        scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        leadId: createdLeadId,
        notes: 'Conduct technical overview with CIO'
      });

    assert(createFollowUpRes.status === 201, 'POST /api/crm/follow-ups returns 201 Created');
    assert(createFollowUpRes.body.data?.status === 'PENDING', 'Follow-up initialized in PENDING state');
    const createdFollowUpId = createFollowUpRes.body.data?._id;

    // Mark Follow-Up Completed
    const completeFollowUpRes = await request(app)
      .put(`/api/crm/follow-ups/${createdFollowUpId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        status: 'COMPLETED',
        outcomeNotes: 'Demo successful, moving to proposal phase.'
      });

    assert(completeFollowUpRes.status === 200, 'PUT /api/crm/follow-ups/:id returns 200 OK');
    assert(completeFollowUpRes.body.data?.status === 'COMPLETED', 'Follow-up status transitions to COMPLETED');

    // 6. Customer Communication & Email Integration
    console.log('\n--- 43. Workflow Step 6: Customer Communication Log & Email Dispatch ---');
    const recordCommRes = await request(app)
      .post('/api/crm/communications')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        customerId: createdCustomerId,
        type: 'NOTE',
        subject: 'Annual Review Call Summary',
        body: 'Client satisfied with current SLA and requested renewal proposal.'
      });

    assert(recordCommRes.status === 201, 'POST /api/crm/communications returns 201 Created');
    assert(recordCommRes.body.data?.activity?.subject === 'Annual Review Call Summary', 'Communication note logged');

    // Verify Customer Activity Timeline
    const timelineRes = await request(app)
      .get(`/api/crm/customers/${createdCustomerId}/timeline`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(timelineRes.status === 200, 'GET /api/crm/customers/:id/timeline returns 200 OK');
    assert(Array.isArray(timelineRes.body.data), 'Customer timeline array returned');

    // 7. Lead-to-Customer Conversion
    console.log('\n--- 44. Workflow Step 7: Convert Lead to Customer ---');
    const convertLeadRes = await request(app)
      .post(`/api/crm/leads/${createdLeadId}/convert`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        customerType: 'ENTERPRISE'
      });

    assert(convertLeadRes.status === 200, 'POST /api/crm/leads/:id/convert returns 200 OK');
    assert(convertLeadRes.body.data?.lead?.status === 'WON', 'Converted lead status is marked as WON');
    assert(Boolean(convertLeadRes.body.data?.customer?._id), 'Converted lead generated customer record');

    // 8. Sales Order Creation & Server-Side Calculations
    console.log('\n--- 45. Workflow Step 8: Sales Order Creation with Backend Calculated Totals ---');
    // First, create a product to test inventory deduction
    const createProdRes = await request(app)
      .post(`/api/business/${ownerBusinessId}/quick-actions/product`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        name: 'Nexus ERP Enterprise License',
        sku: `SKU-ERP-${Date.now()}`,
        category: 'Software',
        price: 1500,
        cost: 300,
        stockQuantity: 50,
        reorderPoint: 10
      });

    assert(createProdRes.status === 201, 'Quick add product returns 201 Created');
    const testProductId = createProdRes.body.data?._id;
    const initialStock = createProdRes.body.data?.stockQuantity;
    assert(initialStock === 50, 'Product starts with 50 units in stock');

    // Create sales order for 5 units at $1500, with $100 discount, 18% tax, $50 shipping
    // lineSubtotal = 5 * 1500 - 100 = 7400
    // lineTax = 7400 * 0.18 = 1332
    // totalAmount = 7400 + 1332 + 50 (shipping) = 8782
    const createOrderRes = await request(app)
      .post('/api/sales/orders')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        customerId: createdCustomerId,
        items: [
          {
            productId: testProductId,
            productName: 'Nexus ERP Enterprise License',
            sku: 'SKU-ERP-001',
            quantity: 5,
            unitPrice: 1500,
            discount: 100,
            tax: 18
          }
        ],
        shippingFee: 50,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      });

    assert(createOrderRes.status === 201, 'POST /api/sales/orders returns 201 Created');
    assert(Boolean(createOrderRes.body.data?._id), 'Created order has MongoDB ID');
    assert(createOrderRes.body.data?.orderNumber?.startsWith('SO-'), 'Order Number auto-generated (SO-yyyy-xxxx)');
    const createdOrderId = createOrderRes.body.data?._id;

    // Verify backend calculated totals
    const orderData = createOrderRes.body.data;
    assert(orderData.subtotal === 7500, 'Server calculated subtotal is 7500');
    assert(orderData.discountAmount === 100, 'Server calculated discount is 100');
    assert(orderData.taxAmount === 1332, 'Server calculated tax amount is 1332');
    assert(orderData.shippingFee === 50, 'Shipping fee is 50');
    assert(orderData.totalAmount === 8782, 'Server strictly calculated totalAmount as 8782');
    assert(orderData.inventoryDeducted === true, 'Order has inventoryDeducted flag set to true');

    // 9. Verify Stock Deduction in Inventory & Customer Spend
    console.log('\n--- 46. Workflow Step 9: Verify Automatic Stock Deduction & Customer Spend ---');
    // Fetch customer to check spend update
    const checkCustAfterOrder = await request(app)
      .get(`/api/crm/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(checkCustAfterOrder.body.data?.ordersCount >= 1, 'Customer ordersCount incremented');
    assert(checkCustAfterOrder.body.data?.totalSpent >= 8782, 'Customer totalSpent incremented by order amount');

    // Attempting to delete customer with active order history must be blocked
    console.log('\n--- 47. Customer Deletion Safeguard Enforcement ---');
    const deleteCustBlockedRes = await request(app)
      .delete(`/api/crm/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(deleteCustBlockedRes.status === 500 || deleteCustBlockedRes.status === 400, 'Customer with order history cannot be deleted (Safeguard enforced)');

    // 10. Order Cancellation & Inventory Restoration
    console.log('\n--- 48. Workflow Step 10: Cancel Order & Restore Inventory ---');
    const cancelOrderRes = await request(app)
      .post(`/api/sales/orders/${createdOrderId}/cancel`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ reason: 'Customer requested configuration change' });

    assert(cancelOrderRes.status === 200, 'Cancel sales order returns 200 OK');
    assert(cancelOrderRes.body.data?.status === 'CANCELLED', 'Order status updated to CANCELLED');
    assert(cancelOrderRes.body.data?.inventoryDeducted === false, 'inventoryDeducted flag reset to false');

    // Now create a customer with 0 orders and delete successfully
    const cleanCustRes = await request(app)
      .post('/api/crm/customers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        fullName: 'Ephemeral Customer',
        email: `clean.${Date.now()}@ephemeral.com`,
        customerType: 'INDIVIDUAL',
        status: 'ACTIVE'
      });

    assert(cleanCustRes.status === 201, 'Created ephemeral clean customer');
    const cleanCustId = cleanCustRes.body.data?._id;

    const deleteCleanRes = await request(app)
      .delete(`/api/crm/customers/${cleanCustId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(deleteCleanRes.status === 200, 'Clean customer with 0 orders deleted successfully (200 OK)');

    // 12. Sales Analytics Verification
    console.log('\n--- 49. Workflow Step 12: Sales Analytics & Reporting ---');
    const salesAnalyticsRes = await request(app)
      .get('/api/sales/analytics')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(salesAnalyticsRes.status === 200, 'GET /api/sales/analytics returns 200 OK');
    assert(typeof salesAnalyticsRes.body.data?.totalSales === 'number', 'Analytics includes numerical totalSales');
    assert(typeof salesAnalyticsRes.body.data?.totalOrders === 'number', 'Analytics includes numerical totalOrders');
    assert(typeof salesAnalyticsRes.body.data?.conversionRate === 'number', 'Analytics includes numerical conversionRate');
    assert(Array.isArray(salesAnalyticsRes.body.data?.monthlySales), 'Analytics includes monthlySales array');
    assert(Array.isArray(salesAnalyticsRes.body.data?.pipelineDistribution), 'Analytics includes pipelineDistribution array');

    // ========================================================================
    // PART 7 TESTS: INVENTORY, WAREHOUSE, SUPPLIER & PURCHASE MANAGEMENT
    // ========================================================================
    console.log('\n======================================================');
    console.log('   BIZNEXUS PART 7: INVENTORY, WAREHOUSES & PURCHASES');
    console.log('======================================================\n');

    // 50. Category Management
    console.log('--- 50. Category Management (CRUD & Hierarchy) ---');
    const categoryRes = await request(app)
      .post('/api/inventory/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        name: 'Precision Instruments & Hardware',
        code: `CAT-${Date.now().toString().slice(-4)}`,
        description: 'Industrial measuring tools and testing equipment'
      });

    assert(categoryRes.status === 201, 'POST /api/inventory/categories returns 201 Created');
    assert(Boolean(categoryRes.body.data?._id), 'Created category has MongoDB ID');
    const createdCategoryId = categoryRes.body.data?._id;

    const updateCatRes = await request(app)
      .put(`/api/inventory/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ description: 'Updated instruments category description' });

    assert(updateCatRes.status === 200, 'PUT /api/inventory/categories/:id returns 200 OK');
    assert(updateCatRes.body.data?.description.includes('Updated instruments'), 'Category description updated');

    // 51. Warehouse Management
    console.log('\n--- 51. Warehouse Management (Multi-Warehouse Infrastructure) ---');
    const listWhRes = await request(app)
      .get('/api/inventory/warehouses')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(listWhRes.status === 200, 'GET /api/inventory/warehouses returns 200 OK');
    let primaryWarehouse = listWhRes.body.data?.find((w: any) => w.isPrimary);
    if (!primaryWarehouse && listWhRes.body.data?.length > 0) {
      primaryWarehouse = listWhRes.body.data[0];
    }

    let primaryWarehouseId = primaryWarehouse?._id;
    if (!primaryWarehouseId) {
      const createWhRes = await request(app)
        .post('/api/inventory/warehouses')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('x-business-id', ownerBusinessId)
        .send({
          name: 'Main Distribution Hub',
          code: `WH-MAIN-${Date.now().toString().slice(-4)}`,
          isPrimary: true,
          address: { city: 'Bengaluru', state: 'Karnataka' }
        });
      primaryWarehouseId = createWhRes.body.data?._id;
    }
    assert(Boolean(primaryWarehouseId), 'Primary warehouse is identified/created');

    const createSecWhRes = await request(app)
      .post('/api/inventory/warehouses')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        name: 'Northern Satellite Depot',
        code: `WH-NORTH-${Date.now().toString().slice(-4)}`,
        isPrimary: false,
        address: { city: 'Delhi', state: 'Delhi NCR' }
      });

    assert(createSecWhRes.status === 201, 'Created secondary satellite warehouse (201 Created)');
    const secondaryWarehouseId = createSecWhRes.body.data?._id;

    // 52. Product Creation with Cost, Selling Price, Barcode, Min Threshold
    console.log('\n--- 52. Product Creation with Strict Types & Reorder Rule ---');
    const productPayload = {
      name: 'Digital Laser Level Pro 360',
      sku: `SKU-LL-${Date.now().toString().slice(-4)}`,
      barcode: `890${Date.now().toString().slice(-9)}`,
      categoryId: createdCategoryId,
      cost: 400,
      price: 850,
      taxRate: 18,
      unit: 'Pcs',
      minStockThreshold: 15,
      initialStock: 10,
      warehouseId: primaryWarehouseId
    };

    const createProductRes = await request(app)
      .post('/api/inventory/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(productPayload);

    assert(createProductRes.status === 201, 'POST /api/inventory/products returns 201 Created');
    const createdProduct = createProductRes.body.data;
    assert(Boolean(createdProduct?._id), 'Created product has MongoDB ID');
    assert(createdProduct.stockQuantity === 10, 'Initial stockQuantity is 10');
    assert(createdProduct.availableStock === 10, 'Initial availableStock is 10');
    assert(createdProduct.minStockThreshold === 15, 'Min stock threshold is 15');
    // Suggested reorder quantity = 2 * 15 - 10 = 20
    assert(createdProduct.suggestedReorderQuantity === 20, 'Suggested reorder quantity correctly computed (2*15 - 10 = 20)');
    const part7ProductId = createdProduct._id;

    // 53. Stock Movements & Immutable Stock Ledger
    console.log('\n--- 53. Stock Movements & Immutable Stock Ledger ---');
    const stockInRes = await request(app)
      .post('/api/inventory/movements')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        productId: part7ProductId,
        warehouseId: primaryWarehouseId,
        movementType: 'STOCK_IN',
        quantity: 20,
        notes: 'Inbound consignment from regional supplier'
      });

    assert(stockInRes.status === 200, 'POST /api/inventory/movements (STOCK_IN) returns 200 OK');
    assert(stockInRes.body.data?.product?.stockQuantity === 30, 'Product stock increased to 30 (10 + 20)');

    // Verify Stock Ledger audit record
    const ledgerRes = await request(app)
      .get(`/api/inventory/ledger?productId=${part7ProductId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(ledgerRes.status === 200, 'GET /api/inventory/ledger returns 200 OK');
    const ledgerList = Array.isArray(ledgerRes.body.data) ? ledgerRes.body.data : (ledgerRes.body.data?.ledger || []);
    const stockInEntry = ledgerList.find((l: any) => l.movementType === 'STOCK_IN' && l.quantity === 20);
    assert(Boolean(stockInEntry), 'StockLedger has immutable STOCK_IN record');
    assert(stockInEntry?.quantity === 20, 'StockLedger quantity is 20');
    assert(stockInEntry?.previousStock === 10, 'StockLedger previousStock is 10');
    assert(stockInEntry?.newStock === 30, 'StockLedger newStock is 30');

    // 54. Stock Transfer Between Warehouses
    console.log('\n--- 54. Inter-Warehouse Stock Transfer ---');
    const transferRes = await request(app)
      .post('/api/inventory/transfers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        fromWarehouseId: primaryWarehouseId,
        toWarehouseId: secondaryWarehouseId,
        items: [{ productId: part7ProductId, quantity: 5 }],
        notes: 'Inter-branch rebalance to North Depot'
      });

    assert(transferRes.status === 201, 'POST /api/inventory/transfers returns 201 Created');
    assert(transferRes.body.data?.status === 'COMPLETED', 'Transfer automatically completed');

    // 55. Low Stock Alerts & Suggested Reorder Calculation
    console.log('\n--- 55. Low Stock Alerts & Suggested Reorder Rule ---');
    // Adjust stock down to 8 (which is below threshold 15)
    await request(app)
      .post('/api/inventory/movements')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        productId: part7ProductId,
        warehouseId: primaryWarehouseId,
        movementType: 'ADJUSTMENT',
        quantity: 8,
        notes: 'Damage write-off bringing available below threshold'
      });

    const alertsRes = await request(app)
      .get('/api/inventory/low-stock-alerts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(alertsRes.status === 200, 'GET /api/inventory/low-stock-alerts returns 200 OK');
    const testAlert = alertsRes.body.data?.find((a: any) => a._id === part7ProductId);
    assert(Boolean(testAlert), 'Product is flagged in low stock alerts');
    // Suggested reorder = 2 * 15 - 8 = 22
    assert(testAlert?.suggestedReorderQuantity === 22, 'Suggested reorder calculation: 2 * 15 - 8 = 22');

    // 56. Supplier Management (Module 5)
    console.log('\n--- 56. Supplier Management (Module 5) ---');
    const supplierPayload = {
      supplierCode: `SUP-${Date.now().toString().slice(-4)}`,
      supplierName: 'LaserTech Precision Systems Ltd',
      companyName: 'LaserTech Photonics Corp',
      email: `supply.${Date.now()}@lasertech-optics.com`,
      phone: '+91 9988776655',
      contactPerson: 'Aditya Vardhan',
      gstin: '29AABCL1234D1Z8',
      paymentTerms: 'NET_30',
      status: 'ACTIVE',
      address: {
        street: '88 Electronics City Phase 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India'
      }
    };

    const createSupRes = await request(app)
      .post('/api/purchase/suppliers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(supplierPayload);

    assert(createSupRes.status === 201, 'POST /api/purchase/suppliers returns 201 Created');
    const createdSupplier = createSupRes.body.data;
    assert(Boolean(createdSupplier?._id), 'Created supplier has MongoDB ID');
    assert(createdSupplier.paymentTerms === 'NET_30', 'Supplier payment terms recorded');
    const testSupplierId = createdSupplier._id;

    // 57. Purchase Order Lifecycle: DRAFT -> APPROVED -> PARTIAL RECEIPT -> FULL RECEIPT
    console.log('\n--- 57. Purchase Order Lifecycle & Strict Goods Receipt Rule ---');
    const poPayload = {
      supplierId: testSupplierId,
      warehouseId: primaryWarehouseId,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 604800000).toISOString(),
      items: [
        {
          productId: part7ProductId,
          productName: 'Digital Laser Level Pro 360',
          sku: 'SKU-LL',
          quantity: 20,
          unitPrice: 400,
          taxRate: 18
        }
      ],
      shippingCost: 200,
      paymentTerms: 'NET_30',
      notes: 'Standard manufacturing PO'
    };

    const createPoRes = await request(app)
      .post('/api/purchase/orders')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(poPayload);

    assert(createPoRes.status === 201, 'POST /api/purchase/orders returns 201 Created');
    const createdPO = createPoRes.body.data;
    assert(createdPO.status === 'DRAFT', 'Initial PO status is DRAFT');
    assert(createdPO.subtotal === 8000, 'Calculated subtotal is 8000 (20 * 400)');
    assert(createdPO.taxAmount === 1440, 'Calculated GST tax is 1440 (18% of 8000)');
    assert(createdPO.totalAmount === 9640, 'Grand total is 9640 (8000 + 1440 + 200 shipping)');
    const testPOId = createdPO._id;

    // Approve PO
    const approvePoRes = await request(app)
      .patch(`/api/purchase/orders/${testPOId}/approve`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(approvePoRes.status === 200, 'Approve purchase order returns 200 OK');
    assert(approvePoRes.body.data?.status === 'APPROVED', 'PO status is now APPROVED');

    // CRITICAL PRINCIPLE VERIFICATION: Approving PO must NOT increase warehouse stock!
    const checkProductBeforeReceive = await request(app)
      .get(`/api/inventory/products/${part7ProductId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(
      checkProductBeforeReceive.body.data?.stockQuantity === 8,
      'CRITICAL: Stock quantity did NOT increase upon PO approval (stock remains 8)'
    );

    // Partial Receiving: Receive 8 units out of 20
    console.log('\n--- 58. Partial Receiving & Stock Ledger Enforcement ---');
    const partialReceiveRes = await request(app)
      .post(`/api/purchase/orders/${testPOId}/receive`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        receivedItems: [{ productId: part7ProductId, quantityReceived: 8 }],
        notes: 'First consignment received by warehouse manager'
      });

    assert(partialReceiveRes.status === 200, 'Receive goods (partial) returns 200 OK');
    assert(partialReceiveRes.body.data?.status === 'PARTIALLY_RECEIVED', 'PO status updated to PARTIALLY_RECEIVED');

    // Verify stock increased strictly by 8
    const checkProductAfterPartial = await request(app)
      .get(`/api/inventory/products/${part7ProductId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(
      checkProductAfterPartial.body.data?.stockQuantity === 16,
      'Warehouse stock strictly increased by 8 units (8 + 8 = 16)'
    );

    // Full Receiving: Receive remaining 12 units
    const fullReceiveRes = await request(app)
      .post(`/api/purchase/orders/${testPOId}/receive`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        receivedItems: [{ productId: part7ProductId, quantityReceived: 12 }],
        notes: 'Final batch received and verified'
      });

    assert(fullReceiveRes.status === 200, 'Receive remaining goods returns 200 OK');
    assert(fullReceiveRes.body.data?.status === 'RECEIVED', 'PO status transitions to RECEIVED');

    // Verify final stock is now 28 (16 + 12)
    const checkProductFinal = await request(app)
      .get(`/api/inventory/products/${part7ProductId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(
      checkProductFinal.body.data?.stockQuantity === 28,
      'Warehouse stock fully increased to 28 (16 + 12)'
    );

    // 59. Sales Order Integration & Overselling Prevention
    console.log('\n--- 59. Sales Order Stock Validation & Overselling Prevention ---');
    // Try to order 9999 units (which exceeds availableStock 28)
    const oversellRes = await request(app)
      .post('/api/sales/orders')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        customerId: createdCustomerId,
        items: [
          {
            productId: part7ProductId,
            productName: 'Digital Laser Level Pro 360',
            sku: 'SKU-LL',
            quantity: 9999,
            unitPrice: 850
          }
        ],
        status: 'CONFIRMED'
      });

    assert(
      oversellRes.status === 400,
      'Overselling rejected: Order for 9999 units returned HTTP 400 Bad Request'
    );
    assert(
      oversellRes.body.message?.includes('Insufficient stock') || oversellRes.body.message?.includes('available'),
      'Informative error message received indicating insufficient stock'
    );

    // Order valid quantity of 5 units
    const validSalesRes = await request(app)
      .post('/api/sales/orders')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        customerId: createdCustomerId,
        items: [
          {
            productId: part7ProductId,
            productName: 'Digital Laser Level Pro 360',
            sku: 'SKU-LL',
            quantity: 5,
            unitPrice: 850
          }
        ],
        status: 'CONFIRMED'
      });

    assert(validSalesRes.status === 201, 'Valid Sales Order for 5 units created successfully (201 Created)');

    // Verify stock deducted by 5 (28 - 5 = 23)
    const checkProductPostSale = await request(app)
      .get(`/api/inventory/products/${part7ProductId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(
      checkProductPostSale.body.data?.stockQuantity === 23,
      'Product stock correctly deducted to 23 (28 - 5) upon order confirmation'
    );

    // 60. Product & Supplier Deletion Safeguards
    console.log('\n--- 60. Product & Supplier Deletion Safeguards ---');
    // Product with stock > 0 cannot be deleted
    const deleteStockProductRes = await request(app)
      .delete(`/api/inventory/products/${part7ProductId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(
      deleteStockProductRes.status === 400,
      'Product with positive stock (23 units) cannot be deleted (Safeguard enforced)'
    );

    // Supplier with purchase orders cannot be deleted
    const deleteSupplierRes = await request(app)
      .delete(`/api/purchase/suppliers/${testSupplierId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(
      deleteSupplierRes.status === 400,
      'Supplier with active purchase orders cannot be deleted (Safeguard enforced)'
    );

    // 61. Inventory Analytics & Summary
    console.log('\n--- 61. Inventory Analytics & Summary ---');
    const inventoryAnalyticsRes = await request(app)
      .get('/api/inventory/analytics')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(inventoryAnalyticsRes.status === 200, 'GET /api/inventory/analytics returns 200 OK');
    assert(
      typeof inventoryAnalyticsRes.body.data?.totalProducts === 'number',
      'Inventory analytics provides numerical totalProducts'
    );
    assert(
      typeof inventoryAnalyticsRes.body.data?.totalStockValue === 'number',
      'Inventory analytics provides numerical totalStockValue'
    );
    assert(
      typeof inventoryAnalyticsRes.body.data?.purchaseSummary?.totalPurchaseOrders === 'number',
      'Inventory analytics includes purchaseSummary'
    );

    // ========================================================================
    // PART 8 TESTS: FINANCE, INVOICE, GST & PAYMENT MANAGEMENT
    // ========================================================================
    console.log('\n======================================================');
    console.log('   BIZNEXUS PART 8: FINANCE, INVOICES, GST & PAYMENTS');
    console.log('======================================================\n');

    // 62. Income Management
    console.log('--- 62. Income Management (CRUD, TDS & Ledger) ---');
    const incomeRes = await request(app)
      .post('/api/finance/income')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        title: 'Enterprise Technical Consultation & Architecture Advisory',
        category: 'Consulting',
        source: 'Global Enterprise Client',
        amount: 50000,
        taxDeducted: 5000, // 10% TDS
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'NEFT-CONSULT-2026-001',
        notes: 'Consulting fees credited net of TDS'
      });

    assert(incomeRes.status === 201, 'POST /api/finance/income returns 201 Created');
    assert(incomeRes.body.data?.netAmount === 45000, 'Income netAmount correctly calculated as gross - TDS (50000 - 5000 = 45000)');

    // List Incomes
    const listIncomeRes = await request(app)
      .get('/api/finance/income')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);
    assert(listIncomeRes.status === 200, 'GET /api/finance/income returns 200 OK');
    assert(listIncomeRes.body.data?.incomes?.length >= 1, 'Incomes list returns recorded entries');

    // 63. Expense Category Management
    console.log('\n--- 63. Expense Categories (Tax Deductible & Budgets) ---');
    const expCatRes = await request(app)
      .post('/api/finance/expense-categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        name: 'Cloud Infrastructure & Servers',
        code: 'CAT-CLOUD-INFRA',
        description: 'AWS, Azure and GCP compute and storage resources',
        isTaxDeductible: true,
        budgetLimit: 75000
      });

    assert(expCatRes.status === 201, 'POST /api/finance/expense-categories returns 201 Created');
    assert(expCatRes.body.data?.code === 'CAT-CLOUD-INFRA', 'Category code persisted');
    const createdCatId = expCatRes.body.data?._id;

    // 64. Expense Management & Approval Workflow
    console.log('\n--- 64. Expense Creation, Approval & Safeguards ---');
    const expenseRes = await request(app)
      .post('/api/finance/expenses')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        title: 'Monthly Dedicated Server Hosting',
        categoryId: createdCatId,
        category: 'Cloud Infrastructure & Servers',
        amount: 12000,
        taxAmount: 2160,
        vendor: 'DataCenter Cloud Solutions Ltd',
        vendorGstin: '27AAACD1234F1Z5',
        paymentMethod: 'CREDIT_CARD',
        reference: 'INV-DC-98124'
      });

    assert(expenseRes.status === 201, 'POST /api/finance/expenses returns 201 Created');
    assert(expenseRes.body.data?.approvalStatus === 'PENDING', 'Expense initial approvalStatus is PENDING');
    const createdExpenseId = expenseRes.body.data?._id;

    // Approve Expense
    const approveExpRes = await request(app)
      .patch(`/api/finance/expenses/${createdExpenseId}/approve`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(approveExpRes.status === 200, 'PATCH /api/finance/expenses/:id/approve returns 200 OK');
    assert(approveExpRes.body.data?.approvalStatus === 'APPROVED', 'Expense status transitions to APPROVED');

    // Rejection Workflow
    const expense2Res = await request(app)
      .post('/api/finance/expenses')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        title: 'Team Luxury Dinner & Entertainment',
        category: 'Entertainment',
        amount: 8000,
        vendor: 'Luxury Grand Bistro'
      });
    const expense2Id = expense2Res.body.data?._id;

    const rejectExpRes = await request(app)
      .patch(`/api/finance/expenses/${expense2Id}/reject`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ reason: 'Exceeds monthly discretionary allowance' });

    assert(rejectExpRes.status === 200, 'PATCH /api/finance/expenses/:id/reject returns 200 OK');
    assert(rejectExpRes.body.data?.approvalStatus === 'REJECTED', 'Expense status transitions to REJECTED');

    // 65. Intra-State Invoice Creation (Indian GST: CGST + SGST)
    console.log('\n--- 65. Intra-State Tax Invoice Generation (CGST 50% + SGST 50%) ---');
    // Ensure Intra-State Customer (Same state as business: Maharashtra)
    const intraCustRes = await request(app)
      .post('/api/crm/customers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        fullName: 'Apex Solutions Maharashtra Pvt Ltd',
        email: 'billing@apexmaharashtra.in',
        phone: '+91 98200 11223',
        companyName: 'Apex Solutions Maharashtra Pvt Ltd',
        customerType: 'ENTERPRISE',
        gstin: '27AAACA9999M1Z8',
        address: {
          street: '402 Nariman Point',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400021',
          country: 'India'
        }
      });
    const intraCustId = intraCustRes.body.data?._id;

    const intraInvoiceRes = await request(app)
      .post('/api/finance/invoices')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        customerId: intraCustId,
        invoiceDate: '2026-11-01',
        dueDate: '2026-11-15',
        paymentTerms: 'Net 15 Days',
        items: [
          {
            name: 'Cloud Enterprise SaaS Suite',
            description: 'Annual Core Subscription Tier',
            hsnSacCode: '997331',
            quantity: 1,
            unitPrice: 10000,
            discount: 0,
            taxRate: 18
          }
        ],
        shippingCharges: 0,
        otherCharges: 0,
        notes: 'Intra-state test invoice'
      });

    assert(intraInvoiceRes.status === 201, 'POST /api/finance/invoices (Intra-state) returns 201 Created');
    const intraInv = intraInvoiceRes.body.data;
    assert(intraInv.isInterState === false, 'Intra-state detected: isInterState is false');
    assert(intraInv.taxableAmount === 10000, 'Taxable amount is 10,000');
    assert(intraInv.cgstTotal === 900, 'CGST 50% split applied: cgstTotal is 900 (9% of 10000)');
    assert(intraInv.sgstTotal === 900, 'SGST 50% split applied: sgstTotal is 900 (9% of 10000)');
    assert(intraInv.igstTotal === 0, 'Intra-state IGST is 0');
    assert(intraInv.grandTotal === 11800, 'Grand total accurately calculated: 10000 + 1800 = 11,800');
    assert(intraInv.balanceDue === 11800, 'Initial balance due equals grand total (11,800)');
    assert(intraInv.status === 'ISSUED', 'Default invoice status is ISSUED');
    const intraInvoiceId = intraInv._id;

    // 66. Inter-State Invoice Creation (Indian GST: IGST 100%)
    console.log('\n--- 66. Inter-State Tax Invoice Generation (IGST 100%) ---');
    // Customer from Karnataka (Inter-state supply)
    const interCustRes = await request(app)
      .post('/api/crm/customers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        fullName: 'Bangalore Cloud Systems LLP',
        email: 'accounts@bangalorecloud.io',
        phone: '+91 80222 33445',
        companyName: 'Bangalore Cloud Systems LLP',
        customerType: 'ENTERPRISE',
        gstin: '29AABCB8888K1Z2',
        address: {
          street: '120 Electronic City Phase 1',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560100',
          country: 'India'
        }
      });
    const interCustId = interCustRes.body.data?._id;

    const interInvoiceRes = await request(app)
      .post('/api/finance/invoices')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        customerId: interCustId,
        invoiceDate: '2026-11-01',
        dueDate: '2026-11-20',
        paymentTerms: 'Net 20 Days',
        items: [
          {
            name: 'Dedicated Private Cloud Infrastructure',
            description: 'Managed cluster deployment',
            hsnSacCode: '998313',
            quantity: 2,
            unitPrice: 10000,
            discount: 0,
            taxRate: 18
          }
        ],
        shippingCharges: 500,
        notes: 'Inter-state supply'
      });

    assert(interInvoiceRes.status === 201, 'POST /api/finance/invoices (Inter-state) returns 201 Created');
    const interInv = interInvoiceRes.body.data;
    assert(interInv.isInterState === true, 'Inter-state detected: isInterState is true');
    assert(interInv.taxableAmount === 20000, 'Taxable amount is 20,000 (2 x 10,000)');
    assert(interInv.cgstTotal === 0, 'Inter-state CGST is 0');
    assert(interInv.sgstTotal === 0, 'Inter-state SGST is 0');
    assert(interInv.igstTotal === 3600, 'Inter-state IGST 100% applied: igstTotal is 3600 (18% of 20000)');
    assert(interInv.grandTotal === 24100, 'Grand total accurately calculated: 20000 + 3600 + 500 = 24,100');

    // 67. Immutable Financial Snapshot
    console.log('\n--- 67. Immutable Financial Snapshot Verification ---');
    assert(
      interInv.customerSnapshot?.name === 'Bangalore Cloud Systems LLP',
      'Invoice preserves customer snapshot name'
    );
    assert(
      interInv.customerSnapshot?.gstin === '29AABCB8888K1Z2',
      'Invoice preserves customer snapshot GSTIN'
    );
    assert(
      interInv.customerSnapshot?.address?.state === 'Karnataka',
      'Invoice preserves customer destination state'
    );
    assert(
      typeof interInv.businessSnapshot?.name === 'string',
      'Invoice preserves business snapshot legal identity'
    );

    // 68. Unique Per-Business Invoice Number Sequencing
    console.log('\n--- 68. Invoice Number Sequencing ---');
    assert(
      typeof intraInv.invoiceNumber === 'string' && intraInv.invoiceNumber.startsWith('INV-'),
      `Intra invoice assigned formal sequential number: ${intraInv.invoiceNumber}`
    );
    assert(
      intraInv.invoiceNumber !== interInv.invoiceNumber,
      `Invoices receive distinct serial numbers (${intraInv.invoiceNumber} vs ${interInv.invoiceNumber})`
    );

    // 69. Partial & Full Payment Reconciliation
    console.log('\n--- 69. Payment Reconciliation (Partial & Full) ---');
    // Overpayment prevention safeguard
    const overpayRes = await request(app)
      .post('/api/finance/payments')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        invoiceId: intraInvoiceId,
        customerId: intraCustId,
        amount: 25000, // Balance due is 11,800
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'UTR-OVERPAY-ERR'
      });
    assert(overpayRes.status === 400, 'Overpayment beyond balance due is rejected (Safeguard enforced)');

    // Step 1: Partial Payment of ₹5,000
    const partialPayRes = await request(app)
      .post('/api/finance/payments')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        invoiceId: intraInvoiceId,
        customerId: intraCustId,
        amount: 5000,
        paymentMethod: 'UPI',
        referenceNumber: 'UPI-PARTIAL-2026-991',
        notes: 'First milestone tranche'
      });

    assert(partialPayRes.status === 201, 'POST /api/finance/payments (Partial) returns 201 Created');
    assert(partialPayRes.body.data?.amount === 5000, 'Payment recorded for 5,000');

    // Verify invoice status after partial payment
    const checkInvPartial = await request(app)
      .get(`/api/finance/invoices/${intraInvoiceId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(checkInvPartial.body.data?.amountPaid === 5000, 'Invoice amountPaid updated to 5,000');
    assert(checkInvPartial.body.data?.balanceDue === 6800, 'Invoice balanceDue reduced to 6,800 (11800 - 5000)');
    assert(checkInvPartial.body.data?.status === 'PARTIALLY_PAID', 'Invoice status transitioned to PARTIALLY_PAID');

    // Step 2: Full Settlement of remaining ₹6,800
    const fullPayRes = await request(app)
      .post('/api/finance/payments')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        invoiceId: intraInvoiceId,
        customerId: intraCustId,
        amount: 6800,
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'NEFT-FINAL-SETTLE-882',
        notes: 'Final settlement payment'
      });

    assert(fullPayRes.status === 201, 'POST /api/finance/payments (Settlement) returns 201 Created');

    // Verify invoice status after full payment
    const checkInvFull = await request(app)
      .get(`/api/finance/invoices/${intraInvoiceId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(checkInvFull.body.data?.amountPaid === 11800, 'Invoice amountPaid equals full total 11,800');
    assert(checkInvFull.body.data?.balanceDue === 0, 'Invoice balanceDue is exactly 0.00');
    assert(checkInvFull.body.data?.status === 'PAID', 'Invoice status transitioned to PAID');

    // 70. Refund Processing & Audit Balance Adjustment
    console.log('\n--- 70. Refund Processing & Audit Ledger Entry ---');
    const refundRes = await request(app)
      .post('/api/finance/refunds')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        invoiceId: intraInvoiceId,
        customerId: intraCustId,
        amount: 1800,
        reason: 'Service SLA credit refund for scheduled maintenance downtime',
        refundMethod: 'BANK_TRANSFER',
        referenceNumber: 'REF-SLA-CREDIT-001'
      });

    assert(refundRes.status === 201, 'POST /api/finance/refunds returns 201 Created');
    assert(refundRes.body.data?.amount === 1800, 'Refund of 1,800 issued');

    // Verify invoice balance due restored by refund amount
    const checkInvPostRefund = await request(app)
      .get(`/api/finance/invoices/${intraInvoiceId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(
      checkInvPostRefund.body.data?.amountPaid === 10000,
      'Invoice amountPaid accurately reduced by refund (11800 - 1800 = 10000)'
    );
    assert(
      checkInvPostRefund.body.data?.balanceDue === 1800,
      'Invoice balanceDue updated to 1,800 post-refund'
    );
    assert(
      checkInvPostRefund.body.data?.status === 'PARTIALLY_PAID',
      'Invoice status reverted to PARTIALLY_PAID'
    );

    // 71. Profit & Loss Report (Zero Double-Counting)
    console.log('\n--- 71. Profit & Loss Report (Zero Double Counting) ---');
    const pnlRes = await request(app)
      .get('/api/finance/reports/profit-loss')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(pnlRes.status === 200, 'GET /api/finance/reports/profit-loss returns 200 OK');
    const pnl = pnlRes.body.data;
    assert(typeof pnl.operatingRevenue?.grossRevenue === 'number', 'Gross revenue is calculated');
    assert(typeof pnl.costOfGoodsAndExpenses?.totalExpenses === 'number', 'Total expenses calculated');
    assert(
      pnl.netProfit === pnl.operatingRevenue.grossRevenue - pnl.costOfGoodsAndExpenses.totalExpenses,
      'Net Profit strictly matches Revenue - Expenses'
    );

    // 72. Indian GST Compliance Report
    console.log('\n--- 72. Indian GST Compliance Report (Intra vs Inter Turnover & HSN) ---');
    const gstRes = await request(app)
      .get('/api/finance/reports/gst')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(gstRes.status === 200, 'GET /api/finance/reports/gst returns 200 OK');
    const gst = gstRes.body.data;
    assert(gst.intraStateTurnover >= 10000, 'GST intraStateTurnover accurately aggregated (>= 10000)');
    assert(gst.interStateTurnover >= 20000, 'GST interStateTurnover accurately aggregated (>= 20000)');
    assert(gst.taxSummary?.cgstTotal >= 900, 'CGST total matches intra-state taxes (>= 900)');
    assert(gst.taxSummary?.sgstTotal >= 900, 'SGST total matches intra-state taxes (>= 900)');
    assert(gst.taxSummary?.igstTotal >= 3600, 'IGST total matches inter-state taxes (>= 3600)');
    assert(Array.isArray(gst.hsnSummary), 'HSN Summary provides array of item tax codes');

    // 73. Unified Double-Entry Financial Transactions Ledger
    console.log('\n--- 73. Unified Audit Ledger (Debit & Credit Tracking) ---');
    const txnRes = await request(app)
      .get('/api/finance/transactions')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(txnRes.status === 200, 'GET /api/finance/transactions returns 200 OK');
    assert(txnRes.body.data?.transactions?.length >= 3, 'Audit ledger records all credit & debit movements');

    // 74. Finance Dashboard Statistics
    console.log('\n--- 74. Finance Dashboard Statistics Verification ---');
    const finStatsRes = await request(app)
      .get('/api/finance/stats')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(finStatsRes.status === 200, 'GET /api/finance/stats returns 200 OK');
    const fStats = finStatsRes.body.data;
    assert(typeof fStats.totalRevenue === 'number', 'Finance Stat 1: totalRevenue is numeric');
    assert(typeof fStats.totalExpenses === 'number', 'Finance Stat 2: totalExpenses is numeric');
    assert(typeof fStats.netProfit === 'number', 'Finance Stat 3: netProfit is numeric');
    assert(typeof fStats.receivedPaymentsAmount === 'number', 'Finance Stat 4: receivedPaymentsAmount is numeric');
    assert(typeof fStats.outstandingInvoicesAmount === 'number', 'Finance Stat 5: outstandingInvoicesAmount is numeric');
    assert(typeof fStats.totalInvoicesCount === 'number', 'Finance Stat 6: totalInvoicesCount is numeric');
    assert(Array.isArray(fStats.monthlyRevenueSeries), 'Finance Stat 7: monthlyRevenueSeries provides chart data');

    // ============================================================================
    // PART 9: PROJECT MANAGEMENT, TASKS, KANBAN, COLLABORATION & CALENDAR TESTS
    // ============================================================================

    // 75. Project Management: Project Creation
    console.log('\n--- 75. Project Creation with Manager & Budget (Part 9) ---');
    const newProjectPayload = {
      name: 'Enterprise Cloud ERP Platform Migration',
      description: 'Full stack microservices transformation with multi-tenant architecture and real-time sockets',
      projectManagerId: ownerRes.body.data.user?.id || ownerRes.body.data.user?._id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      budget: 750000,
      priority: 'HIGH',
      status: 'ACTIVE',
      client: 'Apex Global Enterprises',
      tags: ['cloud', 'erp', 'microservices']
    };

    const createProjRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(newProjectPayload);

    assert(createProjRes.status === 201, 'POST /api/projects returns 201 Created');
    const createdProject = createProjRes.body.data;
    assert(Boolean(createdProject.id || createdProject._id), 'Project ID generated');
    assert(Boolean(createdProject.projectCode), 'Project code auto-generated (PRJ-YYYY-XXXX)');
    assert(createdProject.budget === 750000, 'Project budget matches 750000');
    assert(createdProject.progress === 0, 'Initial project progress is 0%');
    assert(Array.isArray(createdProject.history) && createdProject.history.length >= 1, 'Project audit history created');
    const projectId = createdProject.id || createdProject._id;

    // 76. Project Listing & Detail Retrieval
    console.log('\n--- 76. Project Listing & Retrieval by ID ---');
    const listProjRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(listProjRes.status === 200, 'GET /api/projects returns 200 OK');
    const projList = listProjRes.body.data?.projects || listProjRes.body.data;
    assert(Array.isArray(projList) && projList.length >= 1, 'Projects list contains created project');

    const getProjRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(getProjRes.status === 200, 'GET /api/projects/:id returns 200 OK');
    assert(getProjRes.body.data.name === newProjectPayload.name, 'Retrieved project name matches');

    // 77. Task Management: Create Task
    console.log('\n--- 77. Task Creation with Priority, Deadline & Assignment ---');
    const employeeUserId = employeeRes.body.data.user?.id || employeeRes.body.data.user?._id;
    const taskPayload = {
      projectId,
      title: 'Setup Kubernetes Cluster & CI/CD Pipeline',
      description: 'Provision EKS cluster, configure GitHub Actions workflow, and establish ingress controllers',
      priority: 'HIGH',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      assignedToId: employeeUserId,
      estimatedHours: 40
    };

    const createTaskRes = await request(app)
      .post('/api/projects/tasks')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(taskPayload);

    assert(createTaskRes.status === 201, 'POST /api/projects/tasks returns 201 Created');
    const createdTask = createTaskRes.body.data;
    assert(Boolean(createdTask.id || createdTask._id), 'Task ID generated');
    assert(Boolean(createdTask.taskNumber), 'Task number auto-generated (TSK-YYYY-XXXX)');
    assert(createdTask.status === 'TODO', 'Task initial status is TODO');
    assert(createdTask.estimatedHours === 40, 'Task estimated hours recorded');
    const taskId = createdTask.id || createdTask._id;

    // 78. Notification Dispatch on Task Assignment
    console.log('\n--- 78. Real-Time Notification Triggered on Task Assignment ---');
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(notifRes.status === 200, 'GET /api/notifications returns 200 OK for employee');
    const notifs = notifRes.body.data?.notifications || notifRes.body.data || [];
    const assignmentNotif = notifs.find(
      (n: any) => n.type === 'TASK_ASSIGNMENT' || (n.title && n.title.includes('Task Assigned'))
    );
    assert(Boolean(assignmentNotif), 'TASK_ASSIGNMENT notification was successfully dispatched & recorded for employee');

    // 79. Kanban Board Retrieval
    console.log('\n--- 79. Interactive Kanban Board Data Retrieval ---');
    const kanbanRes = await request(app)
      .get(`/api/projects/${projectId}/kanban`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(kanbanRes.status === 200, 'GET /api/projects/:id/kanban returns 200 OK');
    const kb = kanbanRes.body.data;
    assert(Boolean(kb.columns), 'Kanban columns object returned');
    assert(Array.isArray(kb.columns.TODO), 'Kanban TODO column is array');
    assert(Array.isArray(kb.columns.IN_PROGRESS), 'Kanban IN_PROGRESS column is array');
    assert(Array.isArray(kb.columns.REVIEW), 'Kanban REVIEW column is array');
    assert(Array.isArray(kb.columns.COMPLETED), 'Kanban COMPLETED column is array');
    assert(Array.isArray(kb.columns.BLOCKED), 'Kanban BLOCKED column is array');
    assert(kb.columns.TODO.some((t: any) => (t.id || t._id) === taskId), 'Created task is present in TODO column');

    // 80. Kanban Status Transitions & Audit History
    console.log('\n--- 80. Real-time Status Transitions on Kanban (TODO -> IN_PROGRESS -> REVIEW -> COMPLETED) ---');
    // Move to IN_PROGRESS
    const moveInProgressRes = await request(app)
      .patch(`/api/projects/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ status: 'IN_PROGRESS', notes: 'Sprint task commenced', loggedHours: 10 });

    assert(moveInProgressRes.status === 200, 'PATCH status to IN_PROGRESS returns 200 OK');
    assert(moveInProgressRes.body.data.status === 'IN_PROGRESS', 'Task status is now IN_PROGRESS');

    // Move to REVIEW
    const moveReviewRes = await request(app)
      .patch(`/api/projects/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ status: 'REVIEW', notes: 'All integration tests passed. Requesting PR review.' });

    assert(moveReviewRes.status === 200, 'PATCH status to REVIEW returns 200 OK');
    assert(moveReviewRes.body.data.status === 'REVIEW', 'Task status is now REVIEW');

    // Move to COMPLETED
    const moveCompletedRes = await request(app)
      .patch(`/api/projects/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ status: 'COMPLETED', notes: 'Approved and merged to main' });

    assert(moveCompletedRes.status === 200, 'PATCH status to COMPLETED returns 200 OK');
    assert(moveCompletedRes.body.data.status === 'COMPLETED', 'Task status is now COMPLETED');
    assert(moveCompletedRes.body.data.history?.length >= 3, 'Audit history logs every status transition');

    // 81. Parent Project Progress Auto-Recalculation
    console.log('\n--- 81. Project Progress Auto-Recalculation Upon Task Completion ---');
    const updatedProjRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(updatedProjRes.status === 200, 'GET /api/projects/:id returns 200 OK');
    assert(
      updatedProjRes.body.data.progress === 100,
      'Parent project progress automatically recalculated to 100% (1/1 tasks completed)'
    );

    // 82. Team Collaboration: Task Comments & Mentions
    console.log('\n--- 82. Task Collaboration & @Mentions ---');
    const commentPayload = {
      content: 'Excellent execution on the cluster deployment! @elena @julian ready for load testing.',
      mentions: ['elena', 'julian']
    };

    const addCommentRes = await request(app)
      .post(`/api/projects/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(commentPayload);

    assert(addCommentRes.status === 201, 'POST /api/projects/tasks/:id/comments returns 201 Created');
    assert(addCommentRes.body.data.content === commentPayload.content, 'Comment content saved accurately');
    assert(
      Array.isArray(addCommentRes.body.data.mentions) && addCommentRes.body.data.mentions.includes('elena'),
      'Mentions array saved accurately'
    );

    const listCommentsRes = await request(app)
      .get(`/api/projects/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(listCommentsRes.status === 200, 'GET /api/projects/tasks/:id/comments returns 200 OK');
    assert(listCommentsRes.body.data.length >= 1, 'Comments list returns new discussion comment');

    // 83. Project Milestones & Gantt Timeline Feed
    console.log('\n--- 83. Project Milestones & Timeline Aggregation ---');
    const milestonePayload = {
      projectId,
      title: 'Infrastructure & CI/CD Pipeline Sign-off',
      description: 'Formal sign-off of Kubernetes architecture and automated deployment pipelines',
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      status: 'PENDING',
      order: 1
    };

    const createMilestoneRes = await request(app)
      .post('/api/projects/milestones')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(milestonePayload);

    assert(createMilestoneRes.status === 201, 'POST /api/projects/milestones returns 201 Created');
    const milestoneId = createMilestoneRes.body.data.id || createMilestoneRes.body.data._id;

    // Update milestone to ACHIEVED
    const updateMilestoneRes = await request(app)
      .put(`/api/projects/milestones/${milestoneId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ status: 'ACHIEVED' });

    assert(updateMilestoneRes.status === 200, 'PUT /api/projects/milestones/:id returns 200 OK');
    assert(updateMilestoneRes.body.data.status === 'ACHIEVED', 'Milestone status is now ACHIEVED');

    // Timeline view
    const projectTimelineRes = await request(app)
      .get(`/api/projects/${projectId}/timeline`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(projectTimelineRes.status === 200, 'GET /api/projects/:id/timeline returns 200 OK');
    assert(Array.isArray(projectTimelineRes.body.data.milestones), 'Timeline contains milestones list');
    assert(Array.isArray(projectTimelineRes.body.data.tasks), 'Timeline contains tasks list');
    assert(projectTimelineRes.body.data.progress === 100, 'Timeline progress reflects 100%');

    // 84. Document Management & 10MB Strict Limit Policy
    console.log('\n--- 84. Document Vault & Strict 10MB Size Limit Enforcement ---');
    // Valid Document (2MB <= 10MB)
    const validDocPayload = {
      projectId,
      taskId,
      title: 'Cloud Architecture & Security Blueprint',
      fileName: 'Architecture_Blueprint_v1.pdf',
      fileUrl: 'https://cdn.biznexus.com/docs/Architecture_Blueprint_v1.pdf',
      fileType: 'application/pdf',
      fileSize: 2097152, // 2MB
      category: 'SPECIFICATION',
      isPublic: true
    };

    const validDocRes = await request(app)
      .post('/api/projects/documents')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(validDocPayload);

    assert(validDocRes.status === 201, 'POST /api/projects/documents (2MB <= 10MB) returns 201 Created');
    const documentId = validDocRes.body.data.id || validDocRes.body.data._id;
    assert(Boolean(documentId), 'Document ID generated');
    assert(validDocRes.body.data.category === 'SPECIFICATION', 'Document category saved accurately');

    // Oversized Document (> 10MB rejected)
    const oversizedDocPayload = {
      projectId,
      title: 'Huge Raw Database Dump',
      fileName: 'database_dump.sql.gz',
      fileUrl: 'https://cdn.biznexus.com/docs/database_dump.sql.gz',
      fileType: 'application/gzip',
      fileSize: 15728640, // 15MB (> 10MB limit)
      category: 'OTHER'
    };

    const oversizedDocRes = await request(app)
      .post('/api/projects/documents')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(oversizedDocPayload);

    assert(
      oversizedDocRes.status === 400,
      'POST /api/projects/documents with file > 10MB is rejected with 400 Bad Request'
    );

    // List documents
    const listDocsRes = await request(app)
      .get('/api/projects/documents')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(listDocsRes.status === 200, 'GET /api/projects/documents returns 200 OK');
    const docList = listDocsRes.body.data?.documents || listDocsRes.body.data;
    assert(Array.isArray(docList) && docList.length >= 1, 'Documents list returns uploaded valid document');

    // 85. Centralized Calendar & Business Events
    console.log('\n--- 85. Centralized Calendar & Business Events Aggregation ---');
    const eventPayload = {
      title: 'Executive Cloud Architecture Review',
      description: 'Quarterly review with CTO and enterprise stakeholders',
      eventType: 'MEETING',
      startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 5 * 86400000 + 3600000).toISOString(),
      location: 'Executive Boardroom & Google Meet',
      projectId,
      color: '#3B82F6'
    };

    const createEventRes = await request(app)
      .post('/api/projects/calendar/events')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(eventPayload);

    assert(createEventRes.status === 201, 'POST /api/projects/calendar/events returns 201 Created');
    assert(createEventRes.body.data.title === eventPayload.title, 'Event title saved');

    // Aggregated calendar feed
    const calendarFeedRes = await request(app)
      .get('/api/projects/calendar/feed')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(calendarFeedRes.status === 200, 'GET /api/projects/calendar/feed returns 200 OK');
    const calendarItems = calendarFeedRes.body.data;
    assert(Array.isArray(calendarItems), 'Aggregated calendar feed returns array of schedule items');
    assert(
      calendarItems.some((ci: any) => ci.type === 'EVENT' || ci.title === eventPayload.title),
      'Calendar feed contains the scheduled business meeting'
    );
    assert(
      calendarItems.some((ci: any) => ci.type === 'PROJECT_DEADLINE' || ci.type === 'TASK_DEADLINE' || ci.type === 'MILESTONE'),
      'Calendar feed contains unified deadlines and milestones'
    );

    // 86. Project Safeguard Check & Cleanup
    console.log('\n--- 86. Project Safeguards & Role Access Enforcement ---');
    // Employee cannot delete project
    const empDeleteProjRes = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(
      empDeleteProjRes.status === 403,
      'EMPLOYEE deleting project is blocked (403 Forbidden - only Business Owner / Super Admin)'
    );

    // Delete completed task
    const delTaskRes = await request(app)
      .delete(`/api/projects/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(delTaskRes.status === 200, 'DELETE /api/projects/tasks/:id returns 200 OK');

    // Delete project
    const delProjRes = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(delProjRes.status === 200, 'DELETE /api/projects/:id returns 200 OK when safe to delete');

    // =========================================================================
    // PART 10: AI BUSINESS ASSISTANT, PREDICTIVE INSIGHTS, ADVANCED ANALYTICS,
    // REPORTS, SUBSCRIPTION WEBHOOKS, AUDIT & MULTI-TENANT ISOLATION
    // =========================================================================

    // 87. AI Business Assistant Natural Language Querying Grounded in DB
    console.log('\n--- 87. AI Business Assistant Natural Language Querying Grounded in MongoDB ---');
    // 87.1 Query monthly revenue
    const aiRevRes = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ question: 'What was my revenue this month?' });

    assert(aiRevRes.status === 200, 'POST /api/ai/query (revenue) returns 200 OK');
    assert(aiRevRes.body.data.category === 'REVENUE', 'AI query correctly categorized as REVENUE');
    assert(typeof aiRevRes.body.data.answer === 'string' && aiRevRes.body.data.answer.length > 0, 'AI generated grounded revenue answer');
    assert(aiRevRes.body.data.confidence >= 0.8, 'AI response confidence is >= 0.8');

    // 87.2 Query low stock products
    const aiStockRes = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ question: 'Which products are low in stock?' });

    assert(aiStockRes.status === 200, 'POST /api/ai/query (inventory) returns 200 OK');
    assert(aiStockRes.body.data.category === 'INVENTORY', 'AI query categorized as INVENTORY');
    assert(Boolean(aiStockRes.body.data.answer), 'AI generated stock inventory response');

    // 87.3 Query total expenses
    const aiExpRes = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ question: 'What are my total expenses?' });

    assert(aiExpRes.status === 200, 'POST /api/ai/query (expenses) returns 200 OK');
    assert(aiExpRes.body.data.category === 'EXPENSE', 'AI query categorized as EXPENSE');

    // 87.4 Query overdue invoices
    const aiInvRes = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ question: 'Which invoices are overdue?' });

    assert(aiInvRes.status === 200, 'POST /api/ai/query (invoices) returns 200 OK');
    assert(aiInvRes.body.data.category === 'INVOICES', 'AI query categorized as INVOICES');

    // 87.5 Query top-selling products
    const aiSalesRes = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ question: 'Which products are selling the most?' });

    assert(aiSalesRes.status === 200, 'POST /api/ai/query (sales) returns 200 OK');
    assert(aiSalesRes.body.data.category === 'SALES', 'AI query categorized as SALES');

    // 87.6 Business improvement suggestions
    const aiSugRes = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ question: 'Give me 3 business improvement suggestions' });

    assert(aiSugRes.status === 200, 'POST /api/ai/query (suggestions) returns 200 OK');
    assert(Array.isArray(aiSugRes.body.data.suggestions), 'Suggestions returned as array');

    // 88. AI Business Insights & Predictive Revenue Forecasting
    console.log('\n--- 88. AI Predictive Insights & Linear Trend Forecasting ---');
    const insightsRes = await request(app)
      .get('/api/ai/insights')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(insightsRes.status === 200, 'GET /api/ai/insights returns 200 OK');
    const insights = insightsRes.body.data;
    assert(Boolean(insights.salesTrend), 'Sales trend metrics present');
    assert(Boolean(insights.expenseTrend), 'Expense trend metrics present');
    assert(Boolean(insights.revenueForecasting), 'Revenue forecasting model present');
    assert(Array.isArray(insights.revenueForecasting.projections), 'Forecast projections array present');
    assert(
      insights.revenueForecasting.disclaimer.includes('Forecast figures are mathematical estimates'),
      'Forecast explicitly includes predictive disclaimer'
    );
    assert(Array.isArray(insights.recommendations) && insights.recommendations.length > 0, 'Actionable recommendations generated');

    // 89. Advanced Centralized Analytics Telemetry & CSV Export
    console.log('\n--- 89. Advanced Multi-Timeframe Analytics & CSV Export ---');
    const analytics30Res = await request(app)
      .get('/api/analytics?timeframe=last_30_days')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(analytics30Res.status === 200, 'GET /api/analytics?timeframe=last_30_days returns 200 OK');
    const analytics = analytics30Res.body.data;
    assert(typeof analytics.profitLoss.grossRevenue === 'number', 'Analytics grossRevenue is numeric');
    assert(typeof analytics.profitLoss.totalExpenses === 'number', 'Analytics totalExpenses is numeric');
    assert(typeof analytics.profitLoss.netProfit === 'number', 'Analytics netProfit is numeric');
    assert(Array.isArray(analytics.revenueTrends), 'Revenue trend chart dataset returned');
    assert(Boolean(analytics.salesPerformance), 'Sales performance telemetry returned');

    // CSV Export
    const csvExportRes = await request(app)
      .get('/api/analytics/export?timeframe=last_30_days')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(csvExportRes.status === 200, 'GET /api/analytics/export returns 200 OK');
    assert(csvExportRes.headers['content-type'].includes('text/csv'), 'Analytics export content-type is text/csv');
    assert(csvExportRes.text.includes('Gross Revenue'), 'Analytics CSV contains financial telemetry');

    // 90. Business Report Generator & Period Reports
    console.log('\n--- 90. Structured Period Report Generation & Export ---');
    const reportRes = await request(app)
      .post('/api/reports/generate')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ reportType: 'MONTHLY' });

    assert(reportRes.status === 200, 'POST /api/reports/generate returns 200 OK');
    const report = reportRes.body.data;
    assert(report.reportType === 'MONTHLY', 'Report reportType is MONTHLY');
    assert(Boolean(report.executiveSummary), 'Executive summary generated');
    assert(Boolean(report.kpis), 'KPIs aggregated in report');
    assert(Array.isArray(report.criticalRisks), 'Identified risks list returned');
    assert(Array.isArray(report.strategicOpportunities), 'Identified opportunities list returned');

    // Download Report CSV
    const reportCsvRes = await request(app)
      .get('/api/reports/download?type=MONTHLY')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(reportCsvRes.status === 200, 'GET /api/reports/download returns 200 OK');
    assert(reportCsvRes.headers['content-type'].includes('text/csv'), 'Report download is text/csv');

    // 91. Subscription Plans, Current Billing Status & Upgrades
    console.log('\n--- 91. Subscription Lifecycle & Resource Quota Metering ---');
    // Available plans
    const billingPlansRes = await request(app)
      .get('/api/billing/plans')
      .set('Authorization', `Bearer ${ownerToken}`);

    assert(billingPlansRes.status === 200, 'GET /api/billing/plans returns 200 OK');
    const plansList = billingPlansRes.body.data;
    assert(Array.isArray(plansList) && plansList.length >= 4, 'At least 4 subscription tiers available (FREE, STARTER, PROFESSIONAL, ENTERPRISE)');

    // Current billing status
    const currentBillingRes = await request(app)
      .get('/api/billing/current')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(currentBillingRes.status === 200, 'GET /api/billing/current returns 200 OK');
    assert(Boolean(currentBillingRes.body.data.subscription.plan), 'Current subscription plan active');
    assert(Boolean(currentBillingRes.body.data.usage), 'Resource meters for employees and storage returned');

    // Change plan (Upgrade to ENTERPRISE)
    const upgradeRes = await request(app)
      .post('/api/billing/change-plan')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ planCode: 'ENTERPRISE', billingCycle: 'monthly' });

    assert(upgradeRes.status === 200, 'POST /api/billing/change-plan returns 200 OK');
    assert(upgradeRes.body.data.plan === 'ENTERPRISE', 'Subscription upgraded to ENTERPRISE');

    // Billing payment history
    const paymentsRes = await request(app)
      .get('/api/billing/payments')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(paymentsRes.status === 200, 'GET /api/billing/payments returns 200 OK');
    assert(Array.isArray(paymentsRes.body.data), 'Payments ledger returned as array');

    // 92. Cryptographically Verified Payment Gateway Webhook (HMAC-SHA256)
    console.log('\n--- 92. Verified Payment Gateway Webhook Execution ---');
    const testPaymentId = `pay_${Date.now()}`;
    const webhookPayload = {
      event: 'payment.success',
      paymentId: testPaymentId,
      businessId: ownerBusinessId,
      planCode: 'ENTERPRISE',
      amount: 199,
      currency: 'USD',
      status: 'PAID',
      signature: 'valid_test_signature',
      timestamp: Date.now()
    };

    const webhookRes = await request(app)
      .post('/api/billing/webhook')
      .set('x-webhook-signature', 'valid_test_signature')
      .send(webhookPayload);

    assert(webhookRes.status === 200, 'POST /api/billing/webhook returns 200 OK for authentic signature');
    assert(webhookRes.body.data.verified === true, 'Webhook marked as verified and subscription applied');

    // 93. Payment Webhook Security: Invalid Signature Rejection
    console.log('\n--- 93. Payment Webhook Security: Tampered Signature Rejection ---');
    const tamperedPayload = {
      event: 'payment.success',
      paymentId: `pay_tampered_${Date.now()}`,
      businessId: ownerBusinessId,
      planCode: 'ENTERPRISE',
      amount: 9999,
      currency: 'USD',
      status: 'PAID',
      signature: 'tampered_forged_signature_xyz'
    };

    const tamperedRes = await request(app)
      .post('/api/billing/webhook')
      .set('x-webhook-signature', 'tampered_forged_signature_xyz')
      .send(tamperedPayload);

    assert(tamperedRes.status === 400, 'POST /api/billing/webhook with forged signature rejected (400 Bad Request)');

    // 94. Global Notification System Lifecycle
    console.log('\n--- 94. Global In-App Notification System & Read State ---');
    const getNotifsRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(getNotifsRes.status === 200, 'GET /api/notifications returns 200 OK');

    const markAllRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(markAllRes.status === 200, 'PATCH /api/notifications/read-all returns 200 OK');

    // 95. Business Operational Settings & Tenant Configuration
    console.log('\n--- 95. Business Operational Settings Persistence ---');
    const settingsPayload = {
      currency: 'USD',
      timezone: 'Asia/Kolkata',
      dateFormat: 'YYYY-MM-DD',
      invoiceSettings: {
        prefix: 'INV-2026-',
        nextNumber: 1500,
        paymentTermsDays: 45,
        defaultNotes: 'Terms: Net 45 Days.'
      },
      notificationPreferences: {
        emailOnOrder: true,
        emailOnPayment: true,
        lowStockAlerts: true,
        weeklyDigest: true
      }
    };

    const updateSettingsPt10Res = await request(app)
      .put(`/api/business/${ownerBusinessId}/settings`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(settingsPayload);

    assert(updateSettingsPt10Res.status === 200, 'PUT /api/business/:id/settings returns 200 OK');
    assert(updateSettingsPt10Res.body.data.currency === 'USD', 'Business currency updated to USD');

    // 96. Enterprise Audit Log Trail & Filtering
    console.log('\n--- 96. Enterprise Audit Log Trail & Tenant Activity Records ---');
    const tenantAuditRes = await request(app)
      .get(`/api/business/${ownerBusinessId}/audit-logs?limit=10`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(tenantAuditRes.status === 200, 'GET /api/business/:id/audit-logs returns 200 OK');
    assert(Array.isArray(tenantAuditRes.body.data.items), 'Audit log items returned as array');
    assert(Boolean(tenantAuditRes.body.data.pagination), 'Audit log pagination metadata present');

    // 97. Strict Multi-Tenant Security & Tenant Isolation Enforcement
    console.log('\n--- 97. Strict Multi-Tenant Data Isolation Enforcement ---');
    // Another non-associated business ID
    const unauthorizedBizId = '507f1f77bcf86cd799439011';
    const tenantIsolationRes = await request(app)
      .get(`/api/business/${unauthorizedBizId}/dashboard/stats`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('x-business-id', unauthorizedBizId);

    assert(
      tenantIsolationRes.status === 403,
      'Attempt to access another tenant business stats is blocked with 403 Forbidden'
    );

    // 98. Enterprise Multi-Branch Management
    console.log('\n--- 98. Enterprise Multi-Branch Management ---');

    // 98.1 Create Headquarters Main Branch
    const hqBranchPayload = {
      code: `HQ-${Date.now().toString().slice(-4)}`,
      name: 'Global Flagship Headquarters',
      type: 'HEADQUARTERS',
      isMainBranch: true,
      address: {
        street: '100 Silicon Boulevard',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India'
      },
      contactPhone: '+91 80 4000 1111',
      contactEmail: 'hq@enterprise.biznexus.io',
      taxNumber: '29ABCDE1234F1Z5',
      currency: 'USD',
      status: 'ACTIVE'
    };

    const createHqRes = await request(app)
      .post('/api/branches')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(hqBranchPayload);

    assert(createHqRes.status === 201, 'POST /api/branches (Headquarters) returns 201 Created');
    assert(createHqRes.body.data?.code === hqBranchPayload.code, 'HQ Branch code matches');
    assert(createHqRes.body.data?.isMainBranch === true, 'HQ marked as isMainBranch: true');
    const hqBranchId = createHqRes.body.data?._id;

    // 98.2 Create Secondary Retail Outlet Branch
    const retailBranchPayload = {
      code: `RET-${Date.now().toString().slice(-4)}`,
      name: 'Metro Cyber Hub Retail Store',
      type: 'RETAIL_STORE',
      isMainBranch: false,
      address: {
        street: 'Shop 42 Cyber City',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
        country: 'India'
      },
      contactPhone: '+91 124 5000 2222',
      contactEmail: 'retail.cyber@enterprise.biznexus.io',
      taxNumber: '06ABCDE1234F1Z5',
      currency: 'USD',
      status: 'ACTIVE'
    };

    const createRetailRes = await request(app)
      .post('/api/branches')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(retailBranchPayload);

    assert(createRetailRes.status === 201, 'POST /api/branches (Retail Outlet) returns 201 Created');
    assert(createRetailRes.body.data?.type === 'RETAIL_STORE', 'Retail branch type is RETAIL_STORE');
    assert(createRetailRes.body.data?.isMainBranch === false, 'Retail branch isMainBranch is false');
    const retailBranchId = createRetailRes.body.data?._id;

    // 98.3 Duplicate Branch Code Prevention
    const dupBranchRes = await request(app)
      .post('/api/branches')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(hqBranchPayload);

    assert(dupBranchRes.status === 400, 'Duplicate branch code creation fails with 400 Bad Request');

    // 98.4 List Branches with Filters & Search
    const listBranchesRes = await request(app)
      .get('/api/branches?type=RETAIL_STORE')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(listBranchesRes.status === 200, 'GET /api/branches?type=RETAIL_STORE returns 200 OK');
    assert(Array.isArray(listBranchesRes.body.data?.items), 'Branches returned as array items');
    assert(listBranchesRes.body.data.items.length >= 1, 'Filter by type returns matching branch');

    // 98.5 Get Single Branch by ID
    const getBranchRes = await request(app)
      .get(`/api/branches/${retailBranchId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(getBranchRes.status === 200, 'GET /api/branches/:id returns 200 OK');
    assert(getBranchRes.body.data?.name === retailBranchPayload.name, 'Branch name matches');

    // 98.6 Update Branch Metadata
    const updateBranchRes = await request(app)
      .put(`/api/branches/${retailBranchId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({ contactPhone: '+91 124 9999 8888', name: 'Metro Cyber Hub Experience Center' });

    assert(updateBranchRes.status === 200, 'PUT /api/branches/:id returns 200 OK');
    assert(updateBranchRes.body.data?.contactPhone === '+91 124 9999 8888', 'Branch contact phone updated');

    // 98.7 Branch Telemetry & Analytics
    const branchAnalyticsRes = await request(app)
      .get(`/api/branches/${hqBranchId}/analytics`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(branchAnalyticsRes.status === 200, 'GET /api/branches/:id/analytics returns 200 OK');
    assert(typeof branchAnalyticsRes.body.data?.totalEmployees === 'number', 'Branch telemetry reports totalEmployees');
    assert(typeof branchAnalyticsRes.body.data?.totalRevenue === 'number', 'Branch telemetry reports totalRevenue');

    // 98.8 Inter-Branch Inventory Stock Transfer
    const branchTransferRes = await request(app)
      .post('/api/branches/transfer-stock')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        fromBranchId: hqBranchId,
        toBranchId: retailBranchId,
        fromWarehouseId: primaryWarehouseId,
        toWarehouseId: secondaryWarehouseId,
        productId: part7ProductId,
        quantity: 2,
        notes: 'Express replenishment from HQ Depot to Retail Experience Center'
      });

    assert(branchTransferRes.status === 200, 'POST /api/branches/transfer-stock returns 200 OK');
    assert(branchTransferRes.body.data?.transferNumber?.startsWith('TRF-BR-'), 'Transfer record generated with prefix TRF-BR-');

    // 98.9 Safe Branch Deletion Safeguards (Cannot delete main branch)
    const deleteMainBranchRes = await request(app)
      .delete(`/api/branches/${hqBranchId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(deleteMainBranchRes.status === 400, 'Deleting main/headquarters branch is blocked with 400 Bad Request');

    // 98.10 Deleting unassigned retail branch succeeds
    const deleteRetailBranchRes = await request(app)
      .delete(`/api/branches/${retailBranchId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(deleteRetailBranchRes.status === 200, 'DELETE /api/branches/:id of eligible branch returns 200 OK');

    // 98.11 RBAC Enforcement: Employee role blocked from branch mutations
    const rbacBranchRes = await request(app)
      .post('/api/branches')
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('x-business-id', ownerBusinessId)
      .send(retailBranchPayload);

    assert(rbacBranchRes.status === 403, 'Employee role cannot create branches (403 Forbidden)');

    // 99. Enterprise Point of Sale (POS) System
    console.log('\n--- 99. Enterprise Point of Sale (POS) System ---');

    // 99.1 Open POS Register Session
    const openSessionRes = await request(app)
      .post('/api/pos/sessions/open')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        branchId: hqBranchId,
        registerName: 'Main Store Express Counter',
        openingBalance: 1500,
        notes: 'Morning shift opening float'
      });

    assert(openSessionRes.status === 201, 'POST /api/pos/sessions/open returns 201 Created');
    assert(openSessionRes.body.data?.status === 'OPEN', 'POS Session status is OPEN');
    assert(openSessionRes.body.data?.sessionCode?.startsWith('POS-'), 'Session code formatted as POS-xxxxxx');
    assert(openSessionRes.body.data?.expectedCashBalance === 1500, 'Initial expected cash balance matches opening float (1500)');
    const posSessionId = openSessionRes.body.data?._id;

    // 99.2 Get Active Session for Cashier
    const currentSessionRes = await request(app)
      .get('/api/pos/sessions/current')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(currentSessionRes.status === 200, 'GET /api/pos/sessions/current returns 200 OK');
    assert(currentSessionRes.body.data?._id === posSessionId, 'Current session ID matches active session');

    // 99.3 Quick Catalog Barcode & SKU Lookup
    const catalogSearchRes = await request(app)
      .get('/api/pos/catalog/search?q=')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(catalogSearchRes.status === 200, 'GET /api/pos/catalog/search returns 200 OK');
    assert(Array.isArray(catalogSearchRes.body.data), 'Catalog search returns array of products');

    // 99.4 Cart Hold & Resume
    const holdCartRes = await request(app)
      .post(`/api/pos/sessions/${posSessionId}/hold`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        holdRef: 'HOLD-CUST-01',
        customerName: 'Browsing Customer',
        items: [
          {
            productId: part7ProductId,
            productName: 'Digital Laser Level Pro 360',
            sku: 'SKU-LL-DEMO',
            unitPrice: 850,
            quantity: 1,
            taxRate: 18,
            subtotal: 850,
            total: 1003
          }
        ]
      });

    assert(holdCartRes.status === 200, 'POST /api/pos/sessions/:id/hold returns 200 OK');

    const getHeldRes = await request(app)
      .get(`/api/pos/sessions/${posSessionId}/held`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(getHeldRes.status === 200, 'GET /api/pos/sessions/:id/held returns 200 OK');
    assert(getHeldRes.body.data.length >= 1, 'Held carts list contains held order');

    const heldId = getHeldRes.body.data[0].id || getHeldRes.body.data[0].holdRef;
    const deleteHeldRes = await request(app)
      .delete(`/api/pos/sessions/${posSessionId}/held/${heldId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(deleteHeldRes.status === 200, 'DELETE /api/pos/sessions/:id/held/:holdId resumes/clears held cart');

    // 99.5 Cash Drawer Adjustment (Float In/Out)
    const cashAdjustRes = await request(app)
      .post(`/api/pos/sessions/${posSessionId}/adjust-cash`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        type: 'CASH_IN',
        amount: 500,
        reason: 'Added petty cash change bills to drawer'
      });

    assert(cashAdjustRes.status === 200, 'POST /api/pos/sessions/:id/adjust-cash returns 200 OK');
    assert(cashAdjustRes.body.data?.cashInAmount === 500, 'Cash in amount tracked in session');
    assert(cashAdjustRes.body.data?.expectedCashBalance === 2000, 'Expected drawer balance updated (1500 + 500 = 2000)');

    // 99.6 High-Speed Fast Tender Checkout with Instant Stock Depletion
    // Subtotal: 850, Tax 18%: 153, Discount: 50, Grand Total: 953
    const checkoutRes = await request(app)
      .post('/api/pos/checkout')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        sessionId: posSessionId,
        customerName: 'Alex Mercer (Walk-in)',
        customerPhone: '+91 98888 77777',
        items: [
          {
            productId: part7ProductId,
            productName: 'Digital Laser Level Pro 360',
            sku: 'SKU-LL-DEMO',
            unitPrice: 850,
            quantity: 1,
            discountAmount: 50,
            taxRate: 18,
            taxAmount: 153,
            subtotal: 850,
            total: 953
          }
        ],
        subtotal: 850,
        taxTotal: 153,
        discountTotal: 50,
        grandTotal: 953,
        paymentMethod: 'CASH',
        amountTendered: 1000,
        changeDue: 47
      });

    assert(checkoutRes.status === 201, 'POST /api/pos/checkout returns 201 Created');
    assert(Boolean(checkoutRes.body.data?.receiptNumber), 'Thermal receipt generated with receiptNumber');
    assert(checkoutRes.body.data?.changeDue === 47, 'Calculated change due is correct ($47 on $1000 tendered)');
    assert(checkoutRes.body.data?.grandTotal === 953, 'Receipt grand total is 953');

    // 99.7 POS Shift Z-Report Generation
    const zReportRes = await request(app)
      .get(`/api/pos/sessions/${posSessionId}/z-report`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(zReportRes.status === 200, 'GET /api/pos/sessions/:id/z-report returns 200 OK');
    assert(typeof zReportRes.body.data?.salesBreakdown?.grossSales === 'number', 'Z-Report contains grossSales');
    assert(typeof zReportRes.body.data?.cashReconciliation?.expectedInDrawer === 'number', 'Z-Report contains expectedInDrawer');

    // 99.8 Close POS Shift with Cash Reconciliation
    // Expected drawer cash: 1500 (float) + 500 (cash in) + 953 (cash sale) = 2953
    const closeSessionRes = await request(app)
      .post(`/api/pos/sessions/${posSessionId}/close`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        closingBalance: 2953,
        notes: 'Shift closed smoothly with perfect drawer balance'
      });

    assert(closeSessionRes.status === 200, 'POST /api/pos/sessions/:id/close returns 200 OK');
    assert(closeSessionRes.body.data?.status === 'CLOSED', 'POS session status transitions to CLOSED');
    assert(closeSessionRes.body.data?.cashDiscrepancy === 0, 'Zero cash discrepancy on exact balance');

    // 99.9 RBAC: Cross-tenant / unauthorized access to POS is blocked
    const rbacPosRes = await request(app)
      .post('/api/pos/sessions/open')
      .set('Authorization', `Bearer ${newOwnerToken}`)
      .set('x-business-id', unauthorizedBizId)
      .send({
        branchId: hqBranchId,
        registerName: 'Forbidden Counter',
        openingBalance: 1000
      });

    assert(rbacPosRes.status === 403, 'Cross-tenant / unauthorized access to POS is blocked with 403 Forbidden');

    // 100. Enterprise Advanced Customer Portal
    console.log('\n--- 100. Enterprise Advanced Customer Portal ---');

    // 100.1 Portal Dashboard Stats & Telemetry
    const portalStatsRes = await request(app)
      .get('/api/portal/stats')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(portalStatsRes.status === 200, 'GET /api/portal/stats returns 200 OK');
    assert(typeof portalStatsRes.body.data?.activeOrdersCount === 'number', 'Portal stats include activeOrdersCount');
    assert(typeof portalStatsRes.body.data?.outstandingInvoiceBalance === 'number', 'Portal stats include outstandingInvoiceBalance');
    assert(typeof portalStatsRes.body.data?.lifetimeSpend === 'number', 'Portal stats include lifetimeSpend');
    assert(typeof portalStatsRes.body.data?.openTicketsCount === 'number', 'Portal stats include openTicketsCount');

    // 100.2 Customer Orders History
    const portalOrdersRes = await request(app)
      .get('/api/portal/orders')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(portalOrdersRes.status === 200, 'GET /api/portal/orders returns 200 OK');
    assert(Array.isArray(portalOrdersRes.body.data), 'Portal orders returns an array');

    // 100.3 Customer Invoices & Statements
    const portalInvoicesRes = await request(app)
      .get('/api/portal/invoices')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(portalInvoicesRes.status === 200, 'GET /api/portal/invoices returns 200 OK');
    assert(Array.isArray(portalInvoicesRes.body.data), 'Portal invoices returns an array');

    // 100.4 Instant Online Invoice Payment Simulation
    const invoiceToPayId = intraInvoiceId;
    const payInvoiceRes = await request(app)
      .post(`/api/portal/invoices/${invoiceToPayId}/pay`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        paymentMethod: 'CREDIT_CARD',
        amount: 250
      });

    assert(payInvoiceRes.status === 200, 'POST /api/portal/invoices/:id/pay returns 200 OK');
    assert(payInvoiceRes.body.data?.receipt?.receiptNumber?.startsWith('RCPT-'), 'Payment returns valid receipt reference (RCPT-xxxxxx)');
    assert(payInvoiceRes.body.data?.receipt?.amountPaid === 250, 'Receipt correctly records the paid amount (250)');

    // 100.5 Create Enterprise Support Ticket
    const createTicketRes = await request(app)
      .post('/api/portal/tickets')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        title: 'Expedited Freight Delivery Inquiry for Q4 Milestone',
        description: 'Requesting tracking manifests and expedited dispatch for industrial units to Bangalore facility.',
        category: 'ORDER',
        priority: 'HIGH'
      });

    assert(createTicketRes.status === 201, 'POST /api/portal/tickets returns 201 Created');
    assert(createTicketRes.body.data?.ticketNumber?.startsWith('TICK-'), 'Ticket number auto-generated as TICK-xxxxxx');
    assert(createTicketRes.body.data?.status === 'OPEN', 'Initial ticket status defaults to OPEN');
    assert(createTicketRes.body.data?.priority === 'HIGH', 'Ticket priority accurately recorded');
    const portalTicketId = createTicketRes.body.data?._id;

    // 100.6 List Customer Support Tickets
    const listTicketsRes = await request(app)
      .get('/api/portal/tickets')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId);

    assert(listTicketsRes.status === 200, 'GET /api/portal/tickets returns 200 OK');
    assert(Array.isArray(listTicketsRes.body.data), 'List tickets returns an array');
    const createdTicketFound = listTicketsRes.body.data.some((t: any) => t._id === portalTicketId || t.ticketNumber === createTicketRes.body.data?.ticketNumber);
    assert(createdTicketFound, 'Created ticket is present in tickets list');

    // 100.7 Multi-Party Conversation Thread Reply
    const ticketReplyRes = await request(app)
      .post(`/api/portal/tickets/${portalTicketId}/reply`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        message: 'Docking bay access confirmed. Logistics team is cleared for gate delivery.'
      });

    assert(ticketReplyRes.status === 200, 'POST /api/portal/tickets/:id/reply returns 200 OK');
    assert(ticketReplyRes.body.data?.messages?.length >= 2, 'Ticket conversation thread contains customer reply');

    // 100.8 Customer Profile & Address Update
    const updateCustomerProfileRes = await request(app)
      .put('/api/portal/profile')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        name: 'Vanguard Aerospace Enterprise Client',
        phone: '+91 99000 88000',
        address: {
          street: '100 Innovation Skyway, Suite 400',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560100',
          country: 'India'
        }
      });

    assert(updateCustomerProfileRes.status === 200, 'PUT /api/portal/profile returns 200 OK');
    assert(updateCustomerProfileRes.body.data?.address?.city === 'Bengaluru', 'Client billing/delivery coordinates updated');

    // 100.9 Quote Decision Acceptance Simulation
    const quoteDecisionRes = await request(app)
      .post('/api/portal/quotes/QT-TEST-EXP-01/decision')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-business-id', ownerBusinessId)
      .send({
        decision: 'ACCEPT'
      });

    assert(quoteDecisionRes.status === 200, 'POST /api/portal/quotes/:id/decision returns 200 OK');
    assert(quoteDecisionRes.body.data?.status === 'ACCEPTED', 'Quotation status updated to ACCEPTED');

    // 100.10 RBAC & Multi-Tenant Isolation Enforcement
    const rbacPortalRes = await request(app)
      .post('/api/portal/tickets')
      .set('Authorization', `Bearer ${newOwnerToken}`)
      .set('x-business-id', unauthorizedBizId)
      .send({
        title: 'Unauthorized Infiltration Ticket',
        description: 'Should be rejected by tenant boundaries',
        category: 'SECURITY',
        priority: 'HIGH'
      });

    assert(rbacPortalRes.status === 403, 'Cross-tenant access to portal is strictly blocked with 403 Forbidden');

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution threw unexpected exception:', err);
    process.exit(1);
  }
}

runTests();

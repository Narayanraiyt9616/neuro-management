import { ReactNode, ComponentType } from 'react';

/**
 * Navigation Types
 */
export interface INavLink {
  label: string;
  path: string;
}

/**
 * Plan & Module Types
 */
export interface IPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  badge: string;
  highlight: boolean;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

export interface ISystemModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  color: string;
}

/**
 * Authentication & User Types
 */
export type UserRole =
  | 'SUPER_ADMIN'
  | 'BUSINESS_OWNER'
  | 'MANAGER'
  | 'EMPLOYEE'
  | 'CUSTOMER'
  | 'owner'
  | 'admin';

export interface IUserBusiness {
  id: string;
  name: string;
  slug: string;
  industry: string;
  currency: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string | null;
  status?: 'active' | 'inactive' | 'suspended';
  businessId?: string | null;
  business?: IUserBusiness | null;
  activeBusinessId?: string;
  initialBusinessName?: string;
}

export interface IRegistrationInput {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  businessName?: string;
  role?: UserRole;
  slug?: string;
  industry?: string;
  plan?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IUpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string | null;
}

export interface IChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}

export interface IAuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrCredentials: string | ILoginCredentials, password?: string) => Promise<{ success: boolean; user: IUser }>;
  register: (data: IRegistrationInput) => Promise<{ success: boolean; user: IUser }>;
  logout: () => void;
  updateProfile: (data: IUpdateProfileData) => Promise<IUser>;
  changePassword: (data: IChangePasswordData) => Promise<void>;
  quickDemoLogin: (role?: UserRole) => Promise<IUser>;
  getRoleDashboardPath: (role?: UserRole) => string;
}

/**
 * Business & Multi-Tenant Types
 */
export type BusinessStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'SUSPENDED';

export interface IBusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface IBusiness {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  industry: string;
  category?: string;
  plan: string;
  currency: string;
  role?: string;
  membersCount?: number;
  fiscalYearStart?: string;
  status?: BusinessStatus | string;
  businessEmail?: string;
  contactEmail?: string;
  phone?: string;
  address?: IBusinessAddress;
  registrationNumber?: string;
  gstin?: string;
  website?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  logo?: string | null;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  subscriptionId?: any;
  ownerId?: any;
}

export interface IBusinessRegistrationInput {
  name: string;
  logo?: string | null;
  businessEmail: string;
  phone: string;
  address?: IBusinessAddress;
  category: string;
  registrationNumber: string;
  gstin?: string;
  website?: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  password?: string;
  planCode?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
}

export interface ISubscriptionPlan {
  _id?: string;
  id?: string;
  name: string;
  code: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  employeeLimit: number;
  storageLimitGb: number;
  moduleAccess: string[];
  features: string[];
  isActive?: boolean;
}

export interface IPlatformStats {
  totalBusinesses: number;
  activeBusinesses: number;
  pendingBusinesses: number;
  suspendedBusinesses: number;
  totalUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  recordedPlatformRevenue: number;
  currency: string;
  lastUpdated: string;
}

export interface IPlatformSettings {
  platformName: string;
  logo: string | null;
  general: {
    supportEmail: string;
    contactPhone: string;
    defaultTimezone: string;
    maintenanceMode: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpFrom: string;
    secure: boolean;
  };
  security: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    lockDurationMinutes: number;
    requireMfa: boolean;
  };
  subscription: {
    freeTrialDays: number;
    defaultCurrency: string;
    taxPercentage: number;
    invoicePrefix: string;
  };
}

export interface IAdminUserItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  businessId?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
}

export interface IAuditLogItem {
  id?: string;
  _id: string;
  action: string;
  description: string;
  module: string;
  businessId?: {
    _id: string;
    name: string;
    slug: string;
  } | string | null;
  userId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | string | null;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  timestamp?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
  details?: Record<string, unknown> | string;
  ipAddress?: string;
  userAgent?: string;
}

export interface IPaymentGatewayIntentResult {
  orderId: string;
  provider: 'stripe' | 'razorpay';
  amount: number;
  currency: string;
  planCode: string;
  businessId: string;
  clientSecret: string;
  keyId: string;
  webhookEndpoint: string;
  mockGatewayActive: boolean;
  instructions: string;
}

export interface IInvoiceSettingsConfig {
  prefix: string;
  nextNumber: number;
  paymentTermsDays: number;
  defaultNotes?: string;
}

export interface INotificationPreferencesConfig {
  emailOnOrder: boolean;
  emailOnPayment: boolean;
  lowStockAlerts: boolean;
  weeklyDigest: boolean;
}

export interface IWorkingHoursConfig {
  start: string;
  end: string;
  workDays: string[];
}

export interface IBusinessDashboardStats {
  totalEmployees: number;
  totalCustomers: number;
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  lowStockProducts: number;
  activeProjects: number;
  currency: string;
  dateRange: {
    period: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface IMonthlyRevenueItem {
  month: string;
  revenue: number;
  target?: number;
}

export interface IMonthlyExpenseItem {
  month: string;
  expenses: number;
}

export interface IProfitLossItem {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface ISalesPerformanceItem {
  period: string;
  salesCount: number;
  revenue: number;
  averageOrderValue: number;
}

export interface IOrderStatusBreakdown {
  status: string;
  count: number;
  value: number;
}

export interface IDepartmentCount {
  department: string;
  count: number;
}

export interface IRoleCount {
  role: string;
  count: number;
}

export interface IBusinessAnalytics {
  monthlyRevenue: IMonthlyRevenueItem[];
  monthlyExpenses: IMonthlyExpenseItem[];
  profitAndLoss: IProfitLossItem[];
  salesPerformance: ISalesPerformanceItem[];
  orderStatistics: {
    statusBreakdown: IOrderStatusBreakdown[];
    totalCount: number;
  };
  employeeStatistics: {
    departmentDistribution: IDepartmentCount[];
    roleDistribution: IRoleCount[];
    totalCount: number;
  };
}

export interface IBusinessProfileUpdate {
  name?: string;
  logo?: string | null;
  businessEmail?: string;
  phone?: string;
  address?: IBusinessAddress;
  website?: string;
  description?: string;
  gstin?: string;
  category?: string;
}

export interface IBusinessFullSettings {
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  invoiceSettings?: IInvoiceSettingsConfig;
  notificationPreferences?: INotificationPreferencesConfig;
  workingHours?: IWorkingHoursConfig;
}

export interface IAddEmployeeInput {
  name: string;
  email: string;
  phone?: string;
  role: 'MANAGER' | 'EMPLOYEE';
  department?: string;
  password?: string;
}

export interface IAddCustomerInput {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
}

export interface ICreateInvoiceInput {
  customerName: string;
  customerEmail: string;
  amount: number;
  tax?: number;
  dueDate: string;
  notes?: string;
  status?: 'pending' | 'paid';
}

export interface IAddProductInput {
  name: string;
  sku: string;
  category?: string;
  price: number;
  cost?: number;
  stockQuantity: number;
  reorderPoint?: number;
  unit?: string;
  description?: string;
}

export interface ICreatePurchaseOrderInput {
  title: string;
  vendor: string;
  category?: string;
  amount: number;
  paymentMethod?: string;
  reference?: string;
  description?: string;
}

export interface ICreateProjectInput {
  name: string;
  client?: string;
  budget: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  status?: 'planned' | 'active' | 'in_progress' | 'completed';
}

export interface IBusinessContextType {
  businesses: IBusiness[];
  activeBusiness: IBusiness;
  switchBusiness: (businessId: string) => void;
  addBusiness: (newBiz: Partial<IBusiness> & { name: string; slug: string }) => IBusiness;
  refreshBusinesses?: () => Promise<void>;
}

/**
 * API Response & Health Check Types
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;
  errors?: unknown;
  meta?: Record<string, unknown>;
}

export interface IHealthStatusData {
  service: string;
  version: string;
  environment: string;
  uptime: {
    seconds: number;
    human: string;
  };
  database: {
    state: string;
    isHealthy: boolean;
    host: string;
    name: string;
  };
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  timestamp: string;
}

export interface IApiError {
  message: string;
  statusCode: number;
  errors?: Array<{ field: string; message: string }> | null;
  raw?: unknown;
}

/**
 * Contact Form Types
 */
export interface IContactFormData {
  name: string;
  email: string;
  businessName?: string;
  teamSize?: string;
  subject?: string;
  message: string;
}

export interface IInquiryTicket {
  referenceId: string;
  receivedAt: string;
  sender: {
    name: string;
    email: string;
    businessName: string | null;
    teamSize: string;
  };
  subject: string;
}

/**
 * Common Component Prop Types
 */
export type BadgeColor = 'blue' | 'emerald' | 'indigo' | 'amber' | 'purple' | 'slate' | 'rose';
export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
export type BadgeSize = 'xs' | 'sm';

export interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  variant?: BadgeVariant | string;
  size?: BadgeSize;
  className?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  to?: string;
  href?: string;
  loading?: boolean;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  iconLeft?: ComponentType<{ className?: string; strokeWidth?: number }>;
  iconRight?: ComponentType<{ className?: string; strokeWidth?: number }>;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padded?: boolean;
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export interface EmptyStateProps {
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTo?: string;
  secondaryAction?: ReactNode;
  badgeText?: string;
  className?: string;
}

export interface HealthIndicatorBadgeProps {
  compact?: boolean;
  showDetails?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
  iconColor?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple';
}

export interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export interface TopNavProps {
  setMobileOpen: (open: boolean) => void;
  pageTitle?: string;
}

/**
 * ============================================================================
 * PART 5: HR & WORKFORCE MANAGEMENT TYPES
 * ============================================================================
 */

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
export type LeaveType = 'CASUAL_LEAVE' | 'SICK_LEAVE' | 'EARNED_LEAVE' | 'UNPAID_LEAVE';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type JobStatus = 'OPEN' | 'CLOSED' | 'ACTIVE' | 'DRAFT' | 'ON_HOLD';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED';
export type PayrollStatus = 'DRAFT' | 'APPROVED' | 'PAID';

export interface IEmployeeDocument {
  name: string;
  url: string;
  fileType: string;
  uploadedAt: string;
}

export interface IEmployee {
  _id: string;
  businessId: string;
  userId?: string;
  employeeId: string;
  fullName: string;
  profilePhoto?: string | null;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  departmentId?: string;
  departmentName?: string;
  designation: string;
  joiningDate: string;
  employmentType: EmploymentType;
  salary: {
    basicSalary: number;
    currency: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: EmployeeStatus;
  documents?: IEmployeeDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IDepartment {
  _id: string;
  businessId: string;
  name: string;
  code: string;
  description?: string;
  managerId?: any;
  budget?: number;
  isActive: boolean;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAttendanceRecord {
  _id: string;
  businessId: string;
  employeeId: any;
  userId?: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  workingHours: number;
  status: AttendanceStatus;
  lateMinutes: number;
  notes?: string;
  createdAt?: string;
}

export interface ILeavePolicy {
  _id?: string;
  businessId: string;
  casualLeaveQuota: number;
  sickLeaveQuota: number;
  earnedLeaveQuota: number;
  unpaidLeaveAllowed: boolean;
  carryForwardLimit: number;
}

export interface ILeaveBalance {
  casual: { quota: number; used: number; remaining: number };
  sick: { quota: number; used: number; remaining: number };
  earned: { quota: number; used: number; remaining: number };
  unpaid: { quota: string | number; used: number; remaining: string };
}

export interface ILeaveRequest {
  _id: string;
  businessId: string;
  employeeId: any;
  userId?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface IJobOpening {
  _id: string;
  businessId: string;
  departmentId?: any;
  departmentName?: string;
  title: string;
  description: string;
  qualifications: string[];
  experienceYears: number;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: EmploymentType;
  positionsCount: number;
  status: JobStatus;
  applicationsCount?: number;
  createdAt?: string;
}

export interface IJobApplication {
  _id: string;
  businessId: string;
  jobOpeningId: any;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl: string;
  coverNote?: string;
  experienceYears?: number;
  status: ApplicationStatus;
  interviewSchedule?: {
    scheduledDate?: string;
    interviewerName?: string;
    meetingLink?: string;
    notes?: string;
  };
  createdAt?: string;
}

export interface ISalaryStructure {
  _id: string;
  businessId: string;
  employeeId: string;
  basicSalary: number;
  allowances: {
    hra?: number;
    conveyance?: number;
    medical?: number;
    special?: number;
    other?: number;
  };
  deductions: {
    pf?: number;
    tax?: number;
    insurance?: number;
    other?: number;
  };
  currency: string;
}

export interface IPayrollRecord {
  _id: string;
  businessId: string;
  month: number;
  year: number;
  payrollPeriod: string;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  currency: string;
  status: PayrollStatus;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

export interface IPayslip {
  _id: string;
  businessId: string;
  payrollId: string;
  employeeId: any;
  payrollPeriod: string;
  employeeName: string;
  designation: string;
  department: string;
  basicSalary: number;
  allowances: {
    hra?: number;
    conveyance?: number;
    medical?: number;
    special?: number;
    other?: number;
  };
  deductions: {
    pf?: number;
    tax?: number;
    insurance?: number;
    unpaidLeaveDeduction?: number;
    other?: number;
  };
  grossSalary: number;
  netSalary: number;
  attendanceSummary: {
    totalWorkingDays: number;
    presentDays: number;
    leavesTaken: number;
    unpaidLeaves: number;
    workingHours: number;
  };
  currency: string;
  status: 'GENERATED' | 'PAID';
  createdAt: string;
}

export interface INotificationItem {
  _id: string;
  businessId: string;
  recipientUserId?: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export interface IHRReportsData {
  totalEmployeeReport: {
    totalEmployees: number;
    activeEmployees: number;
    probationEmployees: number;
    employmentTypeBreakdown: Record<string, number>;
  };
  departmentWiseReport: IDepartment[];
  dailyAttendanceReport: {
    totalExpected: number;
    present: number;
    late: number;
    onLeave: number;
    attendanceRate: number;
  };
  monthlyAttendanceReport: {
    totalDays: number;
    present: number;
    late: number;
    halfDay: number;
    onLeave: number;
    absent: number;
  };
  leaveStatisticsReport: {
    totalRequests: number;
    approved: number;
    pending: number;
    rejected: number;
    byType: {
      casual: number;
      sick: number;
      earned: number;
      unpaid: number;
    };
  };
  payrollSummaryReport: {
    totalCycles: number;
    totalPayrollGross: number;
    totalPayrollDisbursed: number;
    recentPayrolls: IPayrollRecord[];
  };
  recruitmentStatisticsReport: {
    openPositions: number;
    totalApplications: number;
    shortlisted: number;
    interviewsHeld: number;
    selected: number;
  };
}

/**
 * ============================================================================
 * PART 6: CRM & SALES MANAGEMENT TYPES & CONTRACTS
 * ============================================================================
 */

export type CustomerTypeOption = 'INDIVIDUAL' | 'BUSINESS' | 'ENTERPRISE' | 'RETAIL' | 'WHOLESALE';
export type CustomerStatusOption = 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'BLOCKED' | 'active' | 'inactive';
export type LeadSourceOption = 'Website' | 'Social Media' | 'Referral' | 'Advertisement' | 'Direct Contact' | 'Other';
export type LeadStatusStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type FollowUpStatusOption = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type FollowUpTypeOption = 'CALL' | 'MEETING' | 'EMAIL' | 'DEMO' | 'FOLLOW_UP';
export type SalesOrderStatusOption = 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type SalesOrderPaymentOption = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';

export interface ICustomerItem {
  _id: string;
  businessId?: string;
  customerId: string;
  name?: string;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  gstin?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  customerType: CustomerTypeOption;
  registrationDate?: string;
  totalSpent: number;
  ordersCount: number;
  status: CustomerStatusOption;
  notes?: string;
  assignedEmployeeId?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILeadItem {
  _id: string;
  businessId?: string;
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSourceOption;
  assignedEmployeeId?: any;
  assignedEmployeeName?: string;
  leadValue: number;
  expectedClosingDate?: string;
  notes?: string;
  status: LeadStatusStage;
  convertedCustomerId?: string;
  convertedOrderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFollowUpItem {
  _id: string;
  businessId?: string;
  leadId?: any;
  customerId?: any;
  title: string;
  type: FollowUpTypeOption;
  scheduledDate: string;
  nextFollowUpDate?: string;
  notes?: string;
  status: FollowUpStatusOption;
  outcomeNotes?: string;
  assignedEmployeeId?: any;
  reminderSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISalesOrderItem {
  productId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  itemTotal: number;
}

export interface ISalesOrder {
  _id: string;
  businessId?: string;
  orderNumber: string;
  customerId: any;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: ISalesOrderItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: SalesOrderStatusOption;
  paymentStatus: SalesOrderPaymentOption;
  orderDate: string;
  expectedDeliveryDate?: string;
  assignedEmployeeId?: any;
  notes?: string;
  inventoryDeducted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISalesActivity {
  _id: string;
  businessId?: string;
  customerId?: any;
  leadId?: any;
  salesOrderId?: any;
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE' | 'STATUS_CHANGE' | 'ORDER_CREATED' | 'LEAD_CONVERTED';
  subject: string;
  description: string;
  performedBy?: any;
  metadata?: any;
  timestamp: string;
}

export interface ISalesAnalyticsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrdersCount: number;
  wonLeadsCount: number;
  lostLeadsCount: number;
  conversionRate: number;
  monthlySales: Array<{
    month: string;
    sales: number;
    orders: number;
  }>;
  salesByEmployee: Array<{
    employeeId: string;
    employeeName: string;
    totalSales: number;
    ordersCount: number;
  }>;
  salesByCustomer: Array<{
    customerId: string;
    customerName: string;
    totalSpent: number;
    ordersCount: number;
  }>;
  pipelineDistribution: Array<{
    stage: LeadStatusStage;
    count: number;
    totalValue: number;
  }>;
}

/**
 * ============================================================================
 * PART 7: INVENTORY, WAREHOUSE, SUPPLIER & PURCHASE MANAGEMENT TYPES
 * ============================================================================
 */

export interface IProductCategory {
  _id: string;
  businessId?: string;
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: any;
  isActive: boolean;
  productCount?: number;
  totalStockValue?: number;
  createdAt?: string;
}

export interface IProductItem {
  _id: string;
  businessId?: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  categoryId?: any;
  price: number;
  cost: number;
  sellingPrice?: number;
  purchasePrice?: number;
  taxRate: number;
  stockQuantity: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  minStockThreshold: number;
  suggestedReorderQuantity: number;
  unit: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description?: string;
  productImage?: string;
  supplierId?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface IWarehouseItem {
  _id: string;
  businessId?: string;
  code: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contactPhone?: string;
  contactEmail?: string;
  managerId?: any;
  isPrimary: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  totalProductsCount?: number;
  totalStockQuantity?: number;
  createdAt?: string;
}

export interface IStockLedgerItem {
  _id: string;
  businessId?: string;
  productId: any;
  warehouseId?: any;
  movementType:
    | 'STOCK_IN'
    | 'STOCK_OUT'
    | 'ADJUSTMENT'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT'
    | 'PURCHASE_RECEIPT'
    | 'SALES_FULFILLMENT'
    | 'SALES_RETURN'
    | 'RESERVATION'
    | 'RESERVATION_RELEASE';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'STOCK_TRANSFER' | 'MANUAL_ADJUSTMENT' | 'INITIAL_STOCK';
  referenceId?: string;
  notes?: string;
  performedBy?: any;
  timestamp: string;
}

export interface IStockTransferItem {
  _id: string;
  businessId?: string;
  transferNumber: string;
  fromWarehouseId: any;
  toWarehouseId: any;
  items: Array<{
    productId: any;
    productName: string;
    quantity: number;
  }>;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  transferDate: string;
  receivedDate?: string;
}

export interface ILowStockAlertItem {
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  availableStock: number;
  stockQuantity: number;
  reorderPoint: number;
  suggestedReorderQuantity: number;
  unit: string;
  status: string;
  unitCost?: number;
  estimatedReorderCost?: number;
}

export interface ISupplierItem {
  _id: string;
  businessId?: string;
  supplierCode: string;
  supplierName: string;
  companyName: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  gstin?: string;
  contactPerson?: string;
  paymentTerms: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number;
  purchaseHistory?: any[];
  supplierProducts?: any[];
  createdAt?: string;
}

export interface IPurchaseOrderItem {
  productId: any;
  productName: string;
  sku?: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface IPurchaseOrder {
  _id: string;
  businessId?: string;
  poNumber: string;
  supplierId: any;
  supplierName: string;
  warehouseId?: any;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: IPurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  notes?: string;
  receiveHistory?: Array<{
    receivedDate: string;
    items: Array<{ productId: any; quantityReceived: number }>;
    notes?: string;
  }>;
  createdAt?: string;
}

export interface IInventoryAnalyticsData {
  totalProducts: number;
  totalStockValue: number;
  lowStockProductsCount: number;
  outOfStockProductsCount: number;
  totalWarehousesCount: number;
  totalSuppliersCount: number;
  lowStockAlerts: ILowStockAlertItem[];
  stockMovementSummary: {
    totalStockIn: number;
    totalStockOut: number;
    totalAdjustments: number;
  };
  purchaseSummary: {
    totalPurchaseOrders: number;
    pendingOrdersCount: number;
    totalPurchaseSpend: number;
  };
}

/**
 * ============================================================================
 * PART 8: FINANCE, INVOICING, GST & EXPENSE TYPES
 * ============================================================================
 */

export interface IIncomeItem {
  _id: string;
  businessId?: string;
  incomeNumber: string;
  title: string;
  category: string;
  source: string;
  amount: number;
  taxDeducted: number;
  netAmount: number;
  date: string;
  paymentMethod: string;
  referenceNumber?: string;
  customerId?: any;
  invoiceId?: any;
  notes?: string;
  status: 'RECORDED' | 'VOID';
  createdAt?: string;
}

export interface IExpenseCategoryItem {
  _id: string;
  businessId?: string;
  name: string;
  code: string;
  description?: string;
  isTaxDeductible: boolean;
  budgetLimit?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface IExpenseItem {
  _id: string;
  businessId?: string;
  expenseNumber?: string;
  title: string;
  categoryId?: any;
  category: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  date: string;
  vendor?: string;
  vendorGstin?: string;
  paymentMethod?: string;
  reference?: string;
  receiptUrl?: string;
  description?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: any;
  approvedAt?: string;
  isPayroll?: boolean;
  isInventoryPurchase?: boolean;
  createdAt?: string;
}

export interface IInvoiceLineItem {
  productId?: any;
  name: string;
  description?: string;
  hsnSacCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  taxRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTaxAmount: number;
  lineTotal: number;
}

export interface IInvoiceItemRecord {
  _id: string;
  businessId?: string;
  invoiceNumber: string;
  customerId?: any;
  salesOrderId?: any;
  customerName: string;
  customerEmail: string;
  businessSnapshot?: {
    name: string;
    legalName?: string;
    gstin?: string;
    email?: string;
    phone?: string;
    address?: any;
    logo?: string;
  };
  customerSnapshot?: {
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    gstin?: string;
    address?: any;
  };
  invoiceDate: string;
  dueDate: string;
  items: IInvoiceLineItem[];
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  isInterState: boolean;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTaxAmount: number;
  shippingCharges: number;
  otherCharges: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  createdAt?: string;
}

export interface IPaymentRecord {
  _id: string;
  businessId?: string;
  paymentNumber: string;
  invoiceId?: any;
  customerId?: any;
  customerName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: 'COMPLETED' | 'PENDING_VERIFICATION' | 'FAILED' | 'REFUNDED';
  isVerified: boolean;
  notes?: string;
  createdAt?: string;
}

export interface IFinancialTransactionRecord {
  _id: string;
  businessId?: string;
  transactionNumber: string;
  date: string;
  type: string;
  category: string;
  amount: number;
  debit: number;
  credit: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  paymentMethod?: string;
  description: string;
  createdAt?: string;
}

export interface IFinanceDashboardStatsData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  pendingPaymentsAmount: number;
  receivedPaymentsAmount: number;
  outstandingInvoicesAmount: number;
  overdueInvoicesCount: number;
  paidInvoicesCount: number;
  totalInvoicesCount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyRevenueSeries: Array<{ month: string; income: number; expense: number; profit: number }>;
}

export interface IProfitLossReportData {
  period: string;
  startDate: string;
  endDate: string;
  operatingRevenue: {
    salesInvoicesTotal: number;
    independentIncomeTotal: number;
    grossRevenue: number;
  };
  costOfGoodsAndExpenses: {
    inventoryPurchases: number;
    payrollSalaries: number;
    operatingExpenses: number;
    totalExpenses: number;
  };
  netOperatingIncome: number;
  netProfit: number;
  profitMarginPercent: number;
}

export interface IGstReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalTaxableTurnover: number;
  intraStateTurnover: number;
  interStateTurnover: number;
  taxSummary: {
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    totalGstCollected: number;
  };
  hsnSummary: Array<{
    hsnSacCode: string;
    description: string;
    taxableValue: number;
    taxRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalTax: number;
  }>;
}

/**
 * ============================================================================
 * PART 9: PROJECT, TASK, KANBAN, COLLABORATION & CALENDAR CONTRACTS
 * ============================================================================
 */

export type ProjectStatusType =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'planned'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'on_hold';

export type ProjectPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED';
export type TaskPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectMemberRoleType = 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'DEVELOPER' | 'DESIGNER' | 'QA' | 'CONTRIBUTOR' | 'VIEWER';
export type MilestoneStatusType = 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED' | 'MISSED';
export type DocumentCategoryType = 'REQUIREMENTS' | 'DESIGN' | 'SPECIFICATION' | 'CONTRACT' | 'REPORT' | 'ATTACHMENT' | 'OTHER';
export type BusinessEventTypeType = 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'HOLIDAY' | 'COMPANY_EVENT' | 'REVIEW';

export interface IProjectMemberItem {
  userId: string;
  employeeId?: string;
  name: string;
  email: string;
  role: ProjectMemberRoleType;
  joinedAt?: string;
}

export interface IProjectHistoryItem {
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
}

export interface IProjectItem {
  id: string;
  _id?: string;
  businessId: string;
  name: string;
  projectCode: string;
  description?: string;
  projectManagerId?: string;
  projectManagerName?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  priority: ProjectPriorityType;
  status: ProjectStatusType;
  assignedEmployees?: string[];
  members?: IProjectMemberItem[];
  progress: number;
  history?: IProjectHistoryItem[];
  client?: string;
  customerId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ITaskAttachmentItem {
  name: string;
  url: string;
  fileType: string;
  fileSize?: number;
}

export interface ITaskHistoryItem {
  action: string;
  fromStatus?: string;
  toStatus?: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  notes?: string;
}

export interface ITaskItem {
  id: string;
  _id?: string;
  businessId: string;
  projectId: string;
  projectName?: string;
  taskNumber: string;
  title: string;
  description?: string;
  priority: TaskPriorityType;
  status: TaskStatusType;
  assignedToId?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  deadline: string;
  estimatedHours?: number;
  loggedHours?: number;
  attachments?: ITaskAttachmentItem[];
  commentsCount: number;
  history?: ITaskHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ITaskCommentItem {
  id: string;
  _id?: string;
  taskId: string;
  projectId: string;
  businessId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  mentions?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    fileType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface IProjectMilestoneItem {
  id: string;
  _id?: string;
  businessId: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: MilestoneStatusType;
  order: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProjectDocumentItem {
  id: string;
  _id?: string;
  businessId: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategoryType;
  uploadedById: string;
  uploadedByName: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBusinessEventAttendee {
  userId?: string;
  name: string;
  email: string;
}

export interface IBusinessEventItem {
  id: string;
  _id?: string;
  businessId: string;
  title: string;
  description?: string;
  eventType: BusinessEventTypeType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  meetingUrl?: string;
  attendees?: IBusinessEventAttendee[];
  projectId?: string;
  projectName?: string;
  taskId?: string;
  color?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IKanbanBoardData {
  projectId: string;
  projectName: string;
  columns: {
    TODO: ITaskItem[];
    IN_PROGRESS: ITaskItem[];
    REVIEW: ITaskItem[];
    COMPLETED: ITaskItem[];
    BLOCKED: ITaskItem[];
  };
  totalTasks: number;
}

export interface IProjectTimelineData {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate?: string;
  progress: number;
  milestones: IProjectMilestoneItem[];
  tasks: ITaskItem[];
  events: IBusinessEventItem[];
}

export interface IAggregatedCalendarItem {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  type: 'EVENT' | 'PROJECT_DEADLINE' | 'TASK_DEADLINE' | 'MILESTONE';
  status?: string;
  color: string;
  metadata?: {
    projectId?: string;
    projectName?: string;
    taskId?: string;
    priority?: string;
    eventType?: string;
    location?: string;
    meetingUrl?: string;
    attendees?: IBusinessEventAttendee[];
  };
}

/**
 * ============================================================================
 * PART 10: AI ASSISTANT, INSIGHTS, ADVANCED ANALYTICS, REPORTS & BILLING
 * ============================================================================
 */

export interface IAiQueryInput {
  question: string;
  context?: Record<string, unknown>;
}

export interface IAiQueryResponse {
  answer: string;
  category: 'REVENUE' | 'EXPENSE' | 'SALES' | 'INVENTORY' | 'EMPLOYEES' | 'INVOICES' | 'GENERAL';
  confidence: number;
  dataPoints?: Record<string, unknown>;
  suggestions?: string[];
  generatedAt: string;
  disclaimer?: string;
}

export interface IForecastDataPoint {
  period: string;
  forecastRevenue: number;
  lowerBound: number;
  upperBound: number;
  isEstimate: true;
}

export interface IAiBusinessInsights {
  salesTrend: {
    direction: 'GROWTH' | 'DECLINING' | 'STABLE';
    growthRatePercent: number;
    topCategory: string;
    summary: string;
  };
  expenseTrend: {
    burnRateMonthly: number;
    expenseToRevenueRatioPercent: number;
    costDriver: string;
    summary: string;
  };
  inventoryDemand: {
    lowStockCount: number;
    stockoutRiskProducts: Array<{ name: string; currentStock: number; reorderLevel: number; suggestedOrder: number }>;
    turnoverRatio: number;
    summary: string;
  };
  revenueForecasting: {
    model: string;
    forecastNext30Days: number;
    forecastNext60Days: number;
    forecastNext90Days: number;
    projections: IForecastDataPoint[];
    disclaimer: string;
  };
  customerRetention: {
    totalCustomers: number;
    repeatCustomerRatePercent: number;
    churnRiskCount: number;
    averageLifetimeValue: number;
    summary: string;
  };
  recommendations: Array<{
    category: 'GROWTH' | 'COST_SAVING' | 'INVENTORY' | 'OPERATIONS';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    action: string;
    potentialImpact: string;
  }>;
}

export interface IAdvancedAnalyticsData {
  timeframe: string;
  startDate: string;
  endDate: string;
  revenueTrends: Array<{ date: string; revenue: number; orders: number }>;
  profitLoss: {
    grossRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMarginPercent: number;
  };
  salesPerformance: {
    totalSales: number;
    ordersCount: number;
    averageOrderValue: number;
    conversionRatePercent: number;
    topProducts: Array<{ name: string; quantitySold: number; totalRevenue: number }>;
  };
  customerGrowth: {
    totalCustomers: number;
    newCustomersThisPeriod: number;
    growthRatePercent: number;
    customerTypeDistribution: Record<string, number>;
  };
  employeePerformance: {
    totalEmployees: number;
    averageAttendancePercent: number;
    totalTasksCompleted: number;
    totalPayrollExpense: number;
  };
  inventoryPerformance: {
    totalSkus: number;
    totalValuation: number;
    lowStockSkus: number;
    warehouseDistribution: Array<{ warehouseName: string; totalItems: number }>;
  };
  purchaseAnalysis: {
    totalPurchaseSpend: number;
    totalPurchaseOrders: number;
    topSuppliers: Array<{ name: string; totalSpend: number }>;
  };
  expenseAnalysis: {
    totalExpenses: number;
    categories: Array<{ category: string; amount: number; percentage: number }>;
  };
  businessGrowthIndex: number;
}

export type BusinessReportPeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface IBusinessReportData {
  reportId: string;
  businessId: string;
  businessName: string;
  reportType: BusinessReportPeriodType;
  periodLabel: string;
  startDate: string;
  endDate: string;
  executiveSummary: string;
  kpis: {
    grossRevenue: number;
    netProfit: number;
    ordersCount: number;
    newCustomersCount: number;
    activeProjectsCount: number;
    lowStockAlerts: number;
    overdueInvoicesCount: number;
    overdueInvoicesAmount: number;
  };
  salesBreakdown: Array<{ category: string; orders: number; revenue: number }>;
  expenseBreakdown: Array<{ category: string; amount: number }>;
  operationalHighlights: {
    tasksCompleted: number;
    attendanceRatePercent: number;
    inventoryAdjustments: number;
  };
  criticalRisks: string[];
  strategicOpportunities: string[];
  generatedAt: string;
  generatedByName: string;
}

export interface ISubscriptionPlanItem {
  id: string;
  _id?: string;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  employeeLimit: number;
  storageLimitGb: number;
  features: string[];
  isActive: boolean;
}

export interface IBillingCurrentStatus {
  subscription: {
    id: string;
    plan: string;
    billingCycle: 'monthly' | 'annual';
    status: string;
    price: number;
    currency: string;
    startDate: string;
    currentPeriodEnd: string;
    daysRemaining: number;
    autoRenew: boolean;
  };
  planDetails: {
    code: string;
    name: string;
    employeeLimit: number;
    storageLimitGb: number;
    features: string[];
  };
  usage: {
    employeesCount: number;
    employeesLimit: number;
    storageUsedMb: number;
    storageLimitMb: number;
    projectsCount: number;
    invoicesCount: number;
  };
}

export interface ISubscriptionPurchaseInput {
  planCode: string;
  billingCycle: 'monthly' | 'annual';
  paymentMethod?: string;
}

export interface INotificationPreferenceInput {
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  taskAlerts?: boolean;
  inventoryAlerts?: boolean;
  financialAlerts?: boolean;
  marketingUpdates?: boolean;
}

/**
 * Enterprise Phase 1: Multi-Branch Management Types
 */
export type BranchType = 'HEADQUARTERS' | 'RETAIL_STORE' | 'WAREHOUSE_DEPOT' | 'REGIONAL_OFFICE';
export type BranchStatus = 'ACTIVE' | 'INACTIVE';

export interface IBranchAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IBranchOperatingHours {
  openTime: string;
  closeTime: string;
  workingDays: string[];
}

export interface IBranchItem {
  _id: string;
  id?: string;
  businessId: string;
  code: string;
  name: string;
  type: BranchType;
  managerId?: {
    _id: string;
    name: string;
    email: string;
  } | string | null;
  address: IBranchAddress;
  contactPhone?: string;
  contactEmail?: string;
  taxNumber?: string;
  isMainBranch: boolean;
  status: BranchStatus;
  operatingHours?: IBranchOperatingHours;
  currency: string;
  assignedWarehousesCount?: number;
  assignedEmployeesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBranchInput {
  code: string;
  name: string;
  type: BranchType;
  managerId?: string | null;
  address?: IBranchAddress;
  contactPhone?: string;
  contactEmail?: string;
  taxNumber?: string;
  isMainBranch?: boolean;
  status?: BranchStatus;
  operatingHours?: IBranchOperatingHours;
  currency?: string;
}

export interface IBranchAnalytics {
  branchId: string;
  branchName: string;
  code: string;
  type: string;
  totalEmployees: number;
  totalWarehouses: number;
  totalOrders: number;
  totalRevenue: number;
  inventoryValuation: number;
  status: string;
}

export interface IBranchTransferInput {
  fromBranchId: string;
  toBranchId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  notes?: string;
}

// Enterprise Phase 2: Point of Sale (POS) Types
export type PosSessionStatus = 'OPEN' | 'SUSPENDED' | 'CLOSED';
export type PosPaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'CREDIT' | 'SPLIT';

export interface IPosPaymentSplit {
  method: PosPaymentMethod;
  amount: number;
  reference?: string;
}

export interface IPosCartItem {
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  unitPrice: number;
  quantity: number;
  discountPercent?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  subtotal: number;
  total: number;
}

export interface IPosCheckoutInput {
  sessionId: string;
  branchId?: string;
  warehouseId?: string;
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: IPosCartItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: PosPaymentMethod;
  amountTendered: number;
  changeDue: number;
  splitPayments?: IPosPaymentSplit[];
  notes?: string;
}

export interface IPosSessionOpenInput {
  branchId: string;
  registerName: string;
  openingBalance: number;
  notes?: string;
}

export interface IPosSessionCloseInput {
  closingBalance: number;
  notes?: string;
}

export interface IPosCashAdjustmentInput {
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  reason: string;
}

export interface IPosSessionItem {
  _id: string;
  businessId: string;
  branchId: any;
  cashierId: any;
  registerName: string;
  sessionCode: string;
  openingBalance: number;
  closingBalance?: number;
  expectedCashBalance: number;
  cashDiscrepancy: number;
  totalSalesAmount: number;
  totalTransactionsCount: number;
  totalCashSales: number;
  totalCardSales: number;
  totalUpiSales: number;
  cashInAmount: number;
  cashOutAmount: number;
  status: PosSessionStatus;
  openedAt: string | Date;
  closedAt?: string | Date;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPosReceipt {
  receiptNumber: string;
  orderNumber: string;
  invoiceId: string;
  sessionId: string;
  sessionCode: string;
  registerName: string;
  branchName: string;
  branchAddress?: any;
  taxNumber?: string;
  cashierName: string;
  customerName: string;
  items: IPosCartItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: PosPaymentMethod;
  amountTendered: number;
  changeDue: number;
  timestamp: string;
}

export interface IPosZReport {
  session: any;
  salesBreakdown: {
    grossSales: number;
    discounts: number;
    netSales: number;
    taxTotal: number;
    tenderBreakdown: {
      cash: number;
      card: number;
      upi: number;
      other: number;
    };
  };
  cashReconciliation: {
    openingFloat: number;
    cashIn: number;
    cashOut: number;
    cashSales: number;
    expectedInDrawer: number;
    actualCounted: number;
    discrepancy: number;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    revenue: number;
  }>;
}

// Enterprise Phase 3: Advanced Customer Portal Types
export type TicketCategory = 'BILLING' | 'ORDER' | 'TECHNICAL' | 'GENERAL';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ITicketMessage {
  senderId: any;
  senderRole: string;
  senderName: string;
  message: string;
  attachments?: string[];
  createdAt: string | Date;
}

export interface ISupportTicketItem {
  _id: string;
  businessId: string;
  customerId: any;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: any;
  messages: ITicketMessage[];
  slaDueAt?: string | Date;
  resolvedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICustomerPortalStats {
  totalOrders: number;
  activeOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  pendingQuotesCount: number;
  openTicketsCount: number;
}

export interface ICreateTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
}

export interface ICustomerPayInvoiceInput {
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'NET_BANKING';
  amount: number;
  transactionReference?: string;
}



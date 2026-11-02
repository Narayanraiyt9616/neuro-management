import { Request, Response, NextFunction } from 'express';
import { Document, Types } from 'mongoose';

/**
 * 5 Standard Platform Roles
 */
export type UserRole = 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  avatar?: string | null;
  businessId: Types.ObjectId | null;
  status: UserStatus;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Password Reset Token Model Interface
 */
export interface IPasswordResetToken {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPasswordResetTokenDocument extends IPasswordResetToken, Document {
  _id: Types.ObjectId;
}

/**
 * Business & Entity Model types
 */
export type BusinessStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'active'
  | 'trial'
  | 'past_due'
  | 'suspended'
  | 'archived';

export interface IBusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
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

export interface IBusinessSettings {
  fiscalYearStart?: string;
  invoicePrefix?: string;
  dateFormat?: string;
  multiCurrencyEnabled?: boolean;
  invoiceSettings?: IInvoiceSettingsConfig;
  notificationPreferences?: INotificationPreferencesConfig;
  workingHours?: IWorkingHoursConfig;
  notifications?: {
    emailAlerts: boolean;
    weeklyDigest: boolean;
  };
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

export interface IBusiness {
  name: string;
  slug: string;
  legalName?: string;
  registrationNumber?: string;
  taxId?: string;
  gstin?: string;
  industry?: string;
  category?: string;
  currency: string;
  timezone: string;
  logo?: string | null;
  contactEmail?: string;
  businessEmail?: string;
  phone?: string;
  website?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  address?: IBusinessAddress;
  ownerId: Types.ObjectId;
  subscriptionId?: Types.ObjectId | null;
  status: BusinessStatus;
  rejectionReason?: string;
  suspensionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  suspendedAt?: Date;
  settings: IBusinessSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBusinessDocument extends IBusiness, Document {
  _id: Types.ObjectId;
}

/**
 * Subscription Plan & Pricing types
 */
export type PlanTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'starter' | 'professional' | 'enterprise' | 'free';

export interface ISubscriptionPlan {
  name: string;
  code: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  employeeLimit: number;
  storageLimitGb: number;
  moduleAccess: string[];
  features: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriptionPlanDocument extends ISubscriptionPlan, Document {
  _id: Types.ObjectId;
}

export type BillingCycle = 'monthly' | 'annual';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'EXPIRED'
  | 'CANCELED'
  | 'PAST_DUE'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export interface ISubscriptionLimits {
  maxUsers: number;
  maxInvoicesPerMonth: number;
  storageLimitMb: number;
  multiCurrency: boolean;
  customBranding: boolean;
  dedicatedAccountManager: boolean;
}

export interface ISubscription {
  businessId: Types.ObjectId;
  plan: PlanTier;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  price: number;
  currency: string;
  startDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  autoRenew?: boolean;
  paymentProvider?: 'stripe' | 'razorpay' | 'manual' | null;
  paymentOrderId?: string | null;
  lastPaymentStatus?: 'pending' | 'success' | 'failed' | null;
  limits: ISubscriptionLimits;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriptionDocument extends ISubscription, Document {
  _id: Types.ObjectId;
}

/**
 * Platform Overview Statistics
 */
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

/**
 * Platform Administration Settings
 */
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

export interface IPlatformSettingsDocument extends IPlatformSettings, Document {
  _id: Types.ObjectId;
}

/**
 * Payment Gateway Integration Types
 */
export interface IPaymentGatewayIntentInput {
  businessId: string;
  planCode: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  billingCycle: 'monthly' | 'annual';
  provider: 'stripe' | 'razorpay';
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

/**
 * Activity Log types
 */
export type ActivityModule =
  | 'auth'
  | 'business'
  | 'billing'
  | 'inventory'
  | 'sales'
  | 'workforce'
  | 'settings'
  | 'system';

export interface IActivityLog {
  businessId?: Types.ObjectId | null;
  userId?: Types.ObjectId | null;
  action: string;
  module: ActivityModule;
  entityType?: string;
  entityId?: Types.ObjectId | null;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: Date;
}

export interface IActivityLogDocument extends IActivityLog, Document {
  _id: Types.ObjectId;
}

/**
 * Standard API Response structures
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

/**
 * Health check data contract
 */
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

/**
 * Contact Inquiry types
 */
export interface IContactFormInput {
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
 * Validation error result
 */
export interface IValidationError {
  field: string;
  message: string;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
}

/**
 * JWT Payload & Authenticated Request types
 */
export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  businessId?: string | null;
}

export interface IAuthRequest extends Request {
  user?: IJwtPayload;
  dbUser?: unknown;
}

/**
 * Auth API Contracts
 */
export interface IRegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
  role?: UserRole;
  businessName?: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  token: string;
  password: string;
  confirmPassword?: string;
}

export interface IUpdateProfileInput {
  name?: string;
  phone?: string;
  avatar?: string | null;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}

export interface IAuthUserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string | null;
  status: UserStatus;
  businessId: string | null;
  business?: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    currency: string;
  } | null;
}

export interface IAuthResponse {
  user: IAuthUserDTO;
  token: string;
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

/**
 * ============================================================================
 * PART 5: HR & WORKFORCE MANAGEMENT TYPES & CONTRACTS
 * ============================================================================
 */

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
export type LeaveType = 'CASUAL_LEAVE' | 'SICK_LEAVE' | 'EARNED_LEAVE' | 'UNPAID_LEAVE';
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type JobOpeningStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ON_HOLD';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED';
export type PayrollStatusType = 'DRAFT' | 'APPROVED' | 'PAID';
export type NotificationType = 'LEAVE' | 'ATTENDANCE' | 'RECRUITMENT' | 'PAYROLL' | 'EMPLOYEE' | 'SYSTEM';

export interface IEmployeeInput {
  fullName: string;
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
  designation: string;
  joiningDate: string;
  employmentType: EmploymentType;
  salary: {
    basicSalary: number;
    currency?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  profilePhoto?: string | null;
  initialPassword?: string;
}

export interface IEmployeeUpdateInput extends Partial<IEmployeeInput> {
  status?: EmployeeStatus;
}

export interface IEmployeeDocumentUploadInput {
  name: string;
  url: string;
  fileType: string;
}

export interface IDepartmentInput {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  budget?: number;
}

export interface IDepartmentUpdateInput extends Partial<IDepartmentInput> {
  isActive?: boolean;
}

export interface IAssignManagerInput {
  managerId: string;
}

export interface IAssignEmployeesInput {
  employeeIds: string[];
}

export interface IAttendanceCheckInInput {
  notes?: string;
  ipAddress?: string;
}

export interface IAttendanceCheckOutInput {
  notes?: string;
}

export interface IAttendanceFilter {
  employeeId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatusType;
  month?: number;
  year?: number;
}

export interface ILeaveRequestInput {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ILeaveActionInput {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

export interface ILeavePolicyInput {
  casualLeaveQuota?: number;
  sickLeaveQuota?: number;
  earnedLeaveQuota?: number;
  unpaidLeaveAllowed?: boolean;
  carryForwardLimit?: number;
}

export interface IJobOpeningInput {
  departmentId: string;
  title: string;
  description: string;
  qualifications: string[];
  experienceYears: number;
  salaryRange?: {
    min: number;
    max: number;
    currency?: string;
  };
  employmentType: EmploymentType;
  positionsCount: number;
  status?: JobOpeningStatus;
}

export interface IJobApplicationInput {
  jobOpeningId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl: string;
  coverNote?: string;
  experienceYears?: number;
}

export interface IJobApplicationStatusInput {
  status: ApplicationStatus;
}

export interface IInterviewScheduleInput {
  scheduledDate: string;
  interviewerName: string;
  notes?: string;
  meetingLink?: string;
}

export interface ISalaryStructureInput {
  employeeId: string;
  basicSalary: number;
  allowances?: {
    hra?: number;
    conveyance?: number;
    medical?: number;
    special?: number;
    other?: number;
  };
  deductions?: {
    pf?: number;
    tax?: number;
    insurance?: number;
    other?: number;
  };
  currency?: string;
}

export interface IPayrollGenerateInput {
  month: number;
  year: number;
  notes?: string;
}

export interface IPayrollStatusUpdateInput {
  status: PayrollStatusType;
  paymentDate?: string;
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

export interface ICustomerInput {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  customerType?: CustomerTypeOption;
  status?: CustomerStatusOption;
  notes?: string;
  assignedEmployeeId?: string;
}

export interface ICustomerUpdateInput extends Partial<ICustomerInput> {}

export interface ILeadInput {
  leadName: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSourceOption;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  leadValue?: number;
  expectedClosingDate?: string;
  notes?: string;
  status?: LeadStatusStage;
}

export interface ILeadUpdateInput extends Partial<ILeadInput> {}

export interface ILeadConvertInput {
  customerType?: CustomerTypeOption;
  createOrder?: boolean;
  orderNotes?: string;
  orderItems?: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }>;
}

export interface IFollowUpInput {
  leadId?: string;
  customerId?: string;
  title: string;
  type?: FollowUpTypeOption;
  scheduledDate: string;
  nextFollowUpDate?: string;
  notes?: string;
  assignedEmployeeId?: string;
}

export interface IFollowUpUpdateInput extends Partial<IFollowUpInput> {
  status?: FollowUpStatusOption;
  outcomeNotes?: string;
}

export interface ISalesOrderItemInput {
  productId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

export interface ISalesOrderCreateInput {
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: ISalesOrderItemInput[];
  taxRate?: number;
  discountAmount?: number;
  shippingFee?: number;
  expectedDeliveryDate?: string;
  assignedEmployeeId?: string;
  notes?: string;
  status?: SalesOrderStatusOption;
  paymentStatus?: SalesOrderPaymentOption;
}

export interface ISalesOrderUpdateInput extends Partial<ISalesOrderCreateInput> {}

export interface ICustomerCommunicationInput {
  customerId?: string;
  leadId?: string;
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE';
  subject: string;
  body: string;
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

export interface IProductCategoryInput {
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: string;
  isActive?: boolean;
}

export interface IProductCategoryUpdateInput extends Partial<IProductCategoryInput> {}

export interface IProductInput {
  name: string;
  sku: string;
  barcode?: string;
  category?: string;
  categoryId?: string;
  price: number;
  cost?: number;
  taxRate?: number;
  stockQuantity?: number;
  reorderPoint?: number;
  minStockThreshold?: number;
  unit?: string;
  description?: string;
  productImage?: string;
  supplierId?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface IProductUpdateInput extends Partial<IProductInput> {}

export interface IWarehouseInput {
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
  managerId?: string;
  isPrimary?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface IWarehouseUpdateInput extends Partial<IWarehouseInput> {}

export interface IStockMovementInput {
  productId: string;
  warehouseId?: string;
  movementType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  referenceType?: 'MANUAL_ADJUSTMENT' | 'INITIAL_STOCK';
  referenceId?: string;
}

export interface IStockTransferCreateInput {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface ISupplierInput {
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
  paymentTerms?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export interface ISupplierUpdateInput extends Partial<ISupplierInput> {}

export interface IPurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface IPurchaseOrderCreateInput {
  supplierId: string;
  warehouseId?: string;
  expectedDeliveryDate?: string;
  items: IPurchaseOrderItemInput[];
  shippingCost?: number;
  notes?: string;
}

export interface IPurchaseOrderReceiveInput {
  receivedItems: Array<{
    productId: string;
    quantityReceived: number;
  }>;
  notes?: string;
  idempotencyKey?: string;
}

export interface IInventoryAnalyticsData {
  totalProducts: number;
  totalStockValue: number;
  lowStockProductsCount: number;
  outOfStockProductsCount: number;
  totalWarehousesCount: number;
  totalSuppliersCount: number;
  lowStockAlerts: Array<{
    productId: string;
    productName: string;
    sku: string;
    availableStock: number;
    reorderPoint: number;
    suggestedReorderQuantity: number;
    unit: string;
  }>;
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
 * PART 8: FINANCE, INVOICE, GST & EXPENSE CONTRACTS
 * ============================================================================
 */

export interface IIncomeInput {
  title: string;
  category: string;
  source: string;
  amount: number;
  taxDeducted?: number;
  date?: string | Date;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'CHEQUE' | 'OTHER';
  referenceNumber?: string;
  customerId?: string;
  invoiceId?: string;
  notes?: string;
}

export interface IIncomeUpdateInput extends Partial<IIncomeInput> {
  status?: 'RECORDED' | 'VOID';
}

export interface IExpenseCategoryInput {
  name: string;
  code: string;
  description?: string;
  isTaxDeductible?: boolean;
  budgetLimit?: number;
  isActive?: boolean;
}

export interface IExpenseCategoryUpdateInput extends Partial<IExpenseCategoryInput> {}

export interface IExpenseInput {
  title: string;
  categoryId?: string;
  category: string;
  amount: number;
  taxAmount?: number;
  date?: string | Date;
  vendor?: string;
  vendorGstin?: string;
  paymentMethod?: string;
  reference?: string;
  receiptUrl?: string;
  description?: string;
}

export interface IExpenseUpdateInput extends Partial<IExpenseInput> {
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface IInvoiceItemInput {
  productId?: string;
  name: string;
  description?: string;
  hsnSacCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export interface IInvoiceCreateInput {
  customerId: string;
  salesOrderId?: string;
  invoiceDate?: string | Date;
  dueDate: string | Date;
  items: IInvoiceItemInput[];
  shippingCharges?: number;
  otherCharges?: number;
  paymentTerms?: string;
  notes?: string;
  termsAndConditions?: string;
}

export interface IInvoiceUpdateInput {
  dueDate?: string | Date;
  notes?: string;
  termsAndConditions?: string;
  status?: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

export interface IPaymentCreateInput {
  invoiceId?: string;
  customerId?: string;
  amount: number;
  paymentDate?: string | Date;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'CHEQUE' | 'OTHER';
  referenceNumber: string;
  notes?: string;
}

export interface IRefundCreateInput {
  paymentId?: string;
  invoiceId?: string;
  customerId?: string;
  amount: number;
  refundDate?: string | Date;
  reason: string;
  refundMethod?: string;
  referenceNumber: string;
  notes?: string;
}

export interface IFinanceDashboardStats {
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

export interface IProfitLossReport {
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

export interface IGstReport {
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
  | 'on_hold'
  | string;
export type ProjectPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED';
export type TaskPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectMemberRoleType = 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'DEVELOPER' | 'DESIGNER' | 'QA' | 'CONTRIBUTOR' | 'VIEWER';
export type MilestoneStatusType = 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED' | 'MISSED';
export type DocumentCategoryType = 'REQUIREMENTS' | 'DESIGN' | 'SPECIFICATION' | 'CONTRACT' | 'REPORT' | 'ATTACHMENT' | 'OTHER';
export type BusinessEventTypeType = 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'HOLIDAY' | 'COMPANY_EVENT' | 'REVIEW';

export interface IProjectCreateInput {
  name: string;
  description?: string;
  projectManagerId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  budget?: number;
  priority?: ProjectPriorityType;
  status?: ProjectStatusType;
  assignedEmployees?: string[];
  members?: Array<{
    userId: string;
    employeeId?: string;
    name: string;
    email: string;
    role?: ProjectMemberRoleType;
  }>;
  client?: string;
  customerId?: string;
  tags?: string[];
}

export interface IProjectUpdateInput extends Partial<IProjectCreateInput> {
  progress?: number;
  spent?: number;
}

export interface ITaskCreateInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriorityType;
  deadline: string | Date;
  status?: TaskStatusType;
  assignedToId?: string;
  estimatedHours?: number;
  attachments?: Array<{
    name: string;
    url: string;
    fileType: string;
    fileSize?: number;
  }>;
}

export interface ITaskUpdateInput extends Partial<ITaskCreateInput> {
  loggedHours?: number;
  statusNotes?: string;
}

export interface ITaskCommentInput {
  content: string;
  mentions?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    fileType: string;
  }>;
}

export interface IProjectMilestoneInput {
  projectId: string;
  title: string;
  description?: string;
  dueDate: string | Date;
  status?: MilestoneStatusType;
  order?: number;
}

export interface IProjectMilestoneUpdateInput extends Partial<IProjectMilestoneInput> {}

export interface IProjectDocumentInput {
  projectId?: string;
  taskId?: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category?: DocumentCategoryType;
  isPublic?: boolean;
}

export interface IBusinessEventInput {
  title: string;
  description?: string;
  eventType?: BusinessEventTypeType;
  startDate: string | Date;
  endDate: string | Date;
  allDay?: boolean;
  location?: string;
  meetingUrl?: string;
  attendees?: Array<{
    userId?: string;
    name: string;
    email: string;
  }>;
  projectId?: string;
  taskId?: string;
  color?: string;
}

export interface IBusinessEventUpdateInput extends Partial<IBusinessEventInput> {}

export interface IKanbanBoardData {
  projectId: string;
  projectName: string;
  columns: {
    TODO: any[];
    IN_PROGRESS: any[];
    REVIEW: any[];
    COMPLETED: any[];
    BLOCKED: any[];
  };
  totalTasks: number;
}

export interface IProjectTimelineData {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate?: string;
  progress: number;
  milestones: any[];
  tasks: any[];
  events: any[];
}

export interface ISocketNotificationPayload {
  recipientUserId: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ISocketTaskEventPayload {
  taskId: string;
  projectId: string;
  businessId: string;
  fromStatus?: string;
  toStatus: string;
  taskTitle: string;
  updatedBy: string;
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

export interface IPaymentWebhookPayload {
  event: string;
  paymentId: string;
  orderId?: string;
  businessId: string;
  planCode: string;
  amount: number;
  currency: string;
  signature: string;
  timestamp?: number;
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

export interface IBranchDocument extends Document {
  _id: Types.ObjectId;
  businessId: Types.ObjectId;
  code: string;
  name: string;
  type: BranchType;
  managerId?: Types.ObjectId | null;
  address: IBranchAddress;
  contactPhone?: string;
  contactEmail?: string;
  taxNumber?: string;
  isMainBranch: boolean;
  status: BranchStatus;
  operatingHours?: IBranchOperatingHours;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface IPosSessionDocument {
  _id: any;
  businessId: any;
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
  openedAt: Date;
  closedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
}

export interface ISupportTicketDocument {
  _id: any;
  businessId: any;
  customerId: any;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: any;
  messages: ITicketMessage[];
  slaDueAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
}

export interface ICustomerPortalStats {
  totalOrders: number;
  activeOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  pendingQuotesCount: number;
  openTicketsCount: number;
}



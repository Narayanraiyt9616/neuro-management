import mongoose from 'mongoose';
import Business from '../models/Business';
import User from '../models/User';
import Subscription from '../models/Subscription';
import SubscriptionPlan from '../models/SubscriptionPlan';
import ActivityLog from '../models/ActivityLog';
import PlatformSettings from '../models/PlatformSettings';
import resilientAuthStore, { isDbConnected } from './resilientAuthStore';
import emailService from './emailService';
import logger from '../utils/logger';
import {
  IPlatformStats,
  IPlatformSettings,
  IPaymentGatewayIntentInput,
  IPaymentGatewayIntentResult
} from '../types';
import { BusinessRegistrationInput } from '../validators/businessValidator';
import { SubscriptionPlanInput } from '../validators/adminValidator';

// Default pre-seeded 4 subscription plans
export const DEFAULT_PLANS: SubscriptionPlanInput[] = [
  {
    name: 'Free Tier',
    code: 'FREE',
    description: 'Essential business management for single practitioners & sole founders',
    monthlyPrice: 0,
    yearlyPrice: 0,
    employeeLimit: 2,
    storageLimitGb: 1,
    moduleAccess: ['dashboard', 'invoicing'],
    features: ['Up to 2 employees', 'Basic invoicing', '1 GB secure storage', 'Community support'],
    isActive: true
  },
  {
    name: 'Starter Tier',
    code: 'STARTER',
    description: 'Designed for emerging startups and growing boutique teams',
    monthlyPrice: 29,
    yearlyPrice: 290,
    employeeLimit: 10,
    storageLimitGb: 10,
    moduleAccess: ['dashboard', 'invoicing', 'inventory', 'team'],
    features: ['Up to 10 employees', 'Multi-currency invoicing', '10 GB storage', 'Email support', 'Team RBAC'],
    isActive: true
  },
  {
    name: 'Professional Scale',
    code: 'PROFESSIONAL',
    description: 'Comprehensive operations for multi-branch and high-volume commercial entities',
    monthlyPrice: 89,
    yearlyPrice: 890,
    employeeLimit: 50,
    storageLimitGb: 50,
    moduleAccess: ['dashboard', 'invoicing', 'inventory', 'team', 'audit', 'multi-branch'],
    features: ['Up to 50 employees', 'Unlimited invoices', 'Multi-entity branches', '50 GB storage', 'Priority SLA support'],
    isActive: true
  },
  {
    name: 'Enterprise Cloud',
    code: 'ENTERPRISE',
    description: 'Unlimited capacity, customized security controls, and dedicated tenant partitions',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    employeeLimit: 500,
    storageLimitGb: 500,
    moduleAccess: ['dashboard', 'invoicing', 'inventory', 'team', 'audit', 'multi-branch', 'settings', 'api-access'],
    features: ['Up to 500 employees', '500 GB storage', 'Dedicated account manager', 'Custom branding', 'Audit compliance logs', 'Direct REST API keys'],
    isActive: true
  }
];

export const adminService = {
  /**
   * Log an administrative activity to audit trail
   */
  async logActivity(data: {
    action: string;
    description: string;
    module?: 'auth' | 'business' | 'billing' | 'inventory' | 'sales' | 'workforce' | 'settings' | 'system';
    businessId?: string | null;
    userId?: string | null;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    const logData = {
      action: data.action,
      description: data.description,
      module: data.module || 'business',
      businessId: data.businessId ? new mongoose.Types.ObjectId(data.businessId) : null,
      userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : null,
      metadata: data.metadata || {},
      ipAddress: data.ipAddress || null,
      timestamp: new Date()
    };

    if (isDbConnected()) {
      try {
        await ActivityLog.create(logData);
        return;
      } catch (err) {
        logger.warn('Failed saving ActivityLog to Mongo, falling back to resilient store', { error: String(err) });
      }
    }

    resilientAuthStore.addAuditLog({
      ...data,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date()
    });
  },

  /**
   * Get actual overview statistics from database
   */
  async getOverviewStats(): Promise<IPlatformStats> {
    if (isDbConnected()) {
      try {
        const [
          totalBusinesses,
          activeBusinesses,
          pendingBusinesses,
          suspendedBusinesses,
          totalUsers,
          activeSubscriptions,
          expiredSubscriptions,
          revenueAgg
        ] = await Promise.all([
          Business.countDocuments({}),
          Business.countDocuments({ status: { $in: ['ACTIVE', 'active', 'APPROVED', 'approved'] } }),
          Business.countDocuments({ status: { $in: ['PENDING', 'pending', 'trial'] } }),
          Business.countDocuments({ status: { $in: ['SUSPENDED', 'suspended'] } }),
          User.countDocuments({}),
          Subscription.countDocuments({
            status: { $in: ['ACTIVE', 'active', 'trialing', 'TRIALING'] },
            currentPeriodEnd: { $gte: new Date() }
          }),
          Subscription.countDocuments({
            $or: [
              { status: { $in: ['EXPIRED', 'expired', 'canceled', 'past_due', 'CANCELED', 'PAST_DUE'] } },
              { currentPeriodEnd: { $lt: new Date() } }
            ]
          }),
          Subscription.aggregate([
            {
              $match: {
                status: { $in: ['ACTIVE', 'active', 'trialing', 'TRIALING'] }
              }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$price' }
              }
            }
          ])
        ]);

        const recordedPlatformRevenue = revenueAgg[0]?.totalRevenue || 0;

        return {
          totalBusinesses,
          activeBusinesses,
          pendingBusinesses,
          suspendedBusinesses,
          totalUsers,
          activeSubscriptions,
          expiredSubscriptions,
          recordedPlatformRevenue,
          currency: 'USD',
          lastUpdated: new Date().toISOString()
        };
      } catch (err) {
        logger.warn('Failed calculating overview stats via Mongo, using resilient store', { error: String(err) });
      }
    }

    return resilientAuthStore.getOverviewStats();
  },

  /**
   * Register a new business organization (Starts in PENDING status)
   */
  async registerBusiness(
    data: BusinessRegistrationInput,
    clientIp?: string
  ): Promise<any> {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

    let owner = await resilientAuthStore.findUserByEmail(data.ownerEmail);
    if (!owner) {
      owner = await resilientAuthStore.createUser({
        name: data.ownerName,
        email: data.ownerEmail,
        phone: data.phone,
        password: data.password || 'BizNexus2026!',
        role: 'BUSINESS_OWNER'
      });
    }

    let createdBusiness: any;
    let createdSubscription: any;

    if (isDbConnected()) {
      try {
        createdBusiness = await Business.create({
          name: data.name,
          slug: uniqueSlug,
          businessEmail: data.businessEmail,
          contactEmail: data.businessEmail,
          phone: data.phone,
          address: data.address,
          category: data.category,
          industry: data.category,
          registrationNumber: data.registrationNumber,
          gstin: data.gstin || '',
          website: data.website || '',
          description: data.description,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          logo: data.logo || null,
          ownerId: owner._id,
          status: 'PENDING'
        });

        const planPrice = data.planCode === 'ENTERPRISE' ? 199 : data.planCode === 'PROFESSIONAL' ? 89 : data.planCode === 'STARTER' ? 29 : 0;
        createdSubscription = await Subscription.create({
          businessId: createdBusiness._id,
          plan: data.planCode || 'STARTER',
          status: 'TRIALING',
          price: planPrice,
          currency: 'USD',
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });

        createdBusiness.subscriptionId = createdSubscription._id;
        await createdBusiness.save();

        await User.findByIdAndUpdate(owner._id, { businessId: createdBusiness._id });
      } catch (err) {
        logger.warn('Failed saving registered business to Mongo, persisting in resilient store', { error: String(err) });
      }
    }

    if (!createdBusiness) {
      createdBusiness = resilientAuthStore.createFullBusiness({
        ...data,
        slug: uniqueSlug,
        ownerId: owner._id.toString(),
        status: 'PENDING'
      });
    }

    const superAdminEmail = 'superadmin@biznexus.com';
    emailService.sendAdminNewBusinessAlert(superAdminEmail, data.name, data.ownerEmail).catch((e) => {
      logger.error('Failed sending admin alert', e);
    });

    emailService.sendBusinessRegistrationPendingNotification(data.ownerEmail, data.name, data.ownerName).catch((e) => {
      logger.error('Failed sending owner pending notification', e);
    });

    await this.logActivity({
      action: 'business_creation',
      description: `New business entity '${data.name}' registered by ${data.ownerName}. Awaiting Super Admin approval.`,
      module: 'business',
      businessId: createdBusiness._id.toString(),
      userId: owner._id.toString(),
      ipAddress: clientIp,
      metadata: {
        registrationNumber: data.registrationNumber,
        category: data.category,
        planCode: data.planCode
      }
    });

    return createdBusiness;
  },

  /**
   * Get all businesses with search, status filtering and pagination
   */
  async getBusinesses(params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; pagination: any }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      try {
        const query: Record<string, unknown> = {};

        if (params.status && params.status !== 'ALL') {
          query.status = { $in: [params.status, params.status.toLowerCase()] };
        }

        if (params.search && params.search.trim()) {
          const s = params.search.trim();
          query.$or = [
            { name: { $regex: s, $options: 'i' } },
            { businessEmail: { $regex: s, $options: 'i' } },
            { registrationNumber: { $regex: s, $options: 'i' } },
            { gstin: { $regex: s, $options: 'i' } },
            { category: { $regex: s, $options: 'i' } },
            { ownerEmail: { $regex: s, $options: 'i' } }
          ];
        }

        const [items, total] = await Promise.all([
          Business.find(query)
            .populate('ownerId', 'name email phone avatar')
            .populate('subscriptionId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Business.countDocuments(query)
        ]);

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (err) {
        logger.warn('Failed querying businesses via Mongo, using resilient store', { error: String(err) });
      }
    }

    return resilientAuthStore.getBusinesses(params);
  },

  /**
   * Get single business details with owner, subscription and activity logs
   */
  async getBusinessById(id: string): Promise<any> {
    if (isDbConnected()) {
      try {
        const business = await Business.findById(id)
          .populate('ownerId', 'name email phone role status avatar')
          .populate('subscriptionId')
          .lean();

        if (business) {
          const recentLogs = await ActivityLog.find({ businessId: id })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

          return { ...business, recentLogs };
        }
      } catch (err) {
        logger.warn('Failed querying business by ID via Mongo', { error: String(err) });
      }
    }

    return resilientAuthStore.getBusinessById(id);
  },

  /**
   * Super Admin approves business -> Sets status to APPROVED / ACTIVE
   */
  async approveBusiness(id: string, adminUser: { email: string; userId: string }): Promise<any> {
    let updated: any;

    if (isDbConnected()) {
      try {
        updated = await Business.findByIdAndUpdate(
          id,
          {
            status: 'ACTIVE',
            approvedAt: new Date(),
            rejectionReason: null
          },
          { new: true }
        ).populate('ownerId');

        if (updated?.subscriptionId) {
          await Subscription.findByIdAndUpdate(updated.subscriptionId, {
            status: 'ACTIVE'
          });
        }
      } catch (err) {
        logger.warn('Failed approving business via Mongo', { error: String(err) });
      }
    }

    if (!updated) {
      updated = resilientAuthStore.updateBusinessStatus(id, 'ACTIVE');
    }

    if (!updated) {
      throw new Error('Business not found');
    }

    const ownerEmail = updated.ownerEmail || updated.ownerId?.email || updated.contactEmail;
    const ownerName = updated.ownerName || updated.ownerId?.name || 'Business Owner';
    emailService.sendBusinessApprovalNotification(ownerEmail, updated.name, ownerName).catch((e) => {
      logger.error('Failed sending approval notification', e);
    });

    await this.logActivity({
      action: 'business_approval',
      description: `Business '${updated.name}' was approved and activated by Super Admin (${adminUser.email}).`,
      module: 'business',
      businessId: id,
      userId: adminUser.userId,
      metadata: { approvedBy: adminUser.email }
    });

    return updated;
  },

  /**
   * Super Admin rejects business -> Sets status to REJECTED with reason
   */
  async rejectBusiness(id: string, reason: string, adminUser: { email: string; userId: string }): Promise<any> {
    let updated: any;

    if (isDbConnected()) {
      try {
        updated = await Business.findByIdAndUpdate(
          id,
          {
            status: 'REJECTED',
            rejectionReason: reason,
            rejectedAt: new Date()
          },
          { new: true }
        ).populate('ownerId');
      } catch (err) {
        logger.warn('Failed rejecting business via Mongo', { error: String(err) });
      }
    }

    if (!updated) {
      updated = resilientAuthStore.updateBusinessStatus(id, 'REJECTED', reason);
    }

    if (!updated) {
      throw new Error('Business not found');
    }

    const ownerEmail = updated.ownerEmail || updated.ownerId?.email || updated.contactEmail;
    const ownerName = updated.ownerName || updated.ownerId?.name || 'Business Owner';
    emailService.sendBusinessRejectionNotification(ownerEmail, updated.name, reason, ownerName).catch((e) => {
      logger.error('Failed sending rejection notification', e);
    });

    await this.logActivity({
      action: 'business_rejection',
      description: `Business '${updated.name}' was rejected by Super Admin (${adminUser.email}). Reason: ${reason}`,
      module: 'business',
      businessId: id,
      userId: adminUser.userId,
      metadata: { reason, rejectedBy: adminUser.email }
    });

    return updated;
  },

  /**
   * Super Admin suspends business
   */
  async suspendBusiness(id: string, reason: string, adminUser: { email: string; userId: string }): Promise<any> {
    let updated: any;

    if (isDbConnected()) {
      try {
        updated = await Business.findByIdAndUpdate(
          id,
          {
            status: 'SUSPENDED',
            suspensionReason: reason,
            suspendedAt: new Date()
          },
          { new: true }
        );

        if (updated?.subscriptionId) {
          await Subscription.findByIdAndUpdate(updated.subscriptionId, { status: 'PAST_DUE' });
        }
      } catch (err) {
        logger.warn('Failed suspending business via Mongo', { error: String(err) });
      }
    }

    if (!updated) {
      updated = resilientAuthStore.updateBusinessStatus(id, 'SUSPENDED', reason);
    }

    if (!updated) {
      throw new Error('Business not found');
    }

    const ownerEmail = updated.ownerEmail || updated.contactEmail;
    const ownerName = updated.ownerName || 'Business Owner';
    if (ownerEmail) {
      emailService.sendBusinessSuspensionNotification(ownerEmail, updated.name, reason, ownerName).catch((e) => {
        logger.error('Failed sending suspension notification', e);
      });
    }

    await this.logActivity({
      action: 'business_suspension',
      description: `Business '${updated.name}' was suspended by Super Admin (${adminUser.email}). Reason: ${reason}`,
      module: 'business',
      businessId: id,
      userId: adminUser.userId,
      metadata: { reason, suspendedBy: adminUser.email }
    });

    return updated;
  },

  /**
   * Super Admin reactivates business
   */
  async reactivateBusiness(id: string, adminUser: { email: string; userId: string }): Promise<any> {
    let updated: any;

    if (isDbConnected()) {
      try {
        updated = await Business.findByIdAndUpdate(
          id,
          {
            status: 'ACTIVE',
            suspensionReason: null
          },
          { new: true }
        );
      } catch (err) {
        logger.warn('Failed reactivating business via Mongo', { error: String(err) });
      }
    }

    if (!updated) {
      updated = resilientAuthStore.updateBusinessStatus(id, 'ACTIVE');
    }

    if (!updated) {
      throw new Error('Business not found');
    }

    await this.logActivity({
      action: 'business_reactivation',
      description: `Business '${updated.name}' was reactivated by Super Admin (${adminUser.email}).`,
      module: 'business',
      businessId: id,
      userId: adminUser.userId
    });

    return updated;
  },

  /**
   * Super Admin edits business information
   */
  async editBusiness(id: string, updates: Record<string, unknown>, adminUser: { email: string; userId: string }): Promise<any> {
    let updated: any;

    if (isDbConnected()) {
      try {
        updated = await Business.findByIdAndUpdate(id, updates, { new: true });
      } catch (err) {
        logger.warn('Failed updating business via Mongo', { error: String(err) });
      }
    }

    if (!updated) {
      updated = resilientAuthStore.updateBusinessFields(id, updates);
    }

    if (!updated) {
      throw new Error('Business not found');
    }

    await this.logActivity({
      action: 'business_updated',
      description: `Business details for '${updated.name}' were updated by Super Admin (${adminUser.email}).`,
      module: 'business',
      businessId: id,
      userId: adminUser.userId,
      metadata: updates
    });

    return updated;
  },

  /**
   * Subscription Plans: Get 4 standard plans
   */
  async getSubscriptionPlans(): Promise<any[]> {
    if (isDbConnected()) {
      try {
        let plans = await SubscriptionPlan.find({}).sort({ monthlyPrice: 1 }).lean();
        if (!plans || plans.length === 0) {
          await SubscriptionPlan.insertMany(DEFAULT_PLANS);
          plans = await SubscriptionPlan.find({}).sort({ monthlyPrice: 1 }).lean();
        }
        return plans;
      } catch (err) {
        logger.warn('Failed querying plans via Mongo, using default plans', { error: String(err) });
      }
    }

    return resilientAuthStore.getSubscriptionPlans();
  },

  /**
   * Subscription Plans: Create new or custom plan
   */
  async createSubscriptionPlan(data: SubscriptionPlanInput, adminUser: { email: string; userId: string }): Promise<any> {
    let created: any;

    if (isDbConnected()) {
      try {
        created = await SubscriptionPlan.create(data);
      } catch (err) {
        logger.warn('Failed creating plan via Mongo', { error: String(err) });
      }
    }

    if (!created) {
      created = resilientAuthStore.addSubscriptionPlan(data);
    }

    await this.logActivity({
      action: 'subscription_plan_created',
      description: `Subscription plan '${data.name}' (${data.code}) created by Super Admin (${adminUser.email}).`,
      module: 'billing',
      userId: adminUser.userId,
      metadata: data
    });

    return created;
  },

  /**
   * Subscription Plans: Edit pricing, limits, or modules
   */
  async updateSubscriptionPlan(
    id: string,
    data: Partial<SubscriptionPlanInput>,
    adminUser: { email: string; userId: string }
  ): Promise<any> {
    let updated: any;

    if (isDbConnected()) {
      try {
        updated = await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true });
      } catch (err) {
        logger.warn('Failed updating plan via Mongo', { error: String(err) });
      }
    }

    if (!updated) {
      updated = resilientAuthStore.updateSubscriptionPlan(id, data);
    }

    if (!updated) {
      throw new Error('Subscription plan not found');
    }

    await this.logActivity({
      action: 'subscription_plan_updated',
      description: `Subscription plan '${updated.name}' modified by Super Admin (${adminUser.email}).`,
      module: 'billing',
      userId: adminUser.userId,
      metadata: data
    });

    return updated;
  },

  /**
   * List all business subscriptions with renewal & expiration status
   */
  async getSubscriptions(params: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; pagination: any }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      try {
        const query: Record<string, unknown> = {};
        if (params.status && params.status !== 'ALL') {
          query.status = { $in: [params.status, params.status.toLowerCase(), params.status.toUpperCase()] };
        }

        const [items, total] = await Promise.all([
          Subscription.find(query)
            .populate('businessId', 'name slug category status ownerEmail')
            .sort({ currentPeriodEnd: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Subscription.countDocuments(query)
        ]);

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (err) {
        logger.warn('Failed querying subscriptions via Mongo', { error: String(err) });
      }
    }

    return resilientAuthStore.getSubscriptions(params);
  },

  /**
   * Prepare payment gateway integration architecture (Razorpay / Stripe)
   */
  async createPaymentGatewayIntent(
    data: IPaymentGatewayIntentInput
  ): Promise<IPaymentGatewayIntentResult> {
    const plans = await this.getSubscriptionPlans();
    const plan = plans.find((p: any) => p.code === data.planCode);
    const price = data.billingCycle === 'annual' ? (plan?.yearlyPrice || 0) : (plan?.monthlyPrice || 0);

    const orderId = `${data.provider === 'stripe' ? 'pi_' : 'order_'}${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const clientSecret = `${orderId}_secret_${Math.random().toString(36).substring(2, 10)}`;
    const keyId = data.provider === 'stripe' ? 'pk_test_biznexus_enterprise_live' : 'rzp_test_biznexus_enterprise_live';

    logger.info(`[PAYMENT GATEWAY ARCHITECTURE] Prepared intent for business ${data.businessId}: ${orderId} (${data.provider.toUpperCase()} $${price})`);

    return {
      orderId,
      provider: data.provider,
      amount: price,
      currency: 'USD',
      planCode: data.planCode,
      businessId: data.businessId,
      clientSecret,
      keyId,
      webhookEndpoint: `/api/billing/webhook/${data.provider}`,
      mockGatewayActive: true,
      instructions: `Cryptographic payment intent created for ${data.provider.toUpperCase()}. Frontend client initiates payment modal. Webhook verifies signature.`
    };
  },

  /**
   * Super Admin User Management: List all platform users with search & filters
   */
  async getUsers(params: {
    search?: string;
    role?: string;
    businessId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; pagination: any }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      try {
        const query: Record<string, unknown> = {};

        if (params.role && params.role !== 'ALL') {
          query.role = params.role.toUpperCase();
        }

        if (params.businessId && params.businessId !== 'ALL') {
          query.businessId = new mongoose.Types.ObjectId(params.businessId);
        }

        if (params.search && params.search.trim()) {
          const s = params.search.trim();
          query.$or = [
            { name: { $regex: s, $options: 'i' } },
            { email: { $regex: s, $options: 'i' } },
            { phone: { $regex: s, $options: 'i' } }
          ];
        }

        const [items, total] = await Promise.all([
          User.find(query)
            .select('-password')
            .populate('businessId', 'name slug status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          User.countDocuments(query)
        ]);

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (err) {
        logger.warn('Failed querying users via Mongo', { error: String(err) });
      }
    }

    return resilientAuthStore.getUsers(params);
  },

  /**
   * Super Admin User Management: Activate, Deactivate, or Suspend account
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended',
    adminUser: { email: string; userId: string }
  ): Promise<any> {
    let updated: any;

    if (isDbConnected()) {
      try {
        updated = await User.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
      } catch (err) {
        logger.warn('Failed updating user status via Mongo', { error: String(err) });
      }
    }

    if (!updated) {
      updated = resilientAuthStore.updateUserStatus(userId, status);
    }

    if (!updated) {
      throw new Error('User not found');
    }

    await this.logActivity({
      action: 'user_account_status_changed',
      description: `Account status for user '${updated.email}' changed to '${status}' by Super Admin (${adminUser.email}).`,
      module: 'workforce',
      userId: adminUser.userId,
      metadata: { targetUser: updated.email, newStatus: status }
    });

    return updated;
  },

  /**
   * Audit Logs: Retrieve filterable and searchable administrative logs
   */
  async getAuditLogs(params: {
    module?: string;
    action?: string;
    businessId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; pagination: any }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      try {
        const query: Record<string, unknown> = {};

        if (params.module && params.module !== 'ALL') {
          query.module = params.module;
        }

        if (params.action && params.action.trim()) {
          query.action = { $regex: params.action.trim(), $options: 'i' };
        }

        if (params.businessId && params.businessId !== 'ALL') {
          query.businessId = new mongoose.Types.ObjectId(params.businessId);
        }

        const [items, total] = await Promise.all([
          ActivityLog.find(query)
            .populate('userId', 'name email role')
            .populate('businessId', 'name slug')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          ActivityLog.countDocuments(query)
        ]);

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (err) {
        logger.warn('Failed querying audit logs via Mongo', { error: String(err) });
      }
    }

    return resilientAuthStore.getAuditLogs(params);
  },

  /**
   * Admin Settings: Get platform configuration
   */
  async getPlatformSettings(): Promise<IPlatformSettings> {
    if (isDbConnected()) {
      try {
        let settings: any = await PlatformSettings.findOne({}).lean();
        if (!settings) {
          const created = await PlatformSettings.create({});
          settings = created.toObject();
        }
        return settings as unknown as IPlatformSettings;
      } catch (err) {
        logger.warn('Failed querying settings via Mongo', { error: String(err) });
      }
    }

    return resilientAuthStore.getPlatformSettings();
  },

  /**
   * Admin Settings: Update platform configuration
   */
  async updatePlatformSettings(
    data: Partial<IPlatformSettings>,
    adminUser: { email: string; userId: string }
  ): Promise<IPlatformSettings> {
    let updated: any;

    if (isDbConnected()) {
      try {
        updated = await PlatformSettings.findOneAndUpdate(
          {},
          { $set: data },
          { new: true, upsert: true }
        ).lean();
      } catch (err) {
        logger.warn('Failed updating settings via Mongo', { error: String(err) });
      }
    }

    if (!updated) {
      updated = resilientAuthStore.updatePlatformSettings(data);
    }

    await this.logActivity({
      action: 'platform_settings_updated',
      description: `Platform administration settings updated by Super Admin (${adminUser.email}).`,
      module: 'settings',
      userId: adminUser.userId,
      metadata: data
    });

    return updated as IPlatformSettings;
  }
};

export default adminService;

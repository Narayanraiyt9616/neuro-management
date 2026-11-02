import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Business from '../models/Business';
import Subscription from '../models/Subscription';
import SubscriptionPlan from '../models/SubscriptionPlan';
import ActivityLog from '../models/ActivityLog';
import PlatformSettings from '../models/PlatformSettings';
import PasswordResetToken from '../models/PasswordResetToken';
import logger from '../utils/logger';
import { UserRole, IPlatformStats, IPlatformSettings } from '../types';
import { DEFAULT_PLANS } from './adminService';

export interface IInMemoryUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // bcrypt hashed
  role: UserRole;
  avatar: string | null;
  businessId: string | null;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidate: string) => Promise<boolean>;
}

export interface IInMemoryBusiness {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  industry: string;
  category?: string;
  currency: string;
  status: string;
  subscriptionId?: string;
  businessEmail?: string;
  phone?: string;
  registrationNumber?: string;
  gstin?: string;
  website?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  logo?: string | null;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  suspendedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInMemorySubscription {
  _id: string;
  businessId: string;
  plan: string;
  status: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  currentPeriodEnd: Date;
  createdAt: Date;
}

export interface IInMemoryAuditLog {
  _id: string;
  action: string;
  description: string;
  module: string;
  businessId?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  timestamp: Date;
}

export interface IInMemoryResetToken {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const DEFAULT_DEMO_BUSINESS_ID = '60d0fe4f5311236168a109ca';
const SECOND_DEMO_BUSINESS_ID = '60d0fe4f5311236168a109cb';
const THIRD_PENDING_BUSINESS_ID = '60d0fe4f5311236168a109cc';

const demoBusinesses: Map<string, IInMemoryBusiness> = new Map([
  [
    DEFAULT_DEMO_BUSINESS_ID,
    {
      _id: DEFAULT_DEMO_BUSINESS_ID,
      name: 'Nexus Technologies Inc.',
      slug: 'nexus-technologies',
      ownerId: '60d0fe4f5311236168a109c2',
      industry: 'Enterprise Software & Cloud Platforms',
      category: 'Information Technology',
      currency: 'USD',
      status: 'ACTIVE',
      subscriptionId: 'sub_001',
      businessEmail: 'contact@nexuscorp.com',
      phone: '+1 (555) 200-0002',
      registrationNumber: 'US-DEL-984210',
      gstin: 'GSTIN-994821',
      website: 'https://nexuscorp.io',
      description: 'Global multi-branch cloud infrastructure and managed services.',
      ownerName: 'Eleanor Sterling',
      ownerEmail: 'owner@nexuscorp.com',
      approvedAt: new Date('2026-01-05'),
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    }
  ],
  [
    SECOND_DEMO_BUSINESS_ID,
    {
      _id: SECOND_DEMO_BUSINESS_ID,
      name: 'Apex Innovations Ltd.',
      slug: 'apex-innovations',
      ownerId: '60d0fe4f5311236168a109cf',
      industry: 'Logistics & Supply Chain',
      category: 'Supply Chain',
      currency: 'EUR',
      status: 'ACTIVE',
      subscriptionId: 'sub_002',
      businessEmail: 'ops@apex-innovations.eu',
      phone: '+33 1 42 68 55 00',
      registrationNumber: 'EU-FR-771892',
      gstin: 'FR-VAT-884129',
      website: 'https://apex-innovations.eu',
      description: 'Pan-European freight forwarding and cold chain fulfillment logistics.',
      ownerName: 'Henri Laurent',
      ownerEmail: 'henri@apex-innovations.eu',
      approvedAt: new Date('2026-01-10'),
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    }
  ],
  [
    THIRD_PENDING_BUSINESS_ID,
    {
      _id: THIRD_PENDING_BUSINESS_ID,
      name: 'Vanguard Aerospace Dynamics',
      slug: 'vanguard-aerospace',
      ownerId: '60d0fe4f5311236168a109c2',
      industry: 'Aerospace Engineering',
      category: 'Manufacturing',
      currency: 'USD',
      status: 'PENDING',
      subscriptionId: 'sub_003',
      businessEmail: 'apply@vanguard-aero.com',
      phone: '+1 (555) 888-9999',
      registrationNumber: 'US-CAL-104928',
      gstin: 'US-EIN-992104',
      website: 'https://vanguard-aero.com',
      description: 'Commercial satellite component manufacturing and propulsion assemblies.',
      ownerName: 'Julian Montgomery',
      ownerEmail: 'julian@vanguard-aero.com',
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-01')
    }
  ]
]);

const demoSubscriptions: Map<string, IInMemorySubscription> = new Map([
  [
    'sub_001',
    {
      _id: 'sub_001',
      businessId: DEFAULT_DEMO_BUSINESS_ID,
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      price: 199,
      currency: 'USD',
      billingCycle: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2026-01-01')
    }
  ],
  [
    'sub_002',
    {
      _id: 'sub_002',
      businessId: SECOND_DEMO_BUSINESS_ID,
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      price: 89,
      currency: 'USD',
      billingCycle: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2026-01-01')
    }
  ],
  [
    'sub_003',
    {
      _id: 'sub_003',
      businessId: THIRD_PENDING_BUSINESS_ID,
      plan: 'STARTER',
      status: 'TRIALING',
      price: 29,
      currency: 'USD',
      billingCycle: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2026-02-01')
    }
  ]
]);

const demoPlans: Map<string, any> = new Map();
DEFAULT_PLANS.forEach((p, idx) => {
  const planId = `plan_${p.code.toLowerCase()}`;
  demoPlans.set(planId, { _id: planId, ...p, createdAt: new Date(), updatedAt: new Date() });
});

const demoAuditLogs: IInMemoryAuditLog[] = [
  {
    _id: 'log_seed_001',
    action: 'business_creation',
    description: "New business entity 'Nexus Technologies Inc.' registered. Awaiting Super Admin approval.",
    module: 'business',
    businessId: DEFAULT_DEMO_BUSINESS_ID,
    userId: '60d0fe4f5311236168a109c1',
    timestamp: new Date('2026-01-01T10:00:00Z')
  },
  {
    _id: 'log_seed_002',
    action: 'business_approval',
    description: "Business 'Nexus Technologies Inc.' was approved and activated by Super Admin.",
    module: 'business',
    businessId: DEFAULT_DEMO_BUSINESS_ID,
    userId: '60d0fe4f5311236168a109c1',
    timestamp: new Date('2026-01-05T12:00:00Z')
  },
  {
    _id: 'log_seed_003',
    action: 'subscription_plan_created',
    description: "Default subscription tier plans (FREE, STARTER, PROFESSIONAL, ENTERPRISE) initialized.",
    module: 'billing',
    userId: '60d0fe4f5311236168a109c1',
    timestamp: new Date('2026-01-01T08:00:00Z')
  }
];

let demoPlatformSettings: IPlatformSettings = {
  platformName: 'BizNexus Enterprise',
  logo: null,
  general: {
    supportEmail: 'support@biznexus.com',
    contactPhone: '+1 (800) 555-BIZN',
    defaultTimezone: 'UTC',
    maintenanceMode: false
  },
  email: {
    smtpHost: 'smtp.biznexus.com',
    smtpPort: 587,
    smtpUser: 'notifications@biznexus.com',
    smtpFrom: 'BizNexus Cloud <notifications@biznexus.com>',
    secure: true
  },
  security: {
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    lockDurationMinutes: 15,
    requireMfa: false
  },
  subscription: {
    freeTrialDays: 14,
    defaultCurrency: 'USD',
    taxPercentage: 18,
    invoicePrefix: 'BNX-'
  }
};

const memoryUsers: Map<string, IInMemoryUser> = new Map();
const memoryTokens: Map<string, IInMemoryResetToken> = new Map();

let memoryInitialized = false;

export const initMemoryStore = async (): Promise<void> => {
  if (memoryInitialized) return;

  const defaultPasswordHash = await bcrypt.hash('BizNexus2026!', 10);

  const seedUsers: Array<Omit<IInMemoryUser, 'comparePassword'>> = [
    {
      _id: '60d0fe4f5311236168a109c1',
      name: 'Alexander Vance',
      email: 'superadmin@biznexus.com',
      phone: '+1 (555) 100-0001',
      password: defaultPasswordHash,
      role: 'SUPER_ADMIN',
      avatar: null,
      businessId: null,
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      _id: '60d0fe4f5311236168a109c2',
      name: 'Eleanor Sterling',
      email: 'owner@nexuscorp.com',
      phone: '+1 (555) 200-0002',
      password: defaultPasswordHash,
      role: 'BUSINESS_OWNER',
      avatar: null,
      businessId: DEFAULT_DEMO_BUSINESS_ID,
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      _id: '60d0fe4f5311236168a109c3',
      name: 'Marcus Thorne',
      email: 'manager@nexuscorp.com',
      phone: '+1 (555) 300-0003',
      password: defaultPasswordHash,
      role: 'MANAGER',
      avatar: null,
      businessId: DEFAULT_DEMO_BUSINESS_ID,
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      _id: '60d0fe4f5311236168a109c4',
      name: 'Sophia Lin',
      email: 'employee@nexuscorp.com',
      phone: '+1 (555) 400-0004',
      password: defaultPasswordHash,
      role: 'EMPLOYEE',
      avatar: null,
      businessId: DEFAULT_DEMO_BUSINESS_ID,
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      _id: '60d0fe4f5311236168a109c5',
      name: 'David Miller',
      email: 'customer@clientco.com',
      phone: '+1 (555) 500-0005',
      password: defaultPasswordHash,
      role: 'CUSTOMER',
      avatar: null,
      businessId: DEFAULT_DEMO_BUSINESS_ID,
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      _id: '60d0fe4f5311236168a109c6',
      name: 'Suspended Member',
      email: 'suspended@nexuscorp.com',
      phone: '+1 (555) 999-0000',
      password: defaultPasswordHash,
      role: 'EMPLOYEE',
      avatar: null,
      businessId: DEFAULT_DEMO_BUSINESS_ID,
      status: 'suspended',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    }
  ];

  for (const u of seedUsers) {
    memoryUsers.set(u.email.toLowerCase(), {
      ...u,
      comparePassword: async (candidate: string) => bcrypt.compare(candidate, u.password)
    });
  }

  memoryInitialized = true;
  logger.info('[RESILIENT STORE] In-memory authentication repository initialized with 5 core roles.');
};

void initMemoryStore();

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const resilientAuthStore = {
  isDbConnected,

  async findUserByEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (isDbConnected()) {
      try {
        const doc = await User.findOne({ email: cleanEmail });
        if (doc) return doc;
      } catch (err) {
        logger.warn('Failed querying User via Mongo, falling back to resilient store', { error: String(err) });
      }
    }
    await initMemoryStore();
    return memoryUsers.get(cleanEmail) || null;
  },

  async findUserById(id: string) {
    if (isDbConnected()) {
      try {
        const doc = await User.findById(id);
        if (doc) return doc;
      } catch (err) {
        logger.warn('Failed querying User by ID via Mongo, falling back to resilient store', { error: String(err) });
      }
    }
    await initMemoryStore();
    for (const u of memoryUsers.values()) {
      if (u._id === id) return u;
    }
    return null;
  },

  async createUser(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    businessId?: string | null;
  }) {
    const cleanEmail = data.email.trim().toLowerCase();
    if (isDbConnected()) {
      try {
        const user = new User({
          name: data.name,
          email: cleanEmail,
          phone: data.phone,
          password: data.password,
          role: data.role,
          businessId: data.businessId || null,
          status: 'active'
        });
        await user.save();
        return user;
      } catch (err) {
        logger.warn('Failed saving User in Mongo, persisting in resilient store', { error: String(err) });
      }
    }

    await initMemoryStore();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newId = new mongoose.Types.ObjectId().toString();
    const newUser: IInMemoryUser = {
      _id: newId,
      name: data.name,
      email: cleanEmail,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
      avatar: null,
      businessId: data.businessId || null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async (candidate: string) => bcrypt.compare(candidate, hashedPassword)
    };
    memoryUsers.set(cleanEmail, newUser);
    return newUser;
  },

  async updateUser(
    id: string,
    updates: Partial<{
      name: string;
      phone: string;
      avatar: string | null;
      password: string;
      lastLoginAt: Date;
    }>
  ) {
    if (isDbConnected()) {
      try {
        const doc = await User.findById(id);
        if (doc) {
          if (updates.name !== undefined) doc.name = updates.name;
          if (updates.phone !== undefined) doc.phone = updates.phone;
          if (updates.avatar !== undefined) doc.avatar = updates.avatar;
          if (updates.lastLoginAt !== undefined) doc.lastLoginAt = updates.lastLoginAt;
          if (updates.password) {
            doc.password = updates.password;
          }
          await doc.save();
          return doc;
        }
      } catch (err) {
        logger.warn('Failed updating user in Mongo, falling back to resilient store', { error: String(err) });
      }
    }

    await initMemoryStore();
    for (const [emailKey, u] of memoryUsers.entries()) {
      if (u._id === id) {
        if (updates.name !== undefined) u.name = updates.name;
        if (updates.phone !== undefined) u.phone = updates.phone;
        if (updates.avatar !== undefined) u.avatar = updates.avatar;
        if (updates.lastLoginAt !== undefined) u.lastLoginAt = updates.lastLoginAt;
        if (updates.password) {
          u.password = await bcrypt.hash(updates.password, 10);
          u.comparePassword = async (candidate: string) => bcrypt.compare(candidate, u.password);
        }
        u.updatedAt = new Date();
        memoryUsers.set(emailKey, u);
        return u;
      }
    }
    return null;
  },

  async findBusinessById(id: string) {
    if (isDbConnected()) {
      try {
        const doc = await Business.findById(id);
        if (doc) return doc;
      } catch (err) {
        logger.warn('Failed querying Business by ID in Mongo', { error: String(err) });
      }
    }
    return demoBusinesses.get(id) || null;
  },

  async createBusiness(data: {
    name: string;
    slug: string;
    ownerId: string;
    industry?: string;
    currency?: string;
  }) {
    if (isDbConnected()) {
      try {
        const biz = await Business.create({
          name: data.name,
          slug: data.slug,
          ownerId: data.ownerId,
          industry: data.industry || 'Enterprise Software & Services',
          currency: data.currency || 'USD',
          status: 'PENDING'
        });
        const sub = await Subscription.create({
          businessId: biz._id,
          plan: 'STARTER',
          status: 'TRIALING',
          price: 29,
          currency: 'USD'
        });
        biz.subscriptionId = sub._id;
        await biz.save();
        return biz;
      } catch (err) {
        logger.warn('Failed creating business in Mongo, persisting in resilient store', { error: String(err) });
      }
    }

    const newBizId = new mongoose.Types.ObjectId().toString();
    const newBiz: IInMemoryBusiness = {
      _id: newBizId,
      name: data.name,
      slug: data.slug,
      ownerId: data.ownerId,
      industry: data.industry || 'Enterprise Software & Services',
      currency: data.currency || 'USD',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    demoBusinesses.set(newBizId, newBiz);
    return newBiz;
  },

  createFullBusiness(data: any): IInMemoryBusiness {
    const newBizId = new mongoose.Types.ObjectId().toString();
    const newSubId = `sub_${Date.now().toString(36)}`;
    const newBiz: IInMemoryBusiness = {
      _id: newBizId,
      name: data.name,
      slug: data.slug,
      ownerId: data.ownerId,
      industry: data.category || 'Technology',
      category: data.category,
      currency: 'USD',
      status: data.status || 'PENDING',
      subscriptionId: newSubId,
      businessEmail: data.businessEmail,
      phone: data.phone,
      registrationNumber: data.registrationNumber,
      gstin: data.gstin,
      website: data.website,
      description: data.description,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      logo: data.logo,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    demoBusinesses.set(newBizId, newBiz);

    demoSubscriptions.set(newSubId, {
      _id: newSubId,
      businessId: newBizId,
      plan: data.planCode || 'STARTER',
      status: 'TRIALING',
      price: data.planCode === 'ENTERPRISE' ? 199 : 29,
      currency: 'USD',
      billingCycle: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    });

    return newBiz;
  },

  getOverviewStats(): IPlatformStats {
    let totalBusinesses = 0;
    let activeBusinesses = 0;
    let pendingBusinesses = 0;
    let suspendedBusinesses = 0;

    for (const b of demoBusinesses.values()) {
      totalBusinesses++;
      const s = b.status.toUpperCase();
      if (s === 'ACTIVE' || s === 'APPROVED') activeBusinesses++;
      else if (s === 'PENDING' || s === 'TRIAL') pendingBusinesses++;
      else if (s === 'SUSPENDED') suspendedBusinesses++;
    }

    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;
    let recordedPlatformRevenue = 0;

    for (const sub of demoSubscriptions.values()) {
      const s = sub.status.toUpperCase();
      if (s === 'ACTIVE' || s === 'TRIALING') {
        activeSubscriptions++;
        recordedPlatformRevenue += sub.price;
      } else {
        expiredSubscriptions++;
      }
    }

    return {
      totalBusinesses,
      activeBusinesses,
      pendingBusinesses,
      suspendedBusinesses,
      totalUsers: memoryUsers.size,
      activeSubscriptions,
      expiredSubscriptions,
      recordedPlatformRevenue,
      currency: 'USD',
      lastUpdated: new Date().toISOString()
    };
  },

  getBusinesses(params: { search?: string; status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));

    let list = Array.from(demoBusinesses.values());

    if (params.status && params.status !== 'ALL') {
      const target = params.status.toUpperCase();
      list = list.filter((b) => b.status.toUpperCase() === target);
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(s) ||
          (b.businessEmail && b.businessEmail.toLowerCase().includes(s)) ||
          (b.registrationNumber && b.registrationNumber.toLowerCase().includes(s)) ||
          (b.category && b.category.toLowerCase().includes(s))
      );
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit).map((b) => {
      const sub = b.subscriptionId ? demoSubscriptions.get(b.subscriptionId) : null;
      return {
        ...b,
        subscriptionId: sub
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  getBusinessById(id: string) {
    const biz = demoBusinesses.get(id);
    if (!biz) return null;
    const sub = biz.subscriptionId ? demoSubscriptions.get(biz.subscriptionId) : null;
    const recentLogs = demoAuditLogs.filter((l) => l.businessId === id).slice(0, 10);
    return {
      ...biz,
      subscriptionId: sub,
      recentLogs
    };
  },

  updateBusinessStatus(id: string, status: string, reason?: string) {
    const biz = demoBusinesses.get(id);
    if (!biz) return null;
    biz.status = status.toUpperCase();
    if (status.toUpperCase() === 'APPROVED' || status.toUpperCase() === 'ACTIVE') {
      biz.approvedAt = new Date();
      biz.rejectionReason = null;
      if (biz.subscriptionId) {
        const sub = demoSubscriptions.get(biz.subscriptionId);
        if (sub) sub.status = 'ACTIVE';
      }
    } else if (status.toUpperCase() === 'REJECTED') {
      biz.rejectionReason = reason || null;
      biz.rejectedAt = new Date();
    } else if (status.toUpperCase() === 'SUSPENDED') {
      biz.suspensionReason = reason || null;
      biz.suspendedAt = new Date();
      if (biz.subscriptionId) {
        const sub = demoSubscriptions.get(biz.subscriptionId);
        if (sub) sub.status = 'PAST_DUE';
      }
    }
    biz.updatedAt = new Date();
    demoBusinesses.set(id, biz);
    return biz;
  },

  updateBusinessFields(id: string, updates: Record<string, unknown>) {
    const biz = demoBusinesses.get(id);
    if (!biz) return null;
    Object.assign(biz, updates);
    biz.updatedAt = new Date();
    demoBusinesses.set(id, biz);
    return biz;
  },

  getSubscriptionPlans() {
    return Array.from(demoPlans.values());
  },

  addSubscriptionPlan(data: any) {
    const newId = `plan_${data.code.toLowerCase()}`;
    const newPlan = { _id: newId, ...data, createdAt: new Date(), updatedAt: new Date() };
    demoPlans.set(newId, newPlan);
    return newPlan;
  },

  updateSubscriptionPlan(id: string, data: any) {
    const plan = demoPlans.get(id);
    if (!plan) return null;
    Object.assign(plan, data);
    plan.updatedAt = new Date();
    demoPlans.set(id, plan);
    return plan;
  },

  getSubscriptions(params: { status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));

    let list = Array.from(demoSubscriptions.values());
    if (params.status && params.status !== 'ALL') {
      const s = params.status.toUpperCase();
      list = list.filter((item) => item.status.toUpperCase() === s);
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit).map((sub) => {
      const biz = demoBusinesses.get(sub.businessId);
      return {
        ...sub,
        businessId: biz ? { name: biz.name, slug: biz.slug, category: biz.category } : null
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  getUsers(params: { search?: string; role?: string; businessId?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));

    let list = Array.from(memoryUsers.values());

    if (params.role && params.role !== 'ALL') {
      const r = params.role.toUpperCase();
      list = list.filter((u) => u.role.toUpperCase() === r);
    }

    if (params.businessId && params.businessId !== 'ALL') {
      list = list.filter((u) => u.businessId === params.businessId);
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim().toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit).map((u) => {
      const biz = u.businessId ? demoBusinesses.get(u.businessId) : null;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        businessId: biz ? { _id: biz._id, name: biz.name, slug: biz.slug } : null,
        createdAt: u.createdAt
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended') {
    for (const [key, u] of memoryUsers.entries()) {
      if (u._id === userId) {
        u.status = status;
        u.updatedAt = new Date();
        memoryUsers.set(key, u);
        return u;
      }
    }
    return null;
  },

  addAuditLog(data: any) {
    const log: IInMemoryAuditLog = {
      _id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action: data.action,
      description: data.description,
      module: data.module || 'business',
      businessId: data.businessId || null,
      userId: data.userId || null,
      metadata: data.metadata || {},
      ipAddress: data.ipAddress || null,
      timestamp: new Date()
    };
    demoAuditLogs.unshift(log);
    if (demoAuditLogs.length > 200) demoAuditLogs.pop();
    return log;
  },

  getAuditLogs(params: { module?: string; action?: string; businessId?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));

    let list = [...demoAuditLogs];

    if (params.module && params.module !== 'ALL') {
      list = list.filter((l) => l.module === params.module);
    }

    if (params.action && params.action.trim()) {
      const a = params.action.trim().toLowerCase();
      list = list.filter((l) => l.action.toLowerCase().includes(a));
    }

    if (params.businessId && params.businessId !== 'ALL') {
      list = list.filter((l) => l.businessId === params.businessId);
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  getPlatformSettings() {
    return demoPlatformSettings;
  },

  updatePlatformSettings(updates: Partial<IPlatformSettings>) {
    demoPlatformSettings = {
      ...demoPlatformSettings,
      ...updates
    };
    return demoPlatformSettings;
  },

  async createResetToken(userId: string, token: string, expiresAt: Date) {
    if (isDbConnected()) {
      try {
        await PasswordResetToken.deleteMany({ userId });
        const doc = await PasswordResetToken.create({
          userId,
          token,
          expiresAt,
          used: false
        });
        return doc;
      } catch (err) {
        logger.warn('Failed creating reset token in Mongo, persisting in resilient store', { error: String(err) });
      }
    }

    const tokenId = new mongoose.Types.ObjectId().toString();
    const tokenRecord: IInMemoryResetToken = {
      _id: tokenId,
      userId,
      token,
      expiresAt,
      used: false,
      createdAt: new Date()
    };
    memoryTokens.set(token, tokenRecord);
    return tokenRecord;
  },

  async findResetToken(token: string) {
    if (isDbConnected()) {
      try {
        const doc = await PasswordResetToken.findOne({ token, used: false });
        if (doc) return doc;
      } catch (err) {
        logger.warn('Failed querying reset token in Mongo', { error: String(err) });
      }
    }
    const mem = memoryTokens.get(token);
    if (mem && !mem.used && mem.expiresAt > new Date()) {
      return mem;
    }
    return null;
  },

  async markResetTokenUsed(token: string) {
    if (isDbConnected()) {
      try {
        await PasswordResetToken.findOneAndUpdate({ token }, { used: true });
      } catch (err) {
        logger.warn('Failed updating reset token in Mongo', { error: String(err) });
      }
    }
    const mem = memoryTokens.get(token);
    if (mem) {
      mem.used = true;
      memoryTokens.set(token, mem);
    }
  },

  /**
   * Seed live MongoDB if connected
   */
  async seedMongoIfConnected(): Promise<void> {
    if (!isDbConnected()) return;

    try {
      const superadminEmail = 'superadmin@biznexus.com';
      const existing = await User.findOne({ email: superadminEmail });
      if (!existing) {
        logger.info('[SEED SERVICE] Seeding demo roles into live MongoDB database...');
        // Create demo business
        const biz = await Business.create({
          name: 'Nexus Technologies Inc.',
          slug: 'nexus-technologies',
          industry: 'Enterprise Software & Cloud Platforms',
          category: 'Information Technology',
          currency: 'USD',
          status: 'ACTIVE',
          businessEmail: 'contact@nexuscorp.com',
          ownerName: 'Eleanor Sterling',
          ownerEmail: 'owner@nexuscorp.com'
        });

        const sub = await Subscription.create({
          businessId: biz._id,
          plan: 'ENTERPRISE',
          status: 'ACTIVE',
          price: 199,
          currency: 'USD'
        });

        biz.subscriptionId = sub._id;
        await biz.save();

        const rolesToSeed: Array<{
          name: string;
          email: string;
          phone: string;
          role: UserRole;
          businessId: mongoose.Types.ObjectId | null;
        }> = [
          {
            name: 'Alexander Vance',
            email: 'superadmin@biznexus.com',
            phone: '+1 (555) 100-0001',
            role: 'SUPER_ADMIN',
            businessId: null
          },
          {
            name: 'Eleanor Sterling',
            email: 'owner@nexuscorp.com',
            phone: '+1 (555) 200-0002',
            role: 'BUSINESS_OWNER',
            businessId: biz._id
          },
          {
            name: 'Marcus Thorne',
            email: 'manager@nexuscorp.com',
            phone: '+1 (555) 300-0003',
            role: 'MANAGER',
            businessId: biz._id
          },
          {
            name: 'Sophia Lin',
            email: 'employee@nexuscorp.com',
            phone: '+1 (555) 400-0004',
            role: 'EMPLOYEE',
            businessId: biz._id
          },
          {
            name: 'David Miller',
            email: 'customer@clientco.com',
            phone: '+1 (555) 500-0005',
            role: 'CUSTOMER',
            businessId: biz._id
          }
        ];

        for (const r of rolesToSeed) {
          await User.create({
            ...r,
            password: 'BizNexus2026!',
            status: 'active'
          });
        }

        // Seed 4 standard subscription plans
        const planCount = await SubscriptionPlan.countDocuments();
        if (planCount === 0) {
          await SubscriptionPlan.insertMany(DEFAULT_PLANS);
        }

        // Seed default platform settings
        const settingsCount = await PlatformSettings.countDocuments();
        if (settingsCount === 0) {
          await PlatformSettings.create({});
        }

        logger.info('[SEED SERVICE] 5 Core Roles & 4 Subscription Plans successfully seeded in MongoDB.');
      }
    } catch (err) {
      logger.error('[SEED SERVICE] Error while seeding MongoDB:', err);
    }
  },

  /**
   * Part 4 Multi-Tenant Helpers
   */
  getInMemoryBusinesses(): Map<string, IInMemoryBusiness> {
    return demoBusinesses;
  },

  getInMemoryUsers(): Map<string, IInMemoryUser> {
    return memoryUsers;
  },

  getInMemoryAuditLogs(): IInMemoryAuditLog[] {
    return demoAuditLogs;
  },

  async isUserBusinessOwner(userId: string, businessId: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        const uId = new mongoose.Types.ObjectId(userId);
        const bId = new mongoose.Types.ObjectId(businessId);
        const biz = await Business.findOne({ _id: bId, ownerId: uId }).lean();
        if (biz) return true;
      } catch {
        // Fallback to in-memory check
      }
    }

    const memBiz = demoBusinesses.get(businessId);
    if (memBiz && memBiz.ownerId === userId) {
      return true;
    }
    return false;
  }
};

export default resilientAuthStore;

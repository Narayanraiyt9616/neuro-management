import mongoose, { Types } from 'mongoose';
import Customer, { ICustomerDocument } from '../models/Customer';
import Lead, { ILeadDocument, LeadStatus } from '../models/Lead';
import FollowUp, { IFollowUpDocument } from '../models/FollowUp';
import SalesActivity, { ISalesActivityDocument } from '../models/SalesActivity';
import SalesOrder from '../models/SalesOrder';
import Employee from '../models/Employee';
import Notification from '../models/Notification';
import emailService from './emailService';
import logger from '../utils/logger';
import {
  ICustomerInput,
  ICustomerUpdateInput,
  ILeadInput,
  ILeadUpdateInput,
  ILeadConvertInput,
  IFollowUpInput,
  IFollowUpUpdateInput,
  ICustomerCommunicationInput
} from '../types';

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-memory fallback stores for non-mongo environments / offline test suites
export const memCustomers: Map<string, any> = new Map();
export const memLeads: Map<string, any> = new Map();
export const memFollowUps: Map<string, any> = new Map();
export const memActivities: Map<string, any> = new Map();

let crmSeedDone = false;

export async function seedDemoCRMIfEmpty(businessIdStr: string): Promise<void> {
  if (crmSeedDone) return;
  crmSeedDone = true;

  const bizId = businessIdStr || '60d0fe4f5311236168a109ca';
  const bizObjId = new Types.ObjectId(bizId);

  try {
    if (isDbConnected()) {
      const custCount = await Customer.countDocuments({ businessId: bizObjId });
      if (custCount === 0) {
        // Seed default customers
        const c1 = await Customer.create({
          businessId: bizObjId,
          customerId: 'CUST-1001',
          name: 'Acme Global Enterprises',
          fullName: 'Acme Global Enterprises',
          email: 'purchasing@acmeglobal.com',
          phone: '+1 (555) 234-5678',
          companyName: 'Acme Global Corp',
          address: { street: '100 Enterprise Way', city: 'San Jose', state: 'CA', postalCode: '95134', country: 'USA' },
          customerType: 'ENTERPRISE',
          registrationDate: new Date('2025-06-15'),
          totalSpent: 48500,
          ordersCount: 4,
          status: 'ACTIVE',
          notes: 'High-value multi-regional client with annual SLA contract.'
        });

        const c2 = await Customer.create({
          businessId: bizObjId,
          customerId: 'CUST-1002',
          name: 'Starlight Retail Partners',
          fullName: 'Starlight Retail Partners',
          email: 'orders@starlightretail.io',
          phone: '+1 (555) 987-6543',
          companyName: 'Starlight Retail Co',
          address: { street: '55 Commerce Blvd', city: 'Austin', state: 'TX', postalCode: '78701', country: 'USA' },
          customerType: 'RETAIL',
          registrationDate: new Date('2025-09-01'),
          totalSpent: 19200,
          ordersCount: 2,
          status: 'ACTIVE',
          notes: 'Quarterly hardware renewals.'
        });

        // Seed default leads
        await Lead.create({
          businessId: bizObjId,
          leadId: 'LEAD-1001',
          name: 'Nexus Dynamics Group',
          email: 'contact@nexusdynamics.net',
          phone: '+1 (555) 888-1212',
          company: 'Nexus Dynamics Group',
          source: 'Website',
          leadValue: 65000,
          expectedClosingDate: new Date(Date.now() + 15 * 86400000),
          notes: 'Interested in platform-wide enterprise tier with cloud migration.',
          status: 'PROPOSAL'
        });

        await Lead.create({
          businessId: bizObjId,
          leadId: 'LEAD-1002',
          name: 'BlueWave Biotech Systems',
          email: 'inquiries@bluewavebio.org',
          phone: '+1 (555) 444-3322',
          company: 'BlueWave Bio Systems',
          source: 'Referral',
          leadValue: 32000,
          expectedClosingDate: new Date(Date.now() + 7 * 86400000),
          notes: 'Needs inventory tracking & automated billing compliance.',
          status: 'QUALIFIED'
        });

        // Seed default follow-up
        await FollowUp.create({
          businessId: bizObjId,
          title: 'Review proposal terms and SLA schedule',
          type: 'MEETING',
          scheduledDate: new Date(Date.now() + 2 * 86400000),
          nextFollowUpDate: new Date(Date.now() + 9 * 86400000),
          notes: 'Prepare technical migration presentation deck.',
          status: 'PENDING',
          reminderSent: false
        });

        // Seed initial activity
        await SalesActivity.create({
          businessId: bizObjId,
          customerId: c1._id,
          type: 'NOTE',
          subject: 'Customer Account Created',
          description: 'Onboarded Acme Global Enterprises into active CRM database.',
          timestamp: new Date()
        });
      }
    }
  } catch (err) {
    logger.warn('Error during CRM demo seeding (fallback store will be used if needed):', { error: String(err) });
  }

  // Also seed memory store
  if (memCustomers.size === 0) {
    const c1Id = 'cust_001';
    const c2Id = 'cust_002';
    memCustomers.set(c1Id, {
      _id: c1Id,
      businessId: bizId,
      customerId: 'CUST-1001',
      name: 'Acme Global Enterprises',
      fullName: 'Acme Global Enterprises',
      email: 'purchasing@acmeglobal.com',
      phone: '+1 (555) 234-5678',
      companyName: 'Acme Global Corp',
      address: { street: '100 Enterprise Way', city: 'San Jose', state: 'CA', postalCode: '95134', country: 'USA' },
      customerType: 'ENTERPRISE',
      registrationDate: new Date('2025-06-15'),
      totalSpent: 48500,
      ordersCount: 4,
      status: 'ACTIVE',
      notes: 'High-value multi-regional client with annual SLA contract.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memCustomers.set(c2Id, {
      _id: c2Id,
      businessId: bizId,
      customerId: 'CUST-1002',
      name: 'Starlight Retail Partners',
      fullName: 'Starlight Retail Partners',
      email: 'orders@starlightretail.io',
      phone: '+1 (555) 987-6543',
      companyName: 'Starlight Retail Co',
      address: { street: '55 Commerce Blvd', city: 'Austin', state: 'TX', postalCode: '78701', country: 'USA' },
      customerType: 'RETAIL',
      registrationDate: new Date('2025-09-01'),
      totalSpent: 19200,
      ordersCount: 2,
      status: 'ACTIVE',
      notes: 'Quarterly hardware renewals.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const l1Id = 'lead_001';
    memLeads.set(l1Id, {
      _id: l1Id,
      businessId: bizId,
      leadId: 'LEAD-1001',
      name: 'Nexus Dynamics Group',
      email: 'contact@nexusdynamics.net',
      phone: '+1 (555) 888-1212',
      company: 'Nexus Dynamics Group',
      source: 'Website',
      leadValue: 65000,
      expectedClosingDate: new Date(Date.now() + 15 * 86400000),
      notes: 'Interested in platform-wide enterprise tier with cloud migration.',
      status: 'PROPOSAL',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const f1Id = 'fu_001';
    memFollowUps.set(f1Id, {
      _id: f1Id,
      businessId: bizId,
      title: 'Review proposal terms and SLA schedule',
      type: 'MEETING',
      scheduledDate: new Date(Date.now() + 2 * 86400000),
      nextFollowUpDate: new Date(Date.now() + 9 * 86400000),
      notes: 'Prepare technical migration presentation deck.',
      status: 'PENDING',
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

export class CRMService {
  /**
   * ============================================================================
   * MODULE 1: CUSTOMER MANAGEMENT
   * ============================================================================
   */

  static async listCustomers(
    businessId: string,
    filters: {
      search?: string;
      customerType?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    await seedDemoCRMIfEmpty(businessId);
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [
          { name: regex },
          { email: regex },
          { customerId: regex },
          { companyName: regex },
          { phone: regex }
        ];
      }

      if (filters.customerType) {
        query.customerType = filters.customerType;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const [customers, total] = await Promise.all([
        Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Customer.countDocuments(query)
      ]);

      return {
        customers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    // In-memory fallback
    let list = Array.from(memCustomers.values()).filter((c) => c.businessId === businessId);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(s) ||
          c.email?.toLowerCase().includes(s) ||
          c.customerId?.toLowerCase().includes(s) ||
          c.companyName?.toLowerCase().includes(s) ||
          c.phone?.toLowerCase().includes(s)
      );
    }
    if (filters.customerType) {
      list = list.filter((c) => c.customerType === filters.customerType);
    }
    if (filters.status) {
      list = list.filter((c) => c.status === filters.status);
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);

    return {
      customers: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getCustomerById(businessId: string, customerId: string) {
    await seedDemoCRMIfEmpty(businessId);
    if (isDbConnected()) {
      let cust = await Customer.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [
          ...(Types.ObjectId.isValid(customerId) ? [{ _id: new Types.ObjectId(customerId) }] : []),
          { customerId }
        ]
      })
        .populate('assignedEmployeeId', 'fullName employeeId email designation')
        .lean();

      if (!cust) throw new Error('Customer not found.');

      // Fetch customer's recent sales orders & activity timeline
      const [orders, activities] = await Promise.all([
        SalesOrder.find({ businessId: new Types.ObjectId(businessId), customerId: cust._id })
          .sort({ orderDate: -1 })
          .limit(10)
          .lean(),
        SalesActivity.find({ businessId: new Types.ObjectId(businessId), customerId: cust._id })
          .sort({ timestamp: -1 })
          .limit(20)
          .lean()
      ]);

      return {
        ...cust,
        recentOrders: orders,
        activityTimeline: activities
      };
    }

    // In-memory fallback
    const cust =
      memCustomers.get(customerId) ||
      Array.from(memCustomers.values()).find(
        (c) => c.businessId === businessId && (c._id === customerId || c.customerId === customerId)
      );

    if (!cust) throw new Error('Customer not found.');

    const activities = Array.from(memActivities.values()).filter(
      (a) => a.businessId === businessId && String(a.customerId) === String(cust._id)
    );

    return {
      ...cust,
      recentOrders: [],
      activityTimeline: activities
    };
  }

  static async createCustomer(businessId: string, input: ICustomerInput, actorUserId?: string) {
    await seedDemoCRMIfEmpty(businessId);
    const cleanEmail = input.email.trim().toLowerCase();

    if (isDbConnected()) {
      const existing = await Customer.findOne({
        businessId: new Types.ObjectId(businessId),
        email: cleanEmail
      });

      if (existing) {
        throw new Error(`Customer with email '${cleanEmail}' already exists in this business.`);
      }

      // Generate sequential Customer ID (CUST-1001, CUST-1002...)
      const count = await Customer.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const custIdStr = `CUST-${1000 + count + 1}`;

      const customer = await Customer.create({
        businessId: new Types.ObjectId(businessId),
        customerId: custIdStr,
        name: input.fullName.trim(),
        fullName: input.fullName.trim(),
        email: cleanEmail,
        phone: input.phone || '',
        companyName: input.companyName || '',
        gstin: (input as any).gstin || '',
        address: input.address || { country: 'India' },
        customerType: input.customerType || 'BUSINESS',
        status: input.status || 'ACTIVE',
        notes: input.notes || '',
        assignedEmployeeId: input.assignedEmployeeId ? new Types.ObjectId(input.assignedEmployeeId) : undefined,
        registrationDate: new Date(),
        totalSpent: 0,
        ordersCount: 0
      });

      // Record Activity
      await SalesActivity.create({
        businessId: new Types.ObjectId(businessId),
        customerId: customer._id,
        type: 'NOTE',
        subject: 'Customer Account Created',
        description: `Customer ${customer.name} (${customer.customerId}) registered in platform.`,
        performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      return customer;
    }

    // In-memory fallback
    const memExisting = Array.from(memCustomers.values()).find(
      (c) => c.businessId === businessId && c.email === cleanEmail
    );
    if (memExisting) {
      throw new Error(`Customer with email '${cleanEmail}' already exists in this business.`);
    }

    const newId = `cust_${Date.now()}`;
    const custIdStr = `CUST-${1000 + memCustomers.size + 1}`;
    const createdCust = {
      _id: newId,
      businessId,
      customerId: custIdStr,
      name: input.fullName.trim(),
      fullName: input.fullName.trim(),
      email: cleanEmail,
      phone: input.phone || '',
      companyName: input.companyName || '',
      gstin: (input as any).gstin || '',
      address: input.address || { country: 'India' },
      customerType: input.customerType || 'BUSINESS',
      status: input.status || 'ACTIVE',
      notes: input.notes || '',
      assignedEmployeeId: input.assignedEmployeeId,
      registrationDate: new Date(),
      totalSpent: 0,
      ordersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memCustomers.set(newId, createdCust);
    return createdCust;
  }

  static async updateCustomer(businessId: string, customerId: string, input: ICustomerUpdateInput, actorUserId?: string) {
    if (isDbConnected()) {
      const cust = await Customer.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [
          ...(Types.ObjectId.isValid(customerId) ? [{ _id: new Types.ObjectId(customerId) }] : []),
          { customerId }
        ]
      });

      if (!cust) throw new Error('Customer not found.');

      if (input.fullName) {
        cust.name = input.fullName.trim();
        cust.fullName = input.fullName.trim();
      }
      if (input.phone !== undefined) cust.phone = input.phone;
      if (input.companyName !== undefined) cust.companyName = input.companyName;
      if (input.address) cust.address = input.address as any;
      if (input.customerType) cust.customerType = input.customerType;
      if (input.status) cust.status = input.status;
      if (input.notes !== undefined) cust.notes = input.notes;
      if (input.assignedEmployeeId !== undefined) {
        cust.assignedEmployeeId = input.assignedEmployeeId ? new Types.ObjectId(input.assignedEmployeeId) : undefined;
      }

      await cust.save();

      await SalesActivity.create({
        businessId: new Types.ObjectId(businessId),
        customerId: cust._id,
        type: 'NOTE',
        subject: 'Customer Profile Updated',
        description: `Customer details for ${cust.name} updated.`,
        performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      return cust;
    }

    const cust =
      memCustomers.get(customerId) ||
      Array.from(memCustomers.values()).find(
        (c) => c.businessId === businessId && (c._id === customerId || c.customerId === customerId)
      );

    if (!cust) throw new Error('Customer not found.');
    if (input.fullName) {
      cust.name = input.fullName;
      cust.fullName = input.fullName;
    }
    Object.assign(cust, input);
    cust.updatedAt = new Date();
    return cust;
  }

  static async deleteCustomer(businessId: string, customerId: string, actorUserId?: string) {
    if (isDbConnected()) {
      const cust = await Customer.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [
          ...(Types.ObjectId.isValid(customerId) ? [{ _id: new Types.ObjectId(customerId) }] : []),
          { customerId }
        ]
      });

      if (!cust) throw new Error('Customer not found.');

      // Safeguard check: cannot delete if customer has sales orders or financial records!
      const orderCount = await SalesOrder.countDocuments({
        businessId: new Types.ObjectId(businessId),
        customerId: cust._id
      });

      if (orderCount > 0 || cust.totalSpent > 0 || cust.ordersCount > 0) {
        throw new Error(
          `Cannot delete customer '${cust.name}' with existing sales orders (${orderCount} orders on record). Deactivate or mark as BLOCKED instead to maintain audit compliance.`
        );
      }

      await Customer.findByIdAndDelete(cust._id);
      return { success: true, message: `Customer '${cust.name}' removed successfully.` };
    }

    // In-memory fallback
    const cust =
      memCustomers.get(customerId) ||
      Array.from(memCustomers.values()).find(
        (c) => c.businessId === businessId && (c._id === customerId || c.customerId === customerId)
      );

    if (!cust) throw new Error('Customer not found.');

    if (cust.ordersCount > 0 || cust.totalSpent > 0) {
      throw new Error(
        `Cannot delete customer '${cust.name}' with existing sales orders (${cust.ordersCount} orders on record). Deactivate or mark as BLOCKED instead to maintain audit compliance.`
      );
    }

    memCustomers.delete(cust._id);
    return { success: true, message: 'Customer removed successfully.' };
  }

  static async getCustomerTimeline(businessId: string, customerId: string) {
    if (isDbConnected()) {
      const activities = await SalesActivity.find({
        businessId: new Types.ObjectId(businessId),
        customerId: new Types.ObjectId(customerId)
      })
        .populate('performedBy', 'name fullName email')
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      return activities;
    }
    return Array.from(memActivities.values()).filter(
      (a) => a.businessId === businessId && a.customerId === customerId
    );
  }

  static async exportCustomersCSV(businessId: string): Promise<string> {
    const { customers } = await this.listCustomers(businessId, { limit: 1000 });
    const header = [
      'Customer ID',
      'Full Name',
      'Email',
      'Phone',
      'Company Name',
      'Customer Type',
      'Total Spent',
      'Orders Count',
      'Status',
      'Registration Date'
    ];

    const rows = customers.map((c: any) => [
      `"${c.customerId || ''}"`,
      `"${c.name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.companyName || ''}"`,
      `"${c.customerType || 'BUSINESS'}"`,
      `"${c.totalSpent || 0}"`,
      `"${c.ordersCount || 0}"`,
      `"${c.status || 'ACTIVE'}"`,
      `"${c.registrationDate ? new Date(c.registrationDate).toISOString().split('T')[0] : ''}"`
    ]);

    return [header.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
  }

  static async importCustomersCSV(businessId: string, csvContent: string, actorUserId?: string) {
    const lines = csvContent.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      throw new Error('CSV must contain a header and at least one customer row.');
    }

    let importedCount = 0;
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2 && parts[1]) {
        try {
          await this.createCustomer(
            businessId,
            {
              fullName: parts[1] || `Customer ${Date.now()}`,
              email: parts[2] || `import.${Date.now()}.${i}@biznexus.com`,
              phone: parts[3] || '',
              companyName: parts[4] || '',
              customerType: (parts[5] as any) || 'BUSINESS'
            },
            actorUserId
          );
          importedCount++;
        } catch {
          // Skip row duplicate error and continue
        }
      }
    }

    return { importedCount, totalRows: lines.length - 1 };
  }

  /**
   * ============================================================================
   * MODULE 2: CRM LEAD MANAGEMENT & PIPELINE
   * ============================================================================
   */

  static async listLeads(
    businessId: string,
    filters: {
      search?: string;
      status?: string;
      source?: string;
      assignedEmployeeId?: string;
    } = {}
  ) {
    await seedDemoCRMIfEmpty(businessId);
    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [{ name: regex }, { email: regex }, { company: regex }, { leadId: regex }];
      }

      if (filters.status) query.status = filters.status;
      if (filters.source) query.source = filters.source;
      if (filters.assignedEmployeeId) {
        query.assignedEmployeeId = new Types.ObjectId(filters.assignedEmployeeId);
      }

      const leads = await Lead.find(query)
        .populate('assignedEmployeeId', 'fullName employeeId email designation')
        .sort({ createdAt: -1 })
        .lean();

      return leads;
    }

    // In-memory fallback
    let list = Array.from(memLeads.values()).filter((l) => l.businessId === businessId);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name?.toLowerCase().includes(s) ||
          l.email?.toLowerCase().includes(s) ||
          l.company?.toLowerCase().includes(s) ||
          l.leadId?.toLowerCase().includes(s)
      );
    }
    if (filters.status) list = list.filter((l) => l.status === filters.status);
    if (filters.source) list = list.filter((l) => l.source === filters.source);

    return list;
  }

  static async createLead(businessId: string, input: ILeadInput, actorUserId?: string) {
    await seedDemoCRMIfEmpty(businessId);
    const cleanEmail = input.email.trim().toLowerCase();

    if (isDbConnected()) {
      const count = await Lead.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const leadIdStr = `LEAD-${1000 + count + 1}`;

      let empName = input.assignedEmployeeName || '';
      if (input.assignedEmployeeId && !empName) {
        const emp = await Employee.findById(input.assignedEmployeeId);
        if (emp) empName = emp.fullName;
      }

      const lead = await Lead.create({
        businessId: new Types.ObjectId(businessId),
        leadId: leadIdStr,
        name: input.leadName.trim(),
        email: cleanEmail,
        phone: input.phone || '',
        company: input.company || '',
        source: input.source || 'Website',
        assignedEmployeeId: input.assignedEmployeeId ? new Types.ObjectId(input.assignedEmployeeId) : undefined,
        assignedEmployeeName: empName,
        leadValue: input.leadValue || 0,
        expectedClosingDate: input.expectedClosingDate ? new Date(input.expectedClosingDate) : undefined,
        notes: input.notes || '',
        status: input.status || 'NEW'
      });

      // Record Sales Activity
      await SalesActivity.create({
        businessId: new Types.ObjectId(businessId),
        leadId: lead._id,
        type: 'NOTE',
        subject: 'Lead Captured',
        description: `Lead ${lead.name} (${lead.leadId}) recorded from ${lead.source}.`,
        performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      return lead;
    }

    const newId = `lead_${Date.now()}`;
    const leadIdStr = `LEAD-${1000 + memLeads.size + 1}`;
    const newLead = {
      _id: newId,
      businessId,
      leadId: leadIdStr,
      name: input.leadName.trim(),
      email: cleanEmail,
      phone: input.phone || '',
      company: input.company || '',
      source: input.source || 'Website',
      assignedEmployeeId: input.assignedEmployeeId,
      assignedEmployeeName: input.assignedEmployeeName || '',
      leadValue: input.leadValue || 0,
      expectedClosingDate: input.expectedClosingDate ? new Date(input.expectedClosingDate) : undefined,
      notes: input.notes || '',
      status: input.status || 'NEW',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memLeads.set(newId, newLead);
    return newLead;
  }

  static async updateLead(businessId: string, leadId: string, input: ILeadUpdateInput, actorUserId?: string) {
    if (isDbConnected()) {
      const lead = await Lead.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(leadId)
      });
      if (!lead) throw new Error('Lead not found.');

      if (input.leadName) lead.name = input.leadName.trim();
      if (input.email) lead.email = input.email.trim().toLowerCase();
      if (input.phone !== undefined) lead.phone = input.phone.trim();
      if (input.company !== undefined) lead.company = input.company.trim();
      if (input.source) lead.source = input.source;
      if (input.assignedEmployeeId !== undefined) {
        lead.assignedEmployeeId = input.assignedEmployeeId ? new Types.ObjectId(input.assignedEmployeeId) : undefined;
      }
      if (input.assignedEmployeeName !== undefined) lead.assignedEmployeeName = input.assignedEmployeeName;
      if (input.leadValue !== undefined) lead.leadValue = input.leadValue;
      if (input.expectedClosingDate) lead.expectedClosingDate = new Date(input.expectedClosingDate);
      if (input.notes !== undefined) lead.notes = input.notes;
      if (input.status) lead.status = input.status;

      await lead.save();
      return lead;
    }

    const lead = memLeads.get(leadId);
    if (!lead) throw new Error('Lead not found.');
    Object.assign(lead, input);
    lead.updatedAt = new Date();
    return lead;
  }

  static async updateLeadStatus(businessId: string, leadId: string, status: LeadStatus, actorUserId?: string) {
    if (isDbConnected()) {
      const lead = await Lead.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(leadId)
      });
      if (!lead) throw new Error('Lead not found.');

      const prevStatus = lead.status;
      lead.status = status;
      await lead.save();

      await SalesActivity.create({
        businessId: new Types.ObjectId(businessId),
        leadId: lead._id,
        type: 'STATUS_CHANGE',
        subject: `Lead Moved to ${status}`,
        description: `Lead stage progressed from ${prevStatus} to ${status}.`,
        performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      return lead;
    }

    const lead = memLeads.get(leadId);
    if (!lead) throw new Error('Lead not found.');
    lead.status = status;
    lead.updatedAt = new Date();
    return lead;
  }

  static async convertLead(businessId: string, leadId: string, input: ILeadConvertInput, actorUserId?: string) {
    let lead: any = null;

    if (isDbConnected()) {
      lead = await Lead.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(leadId)
      });
      if (!lead) throw new Error('Lead not found.');

      // 1. Create or link customer
      let customer = await Customer.findOne({
        businessId: new Types.ObjectId(businessId),
        email: lead.email
      });

      if (!customer) {
        const count = await Customer.countDocuments({ businessId: new Types.ObjectId(businessId) });
        const custIdStr = `CUST-${1000 + count + 1}`;
        customer = await Customer.create({
          businessId: new Types.ObjectId(businessId),
          customerId: custIdStr,
          name: lead.name,
          fullName: lead.name,
          email: lead.email,
          phone: lead.phone,
          companyName: lead.company,
          customerType: input.customerType || 'BUSINESS',
          status: 'ACTIVE',
          notes: `Converted from lead ${lead.leadId}. Notes: ${lead.notes || ''}`
        });
      }

      // 2. Mark lead as WON and converted
      lead.status = 'WON';
      lead.convertedCustomerId = customer._id;
      lead.convertedAt = new Date();
      await lead.save();

      // 3. Log activity
      await SalesActivity.create({
        businessId: new Types.ObjectId(businessId),
        leadId: lead._id,
        customerId: customer._id,
        type: 'LEAD_CONVERTED',
        subject: 'Lead Successfully Converted to Customer',
        description: `Lead ${lead.name} converted into active customer ${customer.customerId}.`,
        performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      return { lead, customer };
    }

    // In-memory fallback
    lead = memLeads.get(leadId);
    if (!lead) throw new Error('Lead not found.');

    const newCustId = `cust_${Date.now()}`;
    const custIdStr = `CUST-${1000 + memCustomers.size + 1}`;
    const customer = {
      _id: newCustId,
      businessId,
      customerId: custIdStr,
      name: lead.name,
      fullName: lead.name,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.company,
      customerType: input.customerType || 'BUSINESS',
      status: 'ACTIVE',
      notes: `Converted from lead ${lead.leadId}.`,
      totalSpent: 0,
      ordersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memCustomers.set(newCustId, customer);

    lead.status = 'WON';
    lead.convertedCustomerId = newCustId;
    lead.convertedAt = new Date();

    return { lead, customer };
  }

  static async deleteLead(businessId: string, leadId: string, actorUserId?: string) {
    if (isDbConnected()) {
      await Lead.deleteOne({ businessId: new Types.ObjectId(businessId), _id: new Types.ObjectId(leadId) });
      return { success: true };
    }
    memLeads.delete(leadId);
    return { success: true };
  }

  /**
   * ============================================================================
   * MODULE 3: FOLLOW-UP MANAGEMENT & CALENDAR
   * ============================================================================
   */

  static async listFollowUps(
    businessId: string,
    filters: {
      status?: string;
      leadId?: string;
      customerId?: string;
      assignedEmployeeId?: string;
    } = {}
  ) {
    await seedDemoCRMIfEmpty(businessId);
    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.status) query.status = filters.status;
      if (filters.leadId) query.leadId = new Types.ObjectId(filters.leadId);
      if (filters.customerId) query.customerId = new Types.ObjectId(filters.customerId);
      if (filters.assignedEmployeeId) {
        query.assignedEmployeeId = new Types.ObjectId(filters.assignedEmployeeId);
      }

      const list = await FollowUp.find(query)
        .populate('assignedEmployeeId', 'fullName email')
        .populate('leadId', 'name company email')
        .populate('customerId', 'name companyName email')
        .sort({ scheduledDate: 1 })
        .lean();

      return list;
    }

    let list = Array.from(memFollowUps.values()).filter((f) => f.businessId === businessId);
    if (filters.status) list = list.filter((f) => f.status === filters.status);
    return list;
  }

  static async createFollowUp(businessId: string, input: IFollowUpInput, actorUserId?: string) {
    await seedDemoCRMIfEmpty(businessId);
    if (isDbConnected()) {
      const followUp = await FollowUp.create({
        businessId: new Types.ObjectId(businessId),
        leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
        customerId: input.customerId ? new Types.ObjectId(input.customerId) : undefined,
        title: input.title.trim(),
        type: input.type || 'FOLLOW_UP',
        scheduledDate: new Date(input.scheduledDate),
        nextFollowUpDate: input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : undefined,
        notes: input.notes || '',
        assignedEmployeeId: input.assignedEmployeeId ? new Types.ObjectId(input.assignedEmployeeId) : undefined,
        status: 'PENDING',
        reminderSent: false
      });

      // Dispatch Notification to assigned user or creator
      if (actorUserId) {
        await Notification.create({
          businessId: new Types.ObjectId(businessId),
          recipientUserId: new Types.ObjectId(actorUserId),
          title: 'Follow-Up Scheduled',
          message: `Scheduled follow-up '${followUp.title}' for ${new Date(input.scheduledDate).toLocaleString()}`,
          type: 'FOLLOW_UP',
          read: false
        });
      }

      return followUp;
    }

    const newId = `fu_${Date.now()}`;
    const newFollowUp = {
      _id: newId,
      businessId,
      ...input,
      scheduledDate: new Date(input.scheduledDate),
      status: 'PENDING',
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memFollowUps.set(newId, newFollowUp);
    return newFollowUp;
  }

  static async updateFollowUp(businessId: string, followUpId: string, input: IFollowUpUpdateInput, actorUserId?: string) {
    if (isDbConnected()) {
      const fu = await FollowUp.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(followUpId)
      });
      if (!fu) throw new Error('Follow-up record not found.');

      if (input.title) fu.title = input.title;
      if (input.type) fu.type = input.type;
      if (input.scheduledDate) fu.scheduledDate = new Date(input.scheduledDate);
      if (input.nextFollowUpDate) fu.nextFollowUpDate = new Date(input.nextFollowUpDate);
      if (input.notes !== undefined) fu.notes = input.notes;
      if (input.status) {
        fu.status = input.status;
        if (input.status === 'COMPLETED') fu.completedAt = new Date();
      }
      if (input.outcomeNotes !== undefined) fu.outcomeNotes = input.outcomeNotes;

      await fu.save();
      return fu;
    }

    const fu = memFollowUps.get(followUpId);
    if (!fu) throw new Error('Follow-up record not found.');
    Object.assign(fu, input);
    fu.updatedAt = new Date();
    return fu;
  }

  static async deleteFollowUp(businessId: string, followUpId: string, actorUserId?: string) {
    if (isDbConnected()) {
      await FollowUp.deleteOne({ businessId: new Types.ObjectId(businessId), _id: new Types.ObjectId(followUpId) });
      return { success: true };
    }
    memFollowUps.delete(followUpId);
    return { success: true };
  }

  /**
   * ============================================================================
   * MODULE 7: CUSTOMER COMMUNICATION & EMAIL DISPATCH
   * ============================================================================
   */

  static async recordCommunication(businessId: string, input: ICustomerCommunicationInput, actorUserId?: string) {
    let customer: any = null;
    let lead: any = null;

    if (isDbConnected()) {
      if (input.customerId && Types.ObjectId.isValid(input.customerId)) {
        customer = await Customer.findById(input.customerId);
      }
      if (input.leadId && Types.ObjectId.isValid(input.leadId)) {
        lead = await Lead.findById(input.leadId);
      }

      // If communication type is EMAIL, dispatch verified email
      let emailResult = null;
      if (input.type === 'EMAIL') {
        const targetEmail = customer?.email || lead?.email;
        const targetName = customer?.name || lead?.name || 'Customer';

        if (!targetEmail) {
          throw new Error('Recipient email address could not be resolved for dispatch.');
        }

        emailResult = await emailService.sendCustomerCommunicationEmail(
          targetEmail,
          targetName,
          input.subject,
          input.body
        );

        if (!emailResult.delivered) {
          throw new Error('Email dispatch was rejected by email provider.');
        }
      }

      const activity = await SalesActivity.create({
        businessId: new Types.ObjectId(businessId),
        customerId: customer?._id,
        leadId: lead?._id,
        type: input.type,
        subject: input.subject.trim(),
        description: input.body.trim(),
        metadata: emailResult ? { emailResult } : {},
        performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      return { activity, emailResult };
    }

    // In-memory fallback
    const activityId = `act_${Date.now()}`;
    const activity = {
      _id: activityId,
      businessId,
      customerId: input.customerId,
      leadId: input.leadId,
      type: input.type,
      subject: input.subject,
      description: input.body,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memActivities.set(activityId, activity);
    return { activity, emailResult: { delivered: true } };
  }

  static async getCommunicationHistory(businessId: string, customerId?: string, leadId?: string) {
    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (customerId && Types.ObjectId.isValid(customerId)) {
        query.customerId = new Types.ObjectId(customerId);
      }
      if (leadId && Types.ObjectId.isValid(leadId)) {
        query.leadId = new Types.ObjectId(leadId);
      }

      const list = await SalesActivity.find(query).sort({ timestamp: -1 }).limit(50).lean();
      return list;
    }

    return Array.from(memActivities.values()).filter(
      (a) => a.businessId === businessId && (!customerId || a.customerId === customerId)
    );
  }
}

export default CRMService;

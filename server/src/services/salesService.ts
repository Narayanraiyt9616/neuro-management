import mongoose, { Types } from 'mongoose';
import SalesOrder, { ISalesOrderDocument, SalesOrderStatus, SalesOrderPaymentStatus } from '../models/SalesOrder';
import Customer from '../models/Customer';
import Product from '../models/Product';
import Lead from '../models/Lead';
import SalesActivity from '../models/SalesActivity';
import Notification from '../models/Notification';
import StockLedger from '../models/StockLedger';
import logger from '../utils/logger';
import { memCustomers } from './crmService';
import { memProducts, memStockLedger } from './inventoryService';
import {
  ISalesOrderCreateInput,
  ISalesOrderUpdateInput,
  ISalesAnalyticsData,
  SalesOrderStatusOption
} from '../types';

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-memory fallback stores
const memSalesOrders: Map<string, any> = new Map();
let salesSeedDone = false;

export function calculateOrderTotals(
  items: Array<{ quantity: number; unitPrice: number; discount?: number; tax?: number; productName: string; productId?: string; sku?: string }>,
  overallDiscount = 0,
  shippingFee = 0,
  taxRate = 0
) {
  let subtotal = 0;
  let calculatedTaxAmount = 0;
  let itemsDiscount = 0;

  const calculatedItems = items.map((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const itemDisc = Math.max(0, Number(item.discount) || 0);
    const itemTaxRate = Math.max(0, Number(item.tax) || 0);

    const lineGross = qty * price;
    const lineNet = Math.max(0, lineGross - itemDisc);
    const lineTax = Math.round((lineNet * (itemTaxRate / 100)) * 100) / 100;
    const itemTotal = Math.round((lineNet + lineTax) * 100) / 100;

    subtotal += Math.round(lineGross * 100) / 100;
    itemsDiscount += itemDisc;
    calculatedTaxAmount += lineTax;

    return {
      productId: item.productId && Types.ObjectId.isValid(item.productId) ? new Types.ObjectId(item.productId) : (item.productId || undefined),
      productName: item.productName,
      sku: item.sku || '',
      quantity: qty,
      unitPrice: price,
      discount: itemDisc,
      tax: itemTaxRate,
      itemTotal
    };
  });

  const totalDiscount = Math.round((itemsDiscount + Math.max(0, overallDiscount)) * 100) / 100;
  const finalTax = Math.round(calculatedTaxAmount * 100) / 100;
  const finalShipping = Math.max(0, Number(shippingFee) || 0);
  const totalAmount = Math.max(
    0,
    Math.round((subtotal - totalDiscount + finalTax + finalShipping) * 100) / 100
  );

  return {
    items: calculatedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: finalTax,
    discountAmount: totalDiscount,
    shippingFee: finalShipping,
    totalAmount
  };
}

export async function seedDemoSalesIfEmpty(businessIdStr: string): Promise<void> {
  if (salesSeedDone) return;
  salesSeedDone = true;

  const bizId = businessIdStr || '60d0fe4f5311236168a109ca';
  const bizObjId = new Types.ObjectId(bizId);

  try {
    if (isDbConnected()) {
      const orderCount = await SalesOrder.countDocuments({ businessId: bizObjId });
      if (orderCount === 0) {
        // Find existing customer or create dummy
        let customer = await Customer.findOne({ businessId: bizObjId });
        if (!customer) {
          customer = await Customer.create({
            businessId: bizObjId,
            customerId: 'CUST-1001',
            name: 'Acme Global Enterprises',
            fullName: 'Acme Global Enterprises',
            email: 'sales@acmeglobal.com',
            companyName: 'Acme Global Corp',
            customerType: 'ENTERPRISE',
            status: 'ACTIVE'
          });
        }

        // Find existing product or create dummy
        let product = await Product.findOne({ businessId: bizObjId });
        if (!product) {
          product = await Product.create({
            businessId: bizObjId,
            name: 'Enterprise Cloud License',
            sku: 'LIC-ENT-001',
            category: 'Software',
            price: 1200,
            cost: 400,
            stockQuantity: 150,
            reorderPoint: 20,
            unit: 'license',
            status: 'in_stock'
          });
        }

        const calculated = calculateOrderTotals([
          {
            productId: product._id.toString(),
            productName: product.name,
            sku: product.sku,
            quantity: 3,
            unitPrice: product.price,
            discount: 100,
            tax: 18
          }
        ], 0, 50, 18);

        await SalesOrder.create({
          businessId: bizObjId,
          orderNumber: 'SO-2026-1001',
          customerId: customer._id,
          customerName: customer.name || customer.fullName,
          customerEmail: customer.email,
          customerPhone: customer.phone || '+1 555-0100',
          items: calculated.items,
          subtotal: calculated.subtotal,
          taxAmount: calculated.taxAmount,
          discountAmount: calculated.discountAmount,
          shippingFee: calculated.shippingFee,
          totalAmount: calculated.totalAmount,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          orderDate: new Date(Date.now() - 5 * 86400000),
          inventoryDeducted: true,
          notes: 'Initial enterprise rollout package'
        });

        // Update product stock accordingly
        product.stockQuantity = Math.max(0, product.stockQuantity - 3);
        await product.save();
      }
    }
  } catch (err) {
    logger.error('Failed to seed demo sales:', err);
  }
}

export class SalesService {
  /**
   * ============================================================================
   * MODULE 4: SALES MANAGEMENT & ORDERS
   * ============================================================================
   */

  static async createSalesOrder(businessId: string, input: ISalesOrderCreateInput, actorUserId?: string) {
    await seedDemoSalesIfEmpty(businessId);

    // 1. Backend recalculates all prices, subtotals, taxes, discounts, and total
    const { items, subtotal, taxAmount, discountAmount, shippingFee, totalAmount } =
      calculateOrderTotals(
        input.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount || 0,
          tax: i.tax || 0
        })),
        input.discountAmount || 0,
        input.shippingFee || 0,
        input.taxRate || 0
      );

    const initialStatus = input.status || 'CONFIRMED';
    const initialPaymentStatus = input.paymentStatus || 'UNPAID';
    const shouldDeductInventory = initialStatus === 'CONFIRMED';

    if (isDbConnected()) {
      // Validate customer
      let customer = await Customer.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(input.customerId)
      });
      if (!customer) {
        throw new Error(`Customer with ID ${input.customerId} not found.`);
      }

      // Generate sequential order number
      const orderCount = await SalesOrder.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const currentYear = new Date().getFullYear();
      const orderNumber = `SO-${currentYear}-${1000 + orderCount + 1}`;

      // Deduct inventory if confirmed
      if (shouldDeductInventory) {
        for (const item of items) {
          if (item.productId) {
            const prod = await Product.findOne({
              businessId: new Types.ObjectId(businessId),
              _id: item.productId
            });
            if (prod) {
              const currentAvail = prod.availableStock !== undefined ? prod.availableStock : prod.stockQuantity;
              if (currentAvail < item.quantity) {
                throw new Error(
                  `Insufficient available stock for '${prod.name}'. Available: ${currentAvail}, Requested: ${item.quantity}. Overselling prevented.`
                );
              }

              const prevStock = prod.stockQuantity;
              prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
              await prod.save();

              // Record in StockLedger
              await StockLedger.create({
                businessId: new Types.ObjectId(businessId),
                productId: prod._id,
                movementType: 'SALES_FULFILLMENT',
                quantity: item.quantity,
                previousStock: prevStock,
                newStock: prod.stockQuantity,
                referenceType: 'SALES_ORDER',
                referenceId: orderNumber,
                notes: `Fulfillment for sales order ${orderNumber}`,
                performedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
              });

              // Trigger low-stock alert if below threshold
              if (prod.status === 'low_stock' && actorUserId && Types.ObjectId.isValid(actorUserId)) {
                await Notification.create({
                  businessId: new Types.ObjectId(businessId),
                  recipientUserId: new Types.ObjectId(actorUserId),
                  title: 'Low Stock Alert Triggered',
                  message: `Product '${prod.name}' (${prod.sku}) dropped below threshold (${prod.availableStock}/${prod.reorderPoint}). Recommended reorder: ${prod.suggestedReorderQuantity} ${prod.unit}.`,
                  type: 'LOW_STOCK'
                });
              }
            }
          }
        }
      }

      // Create SalesOrder
      const salesOrder = await SalesOrder.create({
        businessId: new Types.ObjectId(businessId),
        orderNumber,
        customerId: customer._id,
        customerName: input.customerName || customer.fullName || customer.name,
        customerEmail: input.customerEmail || customer.email,
        customerPhone: input.customerPhone || customer.phone || '',
        items,
        subtotal,
        taxRate: input.taxRate || 0,
        taxAmount,
        discountAmount,
        shippingFee,
        totalAmount,
        status: initialStatus,
        paymentStatus: initialPaymentStatus,
        orderDate: new Date(),
        expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : undefined,
        assignedEmployeeId: input.assignedEmployeeId ? new Types.ObjectId(input.assignedEmployeeId) : undefined,
        notes: input.notes || '',
        inventoryDeducted: shouldDeductInventory
      });

      // Update customer stats
      customer.ordersCount = (customer.ordersCount || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + totalAmount;
      await customer.save();

      // Log SalesActivity
      await SalesActivity.create({
        businessId: new Types.ObjectId(businessId),
        customerId: customer._id,
        salesOrderId: salesOrder._id,
        type: 'ORDER_CREATED',
        subject: `Sales Order Created: ${orderNumber}`,
        description: `Order ${orderNumber} created with ${items.length} items for total $${totalAmount.toFixed(2)}.`,
        performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      // Notification
      if (actorUserId) {
        await Notification.create({
          businessId: new Types.ObjectId(businessId),
          recipientUserId: new Types.ObjectId(actorUserId),
          title: 'Sales Order Created',
          message: `Order ${orderNumber} for ${customer.name || customer.fullName} ($${totalAmount.toFixed(2)}) created successfully.`,
          type: 'ORDER',
          read: false
        });
      }

      return salesOrder;
    }

    // In-Memory Fallback
    const newId = `order_${Date.now()}`;
    const orderNumber = `SO-${new Date().getFullYear()}-${1000 + memSalesOrders.size + 1}`;

    // Validate available stock and prevent overselling
    if (shouldDeductInventory) {
      for (const item of items) {
        if (item.productId) {
          const prodId = String(item.productId);
          const prod = memProducts.get(prodId);
          if (prod) {
            const available = prod.availableStock ?? prod.stockQuantity ?? 0;
            if (available < item.quantity) {
              throw new Error(`Insufficient stock for product '${prod.name || item.productName}'. Available: ${available}, Requested: ${item.quantity}`);
            }
          }
        }
      }

      // Deduct stock and log in StockLedger
      for (const item of items) {
        if (item.productId) {
          const prodId = String(item.productId);
          const prod = memProducts.get(prodId);
          if (prod) {
            const prevStock = prod.stockQuantity || 0;
            prod.stockQuantity = Math.max(0, prevStock - item.quantity);
            prod.availableStock = prod.stockQuantity;
            prod.suggestedReorderQuantity = Math.max(0, (prod.reorderPoint || 10) * 2 - prod.availableStock);
            prod.status = prod.availableStock <= 0 ? 'out_of_stock' : prod.availableStock <= (prod.reorderPoint || 10) ? 'low_stock' : 'in_stock';

            const ledgerId = `sl_sale_${Date.now()}_${Math.random()}`;
            memStockLedger.set(ledgerId, {
              _id: ledgerId,
              businessId,
              productId: prodId,
              movementType: 'SALES_FULFILLMENT',
              quantity: item.quantity,
              previousStock: prevStock,
              newStock: prod.stockQuantity,
              referenceType: 'SALES_ORDER',
              referenceId: orderNumber,
              notes: `Fulfillment for sales order ${orderNumber}`,
              timestamp: new Date()
            });
          }
        }
      }
    }

    const memCust = memCustomers.get(input.customerId);
    if (memCust) {
      memCust.ordersCount = (memCust.ordersCount || 0) + 1;
      memCust.totalSpent = (memCust.totalSpent || 0) + totalAmount;
    }
    const memOrder = {
      _id: newId,
      businessId,
      orderNumber,
      customerId: input.customerId,
      customerName: input.customerName || 'Customer',
      customerEmail: input.customerEmail || 'customer@example.com',
      customerPhone: input.customerPhone || '',
      items,
      subtotal,
      taxAmount,
      discountAmount,
      shippingFee,
      totalAmount,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      orderDate: new Date(),
      inventoryDeducted: shouldDeductInventory,
      notes: input.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memSalesOrders.set(newId, memOrder);
    return memOrder;
  }

  static async listSalesOrders(
    businessId: string,
    filters: {
      customerId?: string;
      status?: string;
      paymentStatus?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    await seedDemoSalesIfEmpty(businessId);
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.customerId) {
        query.customerId = new Types.ObjectId(filters.customerId);
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ orderNumber: regex }, { customerName: regex }, { customerEmail: regex }];
      }
      if (filters.startDate || filters.endDate) {
        query.orderDate = {};
        if (filters.startDate) query.orderDate.$gte = new Date(filters.startDate);
        if (filters.endDate) query.orderDate.$lte = new Date(filters.endDate);
      }

      const [orders, total] = await Promise.all([
        SalesOrder.find(query)
          .populate('customerId', 'name fullName email companyName phone')
          .populate('assignedEmployeeId', 'fullName email')
          .sort({ orderDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        SalesOrder.countDocuments(query)
      ]);

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    let list = Array.from(memSalesOrders.values()).filter((o) => o.businessId === businessId);
    if (filters.customerId) list = list.filter((o) => o.customerId === filters.customerId);
    if (filters.status) list = list.filter((o) => o.status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((o) => o.orderNumber?.toLowerCase().includes(s) || o.customerName?.toLowerCase().includes(s));
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);
    return { orders: paginated, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getSalesOrderById(businessId: string, orderId: string) {
    if (isDbConnected()) {
      const order = await SalesOrder.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(orderId)
      })
        .populate('customerId')
        .populate('assignedEmployeeId', 'fullName email')
        .populate('items.productId')
        .lean();

      if (!order) throw new Error('Sales order not found.');
      return order;
    }

    const order = memSalesOrders.get(orderId);
    if (!order) throw new Error('Sales order not found.');
    return order;
  }

  static async updateOrderStatus(
    businessId: string,
    orderId: string,
    newStatus: SalesOrderStatusOption,
    actorUserId?: string,
    cancelReason?: string
  ) {
    if (isDbConnected()) {
      const order = await SalesOrder.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(orderId)
      });
      if (!order) throw new Error('Sales order not found.');

      const prevStatus = order.status;
      if (prevStatus === newStatus) return order;

      // Inventory management safeguards:
      // Case 1: Transitioning to CANCELLED -> restore stock if deducted
      if (newStatus === 'CANCELLED' && order.inventoryDeducted) {
        for (const item of order.items) {
          if (item.productId) {
            const prod = await Product.findOne({
              businessId: new Types.ObjectId(businessId),
              _id: item.productId
            });
            if (prod) {
              const prevStock = prod.stockQuantity;
              prod.stockQuantity += item.quantity;
              await prod.save();

              // Record in StockLedger
              await StockLedger.create({
                businessId: new Types.ObjectId(businessId),
                productId: prod._id,
                movementType: 'SALES_RETURN',
                quantity: item.quantity,
                previousStock: prevStock,
                newStock: prod.stockQuantity,
                referenceType: 'SALES_ORDER',
                referenceId: order.orderNumber,
                notes: `Stock restored upon cancellation of order ${order.orderNumber}`
              });
            }
          }
        }
        order.inventoryDeducted = false;

        // Decrement customer spend and ordersCount
        const customer = await Customer.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: order.customerId
        });
        if (customer) {
          customer.ordersCount = Math.max(0, (customer.ordersCount || 1) - 1);
          customer.totalSpent = Math.max(0, (customer.totalSpent || 0) - order.totalAmount);
          await customer.save();
        }
      }

      // Case 2: Transitioning from DRAFT / CANCELLED to CONFIRMED / PROCESSING / SHIPPED / DELIVERED -> deduct stock if not deducted
      const isConfirmedState = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(newStatus);
      if (isConfirmedState && !order.inventoryDeducted) {
        for (const item of order.items) {
          if (item.productId) {
            const prod = await Product.findOne({
              businessId: new Types.ObjectId(businessId),
              _id: item.productId
            });
            if (prod) {
              prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
              if (prod.stockQuantity <= 0) {
                prod.status = 'out_of_stock';
              } else if (prod.stockQuantity <= prod.reorderPoint) {
                prod.status = 'low_stock';
              } else {
                prod.status = 'in_stock';
              }
              await prod.save();
            }
          }
        }
        order.inventoryDeducted = true;
      }

      order.status = newStatus;
      if (cancelReason) {
        order.notes = order.notes ? `${order.notes} | Cancellation Reason: ${cancelReason}` : `Cancellation Reason: ${cancelReason}`;
      }
      await order.save();

      // Log activity
      await SalesActivity.create({
        businessId: new Types.ObjectId(businessId),
        customerId: order.customerId,
        salesOrderId: order._id,
        type: 'STATUS_CHANGE',
        subject: `Order Status: ${newStatus}`,
        description: `Order ${order.orderNumber} changed status from ${prevStatus} to ${newStatus}.${cancelReason ? ` Reason: ${cancelReason}` : ''}`,
        performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      return order;
    }

    const order = memSalesOrders.get(orderId);
    if (!order) throw new Error('Sales order not found.');
    order.status = newStatus;
    if (newStatus === 'CANCELLED') {
      if (order.inventoryDeducted) {
        for (const item of order.items) {
          if (item.productId) {
            const prod = memProducts.get(String(item.productId));
            if (prod) {
              const prevStock = prod.stockQuantity || 0;
              prod.stockQuantity = prevStock + item.quantity;
              prod.availableStock = prod.stockQuantity;
              prod.suggestedReorderQuantity = Math.max(0, (prod.reorderPoint || 10) * 2 - prod.availableStock);
              prod.status = prod.availableStock <= 0 ? 'out_of_stock' : prod.availableStock <= (prod.reorderPoint || 10) ? 'low_stock' : 'in_stock';
            }
          }
        }
      }
      order.inventoryDeducted = false;
      const memCust = memCustomers.get(order.customerId);
      if (memCust) {
        memCust.ordersCount = Math.max(0, (memCust.ordersCount || 1) - 1);
        memCust.totalSpent = Math.max(0, (memCust.totalSpent || 0) - (order.totalAmount || 0));
      }
    }
    order.updatedAt = new Date();
    return order;
  }

  static async cancelSalesOrder(businessId: string, orderId: string, reason?: string, actorUserId?: string) {
    return this.updateOrderStatus(businessId, orderId, 'CANCELLED', actorUserId, reason);
  }

  /**
   * ============================================================================
   * MODULE 6: SALES ANALYTICS & INSIGHTS
   * ============================================================================
   */

  static async getSalesAnalytics(businessId: string, dateRange?: string): Promise<ISalesAnalyticsData> {
    await seedDemoSalesIfEmpty(businessId);
    const bizObjId = new Types.ObjectId(businessId);

    if (isDbConnected()) {
      // 1. Total sales and orders (non-cancelled)
      const validOrders = await SalesOrder.find({
        businessId: bizObjId,
        status: { $ne: 'CANCELLED' }
      }).lean();

      const totalSales = Math.round(validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) * 100) / 100;
      const totalOrders = validOrders.length;
      const averageOrderValue = totalOrders > 0 ? Math.round((totalSales / totalOrders) * 100) / 100 : 0;

      // 2. Pending orders count
      const pendingOrdersCount = await SalesOrder.countDocuments({
        businessId: bizObjId,
        status: { $in: ['DRAFT', 'CONFIRMED', 'PROCESSING', 'pending'] }
      });

      // 3. Leads stats & conversion
      const allLeads = await Lead.find({ businessId: bizObjId }).lean();
      const wonLeadsCount = allLeads.filter((l) => l.status === 'WON').length;
      const lostLeadsCount = allLeads.filter((l) => l.status === 'LOST').length;
      const totalLeads = allLeads.length;
      const conversionRate = totalLeads > 0 ? Math.round((wonLeadsCount / totalLeads) * 1000) / 10 : 0;

      // 4. Monthly sales (group by YYYY-MM)
      const monthsMap = new Map<string, { sales: number; orders: number }>();
      validOrders.forEach((o) => {
        const d = new Date(o.orderDate || o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const current = monthsMap.get(key) || { sales: 0, orders: 0 };
        current.sales += o.totalAmount || 0;
        current.orders += 1;
        monthsMap.set(key, current);
      });

      const monthlySales = Array.from(monthsMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, val]) => ({
          month,
          sales: Math.round(val.sales * 100) / 100,
          orders: val.orders
        }));

      // If empty monthly, provide current month dummy structure
      if (monthlySales.length === 0) {
        const cur = new Date();
        const curKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
        monthlySales.push({ month: curKey, sales: totalSales, orders: totalOrders });
      }

      // 5. Sales by Employee
      const empMap = new Map<string, { employeeName: string; totalSales: number; ordersCount: number }>();
      validOrders.forEach((o) => {
        if (o.assignedEmployeeId) {
          const empId = o.assignedEmployeeId.toString();
          const cur = empMap.get(empId) || { employeeName: 'Assigned Specialist', totalSales: 0, ordersCount: 0 };
          cur.totalSales += o.totalAmount || 0;
          cur.ordersCount += 1;
          empMap.set(empId, cur);
        }
      });

      const salesByEmployee = Array.from(empMap.entries()).map(([employeeId, val]) => ({
        employeeId,
        employeeName: val.employeeName,
        totalSales: Math.round(val.totalSales * 100) / 100,
        ordersCount: val.ordersCount
      }));

      // 6. Sales by Customer
      const custAgg = await Customer.find({ businessId: bizObjId })
        .sort({ totalSpent: -1 })
        .limit(5)
        .lean();

      const salesByCustomer = custAgg.map((c) => ({
        customerId: c._id.toString(),
        customerName: c.fullName || c.name,
        totalSpent: c.totalSpent || 0,
        ordersCount: c.ordersCount || 0
      }));

      // 7. Pipeline distribution
      const stages: Array<'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'> = [
        'NEW',
        'CONTACTED',
        'QUALIFIED',
        'PROPOSAL',
        'NEGOTIATION',
        'WON',
        'LOST'
      ];

      const pipelineDistribution = stages.map((stg) => {
        const matching = allLeads.filter((l) => l.status === stg);
        const totalValue = matching.reduce((sum, l) => sum + (l.leadValue || 0), 0);
        return {
          stage: stg,
          count: matching.length,
          totalValue
        };
      });

      return {
        totalSales,
        totalOrders,
        averageOrderValue,
        pendingOrdersCount,
        wonLeadsCount,
        lostLeadsCount,
        conversionRate,
        monthlySales,
        salesByEmployee,
        salesByCustomer,
        pipelineDistribution
      };
    }

    // In-memory fallback
    const orders = Array.from(memSalesOrders.values()).filter((o) => o.businessId === businessId && o.status !== 'CANCELLED');
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;

    return {
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
      pendingOrdersCount: 1,
      wonLeadsCount: 1,
      lostLeadsCount: 0,
      conversionRate: 50,
      monthlySales: [{ month: '2026-11', sales: totalSales, orders: totalOrders }],
      salesByEmployee: [],
      salesByCustomer: [],
      pipelineDistribution: [
        { stage: 'NEW', count: 1, totalValue: 10000 },
        { stage: 'QUALIFIED', count: 1, totalValue: 25000 },
        { stage: 'WON', count: 1, totalValue: 50000 }
      ]
    };
  }
}

export default SalesService;

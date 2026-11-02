import mongoose, { Types } from 'mongoose';
import Supplier, { ISupplierDocument } from '../models/Supplier';
import PurchaseOrder, {
  IPurchaseOrderDocument,
  PurchaseOrderStatus,
  PurchaseOrderPaymentStatus
} from '../models/PurchaseOrder';
import Product from '../models/Product';
import Warehouse from '../models/Warehouse';
import Inventory from '../models/Inventory';
import StockLedger from '../models/StockLedger';
import Notification from '../models/Notification';
import logger from '../utils/logger';
import { memProducts, memStockLedger } from './inventoryService';
import {
  ISupplierInput,
  ISupplierUpdateInput,
  IPurchaseOrderCreateInput,
  IPurchaseOrderReceiveInput
} from '../types';

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-memory fallback stores
export const memSuppliers: Map<string, any> = new Map();
export const memPurchaseOrders: Map<string, any> = new Map();

let purchaseSeedDone = false;

export async function seedDemoPurchaseIfEmpty(businessIdStr: string): Promise<void> {
  if (purchaseSeedDone) return;
  purchaseSeedDone = true;

  const bizId = businessIdStr || '60d0fe4f5311236168a109ca';
  const bizObjId = new Types.ObjectId(bizId);

  try {
    if (isDbConnected()) {
      const supCount = await Supplier.countDocuments({ businessId: bizObjId });
      let sup1: any = null;
      if (supCount === 0) {
        sup1 = await Supplier.create({
          businessId: bizObjId,
          supplierCode: 'SUP-1001',
          supplierName: 'Global Cloud Systems Ltd',
          companyName: 'Global Cloud Systems International',
          email: 'sales@globalcloudsystems.com',
          phone: '+1 (555) 789-0123',
          address: { street: '500 Enterprise Way', city: 'San Jose', state: 'CA', postalCode: '95134', country: 'USA' },
          gstin: '29ABCDE1234F1Z5',
          contactPerson: 'David Miller (Regional Director)',
          paymentTerms: 'Net 30',
          status: 'ACTIVE',
          totalPurchases: 25000,
          totalPaid: 20000,
          outstandingBalance: 5000
        });

        await Supplier.create({
          businessId: bizObjId,
          supplierCode: 'SUP-1002',
          supplierName: 'OmniTech Component Distributors',
          companyName: 'OmniTech Supply Chain Corp',
          email: 'orders@omnitechsupply.io',
          phone: '+91 80 2345 6789',
          address: { street: '45 Electronics City', city: 'Bangalore', state: 'Karnataka', postalCode: '560100', country: 'India' },
          gstin: '29XYZAB5678C1Z2',
          contactPerson: 'Anjali Sharma',
          paymentTerms: 'Net 15',
          status: 'ACTIVE',
          totalPurchases: 14500,
          totalPaid: 14500,
          outstandingBalance: 0
        });
      }

      const poCount = await PurchaseOrder.countDocuments({ businessId: bizObjId });
      if (poCount === 0 && sup1) {
        const prod = await Product.findOne({ businessId: bizObjId });
        if (prod) {
          const wh = await Warehouse.findOne({ businessId: bizObjId });
          await PurchaseOrder.create({
            businessId: bizObjId,
            poNumber: 'PO-2026-1001',
            supplierId: sup1._id,
            supplierName: sup1.supplierName,
            warehouseId: wh?._id,
            orderDate: new Date(Date.now() - 3 * 86400000),
            items: [
              {
                productId: prod._id,
                productName: prod.name,
                sku: prod.sku,
                quantity: 20,
                receivedQuantity: 20,
                unitPrice: prod.cost || 1000,
                taxRate: 18,
                taxAmount: (prod.cost || 1000) * 20 * 0.18,
                lineTotal: (prod.cost || 1000) * 20 * 1.18
              }
            ],
            subtotal: (prod.cost || 1000) * 20,
            taxAmount: (prod.cost || 1000) * 20 * 0.18,
            shippingCost: 200,
            totalAmount: (prod.cost || 1000) * 20 * 1.18 + 200,
            status: 'RECEIVED',
            paymentStatus: 'PAID',
            notes: 'Initial production hardware stocking'
          });
        }
      }
    }
  } catch (err) {
    logger.error('Failed to seed demo purchase:', err);
  }
}

export class PurchaseService {
  /**
   * ============================================================================
   * MODULE 5: SUPPLIER MANAGEMENT
   * ============================================================================
   */

  static async listSuppliers(businessId: string, filters: { search?: string; status?: string } = {}) {
    await seedDemoPurchaseIfEmpty(businessId);
    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.status) query.status = filters.status;
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ supplierName: regex }, { companyName: regex }, { email: regex }, { supplierCode: regex }];
      }

      const suppliers = await Supplier.find(query).sort({ supplierName: 1 }).lean();
      return suppliers;
    }

    let list = Array.from(memSuppliers.values()).filter((s) => s.businessId === businessId);
    if (filters.status) list = list.filter((s) => s.status === filters.status);
    return list;
  }

  static async getSupplierById(businessId: string, supplierId: string) {
    if (isDbConnected()) {
      const supplier = await Supplier.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(supplierId)
      }).lean();

      if (!supplier) throw new Error('Supplier not found.');

      // Fetch purchase history for this supplier
      const purchaseHistory = await PurchaseOrder.find({
        businessId: new Types.ObjectId(businessId),
        supplierId: supplier._id
      })
        .sort({ orderDate: -1 })
        .limit(20)
        .lean();

      // Fetch products associated with this supplier
      const supplierProducts = await Product.find({
        businessId: new Types.ObjectId(businessId),
        supplierId: supplier._id
      }).select('name sku price cost stockQuantity availableStock unit status').lean();

      return {
        ...supplier,
        purchaseHistory,
        supplierProducts
      };
    }

    const sup = memSuppliers.get(supplierId);
    if (!sup) throw new Error('Supplier not found.');
    return { ...sup, purchaseHistory: [], supplierProducts: [] };
  }

  static async createSupplier(businessId: string, input: ISupplierInput) {
    await seedDemoPurchaseIfEmpty(businessId);
    const cleanEmail = input.email.trim().toLowerCase();

    if (isDbConnected()) {
      const existing = await Supplier.findOne({
        businessId: new Types.ObjectId(businessId),
        email: cleanEmail
      });
      if (existing) {
        throw new Error(`Supplier with email '${cleanEmail}' already registered.`);
      }

      // Generate Supplier Code
      const count = await Supplier.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const supplierCode = `SUP-${1000 + count + 1}`;

      const supplier = await Supplier.create({
        businessId: new Types.ObjectId(businessId),
        supplierCode,
        supplierName: input.supplierName.trim(),
        companyName: input.companyName.trim(),
        email: cleanEmail,
        phone: input.phone.trim(),
        address: input.address || {},
        gstin: input.gstin ? input.gstin.trim().toUpperCase() : '',
        contactPerson: input.contactPerson || '',
        paymentTerms: input.paymentTerms || 'Net 30',
        status: input.status || 'ACTIVE'
      });
      return supplier;
    }

    const newId = `sup_${Date.now()}`;
    const supplierCode = `SUP-${1000 + memSuppliers.size + 1}`;
    const newSup = {
      _id: newId,
      businessId,
      supplierCode,
      ...input,
      email: cleanEmail,
      totalPurchases: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memSuppliers.set(newId, newSup);
    return newSup;
  }

  static async updateSupplier(businessId: string, supplierId: string, input: ISupplierUpdateInput) {
    if (isDbConnected()) {
      const supplier = await Supplier.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(supplierId)
      });
      if (!supplier) throw new Error('Supplier not found.');

      if (input.supplierName) supplier.supplierName = input.supplierName.trim();
      if (input.companyName) supplier.companyName = input.companyName.trim();
      if (input.email) supplier.email = input.email.trim().toLowerCase();
      if (input.phone) supplier.phone = input.phone.trim();
      if (input.gstin !== undefined) supplier.gstin = input.gstin.trim().toUpperCase();
      if (input.contactPerson !== undefined) supplier.contactPerson = input.contactPerson.trim();
      if (input.paymentTerms) supplier.paymentTerms = input.paymentTerms.trim();
      if (input.status) supplier.status = input.status;
      if (input.address) Object.assign(supplier.address, input.address);

      await supplier.save();
      return supplier;
    }

    const sup = memSuppliers.get(supplierId);
    if (!sup) throw new Error('Supplier not found.');
    Object.assign(sup, input);
    sup.updatedAt = new Date();
    return sup;
  }

  static async deleteSupplier(businessId: string, supplierId: string) {
    if (isDbConnected()) {
      const supplier = await Supplier.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(supplierId)
      });
      if (!supplier) throw new Error('Supplier not found.');

      // Safeguard: Check if purchase orders exist
      const existingPOs = await PurchaseOrder.countDocuments({
        businessId: new Types.ObjectId(businessId),
        supplierId: supplier._id
      });
      if (existingPOs > 0) {
        throw new Error(
          `Cannot delete supplier '${supplier.supplierName}' with ${existingPOs} purchase order record(s). Supplier history must be preserved.`
        );
      }

      await Supplier.deleteOne({ _id: supplier._id });
      return { success: true, message: `Supplier '${supplier.supplierName}' removed.` };
    }

    // In-memory safeguard
    const openPOs = Array.from(memPurchaseOrders.values()).filter(
      (po) => po.businessId === businessId && (po.supplierId === supplierId || po.supplierId?._id === supplierId)
    );
    if (openPOs.length > 0) {
      throw new Error(`Cannot delete supplier with ${openPOs.length} active purchase orders.`);
    }

    memSuppliers.delete(supplierId);
    return { success: true, message: 'Supplier removed.' };
  }

  /**
   * ============================================================================
   * MODULE 6: PURCHASE ORDER MANAGEMENT
   * ============================================================================
   */

  static async listPurchaseOrders(
    businessId: string,
    filters: {
      status?: string;
      supplierId?: string;
      warehouseId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    await seedDemoPurchaseIfEmpty(businessId);
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.status) query.status = filters.status;
      if (filters.supplierId && Types.ObjectId.isValid(filters.supplierId)) {
        query.supplierId = new Types.ObjectId(filters.supplierId);
      }
      if (filters.warehouseId && Types.ObjectId.isValid(filters.warehouseId)) {
        query.warehouseId = new Types.ObjectId(filters.warehouseId);
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ poNumber: regex }, { supplierName: regex }];
      }

      const [orders, total] = await Promise.all([
        PurchaseOrder.find(query)
          .populate('supplierId', 'supplierName companyName email phone')
          .populate('warehouseId', 'name code')
          .populate('approvedBy', 'fullName email')
          .sort({ orderDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        PurchaseOrder.countDocuments(query)
      ]);

      return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memPurchaseOrders.values()).filter((p) => p.businessId === businessId);
    if (filters.status) list = list.filter((p) => p.status === filters.status);
    const total = list.length;
    const paginated = list.slice(skip, skip + limit);
    return { orders: paginated, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getPurchaseOrderById(businessId: string, poId: string) {
    if (isDbConnected()) {
      const po = await PurchaseOrder.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(poId)
      })
        .populate('supplierId')
        .populate('warehouseId')
        .populate('approvedBy', 'fullName email')
        .populate('items.productId')
        .lean();

      if (!po) throw new Error('Purchase order not found.');
      return po;
    }

    const po = memPurchaseOrders.get(poId);
    if (!po) throw new Error('Purchase order not found.');
    return po;
  }

  static async createPurchaseOrder(businessId: string, input: IPurchaseOrderCreateInput, actorUserId?: string) {
    await seedDemoPurchaseIfEmpty(businessId);

    if (isDbConnected()) {
      const supplier = await Supplier.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(input.supplierId)
      });
      if (!supplier) throw new Error('Supplier not found.');

      let warehouseObjId: Types.ObjectId | null = null;
      if (input.warehouseId && Types.ObjectId.isValid(input.warehouseId)) {
        warehouseObjId = new Types.ObjectId(input.warehouseId);
      } else {
        const defaultWh = await Warehouse.findOne({ businessId: new Types.ObjectId(businessId), isPrimary: true });
        if (defaultWh) warehouseObjId = defaultWh._id;
      }

      // Calculate line item totals and subtotal strictly on backend
      let subtotal = 0;
      let taxAmount = 0;

      const items = await Promise.all(
        input.items.map(async (i) => {
          const prod = await Product.findOne({
            businessId: new Types.ObjectId(businessId),
            _id: new Types.ObjectId(i.productId)
          });
          if (!prod) throw new Error(`Product ${i.productId} not found.`);

          const qty = Math.max(1, i.quantity);
          const price = Math.max(0, i.unitPrice);
          const rate = Math.max(0, i.taxRate || 0);

          const lineNet = qty * price;
          const lineTax = Math.round(lineNet * (rate / 100) * 100) / 100;
          const lineTotal = Math.round((lineNet + lineTax) * 100) / 100;

          subtotal += lineNet;
          taxAmount += lineTax;

          return {
            productId: prod._id,
            productName: prod.name,
            sku: prod.sku,
            quantity: qty,
            receivedQuantity: 0,
            unitPrice: price,
            taxRate: rate,
            taxAmount: lineTax,
            lineTotal
          };
        })
      );

      const shippingCost = Math.max(0, input.shippingCost || 0);
      const totalAmount = Math.round((subtotal + taxAmount + shippingCost) * 100) / 100;

      // Sequential PO Number
      const poCount = await PurchaseOrder.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const currentYear = new Date().getFullYear();
      const poNumber = `PO-${currentYear}-${1000 + poCount + 1}`;

      const po = await PurchaseOrder.create({
        businessId: new Types.ObjectId(businessId),
        poNumber,
        supplierId: supplier._id,
        supplierName: supplier.supplierName,
        warehouseId: warehouseObjId,
        orderDate: new Date(),
        expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : null,
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        shippingCost,
        totalAmount,
        status: 'DRAFT',
        paymentStatus: 'UNPAID',
        notes: input.notes || '',
        receiveHistory: []
      });

      return po;
    }

    // In-memory fallback
    const newId = `po_${Date.now()}`;
    const poNumber = `PO-${new Date().getFullYear()}-${1000 + memPurchaseOrders.size + 1}`;
    const items = input.items.map((i) => ({
      productId: i.productId,
      productName: 'Hardware Component',
      sku: 'SKU-COMP',
      quantity: i.quantity,
      receivedQuantity: 0,
      unitPrice: i.unitPrice,
      taxRate: i.taxRate || 0,
      taxAmount: (i.quantity * i.unitPrice * (i.taxRate || 0)) / 100,
      lineTotal: i.quantity * i.unitPrice * (1 + (i.taxRate || 0) / 100)
    }));

    const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const taxAmount = items.reduce((s, it) => s + it.taxAmount, 0);
    const shippingCost = input.shippingCost || 0;
    const totalAmount = subtotal + taxAmount + shippingCost;

    const memPo = {
      _id: newId,
      businessId,
      poNumber,
      supplierId: input.supplierId,
      supplierName: 'Supplies Partner',
      warehouseId: input.warehouseId,
      items,
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount,
      status: 'DRAFT',
      paymentStatus: 'UNPAID',
      orderDate: new Date(),
      notes: input.notes || '',
      receiveHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memPurchaseOrders.set(newId, memPo);
    return memPo;
  }

  static async approvePurchaseOrder(businessId: string, poId: string, actorUserId?: string) {
    if (isDbConnected()) {
      const po = await PurchaseOrder.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(poId)
      });
      if (!po) throw new Error('Purchase order not found.');

      if (po.status !== 'DRAFT' && po.status !== 'PENDING_APPROVAL') {
        throw new Error(`Cannot approve purchase order with status '${po.status}'.`);
      }

      po.status = 'APPROVED';
      po.approvedBy = actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined;
      po.approvedAt = new Date();
      await po.save();

      // Note: Stock does NOT increase upon approval; stock increases ONLY when goods are received!
      return po;
    }

    const po = memPurchaseOrders.get(poId);
    if (!po) throw new Error('Purchase order not found.');
    po.status = 'APPROVED';
    po.approvedAt = new Date();
    return po;
  }

  /**
   * Receive Purchase Items (Module 6: Supports Partial Receiving & Stock Increase)
   */
  static async receivePurchaseItems(
    businessId: string,
    poId: string,
    input: IPurchaseOrderReceiveInput,
    actorUserId?: string
  ) {
    if (!input.receivedItems || input.receivedItems.length === 0) {
      throw new Error('Please specify at least one item quantity to receive.');
    }

    if (isDbConnected()) {
      const po = await PurchaseOrder.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(poId)
      });
      if (!po) throw new Error('Purchase order not found.');

      if (po.status !== 'APPROVED' && po.status !== 'PARTIALLY_RECEIVED') {
        throw new Error(
          `Cannot receive items for purchase order in '${po.status}' status. Purchase order must be APPROVED first.`
        );
      }

      // Process each received item
      const receiveReceiptItems = [];

      for (const rec of input.receivedItems) {
        if (rec.quantityReceived <= 0) continue;

        const lineItem = po.items.find((i) => i.productId.toString() === rec.productId);
        if (!lineItem) {
          throw new Error(`Product ${rec.productId} is not part of purchase order ${po.poNumber}.`);
        }

        const remainingToReceive = lineItem.quantity - lineItem.receivedQuantity;
        if (rec.quantityReceived > remainingToReceive) {
          throw new Error(
            `Quantity to receive (${rec.quantityReceived}) exceeds remaining balance (${remainingToReceive}) for '${lineItem.productName}'.`
          );
        }

        // 1. Update purchase order line item received quantity
        lineItem.receivedQuantity += rec.quantityReceived;

        // 2. Increase Product stock (physical & available)
        const product = await Product.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: lineItem.productId
        });
        if (product) {
          const previousStock = product.stockQuantity;
          product.stockQuantity += rec.quantityReceived;
          await product.save(); // pre-save recalculates availableStock, status, and suggestedReorder

          // 3. Update warehouse inventory if warehouse is set
          if (po.warehouseId) {
            let inv = await Inventory.findOne({
              businessId: new Types.ObjectId(businessId),
              warehouseId: po.warehouseId,
              productId: product._id
            });
            if (inv) {
              inv.currentStock += rec.quantityReceived;
              await inv.save();
            } else {
              await Inventory.create({
                businessId: new Types.ObjectId(businessId),
                warehouseId: po.warehouseId,
                productId: product._id,
                currentStock: rec.quantityReceived,
                reorderPoint: product.reorderPoint
              });
            }
          }

          // 4. Record StockLedger entry for audit trail
          const idempotencyKey = input.idempotencyKey ? `${input.idempotencyKey}-${product._id}` : undefined;
          await StockLedger.create({
            businessId: new Types.ObjectId(businessId),
            productId: product._id,
            warehouseId: po.warehouseId,
            movementType: 'PURCHASE_RECEIPT',
            quantity: rec.quantityReceived,
            previousStock,
            newStock: product.stockQuantity,
            referenceType: 'PURCHASE_ORDER',
            referenceId: po.poNumber,
            idempotencyKey,
            notes: `Received from PO ${po.poNumber}: ${input.notes || 'Goods receipt'}`,
            performedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined,
            timestamp: new Date()
          });
        }

        receiveReceiptItems.push({
          productId: lineItem.productId,
          quantityReceived: rec.quantityReceived
        });
      }

      // Check overall status: if all items are fully received -> RECEIVED, else PARTIALLY_RECEIVED
      const allFullyReceived = po.items.every((it) => it.receivedQuantity >= it.quantity);
      po.status = allFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

      // Append receive history
      po.receiveHistory.push({
        receivedDate: new Date(),
        items: receiveReceiptItems,
        receivedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined,
        notes: input.notes || 'Goods received and inspected'
      });

      await po.save();

      // Update supplier purchase stats
      const supplier = await Supplier.findById(po.supplierId);
      if (supplier && po.status === 'RECEIVED') {
        supplier.totalPurchases += po.totalAmount;
        supplier.outstandingBalance += po.totalAmount;
        await supplier.save();
      }

      return po;
    }

    // In-memory fallback
    const po = memPurchaseOrders.get(poId);
    if (!po) throw new Error('Purchase order not found.');
    if (po.status !== 'APPROVED' && po.status !== 'PARTIALLY_RECEIVED') {
      throw new Error('Purchase order must be APPROVED first.');
    }

    let allReceived = true;
    for (const rec of input.receivedItems) {
      const item = po.items.find((it: any) => it.productId === rec.productId);
      if (item) {
        item.receivedQuantity = (item.receivedQuantity || 0) + rec.quantityReceived;
        if (item.receivedQuantity < item.quantity) allReceived = false;

        // Strictly increment warehouse stock for the received item
        const prod = memProducts.get(rec.productId);
        if (prod) {
          const prev = prod.stockQuantity || 0;
          prod.stockQuantity = prev + rec.quantityReceived;
          prod.availableStock = prod.stockQuantity;
          prod.suggestedReorderQuantity = Math.max(0, (prod.reorderPoint || 10) * 2 - prod.availableStock);
          prod.status = prod.availableStock <= 0 ? 'out_of_stock' : prod.availableStock <= (prod.reorderPoint || 10) ? 'low_stock' : 'in_stock';

          // Record immutable stock ledger entry
          const ledgerId = `sl_po_${Date.now()}_${Math.random()}`;
          memStockLedger.set(ledgerId, {
            _id: ledgerId,
            businessId,
            productId: rec.productId,
            warehouseId: po.warehouseId,
            movementType: 'PURCHASE_RECEIPT',
            quantity: rec.quantityReceived,
            previousStock: prev,
            newStock: prod.stockQuantity,
            referenceType: 'PURCHASE_ORDER',
            referenceId: po.poNumber,
            notes: input.notes || 'Purchase order consignment receipt',
            timestamp: new Date()
          });
        }
      }
    }

    po.status = allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    po.receiveHistory.push({
      receivedDate: new Date(),
      items: input.receivedItems,
      notes: input.notes
    });
    po.updatedAt = new Date();
    return po;
  }

  static async cancelPurchaseOrder(businessId: string, poId: string, reason?: string, actorUserId?: string) {
    if (isDbConnected()) {
      const po = await PurchaseOrder.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(poId)
      });
      if (!po) throw new Error('Purchase order not found.');

      if (['PARTIALLY_RECEIVED', 'RECEIVED'].includes(po.status)) {
        throw new Error(
          `Cannot cancel purchase order in '${po.status}' status because goods have already been received into stock.`
        );
      }

      po.status = 'CANCELLED';
      if (reason) po.notes = po.notes ? `${po.notes} | Cancellation: ${reason}` : `Cancellation: ${reason}`;
      await po.save();
      return po;
    }

    const po = memPurchaseOrders.get(poId);
    if (!po) throw new Error('Purchase order not found.');
    po.status = 'CANCELLED';
    po.updatedAt = new Date();
    return po;
  }
}

export default PurchaseService;

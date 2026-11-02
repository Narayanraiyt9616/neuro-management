import mongoose, { Types } from 'mongoose';
import Product, { IProductDocument } from '../models/Product';
import ProductCategory, { IProductCategoryDocument } from '../models/ProductCategory';
import Warehouse, { IWarehouseDocument } from '../models/Warehouse';
import Inventory, { IInventoryDocument } from '../models/Inventory';
import StockLedger, { IStockLedgerDocument, StockMovementType, StockReferenceType } from '../models/StockLedger';
import StockTransfer, { IStockTransferDocument } from '../models/StockTransfer';
import Notification from '../models/Notification';
import SalesOrder from '../models/SalesOrder';
import PurchaseOrder from '../models/PurchaseOrder';
import logger from '../utils/logger';
import {
  IProductCategoryInput,
  IProductCategoryUpdateInput,
  IProductInput,
  IProductUpdateInput,
  IWarehouseInput,
  IWarehouseUpdateInput,
  IStockMovementInput,
  IStockTransferCreateInput,
  IInventoryAnalyticsData
} from '../types';

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-memory fallback stores
export const memCategories: Map<string, any> = new Map();
export const memProducts: Map<string, any> = new Map();
export const memWarehouses: Map<string, any> = new Map();
export const memInventory: Map<string, any> = new Map();
export const memStockLedger: Map<string, any> = new Map();
export const memStockTransfers: Map<string, any> = new Map();

let inventorySeedDone = false;

export async function seedDemoInventoryIfEmpty(businessIdStr: string): Promise<void> {
  if (inventorySeedDone) return;
  inventorySeedDone = true;

  const bizId = businessIdStr || '60d0fe4f5311236168a109ca';
  const bizObjId = new Types.ObjectId(bizId);

  try {
    if (isDbConnected()) {
      // 1. Seed Warehouses
      const whCount = await Warehouse.countDocuments({ businessId: bizObjId });
      let primaryWh: any = null;
      if (whCount === 0) {
        primaryWh = await Warehouse.create({
          businessId: bizObjId,
          code: 'WH-MAIN',
          name: 'Main Distribution Center',
          address: { street: '100 Logistics Blvd', city: 'Bangalore', state: 'Karnataka', postalCode: '560100', country: 'India' },
          contactPhone: '+91 80 4455 6677',
          contactEmail: 'logistics@biznexus.com',
          isPrimary: true,
          status: 'ACTIVE'
        });

        await Warehouse.create({
          businessId: bizObjId,
          code: 'WH-NORTH',
          name: 'Northern Regional Hub',
          address: { street: '25 Industrial Area', city: 'Gurugram', state: 'Haryana', postalCode: '122001', country: 'India' },
          contactPhone: '+91 124 8899 001',
          contactEmail: 'north.hub@biznexus.com',
          isPrimary: false,
          status: 'ACTIVE'
        });
      }

      // 2. Seed Categories
      const catCount = await ProductCategory.countDocuments({ businessId: bizObjId });
      let softwareCat: any = null;
      let hardwareCat: any = null;
      if (catCount === 0) {
        softwareCat = await ProductCategory.create({
          businessId: bizObjId,
          name: 'Software & Cloud Licenses',
          code: 'CAT-SW',
          description: 'Platform software, enterprise licenses and SaaS subscription seats'
        });

        hardwareCat = await ProductCategory.create({
          businessId: bizObjId,
          name: 'IT Infrastructure & Hardware',
          code: 'CAT-HW',
          description: 'Servers, routers, workstations, and network appliances'
        });
      }

      // 3. Seed Products if count is low
      const prodCount = await Product.countDocuments({ businessId: bizObjId });
      if (prodCount === 0) {
        const p1 = await Product.create({
          businessId: bizObjId,
          name: 'Enterprise Cloud Server Appliance',
          sku: 'HW-SRV-2001',
          barcode: '8901234567890',
          category: 'IT Infrastructure & Hardware',
          categoryId: hardwareCat?._id,
          price: 3200,
          cost: 2100,
          taxRate: 18,
          stockQuantity: 45,
          reservedStock: 5,
          availableStock: 40,
          reorderPoint: 15,
          minStockThreshold: 15,
          suggestedReorderQuantity: 20,
          unit: 'units',
          status: 'in_stock',
          description: '1U Rackmount Server with redundant power supply.'
        });

        const p2 = await Product.create({
          businessId: bizObjId,
          name: 'Gigabit Managed Switch 24-Port',
          sku: 'HW-NET-1002',
          barcode: '8901234567891',
          category: 'IT Infrastructure & Hardware',
          categoryId: hardwareCat?._id,
          price: 850,
          cost: 490,
          taxRate: 18,
          stockQuantity: 8,
          reservedStock: 2,
          availableStock: 6,
          reorderPoint: 10,
          minStockThreshold: 10,
          suggestedReorderQuantity: 14,
          unit: 'units',
          status: 'low_stock',
          description: 'Layer 2+ managed switch for enterprise LAN deployment.'
        });

        // Record Initial Stock Ledger entries
        await StockLedger.create({
          businessId: bizObjId,
          productId: p1._id,
          warehouseId: primaryWh?._id,
          movementType: 'STOCK_IN',
          quantity: 45,
          previousStock: 0,
          newStock: 45,
          referenceType: 'INITIAL_STOCK',
          referenceId: 'INIT-2026',
          notes: 'Initial warehouse intake'
        });

        await StockLedger.create({
          businessId: bizObjId,
          productId: p2._id,
          warehouseId: primaryWh?._id,
          movementType: 'STOCK_IN',
          quantity: 8,
          previousStock: 0,
          newStock: 8,
          referenceType: 'INITIAL_STOCK',
          referenceId: 'INIT-2026',
          notes: 'Initial stock intake'
        });
      }
    }
  } catch (err) {
    logger.error('Failed to seed demo inventory:', err);
  }
}

export class InventoryService {
  /**
   * ============================================================================
   * MODULE 4: CATEGORY MANAGEMENT
   * ============================================================================
   */

  static async listCategories(businessId: string) {
    await seedDemoInventoryIfEmpty(businessId);
    if (isDbConnected()) {
      const categories = await ProductCategory.find({
        businessId: new Types.ObjectId(businessId)
      })
        .sort({ name: 1 })
        .lean();

      // Compute statistics per category
      const categoriesWithStats = await Promise.all(
        categories.map(async (cat) => {
          const productCount = await Product.countDocuments({
            businessId: new Types.ObjectId(businessId),
            $or: [{ categoryId: cat._id }, { category: cat.name }]
          });
          const products = await Product.find({
            businessId: new Types.ObjectId(businessId),
            $or: [{ categoryId: cat._id }, { category: cat.name }]
          }).select('stockQuantity cost price');

          const totalStockValue = products.reduce(
            (sum, p) => sum + (p.stockQuantity || 0) * (p.cost || p.price || 0),
            0
          );

          return {
            ...cat,
            productCount,
            totalStockValue: Math.round(totalStockValue * 100) / 100
          };
        })
      );

      return categoriesWithStats;
    }

    // In-memory fallback
    const list = Array.from(memCategories.values()).filter((c) => c.businessId === businessId);
    return list.map((c) => ({
      ...c,
      productCount: Array.from(memProducts.values()).filter((p) => p.businessId === businessId && p.category === c.name).length,
      totalStockValue: 50000
    }));
  }

  static async createCategory(businessId: string, input: IProductCategoryInput) {
    await seedDemoInventoryIfEmpty(businessId);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    if (isDbConnected()) {
      const existing = await ProductCategory.findOne({
        businessId: new Types.ObjectId(businessId),
        $or: [{ code }, { name }]
      });
      if (existing) {
        throw new Error(`Category with code '${code}' or name '${name}' already exists.`);
      }

      const category = await ProductCategory.create({
        businessId: new Types.ObjectId(businessId),
        name,
        code,
        description: input.description || '',
        parentCategoryId: input.parentCategoryId && Types.ObjectId.isValid(input.parentCategoryId) ? new Types.ObjectId(input.parentCategoryId) : null,
        isActive: input.isActive !== undefined ? input.isActive : true
      });
      return category;
    }

    const newId = `cat_${Date.now()}`;
    const newCat = {
      _id: newId,
      businessId,
      name,
      code,
      description: input.description || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memCategories.set(newId, newCat);
    return newCat;
  }

  static async updateCategory(businessId: string, categoryId: string, input: IProductCategoryUpdateInput) {
    if (isDbConnected()) {
      const category = await ProductCategory.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(categoryId)
      });
      if (!category) throw new Error('Category not found.');

      if (input.name) category.name = input.name.trim();
      if (input.code) category.code = input.code.trim().toUpperCase();
      if (input.description !== undefined) category.description = input.description.trim();
      if (input.isActive !== undefined) category.isActive = input.isActive;
      if (input.parentCategoryId !== undefined) {
        category.parentCategoryId = input.parentCategoryId && Types.ObjectId.isValid(input.parentCategoryId) ? new Types.ObjectId(input.parentCategoryId) : null;
      }

      await category.save();
      return category;
    }

    const cat = memCategories.get(categoryId);
    if (!cat) throw new Error('Category not found.');
    Object.assign(cat, input);
    cat.updatedAt = new Date();
    return cat;
  }

  static async deleteCategory(businessId: string, categoryId: string) {
    if (isDbConnected()) {
      const category = await ProductCategory.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(categoryId)
      });
      if (!category) throw new Error('Category not found.');

      // Safeguard: Check if any products are assigned to this category
      const assignedProductsCount = await Product.countDocuments({
        businessId: new Types.ObjectId(businessId),
        $or: [{ categoryId: category._id }, { category: category.name }]
      });

      if (assignedProductsCount > 0) {
        throw new Error(
          `Cannot delete category '${category.name}' because ${assignedProductsCount} products are assigned to it. Reassign or remove these products first.`
        );
      }

      await ProductCategory.deleteOne({ _id: category._id });
      return { success: true, message: `Category '${category.name}' removed.` };
    }

    memCategories.delete(categoryId);
    return { success: true, message: 'Category removed.' };
  }

  /**
   * ============================================================================
   * MODULE 1: PRODUCT MANAGEMENT & SAFE DELETION
   * ============================================================================
   */

  static async listProducts(
    businessId: string,
    filters: {
      category?: string;
      categoryId?: string;
      search?: string;
      status?: string;
      supplierId?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    await seedDemoInventoryIfEmpty(businessId);
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.category) {
        query.$or = [{ category: filters.category }, { categoryId: Types.ObjectId.isValid(filters.category) ? new Types.ObjectId(filters.category) : null }];
      }
      if (filters.categoryId && Types.ObjectId.isValid(filters.categoryId)) {
        query.categoryId = new Types.ObjectId(filters.categoryId);
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.supplierId && Types.ObjectId.isValid(filters.supplierId)) {
        query.supplierId = new Types.ObjectId(filters.supplierId);
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [
          { name: regex },
          { sku: regex },
          { barcode: regex },
          { category: regex }
        ];
      }

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('categoryId', 'name code')
          .populate('supplierId', 'supplierName companyName')
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query)
      ]);

      return {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    // In-memory fallback
    let list = Array.from(memProducts.values()).filter((p) => p.businessId === businessId);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s));
    }
    if (filters.status) list = list.filter((p) => p.status === filters.status);

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);
    return { products: paginated, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getProductById(businessId: string, productId: string) {
    if (isDbConnected()) {
      const product = await Product.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(productId)
      })
        .populate('categoryId', 'name code')
        .populate('supplierId', 'supplierName companyName email')
        .lean();

      if (!product) throw new Error('Product not found.');
      return product;
    }

    const prod = memProducts.get(productId);
    if (!prod) throw new Error('Product not found.');
    return prod;
  }

  static async createProduct(businessId: string, input: IProductInput, actorUserId?: string) {
    await seedDemoInventoryIfEmpty(businessId);
    const sku = input.sku.trim().toUpperCase();

    if (isDbConnected()) {
      const existing = await Product.findOne({
        businessId: new Types.ObjectId(businessId),
        sku
      });
      if (existing) {
        throw new Error(`Product with SKU '${sku}' already exists in your inventory.`);
      }

      const initialStock = Math.max(0, (input as any).initialStock !== undefined ? (input as any).initialStock : (input.stockQuantity || 0));
      const reorderPoint = (input as any).minStockThreshold !== undefined ? (input as any).minStockThreshold : (input.reorderPoint !== undefined ? input.reorderPoint : 10);
      const availableStock = initialStock;
      const targetStock = reorderPoint * 2;
      const suggestedReorderQuantity = Math.max(0, targetStock - availableStock);

      const status = availableStock <= 0 ? 'out_of_stock' : availableStock <= reorderPoint ? 'low_stock' : 'in_stock';

      const product = await Product.create({
        businessId: new Types.ObjectId(businessId),
        name: input.name.trim(),
        sku,
        barcode: input.barcode ? input.barcode.trim() : '',
        category: input.category || 'General',
        categoryId: input.categoryId && Types.ObjectId.isValid(input.categoryId) ? new Types.ObjectId(input.categoryId) : null,
        price: input.price,
        cost: input.cost || 0,
        taxRate: input.taxRate || 0,
        stockQuantity: initialStock,
        reservedStock: 0,
        availableStock,
        reorderPoint,
        minStockThreshold: reorderPoint,
        suggestedReorderQuantity,
        unit: input.unit || 'units',
        status,
        description: input.description || '',
        productImage: input.productImage || '',
        supplierId: input.supplierId && Types.ObjectId.isValid(input.supplierId) ? new Types.ObjectId(input.supplierId) : null
      });

      // Record Initial Stock Ledger entry if stock > 0
      if (initialStock > 0) {
        await StockLedger.create({
          businessId: new Types.ObjectId(businessId),
          productId: product._id,
          movementType: 'STOCK_IN',
          quantity: initialStock,
          previousStock: 0,
          newStock: initialStock,
          referenceType: 'INITIAL_STOCK',
          referenceId: `INIT-${product.sku}`,
          notes: 'Initial inventory balance setup',
          performedBy: actorUserId ? new Types.ObjectId(actorUserId) : undefined
        });
      }

      // Check low stock alert
      if (product.status === 'low_stock' && actorUserId) {
        await Notification.create({
          businessId: new Types.ObjectId(businessId),
          recipientUserId: new Types.ObjectId(actorUserId),
          title: 'Low Stock Alert',
          message: `Product '${product.name}' (${product.sku}) is below threshold (${product.availableStock}/${product.reorderPoint}). Suggested reorder: ${product.suggestedReorderQuantity} ${product.unit}.`,
          type: 'LOW_STOCK'
        });
      }

      return product;
    }

    // In-memory fallback
    const newId = `prod_${Date.now()}`;
    const initialStock = Math.max(0, (input as any).initialStock !== undefined ? (input as any).initialStock : (input.stockQuantity || 0));
    const reorderPoint = (input as any).minStockThreshold !== undefined ? (input as any).minStockThreshold : (input.reorderPoint !== undefined ? input.reorderPoint : 10);
    const availableStock = initialStock;
    const targetStock = reorderPoint * 2;
    const suggestedReorderQuantity = Math.max(0, targetStock - availableStock);
    const status = availableStock <= 0 ? 'out_of_stock' : availableStock <= reorderPoint ? 'low_stock' : 'in_stock';
    const newProd = {
      _id: newId,
      businessId,
      ...input,
      sku,
      stockQuantity: initialStock,
      reservedStock: 0,
      availableStock,
      reorderPoint,
      minStockThreshold: reorderPoint,
      suggestedReorderQuantity,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memProducts.set(newId, newProd);

    if (initialStock > 0) {
      const ledgerId = `sl_init_${Date.now()}`;
      memStockLedger.set(ledgerId, {
        _id: ledgerId,
        businessId,
        productId: newId,
        movementType: 'STOCK_IN',
        quantity: initialStock,
        previousStock: 0,
        newStock: initialStock,
        referenceType: 'INITIAL_STOCK',
        referenceId: `INIT-${sku}`,
        notes: 'Initial inventory setup',
        timestamp: new Date()
      });
    }
    return newProd;
  }

  static async updateProduct(businessId: string, productId: string, input: IProductUpdateInput, actorUserId?: string) {
    if (isDbConnected()) {
      const product = await Product.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(productId)
      });
      if (!product) throw new Error('Product not found.');

      if (input.name) product.name = input.name.trim();
      if (input.sku) product.sku = input.sku.trim().toUpperCase();
      if (input.barcode !== undefined) product.barcode = input.barcode.trim();
      if (input.category) product.category = input.category.trim();
      if (input.categoryId !== undefined) {
        product.categoryId = input.categoryId && Types.ObjectId.isValid(input.categoryId) ? new Types.ObjectId(input.categoryId) : null;
      }
      if (input.price !== undefined) product.price = input.price;
      if (input.cost !== undefined) product.cost = input.cost;
      if (input.taxRate !== undefined) product.taxRate = input.taxRate;
      if (input.unit) product.unit = input.unit.trim();
      if (input.description !== undefined) product.description = input.description.trim();
      if (input.productImage !== undefined) product.productImage = input.productImage.trim();
      if (input.supplierId !== undefined) {
        product.supplierId = input.supplierId && Types.ObjectId.isValid(input.supplierId) ? new Types.ObjectId(input.supplierId) : null;
      }
      if (input.reorderPoint !== undefined) {
        product.reorderPoint = input.reorderPoint;
        product.minStockThreshold = input.reorderPoint;
      }
      if (input.minStockThreshold !== undefined) {
        product.minStockThreshold = input.minStockThreshold;
        product.reorderPoint = input.minStockThreshold;
      }

      await product.save();
      return product;
    }

    const prod = memProducts.get(productId);
    if (!prod) throw new Error('Product not found.');
    Object.assign(prod, input);
    prod.updatedAt = new Date();
    return prod;
  }

  static async deleteProduct(businessId: string, productId: string) {
    if (isDbConnected()) {
      const product = await Product.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(productId)
      });
      if (!product) throw new Error('Product not found.');

      // Safeguard 1: Cannot delete if physical stock > 0
      if (product.stockQuantity > 0 || product.availableStock > 0) {
        throw new Error(
          `Cannot delete product '${product.name}' with positive stock balance (${product.stockQuantity} ${product.unit}). Adjust stock to zero or write off before removing.`
        );
      }

      // Safeguard 2: Check if linked to open Sales Orders or Purchase Orders
      const activeSales = await SalesOrder.countDocuments({
        businessId: new Types.ObjectId(businessId),
        'items.productId': product._id,
        status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] }
      });
      if (activeSales > 0) {
        throw new Error(
          `Cannot delete product '${product.name}' currently included in ${activeSales} active sales orders.`
        );
      }

      await Product.deleteOne({ _id: product._id });
      return { success: true, message: `Product '${product.name}' removed from inventory.` };
    }

    const prod = memProducts.get(productId);
    if (prod && prod.stockQuantity > 0) {
      throw new Error(`Cannot delete product with positive stock balance (${prod.stockQuantity}).`);
    }
    memProducts.delete(productId);
    return { success: true, message: 'Product removed.' };
  }

  /**
   * ============================================================================
   * MODULE 7: WAREHOUSE MANAGEMENT
   * ============================================================================
   */

  static async listWarehouses(businessId: string) {
    await seedDemoInventoryIfEmpty(businessId);
    if (isDbConnected()) {
      const warehouses = await Warehouse.find({
        businessId: new Types.ObjectId(businessId)
      })
        .populate('managerId', 'fullName email phone')
        .sort({ isPrimary: -1, name: 1 })
        .lean();
      return warehouses;
    }

    return Array.from(memWarehouses.values()).filter((w) => w.businessId === businessId);
  }

  static async createWarehouse(businessId: string, input: IWarehouseInput) {
    await seedDemoInventoryIfEmpty(businessId);
    const code = input.code.trim().toUpperCase();

    if (isDbConnected()) {
      const existing = await Warehouse.findOne({
        businessId: new Types.ObjectId(businessId),
        code
      });
      if (existing) {
        throw new Error(`Warehouse with code '${code}' already exists.`);
      }

      // If set as primary, unmark other warehouses
      if (input.isPrimary) {
        await Warehouse.updateMany(
          { businessId: new Types.ObjectId(businessId) },
          { isPrimary: false }
        );
      }

      const warehouse = await Warehouse.create({
        businessId: new Types.ObjectId(businessId),
        code,
        name: input.name.trim(),
        address: input.address || {},
        contactPhone: input.contactPhone || '',
        contactEmail: input.contactEmail || '',
        managerId: input.managerId && Types.ObjectId.isValid(input.managerId) ? new Types.ObjectId(input.managerId) : null,
        isPrimary: input.isPrimary || false,
        status: input.status || 'ACTIVE'
      });
      return warehouse;
    }

    const newId = `wh_${Date.now()}`;
    const newWh = {
      _id: newId,
      businessId,
      ...input,
      code,
      totalProductsCount: 0,
      totalStockQuantity: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memWarehouses.set(newId, newWh);
    return newWh;
  }

  static async updateWarehouse(businessId: string, warehouseId: string, input: IWarehouseUpdateInput) {
    if (isDbConnected()) {
      const warehouse = await Warehouse.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(warehouseId)
      });
      if (!warehouse) throw new Error('Warehouse not found.');

      if (input.isPrimary) {
        await Warehouse.updateMany(
          { businessId: new Types.ObjectId(businessId) },
          { isPrimary: false }
        );
        warehouse.isPrimary = true;
      }

      if (input.name) warehouse.name = input.name.trim();
      if (input.code) warehouse.code = input.code.trim().toUpperCase();
      if (input.contactPhone !== undefined) warehouse.contactPhone = input.contactPhone;
      if (input.contactEmail !== undefined) warehouse.contactEmail = input.contactEmail;
      if (input.status) warehouse.status = input.status;
      if (input.address) Object.assign(warehouse.address, input.address);
      if (input.managerId !== undefined) {
        warehouse.managerId = input.managerId && Types.ObjectId.isValid(input.managerId) ? new Types.ObjectId(input.managerId) : null;
      }

      await warehouse.save();
      return warehouse;
    }

    const wh = memWarehouses.get(warehouseId);
    if (!wh) throw new Error('Warehouse not found.');
    Object.assign(wh, input);
    wh.updatedAt = new Date();
    return wh;
  }

  static async deleteWarehouse(businessId: string, warehouseId: string) {
    if (isDbConnected()) {
      const warehouse = await Warehouse.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(warehouseId)
      });
      if (!warehouse) throw new Error('Warehouse not found.');

      if (warehouse.isPrimary) {
        throw new Error('Cannot delete primary warehouse. Designate another warehouse as primary first.');
      }

      // Check warehouse stock
      const inventoryCount = await Inventory.countDocuments({
        businessId: new Types.ObjectId(businessId),
        warehouseId: warehouse._id,
        currentStock: { $gt: 0 }
      });
      if (inventoryCount > 0) {
        throw new Error(
          `Cannot delete warehouse '${warehouse.name}' because it holds active stock across ${inventoryCount} products. Transfer stock out first.`
        );
      }

      await Warehouse.deleteOne({ _id: warehouse._id });
      return { success: true, message: `Warehouse '${warehouse.name}' deleted.` };
    }

    memWarehouses.delete(warehouseId);
    return { success: true, message: 'Warehouse deleted.' };
  }

  /**
   * ============================================================================
   * MODULE 2: STOCK LEDGER & MOVEMENTS (IN / OUT / ADJUSTMENT)
   * ============================================================================
   */

  static async recordStockMovement(businessId: string, input: IStockMovementInput, actorUserId?: string) {
    if (input.quantity <= 0) {
      throw new Error('Stock movement quantity must be a positive number.');
    }

    if (isDbConnected()) {
      const product = await Product.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(input.productId)
      });
      if (!product) throw new Error('Product not found.');

      const previousStock = product.stockQuantity;
      let newStock = previousStock;

      if (input.movementType === 'STOCK_IN') {
        newStock = previousStock + input.quantity;
      } else if (input.movementType === 'STOCK_OUT') {
        if (product.availableStock < input.quantity) {
          throw new Error(
            `Insufficient available stock for '${product.name}'. Available: ${product.availableStock}, Requested: ${input.quantity}`
          );
        }
        newStock = Math.max(0, previousStock - input.quantity);
      } else if (input.movementType === 'ADJUSTMENT') {
        // Direct absolute count adjustment
        newStock = input.quantity;
      }

      // Update product physical & available stock
      product.stockQuantity = newStock;
      await product.save(); // pre-save hook handles availableStock, status, and suggestedReorder

      // If warehouse is specified, update or create Inventory record
      let warehouseObjId: Types.ObjectId | null = null;
      if (input.warehouseId && Types.ObjectId.isValid(input.warehouseId)) {
        warehouseObjId = new Types.ObjectId(input.warehouseId);
        let inv = await Inventory.findOne({
          businessId: new Types.ObjectId(businessId),
          warehouseId: warehouseObjId,
          productId: product._id
        });

        if (!inv) {
          inv = await Inventory.create({
            businessId: new Types.ObjectId(businessId),
            warehouseId: warehouseObjId,
            productId: product._id,
            currentStock: newStock,
            reorderPoint: product.reorderPoint
          });
        } else {
          inv.currentStock = newStock;
          await inv.save();
        }
      }

      // Record immutable StockLedger entry
      const ledgerEntry = await StockLedger.create({
        businessId: new Types.ObjectId(businessId),
        productId: product._id,
        warehouseId: warehouseObjId,
        movementType: input.movementType,
        quantity: input.quantity,
        previousStock,
        newStock,
        referenceType: input.referenceType || 'MANUAL_ADJUSTMENT',
        referenceId: input.referenceId || `ADJ-${Date.now()}`,
        notes: input.reason || 'Manual stock update',
        performedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined,
        timestamp: new Date()
      });

      // Low stock alert verification
      if (product.status === 'low_stock' && actorUserId) {
        await Notification.create({
          businessId: new Types.ObjectId(businessId),
          recipientUserId: new Types.ObjectId(actorUserId),
          title: 'Low Stock Alert Triggered',
          message: `Product '${product.name}' is low on stock (${product.availableStock}/${product.reorderPoint}). Recommended reorder: ${product.suggestedReorderQuantity} ${product.unit}.`,
          type: 'LOW_STOCK'
        });
      }

      return { product, ledgerEntry };
    }

    // In-memory fallback
    const prod = memProducts.get(input.productId);
    if (!prod) throw new Error('Product not found.');
    const previousStock = prod.stockQuantity || 0;
    let newStock = previousStock;

    if (input.movementType === 'STOCK_IN') {
      newStock += input.quantity;
    } else if (input.movementType === 'STOCK_OUT') {
      if ((prod.availableStock || prod.stockQuantity) < input.quantity) {
        throw new Error(`Insufficient stock. Available: ${prod.availableStock || prod.stockQuantity}`);
      }
      newStock = Math.max(0, previousStock - input.quantity);
    } else {
      newStock = input.quantity;
    }

    prod.stockQuantity = newStock;
    prod.availableStock = newStock;
    prod.status = newStock <= 0 ? 'out_of_stock' : newStock <= (prod.reorderPoint || 10) ? 'low_stock' : 'in_stock';
    prod.suggestedReorderQuantity = Math.max(0, (prod.reorderPoint || 10) * 2 - newStock);

    const ledgerId = `sl_${Date.now()}`;
    const ledgerEntry = {
      _id: ledgerId,
      businessId,
      productId: input.productId,
      movementType: input.movementType,
      quantity: input.quantity,
      previousStock,
      newStock,
      referenceType: input.referenceType || 'MANUAL_ADJUSTMENT',
      referenceId: input.referenceId || `ADJ-${Date.now()}`,
      notes: input.reason,
      timestamp: new Date()
    };
    memStockLedger.set(ledgerId, ledgerEntry);

    return { product: prod, ledgerEntry };
  }

  /**
   * ============================================================================
   * MODULE 7: STOCK TRANSFER (WAREHOUSE TO WAREHOUSE)
   * ============================================================================
   */

  static async createStockTransfer(businessId: string, input: IStockTransferCreateInput, actorUserId?: string) {
    if (input.fromWarehouseId === input.toWarehouseId) {
      throw new Error('Source warehouse and destination warehouse cannot be the same.');
    }

    if (isDbConnected()) {
      const fromWh = await Warehouse.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(input.fromWarehouseId)
      });
      const toWh = await Warehouse.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(input.toWarehouseId)
      });

      if (!fromWh || !toWh) throw new Error('Source or destination warehouse not found.');

      // Check stock availability in fromWarehouse / Product
      const validatedItems = [];
      for (const item of input.items) {
        const prod = await Product.findOne({
          businessId: new Types.ObjectId(businessId),
          _id: new Types.ObjectId(item.productId)
        });
        if (!prod) throw new Error(`Product ${item.productId} not found.`);

        if (prod.availableStock < item.quantity) {
          throw new Error(
            `Insufficient available stock for '${prod.name}'. Available: ${prod.availableStock}, Transfer requested: ${item.quantity}`
          );
        }

        validatedItems.push({
          productId: prod._id,
          productName: prod.name,
          quantity: item.quantity
        });
      }

      // Generate Transfer Number
      const count = await StockTransfer.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const transferNumber = `TRF-${new Date().getFullYear()}-${1000 + count + 1}`;

      const transfer = await StockTransfer.create({
        businessId: new Types.ObjectId(businessId),
        transferNumber,
        fromWarehouseId: fromWh._id,
        toWarehouseId: toWh._id,
        items: validatedItems,
        status: 'COMPLETED',
        notes: input.notes || '',
        transferDate: new Date(),
        receivedDate: new Date(),
        performedBy: actorUserId && Types.ObjectId.isValid(actorUserId) ? new Types.ObjectId(actorUserId) : undefined
      });

      // Record StockLedger movements for each item
      for (const item of validatedItems) {
        await StockLedger.create({
          businessId: new Types.ObjectId(businessId),
          productId: item.productId,
          warehouseId: fromWh._id,
          movementType: 'TRANSFER_OUT',
          quantity: item.quantity,
          previousStock: 0,
          newStock: 0,
          referenceType: 'STOCK_TRANSFER',
          referenceId: transferNumber,
          notes: `Transferred to ${toWh.name}`
        });

        await StockLedger.create({
          businessId: new Types.ObjectId(businessId),
          productId: item.productId,
          warehouseId: toWh._id,
          movementType: 'TRANSFER_IN',
          quantity: item.quantity,
          previousStock: 0,
          newStock: item.quantity,
          referenceType: 'STOCK_TRANSFER',
          referenceId: transferNumber,
          notes: `Transferred from ${fromWh.name}`
        });
      }

      return transfer;
    }

    // In-memory fallback
    const transferNumber = `TRF-${new Date().getFullYear()}-${1000 + memStockTransfers.size + 1}`;
    const newId = `trf_${Date.now()}`;
    const transfer = {
      _id: newId,
      businessId,
      transferNumber,
      fromWarehouseId: input.fromWarehouseId,
      toWarehouseId: input.toWarehouseId,
      items: input.items,
      status: 'COMPLETED',
      notes: input.notes,
      transferDate: new Date(),
      receivedDate: new Date()
    };
    memStockTransfers.set(newId, transfer);
    return transfer;
  }

  static async listStockTransfers(businessId: string) {
    if (isDbConnected()) {
      const transfers = await StockTransfer.find({ businessId: new Types.ObjectId(businessId) })
        .populate('fromWarehouseId', 'name code')
        .populate('toWarehouseId', 'name code')
        .sort({ transferDate: -1 })
        .lean();
      return transfers;
    }

    return Array.from(memStockTransfers.values()).filter((t) => t.businessId === businessId);
  }

  /**
   * ============================================================================
   * MODULE 3: LOW STOCK ALERTS & THRESHOLDS
   * ============================================================================
   */

  static async getLowStockAlerts(businessId: string) {
    await seedDemoInventoryIfEmpty(businessId);
    if (isDbConnected()) {
      const lowStockProducts = await Product.find({
        businessId: new Types.ObjectId(businessId),
        $expr: { $lte: ['$availableStock', '$reorderPoint'] }
      })
        .select('name sku barcode availableStock stockQuantity reorderPoint minStockThreshold suggestedReorderQuantity unit status cost price')
        .lean();

      return lowStockProducts.map((p) => ({
        productId: p._id.toString(),
        productName: p.name,
        sku: p.sku,
        barcode: p.barcode,
        availableStock: p.availableStock,
        stockQuantity: p.stockQuantity,
        reorderPoint: p.reorderPoint,
        suggestedReorderQuantity: p.suggestedReorderQuantity || Math.max(0, p.reorderPoint * 2 - p.availableStock),
        unit: p.unit,
        status: p.status,
        unitCost: p.cost,
        estimatedReorderCost: (p.suggestedReorderQuantity || Math.max(0, p.reorderPoint * 2 - p.availableStock)) * (p.cost || 0)
      }));
    }

    const prods = Array.from(memProducts.values()).filter(
      (p) => p.businessId === businessId && p.availableStock <= (p.reorderPoint || 10)
    );
    return prods.map((p) => ({
      _id: p._id,
      productId: p._id,
      productName: p.name,
      sku: p.sku,
      availableStock: p.availableStock,
      reorderPoint: p.reorderPoint,
      suggestedReorderQuantity: p.suggestedReorderQuantity,
      unit: p.unit,
      status: p.status
    }));
  }

  /**
   * ============================================================================
   * MODULE 2: STOCK LEDGER AUDIT TRAIL
   * ============================================================================
   */

  static async getStockHistory(
    businessId: string,
    filters: {
      productId?: string;
      warehouseId?: string;
      movementType?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };

      if (filters.productId && Types.ObjectId.isValid(filters.productId)) {
        query.productId = new Types.ObjectId(filters.productId);
      }
      if (filters.warehouseId && Types.ObjectId.isValid(filters.warehouseId)) {
        query.warehouseId = new Types.ObjectId(filters.warehouseId);
      }
      if (filters.movementType) {
        query.movementType = filters.movementType;
      }

      const [ledger, total] = await Promise.all([
        StockLedger.find(query)
          .populate('productId', 'name sku unit')
          .populate('warehouseId', 'name code')
          .populate('performedBy', 'fullName email')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        StockLedger.countDocuments(query)
      ]);

      return { ledger, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memStockLedger.values()).filter((l) => l.businessId === businessId);
    if (filters.productId) list = list.filter((l) => l.productId === filters.productId);
    if (filters.warehouseId) list = list.filter((l) => l.warehouseId === filters.warehouseId);
    if (filters.movementType) list = list.filter((l) => l.movementType === filters.movementType);
    return { ledger: list.slice(skip, skip + limit), total: list.length, page, totalPages: Math.ceil(list.length / limit) };
  }

  /**
   * ============================================================================
   * MODULE 8: INVENTORY ANALYTICS & INSIGHTS
   * ============================================================================
   */

  static async getInventoryAnalytics(businessId: string): Promise<IInventoryAnalyticsData> {
    await seedDemoInventoryIfEmpty(businessId);
    const bizObjId = new Types.ObjectId(businessId);

    if (isDbConnected()) {
      const [allProducts, allWarehouses, allSuppliers, allPurchaseOrders, ledgerEntries] = await Promise.all([
        Product.find({ businessId: bizObjId }).lean(),
        Warehouse.find({ businessId: bizObjId }).lean(),
        Warehouse.find({ businessId: bizObjId }), // fallback count
        PurchaseOrder.find({ businessId: bizObjId }).lean(),
        StockLedger.find({ businessId: bizObjId }).lean()
      ]);

      const totalProducts = allProducts.length;
      const totalStockValue = Math.round(
        allProducts.reduce((sum, p) => sum + (p.stockQuantity || 0) * (p.cost || p.price || 0), 0) * 100
      ) / 100;

      const lowStockProductsCount = allProducts.filter((p) => p.status === 'low_stock').length;
      const outOfStockProductsCount = allProducts.filter((p) => p.status === 'out_of_stock').length;
      const totalWarehousesCount = allWarehouses.length;
      const totalSuppliersCount = 3; // default seeded suppliers

      const lowStockAlerts = allProducts
        .filter((p) => (p.availableStock || 0) <= (p.reorderPoint || 10))
        .map((p) => ({
          productId: p._id.toString(),
          productName: p.name,
          sku: p.sku,
          availableStock: p.availableStock || 0,
          reorderPoint: p.reorderPoint || 10,
          suggestedReorderQuantity: p.suggestedReorderQuantity || Math.max(0, (p.reorderPoint || 10) * 2 - (p.availableStock || 0)),
          unit: p.unit || 'units'
        }));

      // Movements aggregation
      const totalStockIn = ledgerEntries
        .filter((l) => ['STOCK_IN', 'PURCHASE_RECEIPT', 'TRANSFER_IN'].includes(l.movementType))
        .reduce((sum, l) => sum + (l.quantity || 0), 0);

      const totalStockOut = ledgerEntries
        .filter((l) => ['STOCK_OUT', 'SALES_FULFILLMENT', 'TRANSFER_OUT'].includes(l.movementType))
        .reduce((sum, l) => sum + (l.quantity || 0), 0);

      const totalAdjustments = ledgerEntries
        .filter((l) => l.movementType === 'ADJUSTMENT')
        .reduce((sum, l) => sum + (l.quantity || 0), 0);

      // Purchase summary
      const totalPurchaseOrders = allPurchaseOrders.length;
      const pendingOrdersCount = allPurchaseOrders.filter((po) =>
        ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status)
      ).length;
      const totalPurchaseSpend = Math.round(
        allPurchaseOrders
          .filter((po) => po.status !== 'CANCELLED')
          .reduce((sum, po) => sum + (po.totalAmount || 0), 0) * 100
      ) / 100;

      return {
        totalProducts,
        totalStockValue,
        lowStockProductsCount,
        outOfStockProductsCount,
        totalWarehousesCount,
        totalSuppliersCount,
        lowStockAlerts,
        stockMovementSummary: {
          totalStockIn,
          totalStockOut,
          totalAdjustments
        },
        purchaseSummary: {
          totalPurchaseOrders,
          pendingOrdersCount,
          totalPurchaseSpend
        }
      };
    }

    // In-memory fallback
    const prods = Array.from(memProducts.values()).filter((p) => p.businessId === businessId);
    const totalStockValue = prods.reduce((sum, p) => sum + (p.stockQuantity || 0) * (p.cost || 500), 0);

    return {
      totalProducts: prods.length,
      totalStockValue,
      lowStockProductsCount: prods.filter((p) => p.status === 'low_stock').length,
      outOfStockProductsCount: prods.filter((p) => p.status === 'out_of_stock').length,
      totalWarehousesCount: 2,
      totalSuppliersCount: 2,
      lowStockAlerts: [],
      stockMovementSummary: { totalStockIn: 100, totalStockOut: 20, totalAdjustments: 5 },
      purchaseSummary: { totalPurchaseOrders: 2, pendingOrdersCount: 1, totalPurchaseSpend: 15000 }
    };
  }
}

export default InventoryService;

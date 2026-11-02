import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import inventoryService from '../../services/inventoryService';
import {
  IProductItem,
  IProductCategory,
  IWarehouseItem,
  IStockLedgerItem,
  IStockTransferItem,
  ILowStockAlertItem,
  IInventoryAnalyticsData
} from '../../types';
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  Layers,
  ArrowRightLeft,
  History,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Barcode,
  PackagePlus,
  Warehouse as WarehouseIcon
} from 'lucide-react';

export const InventoryManagementPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Active Tab: 'products' | 'categories' | 'warehouses' | 'movements' | 'transfers' | 'alerts'
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'warehouses' | 'movements' | 'transfers' | 'alerts'>('products');

  // Data states
  const [products, setProducts] = useState<IProductItem[]>([]);
  const [categories, setCategories] = useState<IProductCategory[]>([]);
  const [warehouses, setWarehouses] = useState<IWarehouseItem[]>([]);
  const [stockLedger, setStockLedger] = useState<IStockLedgerItem[]>([]);
  const [transfers, setTransfers] = useState<IStockTransferItem[]>([]);
  const [alerts, setAlerts] = useState<ILowStockAlertItem[]>([]);
  const [analytics, setAnalytics] = useState<IInventoryAnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Selected item
  const [selectedProduct, setSelectedProduct] = useState<IProductItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<IWarehouseItem | null>(null);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'General',
    categoryId: '',
    price: 0,
    cost: 0,
    taxRate: 18,
    stockQuantity: 0,
    reorderPoint: 10,
    unit: 'units',
    description: '',
    productImage: ''
  });

  // Category Form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    description: ''
  });

  // Warehouse Form
  const [warehouseForm, setWarehouseForm] = useState({
    code: '',
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    contactPhone: '',
    contactEmail: '',
    isPrimary: false
  });

  // Movement Form
  const [movementForm, setMovementForm] = useState({
    productId: '',
    warehouseId: '',
    movementType: 'STOCK_IN' as 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT',
    quantity: 1,
    reason: ''
  });

  // Transfer Form
  const [transferForm, setTransferForm] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    productId: '',
    quantity: 1,
    notes: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await inventoryService.listProducts(businessId, {
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        page,
        limit: 15
      });
      setProducts(res.products || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [businessId, searchTerm, categoryFilter, statusFilter, page]);

  const fetchAuxData = useCallback(async () => {
    if (!businessId) return;
    try {
      const [cats, whs, alts, anl, led, trfs] = await Promise.all([
        inventoryService.listCategories(businessId),
        inventoryService.listWarehouses(businessId),
        inventoryService.getLowStockAlerts(businessId),
        inventoryService.getInventoryAnalytics(businessId),
        inventoryService.getStockHistory(businessId, { limit: 25 }),
        inventoryService.listStockTransfers(businessId)
      ]);
      setCategories(cats || []);
      setWarehouses(whs || []);
      setAlerts(alts || []);
      setAnalytics(anl);
      setStockLedger(led.ledger || []);
      setTransfers(trfs || []);

      if (whs && whs.length >= 2) {
        setTransferForm((f) => ({
          ...f,
          fromWarehouseId: whs[0]._id,
          toWarehouseId: whs[1]._id
        }));
      }
    } catch {
      // non-fatal aux error
    }
  }, [businessId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchAuxData();
  }, [fetchAuxData]);

  // Handle Product CRUD
  const handleOpenAddProduct = () => {
    setProductForm({
      name: '',
      sku: '',
      barcode: '',
      category: categories[0]?.name || 'General',
      categoryId: categories[0]?._id || '',
      price: 100,
      cost: 60,
      taxRate: 18,
      stockQuantity: 10,
      reorderPoint: 10,
      unit: 'units',
      description: '',
      productImage: ''
    });
    setShowAddProductModal(true);
  };

  const handleOpenEditProduct = (p: IProductItem) => {
    setSelectedProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode || '',
      category: p.category || 'General',
      categoryId: p.categoryId?._id || p.categoryId || '',
      price: p.price,
      cost: p.cost || 0,
      taxRate: p.taxRate || 0,
      stockQuantity: p.stockQuantity,
      reorderPoint: p.reorderPoint || 10,
      unit: p.unit || 'units',
      description: p.description || '',
      productImage: p.productImage || ''
    });
    setShowEditProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      setActionLoading(true);
      setErrorMsg('');

      if (showEditProductModal && selectedProduct) {
        await inventoryService.updateProduct(businessId, selectedProduct._id, productForm);
        setSuccessMsg(`Product '${productForm.name}' updated.`);
        setShowEditProductModal(false);
      } else {
        await inventoryService.createProduct(businessId, productForm);
        setSuccessMsg(`Product '${productForm.name}' created with SKU ${productForm.sku}.`);
        setShowAddProductModal(false);
      }

      fetchProducts();
      fetchAuxData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProductConfirm = async () => {
    if (!businessId || !selectedProduct) return;
    try {
      setActionLoading(true);
      await inventoryService.deleteProduct(businessId, selectedProduct._id);
      setSuccessMsg(`Product '${selectedProduct.name}' removed from catalog.`);
      setShowDeleteProductModal(false);
      fetchProducts();
      fetchAuxData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to delete product.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      setActionLoading(true);
      if (selectedCategory) {
        await inventoryService.updateCategory(businessId, selectedCategory._id, categoryForm);
        setSuccessMsg('Category updated.');
      } else {
        await inventoryService.createCategory(businessId, categoryForm);
        setSuccessMsg('New category created.');
      }
      setShowCategoryModal(false);
      setSelectedCategory(null);
      fetchAuxData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (cat: IProductCategory) => {
    if (!businessId) return;
    try {
      await inventoryService.deleteCategory(businessId, cat._id);
      setSuccessMsg(`Category '${cat.name}' removed.`);
      fetchAuxData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Cannot delete category.');
    }
  };

  // Handle Warehouse CRUD
  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      setActionLoading(true);
      const payload = {
        code: warehouseForm.code,
        name: warehouseForm.name,
        contactPhone: warehouseForm.contactPhone,
        contactEmail: warehouseForm.contactEmail,
        isPrimary: warehouseForm.isPrimary,
        address: {
          street: warehouseForm.street,
          city: warehouseForm.city,
          state: warehouseForm.state,
          postalCode: warehouseForm.postalCode,
          country: warehouseForm.country
        }
      };

      if (selectedWarehouse) {
        await inventoryService.updateWarehouse(businessId, selectedWarehouse._id, payload);
        setSuccessMsg('Warehouse updated.');
      } else {
        await inventoryService.createWarehouse(businessId, payload);
        setSuccessMsg('New warehouse location registered.');
      }
      setShowWarehouseModal(false);
      setSelectedWarehouse(null);
      fetchAuxData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save warehouse.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Stock Movement
  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !movementForm.productId) return;
    try {
      setActionLoading(true);
      await inventoryService.recordStockMovement(businessId, {
        productId: movementForm.productId,
        warehouseId: movementForm.warehouseId || undefined,
        movementType: movementForm.movementType,
        quantity: Number(movementForm.quantity),
        reason: movementForm.reason
      });
      setSuccessMsg(`Stock movement recorded successfully and ledger updated.`);
      setShowMovementModal(false);
      setMovementForm({ productId: '', warehouseId: '', movementType: 'STOCK_IN', quantity: 1, reason: '' });
      fetchProducts();
      fetchAuxData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to record stock movement.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Stock Transfer
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !transferForm.productId || !transferForm.fromWarehouseId || !transferForm.toWarehouseId) return;
    try {
      setActionLoading(true);
      await inventoryService.createStockTransfer(businessId, {
        fromWarehouseId: transferForm.fromWarehouseId,
        toWarehouseId: transferForm.toWarehouseId,
        items: [{ productId: transferForm.productId, quantity: Number(transferForm.quantity) }],
        notes: transferForm.notes
      });
      setSuccessMsg('Stock transferred between warehouses successfully.');
      setShowTransferModal(false);
      fetchProducts();
      fetchAuxData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Transfer failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">IN STOCK</span>;
      case 'low_stock':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">LOW STOCK</span>;
      case 'out_of_stock':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">OUT OF STOCK</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-7 h-7 text-indigo-600" />
            Inventory & Warehouse Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain product catalogs, manage multiple warehouses, log stock movements, and track automated low-stock warnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              if (products.length > 0) {
                setMovementForm({
                  productId: products[0]._id,
                  warehouseId: warehouses[0]?._id || '',
                  movementType: 'STOCK_IN',
                  quantity: 10,
                  reason: 'Stock Intake'
                });
              }
              setShowMovementModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
          >
            <PackagePlus className="w-4 h-4 text-emerald-600" />
            Stock In / Out
          </button>

          {warehouses.length >= 2 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              Transfer Stock
            </button>
          )}

          <button
            onClick={handleOpenAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Top Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Products</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalProducts}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Stock Value</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ${analytics.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Low Stock Alerts</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{analytics.lowStockProductsCount}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Warehouses</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{analytics.totalWarehousesCount}</div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'alerts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Low Stock Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'warehouses' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" />
          Warehouses ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'movements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          Stock Ledger & Movements
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'transfers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Transfers ({transfers.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PRODUCT CATALOG
          ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="">All Statuses</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5 text-right">Selling Price</th>
                    <th className="px-5 py-3.5 text-right">Cost</th>
                    <th className="px-5 py-3.5 text-right">Available Stock</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-2"></div>
                        <div>Loading product inventory...</div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                        <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-base font-medium text-slate-700">No products found</p>
                        <p className="text-sm text-slate-400 mt-1">Add items to your catalog to track inventory.</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="flex items-center gap-2 text-xs text-indigo-600 font-mono mt-0.5">
                            <span>{p.sku}</span>
                            {p.barcode && (
                              <span className="text-slate-400 flex items-center gap-0.5">
                                <Barcode className="w-3 h-3" /> {p.barcode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-900">
                          ${p.price.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-600">
                          ${(p.cost || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-bold text-slate-900">
                            {p.availableStock !== undefined ? p.availableStock : p.stockQuantity}
                          </span>{' '}
                          <span className="text-xs text-slate-500">{p.unit}</span>
                          {p.reservedStock > 0 && (
                            <div className="text-[10px] text-amber-600">
                              ({p.reservedStock} reserved)
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(p.status)}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              title="Edit Product"
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(p);
                                setShowDeleteProductModal(true);
                              }}
                              title="Delete Product"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LOW STOCK ALERTS (MODULE 3)
          ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Automated Stock Threshold Alert:</strong> Products listed below have reached or dropped below their minimum stock threshold. Suggested reorder quantities are computed using the platform reorder rule (2x Threshold &minus; Available Stock).
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">SKU</th>
                  <th className="px-5 py-3.5 text-right">Available Stock</th>
                  <th className="px-5 py-3.5 text-right">Min Threshold</th>
                  <th className="px-5 py-3.5 text-right">Suggested Reorder Qty</th>
                  <th className="px-5 py-3.5 text-right">Est. Reorder Cost</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      All inventory products are above minimum threshold levels. No low stock warnings.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alt) => (
                    <tr key={alt.productId} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{alt.productName}</td>
                      <td className="px-5 py-4 font-mono text-xs text-indigo-600">{alt.sku}</td>
                      <td className="px-5 py-4 text-right font-bold text-amber-700">
                        {alt.availableStock} {alt.unit}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-600 font-medium">
                        {alt.reorderPoint} {alt.unit}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-700">
                        +{alt.suggestedReorderQuantity} {alt.unit}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">
                        ${(alt.estimatedReorderCost || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(alt.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CATEGORIES
          ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setCategoryForm({ name: '', code: '', description: '' });
                setShowCategoryModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {cat.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5">{cat.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryForm({ name: cat.name, code: cat.code, description: cat.description || '' });
                        setShowCategoryModal(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {cat.description && <p className="text-xs text-slate-500">{cat.description}</p>}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Products Assigned:</span>
                  <span className="font-bold text-slate-900">{cat.productCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Stock Valuation:</span>
                  <span className="font-bold text-emerald-700">${(cat.totalStockValue || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: WAREHOUSES
          ========================================================================= */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSelectedWarehouse(null);
                setWarehouseForm({
                  code: '',
                  name: '',
                  street: '',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: 'India',
                  contactPhone: '',
                  contactEmail: '',
                  isPrimary: false
                });
                setShowWarehouseModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Register Warehouse
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh) => (
              <div key={wh._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {wh.code}
                      </span>
                      {wh.isPrimary && (
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5">{wh.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${wh.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {wh.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>{[wh.address?.street, wh.address?.city, wh.address?.state, wh.address?.country].filter(Boolean).join(', ') || 'Address not configured'}</div>
                  {wh.contactPhone && <div>Phone: {wh.contactPhone}</div>}
                  {wh.contactEmail && <div>Email: {wh.contactEmail}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: STOCK LEDGER AUDIT TRAIL
          ========================================================================= */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Movement Type</th>
                  <th className="px-5 py-3.5 text-right">Quantity</th>
                  <th className="px-5 py-3.5 text-right">Balance After</th>
                  <th className="px-5 py-3.5">Reference / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stockLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  stockLedger.map((sl) => (
                    <tr key={sl._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {new Date(sl.timestamp).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{sl.productId?.name || 'Product'}</div>
                        <div className="text-xs font-mono text-indigo-600">{sl.productId?.sku}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          ['STOCK_IN', 'PURCHASE_RECEIPT', 'TRANSFER_IN'].includes(sl.movementType)
                            ? 'bg-emerald-100 text-emerald-800'
                            : ['STOCK_OUT', 'SALES_FULFILLMENT', 'TRANSFER_OUT'].includes(sl.movementType)
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sl.movementType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        {['STOCK_IN', 'PURCHASE_RECEIPT', 'TRANSFER_IN'].includes(sl.movementType) ? `+${sl.quantity}` : `-${sl.quantity}`}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                        {sl.newStock}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        <div className="font-mono text-slate-800">{sl.referenceId || sl.referenceType}</div>
                        {sl.notes && <div className="text-slate-400">{sl.notes}</div>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: STOCK TRANSFERS
          ========================================================================= */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Transfer Number</th>
                  <th className="px-5 py-3.5">From Warehouse</th>
                  <th className="px-5 py-3.5">To Warehouse</th>
                  <th className="px-5 py-3.5 text-right">Items Count</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No stock transfers recorded between warehouses.
                    </td>
                  </tr>
                ) : (
                  transfers.map((trf) => (
                    <tr key={trf._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-mono font-bold text-indigo-600">{trf.transferNumber}</td>
                      <td className="px-5 py-4 font-medium text-slate-800">{trf.fromWarehouseId?.name || 'Warehouse A'}</td>
                      <td className="px-5 py-4 font-medium text-slate-800">{trf.toWarehouseId?.name || 'Warehouse B'}</td>
                      <td className="px-5 py-4 text-right font-bold text-slate-900">{trf.items?.length || 1}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {trf.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">{new Date(trf.transferDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT PRODUCT
          ========================================================================= */}
      {(showAddProductModal || showEditProductModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-600" />
                {showEditProductModal ? 'Edit Product Details' : 'Add New Inventory Product'}
              </h2>
              <button onClick={() => { setShowAddProductModal(false); setShowEditProductModal(false); }}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Gigabit Cloud Router"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. NET-RTR-001"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    placeholder="8901234567890"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="units / pcs / kg"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost / Purchase ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={productForm.cost}
                    onChange={(e) => setProductForm({ ...productForm, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productForm.taxRate}
                    onChange={(e) => setProductForm({ ...productForm, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Reorder Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.reorderPoint}
                    onChange={(e) => setProductForm({ ...productForm, reorderPoint: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-right"
                  />
                </div>
              </div>

              {!showEditProductModal && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock Intake Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Specifications, warranty, packaging..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowAddProductModal(false); setShowEditProductModal(false); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : showEditProductModal ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: STOCK MOVEMENT (IN / OUT / ADJUSTMENT)
          ========================================================================= */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-indigo-600" />
                Record Stock Movement
              </h3>
              <button onClick={() => setShowMovementModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRecordMovement} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product</label>
                <select
                  required
                  value={movementForm.productId}
                  onChange={(e) => setMovementForm({ ...movementForm, productId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku}) &bull; Stock: {p.availableStock}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Movement Type</label>
                  <select
                    value={movementForm.movementType}
                    onChange={(e) => setMovementForm({ ...movementForm, movementType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="STOCK_IN">STOCK IN (+)</option>
                    <option value="STOCK_OUT">STOCK OUT (-)</option>
                    <option value="ADJUSTMENT">COUNT ADJUST (=)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Location (Optional)</label>
                <select
                  value={movementForm.warehouseId}
                  onChange={(e) => setMovementForm({ ...movementForm, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="">-- Primary / All Warehouses --</option>
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  placeholder="e.g. Physical inventory reconciliation"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Commit Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: STOCK TRANSFER
          ========================================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                Inter-Warehouse Stock Transfer
              </h3>
              <button onClick={() => setShowTransferModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Warehouse</label>
                  <select
                    required
                    value={transferForm.fromWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Warehouse</label>
                  <select
                    required
                    value={transferForm.toWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product to Transfer</label>
                <select
                  required
                  value={transferForm.productId}
                  onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku}) &bull; Avail: {p.availableStock}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  placeholder="Transport reference, truck number..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CATEGORY CREATE / EDIT
          ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedCategory ? 'Edit Category' : 'Create Product Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: WAREHOUSE REGISTER
          ========================================================================= */}
      {showWarehouseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedWarehouse ? 'Edit Warehouse' : 'Register Warehouse'}
              </h3>
              <button onClick={() => setShowWarehouseModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveWarehouse} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={warehouseForm.city}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={warehouseForm.contactPhone}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimaryWh"
                  checked={warehouseForm.isPrimary}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, isPrimary: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isPrimaryWh" className="text-xs font-medium text-slate-700">
                  Set as primary default distribution center
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWarehouseModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PRODUCT DELETE SAFEGUARD
          ========================================================================= */}
      {showDeleteProductModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Delete Product Confirmation</h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to remove <strong className="text-slate-900">{selectedProduct.name}</strong> ({selectedProduct.sku})?
            </p>
            {selectedProduct.stockQuantity > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Inventory Safeguard:</strong> This product currently has {selectedProduct.stockQuantity} {selectedProduct.unit} in physical stock. The platform will block deletion until stock balance is written off or zeroed out.
              </div>
            )}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteProductModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProductConfirm}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagementPage;

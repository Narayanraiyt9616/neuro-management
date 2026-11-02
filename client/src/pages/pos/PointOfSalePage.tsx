import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import posService from '../../services/posService';
import branchService from '../../services/branchService';
import {
  IPosSessionItem,
  IPosCartItem,
  IPosReceipt,
  IPosZReport,
  PosPaymentMethod,
  IBranchItem
} from '../../types';
import {
  Scan,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  QrCode,
  Layers,
  PauseCircle,
  PlayCircle,
  FileText,
  Printer,
  X,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  User,
  Store,
  RefreshCw
} from 'lucide-react';

export const PointOfSalePage: React.FC = () => {
  const { activeBusiness } = useBusiness();

  // Active POS Session State
  const [session, setSession] = useState<IPosSessionItem | null>(null);
  const [branches, setBranches] = useState<IBranchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Cart State
  const [cartItems, setCartItems] = useState<IPosCartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Modals State
  const [showOpenSessionModal, setShowOpenSessionModal] = useState<boolean>(false);
  const [showCloseSessionModal, setShowCloseSessionModal] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showCashAdjustModal, setShowCashAdjustModal] = useState<boolean>(false);
  const [showHeldCartsModal, setShowHeldCartsModal] = useState<boolean>(false);
  const [showZReportModal, setShowZReportModal] = useState<boolean>(false);

  // Form States
  const [openFloat, setOpenFloat] = useState<number>(2000);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [registerName, setRegisterName] = useState<string>('Counter Register 1');

  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>('CASH');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [cashAdjustType, setCashAdjustType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_IN');
  const [cashAdjustAmount, setCashAdjustAmount] = useState<number>(500);
  const [cashAdjustReason, setCashAdjustReason] = useState<string>('');

  const [countedCash, setCountedCash] = useState<number>(0);
  const [heldCarts, setHeldCarts] = useState<any[]>([]);
  const [latestReceipt, setLatestReceipt] = useState<IPosReceipt | null>(null);
  const [zReportData, setZReportData] = useState<IPosZReport | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // 1. Initial Load: Check active session & branches
  const initPos = async () => {
    try {
      setLoading(true);
      const [sessionRes, branchRes, catalogRes] = await Promise.all([
        posService.getCurrentSession(),
        branchService.getBranches({ limit: 50 }),
        posService.searchCatalog('')
      ]);

      if (sessionRes.success && sessionRes.data) {
        setSession(sessionRes.data);
        setShowOpenSessionModal(false);
      } else {
        setSession(null);
        setShowOpenSessionModal(true);
      }

      if (branchRes.success) {
        setBranches(branchRes.data.items || []);
        if (branchRes.data.items?.length > 0) {
          setSelectedBranchId(branchRes.data.items[0]._id);
        }
      }

      if (catalogRes.success) {
        setCatalog(catalogRes.data || []);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to initialize POS register', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPos();
  }, [activeBusiness?._id]);

  // Focus barcode input on ready
  useEffect(() => {
    if (session && !showCheckoutModal && !showReceiptModal && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [session, showCheckoutModal, showReceiptModal]);

  // 2. Open Shift Session
  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) {
      showNotification('Please select a branch location', 'error');
      return;
    }
    try {
      const res = await posService.openSession({
        branchId: selectedBranchId,
        registerName,
        openingBalance: Number(openFloat) || 0
      });
      if (res.success && res.data) {
        setSession(res.data);
        setShowOpenSessionModal(false);
        showNotification(`Session ${res.data.sessionCode} opened successfully!`);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to open session', 'error');
    }
  };

  // 3. Search Catalog / Barcode
  const handleSearch = async (term: string) => {
    setSearchQuery(term);
    try {
      const res = await posService.searchCatalog(term);
      if (res.success) {
        setCatalog(res.data || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle enter key in barcode input (Instant add)
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = searchQuery.trim();
      if (!code) return;

      const matched = catalog.find(
        (p) => (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) || p.sku.toLowerCase() === code.toLowerCase()
      );

      if (matched) {
        addToCart(matched);
        setSearchQuery('');
        handleSearch('');
      } else {
        showNotification(`No item matched barcode/SKU: ${code}`, 'error');
      }
    }
  };

  // 4. Cart Operations
  const addToCart = (product: any) => {
    const existingIndex = cartItems.findIndex((it) => it.productId === product._id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      const item = updated[existingIndex];
      const newQty = item.quantity + 1;
      const subtotal = newQty * item.unitPrice;
      const taxAmount = (subtotal * (item.taxRate || 0)) / 100;
      updated[existingIndex] = {
        ...item,
        quantity: newQty,
        subtotal,
        taxAmount,
        total: subtotal + taxAmount - (item.discountAmount || 0)
      };
      setCartItems(updated);
    } else {
      const unitPrice = Number(product.price) || 0;
      const taxRate = Number(product.taxRate) || 0;
      const subtotal = unitPrice * 1;
      const taxAmount = (subtotal * taxRate) / 100;
      const newItem: IPosCartItem = {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        barcode: product.barcode,
        unitPrice,
        quantity: 1,
        taxRate,
        taxAmount,
        discountPercent: 0,
        discountAmount: 0,
        subtotal,
        total: subtotal + taxAmount
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cartItems
      .map((it) => {
        if (it.productId === productId) {
          const newQty = it.quantity + delta;
          if (newQty <= 0) return null;
          const subtotal = newQty * it.unitPrice;
          const taxAmount = (subtotal * (it.taxRate || 0)) / 100;
          return {
            ...it,
            quantity: newQty,
            subtotal,
            taxAmount,
            total: subtotal + taxAmount - (it.discountAmount || 0)
          };
        }
        return it;
      })
      .filter(Boolean) as IPosCartItem[];

    setCartItems(updated);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter((it) => it.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Cart Totals Calculation
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxTotal = cartItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const discountTotal = cartItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
  const grandTotal = Math.round((subtotal + taxTotal - discountTotal) * 100) / 100;
  const changeDue = Math.max(0, amountTendered - grandTotal);

  // 5. Open Tender Modal
  const openCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('Cart is empty. Scan or select products first.', 'error');
      return;
    }
    setAmountTendered(grandTotal);
    setShowCheckoutModal(true);
  };

  // 6. Complete Checkout
  const handleCompleteCheckout = async () => {
    if (!session) return;
    if (paymentMethod === 'CASH' && amountTendered < grandTotal) {
      showNotification(`Amount tendered ($${amountTendered}) is less than total ($${grandTotal})`, 'error');
      return;
    }

    try {
      const res = await posService.processCheckout({
        sessionId: session._id,
        items: cartItems,
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal,
        paymentMethod,
        amountTendered,
        changeDue,
        customerName,
        customerPhone
      });

      if (res.success && res.data) {
        setLatestReceipt(res.data);
        setShowCheckoutModal(false);
        setCartItems([]);
        setShowReceiptModal(true);
        showNotification(`Order completed! Invoice #${res.data.receiptNumber}`);

        // Refresh session telemetry
        const updatedSession = await posService.getCurrentSession();
        if (updatedSession.success && updatedSession.data) {
          setSession(updatedSession.data);
        }
      }
    } catch (err: any) {
      showNotification(err.message || 'Payment processing failed', 'error');
    }
  };

  // 7. Hold / Resume Carts
  const handleHoldCart = async () => {
    if (!session || cartItems.length === 0) return;
    try {
      await posService.holdCart(session._id, {
        customerName,
        items: cartItems
      });
      setCartItems([]);
      showNotification('Cart saved to held orders queue');
      loadHeldCarts();
    } catch (err: any) {
      showNotification(err.message || 'Failed to hold cart', 'error');
    }
  };

  const loadHeldCarts = async () => {
    if (!session) return;
    try {
      const res = await posService.getHeldCarts(session._id);
      if (res.success) {
        setHeldCarts(res.data || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const resumeHeldCart = (held: any) => {
    setCartItems(held.items || []);
    if (held.customerName) setCustomerName(held.customerName);
    posService.removeHeldCart(session!._id, held.id || held.holdRef);
    setShowHeldCartsModal(false);
    showNotification(`Resumed cart for ${held.customerName || 'Customer'}`);
  };

  // 8. Cash Adjustments (In / Out)
  const handleCashAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await posService.adjustCash(session._id, {
        type: cashAdjustType,
        amount: Number(cashAdjustAmount) || 0,
        reason: cashAdjustReason || 'General drawer adjustment'
      });
      if (res.success && res.data) {
        setSession(res.data);
        setShowCashAdjustModal(false);
        setCashAdjustReason('');
        showNotification(`Cash float adjustment of $${cashAdjustAmount} recorded`);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to adjust cash', 'error');
    }
  };

  // 9. Close Shift & Discrepancy
  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await posService.closeSession(session._id, {
        closingBalance: Number(countedCash) || 0
      });
      if (res.success) {
        showNotification(`Register session closed. Discrepancy: $${res.data?.cashDiscrepancy || 0}`);
        setShowCloseSessionModal(false);
        setSession(null);
        setShowOpenSessionModal(true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to close session', 'error');
    }
  };

  // 10. View Z-Report
  const handleViewZReport = async () => {
    if (!session) return;
    try {
      const res = await posService.getZReport(session._id);
      if (res.success) {
        setZReportData(res.data);
        setShowZReportModal(true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to generate Z-Report', 'error');
    }
  };

  // Categories extraction
  const categories = ['ALL', ...Array.from(new Set(catalog.map((p) => p.category || 'General')))];
  const filteredCatalog = catalog.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || (p.category || 'General') === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-slate-400 font-medium text-sm">Initializing POS Terminal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none -m-4 md:-m-6">
      {/* Top Banner & Notifications */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 border transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          {feedbackMessage.text}
        </div>
      )}

      {/* POS Top Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">POS Register Terminal</span>
              {session ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {session.sessionCode}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Register Closed
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {session ? `${session.registerName} • Drawer Cash: $${session.expectedCashBalance.toFixed(2)}` : 'Shift not started'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        {session && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadHeldCarts();
                setShowHeldCartsModal(true);
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Held Carts"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Held Orders</span>
              {heldCarts.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                  {heldCarts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowCashAdjustModal(true)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              <span>Float In/Out</span>
            </button>

            <button
              onClick={handleViewZReport}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Z-Report</span>
            </button>

            <button
              onClick={() => {
                setCountedCash(session.expectedCashBalance);
                setShowCloseSessionModal(true);
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Close Shift</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Register Body: 2 Columns (Catalog on Left, Fast Cart on Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Product Search, Category Tabs & Catalog Grid */}
        <div className="flex-1 flex flex-col border-r border-slate-800/80 p-4 overflow-y-auto">
          {/* Barcode Scanner & Search Bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Scan className="w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan barcode or type SKU / product name (Press Enter)..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={() => handleSearch('')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
            >
              Reset
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-1">
            {filteredCatalog.map((prod) => {
              const inStock = prod.stockQuantity > 0;
              return (
                <div
                  key={prod._id}
                  onClick={() => inStock && addToCart(prod)}
                  className={`group p-3 rounded-xl border flex flex-col justify-between transition-all select-none cursor-pointer ${
                    inStock
                      ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98]'
                      : 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {prod.sku}
                      </span>
                      {prod.barcode && (
                        <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                          <Scan className="w-2.5 h-2.5" />
                          {prod.barcode.slice(-4)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-emerald-400">${Number(prod.price).toFixed(2)}</span>
                      {prod.taxRate > 0 && (
                        <span className="text-[9px] text-slate-400 ml-1">+{prod.taxRate}% tax</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        inStock ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {inStock ? `${prod.stockQuantity} ${prod.unit || 'pcs'}` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: High-Speed Checkout Cart */}
        <div className="w-full lg:w-96 bg-slate-900/50 flex flex-col justify-between border-t lg:border-t-0 border-slate-800">
          {/* Customer Selection Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <User className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-hidden w-full font-medium"
              />
            </div>
            <input
              type="text"
              placeholder="Phone (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 w-28 focus:outline-hidden"
            />
          </div>

          {/* Cart Item Rows */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-30 text-blue-400" />
                <p className="text-sm font-medium text-slate-400">Cart is empty</p>
                <p className="text-xs text-slate-400 mt-1">Scan barcode or click items to add to order</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.productName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {item.sku} • ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center gap-1.5 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white min-w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-16">
                    <p className="text-xs font-bold text-emerald-400">${item.total.toFixed(2)}</p>
                    {(item.taxAmount || 0) > 0 && (
                      <p className="text-[9px] text-slate-400 font-mono">+${(item.taxAmount || 0).toFixed(2)} tax</p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Pricing Summary & Action Drawer */}
          <div className="bg-slate-900 border-t border-slate-800 p-4">
            <div className="space-y-1.5 text-xs text-slate-400 mb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Breakdown</span>
                <span className="font-mono text-slate-200">${taxTotal.toFixed(2)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Discounts</span>
                  <span className="font-mono">-${discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm font-bold text-white">
                <span>Grand Total</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={handleHoldCart}
                disabled={cartItems.length === 0}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Hold Order</span>
              </button>

              <button
                onClick={clearCart}
                disabled={cartItems.length === 0}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear Cart</span>
              </button>
            </div>

            {/* Big Green Checkout Button */}
            <button
              onClick={openCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Banknote className="w-5 h-5" />
              <span>Charge ${grandTotal.toFixed(2)} (Space/Enter)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Open POS Shift Session */}
      {showOpenSessionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Open Register Shift</h3>
                <p className="text-xs text-slate-400">Initialize counter drawer with opening cash float</p>
              </div>
            </div>

            <form onSubmit={handleOpenSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch Location</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  required
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Register Counter</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  placeholder="e.g. Counter Register 1"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Opening Cash Float ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={openFloat}
                  onChange={(e) => setOpenFloat(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-base font-bold rounded-lg px-3 py-2 focus:outline-hidden"
                  placeholder="2000"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">Starting cash in register drawer for change.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md transition-colors"
                >
                  Start Shift Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: High-Speed Checkout & Tender Selection */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Payment Tender</h3>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Due Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Amount Due</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">${grandTotal.toFixed(2)}</div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { method: 'CASH', label: 'Cash', icon: Banknote },
                { method: 'CARD', label: 'Card', icon: CreditCard },
                { method: 'UPI', label: 'UPI / QR', icon: QrCode },
                { method: 'SPLIT', label: 'Split', icon: Layers }
              ].map(({ method, label, icon: Icon }) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method as PosPaymentMethod)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === method
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>

            {/* Cash Tender Fast Amount Buttons */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3 mb-4">
                <label className="block text-xs font-semibold text-slate-300">Amount Tendered</label>
                <input
                  type="number"
                  min={grandTotal}
                  step="0.01"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xl font-bold rounded-lg px-3 py-2 focus:outline-hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAmountTendered(grandTotal)}
                    className="flex-1 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono"
                  >
                    Exact (${grandTotal.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountTendered(Math.ceil(grandTotal / 100) * 100)}
                    className="flex-1 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono"
                  >
                    Round 100
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountTendered(Math.ceil(grandTotal / 500) * 500)}
                    className="flex-1 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono"
                  >
                    Round 500
                  </button>
                </div>

                {/* Change Due Box */}
                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400">Change Due to Customer</span>
                  <span className="text-xl font-black text-emerald-300 font-mono">${changeDue.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Back to Cart
              </button>
              <button
                type="button"
                onClick={handleCompleteCheckout}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Thermal Receipt (80mm Format) */}
      {showReceiptModal && latestReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-950 rounded-2xl p-6 w-full max-w-sm shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-300 mb-4">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600">Customer Receipt</span>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-950">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-base font-extrabold tracking-tight text-slate-950">{activeBusiness?.name || 'BIZNEXUS ENTERPRISE'}</h2>
              <p className="text-[10px] text-slate-500">{latestReceipt.branchName}</p>
              {latestReceipt.taxNumber && <p className="text-[10px] text-slate-500">GSTIN: {latestReceipt.taxNumber}</p>}
              <p className="text-[10px] text-slate-500">Invoice: {latestReceipt.receiptNumber}</p>
              <p className="text-[10px] text-slate-500">{new Date(latestReceipt.timestamp).toLocaleString()}</p>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2 mb-3 space-y-1.5">
              {latestReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="truncate max-w-[180px]">
                    {it.productName} x{it.quantity}
                  </span>
                  <span className="font-bold">${it.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${latestReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${latestReceipt.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>${latestReceipt.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Paid ({latestReceipt.paymentMethod}):</span>
                <span>${latestReceipt.amountTendered.toFixed(2)}</span>
              </div>
              {latestReceipt.changeDue > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Change:</span>
                  <span>${latestReceipt.changeDue.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="text-center pt-3 text-[10px] text-slate-500">
              <p>Cashier: {latestReceipt.cashierName}</p>
              <p className="mt-1 font-semibold">Thank you for your business!</p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-sans font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Float Adjustment (Cash In / Out) */}
      {showCashAdjustModal && session && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-400" />
                Drawer Cash Float Adjustment
              </h3>
              <button onClick={() => setShowCashAdjustModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCashAdjustment} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCashAdjustType('CASH_IN')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    cashAdjustType === 'CASH_IN'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  <span>Cash In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCashAdjustType('CASH_OUT')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    cashAdjustType === 'CASH_OUT'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  <span>Cash Out</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={cashAdjustAmount}
                  onChange={(e) => setCashAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold rounded-lg px-3 py-2 text-sm focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Added petty cash float"
                  value={cashAdjustReason}
                  onChange={(e) => setCashAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Held Orders Drawer */}
      {showHeldCartsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-400" />
                Held Orders Queue
              </h3>
              <button onClick={() => setShowHeldCartsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {heldCarts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No orders currently on hold.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {heldCarts.map((h, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{h.customerName || 'Customer'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {h.holdRef} • {h.items?.length || 0} items
                      </p>
                    </div>
                    <button
                      onClick={() => resumeHeldCart(h)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 6: Close Session & Discrepancy Reconciliation */}
      {showCloseSessionModal && session && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                Close Register Shift
              </h3>
              <button onClick={() => setShowCloseSessionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloseSession} className="space-y-4">
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Opening Float:</span>
                  <span className="font-mono text-white">${session.openingBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span className="font-mono text-white">${session.totalCashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash In / Out:</span>
                  <span className="font-mono text-white">
                    +${session.cashInAmount.toFixed(2)} / -${session.cashOutAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-blue-400 pt-1.5 border-t border-slate-800">
                  <span>Expected Drawer Cash:</span>
                  <span className="font-mono">${session.expectedCashBalance.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Counted Cash in Drawer ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={countedCash}
                  onChange={(e) => setCountedCash(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-lg rounded-lg px-3 py-2 focus:outline-hidden"
                  required
                />
              </div>

              {/* Calculated Discrepancy */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  countedCash - session.expectedCashBalance === 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                <span>Reconciliation Discrepancy:</span>
                <span className="font-mono text-sm">
                  {countedCash - session.expectedCashBalance >= 0 ? '+' : ''}$
                  {(countedCash - session.expectedCashBalance).toFixed(2)}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg transition-colors"
                >
                  Finalize & Close Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: POS Z-Report Shift Audit */}
      {showZReportModal && zReportData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">POS Daily Z-Report</h3>
                <p className="text-xs text-slate-400">Shift audit & financial reconciliation</p>
              </div>
              <button onClick={() => setShowZReportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Sales Breakdown */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Revenue Breakdown</span>
                <div className="flex justify-between">
                  <span>Gross Sales:</span>
                  <span className="font-mono text-white">${zReportData.salesBreakdown.grossSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discounts Given:</span>
                  <span className="font-mono text-amber-400">-${zReportData.salesBreakdown.discounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Sales:</span>
                  <span className="font-mono text-emerald-400 font-bold">${zReportData.salesBreakdown.netSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Collected:</span>
                  <span className="font-mono text-white">${zReportData.salesBreakdown.taxTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Tender Breakdown */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tender Methods</span>
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span className="font-mono text-white">${zReportData.salesBreakdown.tenderBreakdown.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Card Payments:</span>
                  <span className="font-mono text-white">${zReportData.salesBreakdown.tenderBreakdown.card.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>UPI / QR:</span>
                  <span className="font-mono text-white">${zReportData.salesBreakdown.tenderBreakdown.upi.toFixed(2)}</span>
                </div>
              </div>

              {/* Cash Reconciliation */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Drawer Reconciliation</span>
                <div className="flex justify-between">
                  <span>Opening Float:</span>
                  <span className="font-mono text-white">${zReportData.cashReconciliation.openingFloat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected in Drawer:</span>
                  <span className="font-mono text-blue-400 font-bold">${zReportData.cashReconciliation.expectedInDrawer.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual Counted:</span>
                  <span className="font-mono text-white">${zReportData.cashReconciliation.actualCounted.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-800">
                  <span>Cash Discrepancy:</span>
                  <span
                    className={`font-mono ${
                      zReportData.cashReconciliation.discrepancy === 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ${zReportData.cashReconciliation.discrepancy.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Z-Report</span>
              </button>
              <button
                onClick={() => setShowZReportModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSalePage;

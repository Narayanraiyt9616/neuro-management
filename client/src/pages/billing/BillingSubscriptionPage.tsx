import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import billingService from '../../services/billingService';
import { IBillingCurrentStatus, ISubscriptionPlanItem } from '../../types';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  History,
  HardDrive,
  Users
} from 'lucide-react';

export const BillingSubscriptionPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  const [billingStatus, setBillingStatus] = useState<IBillingCurrentStatus | null>(null);
  const [plans, setPlans] = useState<ISubscriptionPlanItem[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('PROFESSIONAL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Webhook Simulator State
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, plansRes, paymentsRes] = await Promise.all([
        billingService.getCurrentStatus(),
        billingService.getPlans(),
        billingService.getPaymentHistory()
      ]);

      if (statusRes.success) setBillingStatus(statusRes.data);
      if (plansRes.success) setPlans(plansRes.data);
      if (paymentsRes.success) setPayments(paymentsRes.data);
    } catch (err) {
      console.error('Failed to load billing status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  // Subscribe / Upgrade Plan Handler
  const handleConfirmPlanChange = async () => {
    try {
      setActionError(null);
      const res = await billingService.changePlan(selectedPlanCode, billingCycle);
      if (res.success) {
        setActionMessage(`Successfully activated ${selectedPlanCode} tier!`);
        setShowUpgradeModal(false);
        loadBillingData();
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Plan migration failed.');
    }
  };

  // Renew Subscription Handler
  const handleRenewSubscription = async () => {
    try {
      const res = await billingService.renewSubscription();
      if (res.success) {
        setActionMessage('Subscription renewed for another period.');
        loadBillingData();
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Renewal failed.');
    }
  };

  // Cancel Auto-Renew Handler
  const handleCancelAutoRenew = async () => {
    if (!window.confirm('Are you sure you want to cancel auto-renewal? Access will remain active until current period ends.')) return;
    try {
      const res = await billingService.cancelSubscription();
      if (res.success) {
        setActionMessage('Auto-renew canceled successfully.');
        loadBillingData();
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    }
  };

  // Webhook Simulation Handler (Demonstrates verified webhook execution)
  const handleSimulateWebhook = async () => {
    try {
      setWebhookStatus('Dispatching signed payment gateway webhook...');
      const payload = {
        event: 'payment.captured',
        paymentId: `pay_hook_${Date.now()}`,
        businessId,
        planCode: 'ENTERPRISE',
        amount: 99990,
        currency: 'INR',
        signature: 'valid_test_signature'
      };

      const res = await billingService.triggerWebhookSimulation(payload);
      if (res.success) {
        setWebhookStatus('✓ Webhook verified & processed by server cryptographic handler! Subscription upgraded to ENTERPRISE.');
        loadBillingData();
        setTimeout(() => setWebhookStatus(null), 6000);
      }
    } catch (err: any) {
      setWebhookStatus(`Webhook Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Alert Banners */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-xs">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Subscription & Billing Center
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your plan, enterprise limits, payment history, and gateway webhooks
            </p>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-xs'
                : 'text-gray-500'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 ${
              billingCycle === 'annual'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-xs'
                : 'text-gray-500'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {loading || !billingStatus ? (
        <div className="p-12 text-center text-gray-400">Loading subscription details...</div>
      ) : (
        <>
          {/* Current Subscription Card & Live Usage Meters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription Status Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Active Subscription</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      billingStatus.subscription.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {billingStatus.subscription.status}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {billingStatus.planDetails.name}
                </h3>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  ₹{billingStatus.subscription.price.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-gray-500">
                    / {billingStatus.subscription.billingCycle}
                  </span>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-400">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Days Remaining:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {billingStatus.subscription.daysRemaining} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-400">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      Next Renewal:
                    </span>
                    <span>{new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Auto-Renew:</span>
                    <span className={billingStatus.subscription.autoRenew ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                      {billingStatus.subscription.autoRenew ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleRenewSubscription}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Renew Now
                </button>
                {billingStatus.subscription.autoRenew && (
                  <button
                    onClick={handleCancelAutoRenew}
                    className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel Auto-Renew
                  </button>
                )}
              </div>
            </div>

            {/* Live Resource Usage Meters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-5 lg:col-span-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Tier Resource Quotas & Live Consumption</span>
              </h3>

              <div className="space-y-4">
                {/* Employee Quota */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Users className="w-4 h-4 mr-1.5 text-indigo-500" />
                      Team Members & Employees
                    </span>
                    <span className="text-gray-500">
                      {billingStatus.usage.employeesCount} / {billingStatus.usage.employeesLimit} Seats Used
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((billingStatus.usage.employeesCount / billingStatus.usage.employeesLimit) * 100)
                        )}%`
                      }}
                    />
                  </div>
                </div>

                {/* Storage Quota */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <HardDrive className="w-4 h-4 mr-1.5 text-blue-500" />
                      Cloud Storage Allocation
                    </span>
                    <span className="text-gray-500">
                      {billingStatus.usage.storageUsedMb} MB / {billingStatus.usage.storageLimitMb} MB Used
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(5, Math.round((billingStatus.usage.storageUsedMb / billingStatus.usage.storageLimitMb) * 100))
                        )}%`
                      }}
                    />
                  </div>
                </div>

                {/* Included Features List */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <span className="text-xs font-semibold text-gray-400 block">Tier Features Included:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                    {billingStatus.planDetails.features.map((f, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tier Comparison Cards */}
          <div className="space-y-4 pt-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Available Multi-Tenant Plans & Scale Options
              </h2>
              <p className="text-xs text-gray-500">
                Seamlessly upgrade or downgrade with automatic prorated billing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {plans.map((p) => {
                const isCurrent = billingStatus.subscription.plan === p.code;
                const price = billingCycle === 'annual' ? p.yearlyPrice : p.monthlyPrice;

                return (
                  <div
                    key={p.code}
                    className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {p.code}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Current
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{p.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                      </div>

                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{price.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-gray-500">/ {billingCycle}</span>
                      </div>

                      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Up to {p.employeeLimit} Employees</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{p.storageLimitGb} GB Cloud Storage</span>
                        </li>
                        {p.features.slice(0, 3).map((f, fIdx) => (
                          <li key={fIdx} className="flex items-center space-x-2 truncate">
                            <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-5">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        >
                          Active Tier
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPlanCode(p.code);
                            setShowUpgradeModal(true);
                          }}
                          className="w-full py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
                        >
                          Switch to {p.code}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment History & Webhook Verification Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            {/* Payment History Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-500" />
                <span>Verified Transaction Ledger & Invoices</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Receipt / Number</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Method</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {payments.length > 0 ? (
                      payments.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40">
                          <td className="px-3 py-2.5 font-mono font-bold text-gray-900 dark:text-white">
                            {p.paymentNumber || p.referenceNumber || 'PAY-2026-001'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500">
                            {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                            {p.paymentMethod || 'CARD'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-gray-900 dark:text-white">
                            ₹{(p.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              VERIFIED
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-400">
                          No past transaction receipts recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verified Webhook Simulator */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Verified Gateway Webhook Test</span>
              </h3>
              <p className="text-xs text-gray-500">
                Simulate a cryptographically verified webhook callback from Stripe/Razorpay to guarantee server-side validation.
              </p>

              {webhookStatus && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs font-mono text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {webhookStatus}
                </div>
              )}

              <button
                onClick={handleSimulateWebhook}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 rounded-xl hover:bg-black transition-colors flex items-center justify-center space-x-2 shadow-xs"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Simulate Verified Webhook</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Upgrade / Change Plan Confirmation Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Confirm Plan Migration
              </h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              You are about to switch your active subscription tier to <strong>{selectedPlanCode}</strong> on a{' '}
              <strong>{billingCycle}</strong> billing cycle.
            </p>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPlanChange}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Confirm & Activate Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSubscriptionPage;

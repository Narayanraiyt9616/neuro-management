import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { businessService } from '../../services/businessService';
import { IBusinessFullSettings } from '../../types';
import {
  Settings,
  Globe,
  Receipt,
  Bell,
  Clock,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Key
} from 'lucide-react';

export const BusinessSettingsPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  // Tab State
  type SettingsTab = 'localization' | 'invoicing' | 'notifications' | 'operations' | 'security';
  const [activeTab, setActiveTab] = useState<SettingsTab>('localization');

  // Form State
  const [currency, setCurrency] = useState<string>('USD');
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState<string>('YYYY-MM-DD');

  // Invoicing
  const [invoicePrefix, setInvoicePrefix] = useState<string>('INV-');
  const [nextNumber, setNextNumber] = useState<number>(1001);
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [defaultNotes, setDefaultNotes] = useState<string>('Thank you for your business. Payment is due within agreed terms.');

  // Notifications
  const [emailOnOrder, setEmailOnOrder] = useState<boolean>(true);
  const [emailOnPayment, setEmailOnPayment] = useState<boolean>(true);
  const [lowStockAlerts, setLowStockAlerts] = useState<boolean>(true);
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(false);

  // Operations / Working hours
  const [workStart, setWorkStart] = useState<string>('09:00');
  const [workEnd, setWorkEnd] = useState<string>('18:00');
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  // Security & Webhook
  const [webhookSecret, setWebhookSecret] = useState<string>('whsec_live_9f83ac9201bd4e55a88291f0c2948bb3');
  const [require2FA, setRequire2FA] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Status
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Prepopulate from activeBusiness
  useEffect(() => {
    if (activeBusiness) {
      const bizAny = activeBusiness as any;
      if (bizAny.currency) setCurrency(bizAny.currency);
      if (bizAny.timezone) setTimezone(bizAny.timezone);
      const settings = bizAny.settings;
      if (settings) {
        if (settings.dateFormat) setDateFormat(settings.dateFormat);
        if (settings.invoiceSettings) {
          if (settings.invoiceSettings.prefix) setInvoicePrefix(settings.invoiceSettings.prefix);
          if (settings.invoiceSettings.nextNumber) setNextNumber(settings.invoiceSettings.nextNumber);
          if (settings.invoiceSettings.paymentTermsDays) setPaymentTermsDays(settings.invoiceSettings.paymentTermsDays);
          if (settings.invoiceSettings.defaultNotes) setDefaultNotes(settings.invoiceSettings.defaultNotes);
        }
        if (settings.notificationPreferences) {
          setEmailOnOrder(Boolean(settings.notificationPreferences.emailOnOrder));
          setEmailOnPayment(Boolean(settings.notificationPreferences.emailOnPayment));
          setLowStockAlerts(Boolean(settings.notificationPreferences.lowStockAlerts));
          setWeeklyDigest(Boolean(settings.notificationPreferences.weeklyDigest));
        }
        if (settings.workingHours) {
          if (settings.workingHours.start) setWorkStart(settings.workingHours.start);
          if (settings.workingHours.end) setWorkEnd(settings.workingHours.end);
          if (settings.workingHours.workDays || settings.workingHours.workingDays) {
            setWorkingDays(settings.workingHours.workDays || settings.workingHours.workingDays);
          }
        }
      }
    }
  }, [activeBusiness]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRegenerateSecret = () => {
    const chars = '0123456789abcdef';
    let newSec = 'whsec_live_';
    for (let i = 0; i < 32; i++) {
      newSec += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setWebhookSecret(newSec);
    setSaveMessage({ type: 'success', text: 'New webhook signature key generated. Make sure to update your external integrations.' });
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      setSaveMessage({ type: 'error', text: 'No active business selected.' });
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    const payload: IBusinessFullSettings = {
      currency,
      timezone,
      dateFormat,
      invoiceSettings: {
        prefix: invoicePrefix,
        nextNumber: Number(nextNumber),
        paymentTermsDays: Number(paymentTermsDays),
        defaultNotes
      },
      notificationPreferences: {
        emailOnOrder,
        emailOnPayment,
        lowStockAlerts,
        weeklyDigest
      },
      workingHours: {
        start: workStart,
        end: workEnd,
        workDays: workingDays
      }
    };

    try {
      await businessService.updateBusinessSettings(businessId, payload);
      setSaveMessage({ type: 'success', text: 'Business settings updated and synchronized successfully.' });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update business settings';
      setSaveMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Business Operational Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure localization, invoicing defaults, notification policies, and API credentials for{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{activeBusiness?.name || 'your enterprise'}</span>
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </div>

      {/* Save Notification */}
      {saveMessage && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{saveMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('localization')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'localization'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Localization & Currency</span>
        </button>

        <button
          onClick={() => setActiveTab('invoicing')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'invoicing'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoicing & GST Defaults</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('operations')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'operations'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Working Hours & Shifts</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Tenant Security & Webhooks</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs p-6">
        {/* 1. Localization */}
        {activeTab === 'localization' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Localization & Formats</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define default display currencies, regional timezones, and system date formats across all documents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Default Operational Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="AED">AED (د.إ) - UAE Dirham</option>
                  <option value="SGD">SGD ($) - Singapore Dollar</option>
                </select>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Used for accounting, invoices, and analytics summaries.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Operating Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                  <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                </select>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Determines daily cutoffs, attendance check-ins, and timestamp records.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  System Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-01)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 01/11/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/01/2026)</option>
                  <option value="DD-MMM-YYYY">DD-MMM-YYYY (e.g. 01-Nov-2026)</option>
                </select>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Standard format applied on PDF invoices, slips, and export sheets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Invoicing & GST Defaults */}
        {activeTab === 'invoicing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Invoicing & GST Parameters</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Control auto-generated invoice numbering, payment terms, and default terms shown to clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Invoice Code Prefix
                </label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="INV-"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  e.g., &quot;INV-&quot; generates INV-1001, INV-1002.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Next Invoice Serial Number
                </label>
                <input
                  type="number"
                  value={nextNumber}
                  onChange={(e) => setNextNumber(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Next sequential number automatically assigned on creation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Default Payment Terms (Days)
                </label>
                <input
                  type="number"
                  value={paymentTermsDays}
                  onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Due date is set to invoice creation date + this number of days.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Standard Footer Terms & Payment Instructions
              </label>
              <textarea
                value={defaultNotes}
                onChange={(e) => setDefaultNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Include bank details, wire instructions, or refund policies..."
              />
            </div>
          </div>
        )}

        {/* 3. Notification Policies */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Enterprise Notification Policies</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose automated triggers for dispatching transactional alerts to company admins and staff.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl">
              <label className="flex items-start space-x-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailOnOrder}
                  onChange={(e) => setEmailOnOrder(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Order Creation Notifications
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Send real-time alerts when a customer or manager books a new sales order.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailOnPayment}
                  onChange={(e) => setEmailOnPayment(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Payment Receipt & Invoice Settlement
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Dispatch notifications whenever a payment transaction is recorded or an invoice status turns to PAID.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockAlerts}
                  onChange={(e) => setLowStockAlerts(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Low Inventory Stock Warning
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Trigger urgent notifications when stock of any warehouse product drops below its configured threshold.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Weekly Executive AI Digest
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Receive an aggregated business KPI digest with AI insights every Monday morning.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* 4. Operations & Working Hours */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Working Hours & Operational Schedule</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set company operating hours used for employee attendance tracking, late marks, and SLA deadlines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Work Day Start Time
                </label>
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Work Day End Time
                </label>
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Active Operating Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const active = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. Security & Webhooks */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tenant Security & Gateway Credentials</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cryptographic signature secrets, tenant identifier, and security policies for this organization.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tenant Business Identifier (MongoDB ID)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={businessId || '60d0fe4f5311236168a109ca'}
                    className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(businessId || '60d0fe4f5311236168a109ca', 'bizId')}
                    className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center shrink-0"
                  >
                    {copiedKey === 'bizId' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copiedKey === 'bizId' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Pass as <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded-sm">x-business-id</code> HTTP header on tenant-scoped REST API calls.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Payment Webhook HMAC-SHA256 Secret
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative w-full">
                    <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      value={webhookSecret}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(webhookSecret, 'secret')}
                    className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center shrink-0"
                  >
                    {copiedKey === 'secret' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copiedKey === 'secret' ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateSecret}
                    className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-lg cursor-pointer flex items-center shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Roll Key
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Used by payment providers (Stripe, Razorpay) to sign the <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded-sm">x-webhook-signature</code> payload header.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-start space-x-3 p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={require2FA}
                    onChange={(e) => setRequire2FA(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      Enforce Multi-Factor Authentication (MFA/2FA)
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Require all company managers and employees to provide an authenticator OTP during sign in.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessSettingsPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import analyticsService from '../../services/analyticsService';
import aiService from '../../services/aiService';
import reportService from '../../services/reportService';
import {
  IAdvancedAnalyticsData,
  IAiBusinessInsights,
  IBusinessReportData,
  BusinessReportPeriodType
} from '../../types';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Brain,
  Sparkles,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Send,
  Zap,
  PieChart
} from 'lucide-react';

export const ReportsAnalyticsPage: React.FC = () => {
  const { activeBusiness } = useBusiness();

  // Tab State
  type TabType = 'analytics' | 'assistant' | 'insights' | 'reports';
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  // Analytics States
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<string>('last_30_days');
  const [analyticsData, setAnalyticsData] = useState<IAdvancedAnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);

  // AI Assistant States
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; dataPoints?: any; suggestions?: string[] }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your BizNexus AI Business Copilot. I analyze your real database figures to answer financial, sales, inventory, and employee questions.',
      suggestions: [
        'What was my revenue this month?',
        'Which products are selling the most?',
        'Which products are low in stock?',
        'What are my total expenses?',
        'Which invoices are overdue?'
      ]
    }
  ]);

  // AI Insights States
  const [insights, setInsights] = useState<IAiBusinessInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(true);

  // Reports States
  const [selectedReportType, setSelectedReportType] = useState<BusinessReportPeriodType>('MONTHLY');
  const [reportData, setReportData] = useState<IBusinessReportData | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // Data Loaders
  // --------------------------------------------------------------------------
  const loadAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const res = await analyticsService.getAdvancedAnalytics(analyticsTimeframe);
      if (res.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsTimeframe]);

  const loadInsights = useCallback(async () => {
    try {
      setInsightsLoading(true);
      const res = await aiService.getInsights();
      if (res.success) {
        setInsights(res.data);
      }
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const loadReport = useCallback(async (type: BusinessReportPeriodType) => {
    try {
      setReportLoading(true);
      const res = await reportService.generateReport(type);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'insights') {
      loadInsights();
    } else if (activeTab === 'reports' && !reportData) {
      loadReport(selectedReportType);
    }
  }, [activeTab, loadAnalytics, loadInsights, loadReport, selectedReportType, reportData]);

  // --------------------------------------------------------------------------
  // AI Assistant Ask Handler
  // --------------------------------------------------------------------------
  const handleAskAssistant = async (queryText?: string) => {
    const question = (queryText || aiQuestion).trim();
    if (!question) return;

    setChatHistory((prev) => [...prev, { role: 'user', text: question }]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const res = await aiService.askAssistant(question);
      if (res.success) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: res.data.answer,
            dataPoints: res.data.dataPoints,
            suggestions: res.data.suggestions
          }
        ]);
      }
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: err.message || 'I encountered an error querying your business records. Please try again.'
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // CSV Exports
  // --------------------------------------------------------------------------
  const handleExportAnalyticsCsv = async () => {
    try {
      const csv = await analyticsService.exportAnalyticsCsv(analyticsTimeframe);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${analyticsTimeframe}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch (err) {
      alert('Failed to export analytics CSV');
    }
  };

  const handleExportReportCsv = async () => {
    try {
      const csv = await reportService.downloadReportCsv(selectedReportType);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biznexus_report_${selectedReportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch (err) {
      alert('Failed to export report CSV');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl text-white shadow-md">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center space-x-2">
              <span>Executive Intelligence & Analytics</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                AI Copilot Active
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Live telemetry for {activeBusiness?.name || 'your enterprise'}, predictive revenue forecasts, automated period reports, and AI query assistant
            </p>
          </div>
        </div>

        {/* Global Tab Actions */}
        <div className="flex items-center space-x-2">
          {activeTab === 'analytics' && (
            <>
              <select
                value={analyticsTimeframe}
                onChange={(e) => setAnalyticsTimeframe(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="today">Today</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="this_year">This Fiscal Year</option>
              </select>

              <button
                onClick={handleExportAnalyticsCsv}
                className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export CSV
              </button>
            </>
          )}

          {activeTab === 'reports' && (
            <button
              onClick={handleExportReportCsv}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Report CSV
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 pb-px space-x-2 sm:space-x-8">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Advanced Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'assistant'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>AI Business Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'insights'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Predictive Insights & Forecasts</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Business Report Generator</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 1: ADVANCED ANALYTICS DASHBOARD */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading || !analyticsData ? (
            <div className="p-12 text-center text-gray-400">Loading analytics metrics...</div>
          ) : (
            <>
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-semibold">Gross Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{analyticsData.profitLoss.grossRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    <span>Margin: {analyticsData.profitLoss.profitMarginPercent}%</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-semibold">Operating Expenses</span>
                    <DollarSign className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{analyticsData.profitLoss.totalExpenses.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Net Profit: ₹{analyticsData.profitLoss.netProfit.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-semibold">Sales Orders</span>
                    <Boxes className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.salesPerformance.ordersCount}
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    AOV: ₹{analyticsData.salesPerformance.averageOrderValue.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-semibold">Business Growth Index</span>
                    <Zap className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {analyticsData.businessGrowthIndex} / 100
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    +{analyticsData.customerGrowth.newCustomersThisPeriod} New Accounts
                  </div>
                </div>
              </div>

              {/* Revenue Trend Visualizer */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <span>Daily Revenue Velocity & Order Volume</span>
                  </h3>
                  <span className="text-xs text-gray-400">Period: {analyticsData.timeframe.replace(/_/g, ' ')}</span>
                </div>

                <div className="space-y-2">
                  {analyticsData.revenueTrends.slice(-10).map((t, idx) => {
                    const maxRev = Math.max(...analyticsData.revenueTrends.map((item) => item.revenue), 1);
                    const widthPct = Math.min(100, Math.max(8, Math.round((t.revenue / maxRev) * 100)));
                    return (
                      <div key={idx} className="flex items-center text-xs space-x-3">
                        <span className="w-20 font-mono text-gray-400">{t.date}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 h-6 rounded-lg overflow-hidden flex items-center px-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-6 rounded-lg transition-all duration-500 flex items-center px-2 text-white font-bold text-[11px]"
                            style={{ width: `${widthPct}%` }}
                          >
                            ₹{t.revenue.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <span className="w-16 text-right font-medium text-gray-600 dark:text-gray-300">
                          {t.orders} order(s)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Products & Expense Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Boxes className="w-4 h-4 text-emerald-500" />
                    <span>Top Selling Products & SKUs</span>
                  </h3>
                  <div className="space-y-2.5">
                    {analyticsData.salesPerformance.topProducts.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-indigo-600">#{i + 1}</span>
                          <span className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">{p.quantitySold} units</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            ₹{p.totalRevenue.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense Categories */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <PieChart className="w-4 h-4 text-rose-500" />
                    <span>Operating Expense Distribution</span>
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.expenseAnalysis.categories.map((c, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{c.category}</span>
                          <span className="text-gray-500">
                            ₹{c.amount.toLocaleString('en-IN')} ({c.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, c.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 2: AI BUSINESS ASSISTANT COPILOT */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'assistant' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs p-6 space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                <span>AI Business Copilot</span>
              </h2>
              <p className="text-xs text-gray-500">
                Ask natural questions about revenue, expenses, inventory, top products, overdue invoices, and employee metrics
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              Grounded in Live DB
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-50 dark:bg-gray-900/60 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Suggested follow-up prompt chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleAskAssistant(s)}
                        className="px-2.5 py-1 text-xs rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {aiLoading && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 flex items-center space-x-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                <span>Analyzing your business database records...</span>
              </div>
            )}
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAssistant();
            }}
            className="flex items-center space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700"
          >
            <input
              type="text"
              placeholder="e.g. What was my revenue this month? Which products are low in stock?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuestion.trim()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 3: PREDICTIVE INSIGHTS & REVENUE FORECASTING */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {insightsLoading || !insights ? (
            <div className="p-12 text-center text-gray-400">Computing predictive telemetry...</div>
          ) : (
            <>
              {/* Revenue Forecast Grid */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                      <span>Revenue Forecasting (Moving Average & Linear Extrapolation)</span>
                    </h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      {insights.revenueForecasting.disclaimer}
                    </p>
                  </div>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-mono">
                    Model: {insights.revenueForecasting.model}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.revenueForecasting.projections.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 space-y-2"
                    >
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        {p.period}
                      </span>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{p.forecastRevenue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center justify-between">
                        <span>Range:</span>
                        <span>
                          ₹{p.lowerBound.toLocaleString('en-IN')} - ₹{p.upperBound.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic AI Recommendations */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span>Strategic Improvement Opportunities</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.recommendations.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-900/40 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {r.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              r.priority === 'HIGH'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            }`}
                          >
                            {r.priority} PRIORITY
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{r.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{r.action}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Impact: {r.potentialImpact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 4: BUSINESS REPORT GENERATOR */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Type Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 mr-2">Select Report Cycle:</span>
            {(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'] as BusinessReportPeriodType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedReportType(type);
                  loadReport(type);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedReportType === type
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {reportLoading || !reportData ? (
            <div className="p-12 text-center text-gray-400">Synthesizing executive business report...</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
              {/* Document Banner */}
              <div className="border-b border-gray-100 dark:border-gray-700 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {reportData.reportId}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {reportData.periodLabel}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Prepared for {reportData.businessName} • Generated by {reportData.generatedByName}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Timestamp: {new Date(reportData.generatedAt).toLocaleString()}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Executive Summary
                </span>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {reportData.executiveSummary}
                </p>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <span className="text-xs text-gray-500 block">Gross Revenue</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{reportData.kpis.grossRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <span className="text-xs text-gray-500 block">Net Operating Profit</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{reportData.kpis.netProfit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <span className="text-xs text-gray-500 block">Processed Orders</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {reportData.kpis.ordersCount}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <span className="text-xs text-gray-500 block">Active Projects</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {reportData.kpis.activeProjectsCount}
                  </span>
                </div>
              </div>

              {/* Critical Risks & Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Identified Risks & Attention Items</span>
                  </span>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc pl-4">
                    {reportData.criticalRisks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strategic Growth Opportunities</span>
                  </span>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc pl-4">
                    {reportData.strategicOpportunities.map((opp, i) => (
                      <li key={i}>{opp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsAnalyticsPage;

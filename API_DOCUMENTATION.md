# BizNexus – REST API Specification

This document provides the technical specification for all REST API endpoints available in BizNexus across all 10 modules.

---

## 🔒 Authentication & Headers

All protected endpoints require a valid JWT token passed in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

Tenant-scoped endpoints require the target business identifier passed in the `x-business-id` header:

```http
x-business-id: <business_mongo_id>
```

---

## 📑 Module Index

1. [Authentication Endpoints (`/api/auth`)](#1-authentication-endpoints)
2. [Platform Administration (`/api/admin`)](#2-platform-administration)
3. [Business & Tenant Overview (`/api/business`)](#3-business--tenant-overview)
4. [Workforce & HR Management (`/api/hr`)](#4-workforce--hr-management)
5. [Customers & CRM (`/api/customers`, `/api/crm`)](#5-customers--crm)
6. [Inventory & Purchasing (`/api/inventory`, `/api/purchase`)](#6-inventory--purchasing)
7. [Finance, Income & Expenses (`/api/finance`)](#7-finance-income--expenses)
8. [Projects, Tasks & Kanban (`/api/projects`)](#8-projects-tasks--kanban)
9. [AI Business Assistant & Insights (`/api/ai`)](#9-ai-business-assistant--insights)
10. [Advanced Analytics Telemetry (`/api/analytics`)](#10-advanced-analytics-telemetry)
11. [Business Report Generator (`/api/reports`)](#11-business-report-generator)
12. [Subscriptions & Payment Webhooks (`/api/billing`)](#12-subscriptions--payment-webhooks)
13. [Global Notifications (`/api/notifications`)](#13-global-notifications)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new user account.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1-555-0199",
    "password": "Password123!",
    "role": "BUSINESS_OWNER"
  }
  ```
- **Response `201 Created`**: Returns user profile and signed JWT token.

### `POST /api/auth/login`
Authenticates user credentials.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**: Returns user object, accessible businesses, and JWT token.

### `POST /api/auth/forgot-password`
Initiates an email-based password reset.
- **Request Body**: `{ "email": "jane@example.com" }`
- **Response `200 OK`**: Emits reset token and triggers email notification.

### `POST /api/auth/reset-password`
Applies a new password using a secure reset token.
- **Request Body**: `{ "token": "<reset_token>", "newPassword": "NewPassword2026!" }`
- **Response `200 OK`**: Updates password and revokes token.

---

## 2. Platform Administration

*All endpoints in this section strictly require `SUPER_ADMIN` role.*

### `GET /api/admin/stats`
Returns centralized platform overview statistics directly aggregated from MongoDB:
- Total Businesses, Active Businesses, Pending Businesses, Suspended Businesses
- Total Platform Users, Active Subscriptions, Platform Revenue

### `GET /api/admin/businesses`
Query, filter, and paginate through all registered business tenants.
- **Query Params**: `status` (`ALL`, `ACTIVE`, `PENDING`, `SUSPENDED`), `search`, `page`, `limit`.

### `PATCH /api/admin/businesses/:id/approve`
Approves a pending business registration, activates its initial subscription, and notifies the founder.

### `PATCH /api/admin/businesses/:id/suspend`
Suspends a tenant organization and revokes active API access.

### `GET /api/admin/audit-logs`
Returns platform-wide immutable security audit logs with module and actor filters.

---

## 3. Business & Tenant Overview

### `GET /api/business/my-businesses`
Returns list of all businesses the authenticated user has authorization to access (for multi-business switching).

### `GET /api/business/:businessId/dashboard/stats`
Returns the 10 real database metrics for the business owner dashboard:
- Total Employees, Customers, Sales, Orders, Revenue, Expenses, Net Profit, Pending Payments, Low Stock Products, Active Projects.
- **Query Params**: `period` (`today`, `7d`, `30d`, `this_month`, `this_year`, `custom`), `startDate`, `endDate`.

### `GET /api/business/:businessId/dashboard/analytics`
Returns dataset for 6 interactive charts:
1. Monthly Revenue
2. Monthly Expenses
3. Profit & Loss
4. Sales Performance
5. Order Statistics Breakdown
6. Employee Department & Role Distribution

### `PUT /api/business/:businessId/settings`
Updates business operational settings (currency, timezone, date format, invoice prefixes, notification policies).

### `GET /api/business/:businessId/audit-logs`
Returns tenant-isolated security audit log records.

---

## 4. Workforce & HR Management

### `POST /api/hr/employees`
Adds a new employee record with designation, department, salary structure, and emergency contact.

### `POST /api/hr/attendance/check-in`
Records real-time employee attendance check-in. Prevents duplicate check-ins on the same calendar day.

### `POST /api/hr/attendance/check-out`
Records check-out and auto-calculates total hours worked.

### `POST /api/hr/leave/requests`
Submits a leave request with automatic balance deduction and notification to managers.

### `POST /api/hr/payroll/run`
Executes an automated payroll run for a pay period, calculating base salary, allowances, tax deductions, and generating payslips.

---

## 5. Customers & CRM

### `POST /api/customers`
Registers a new B2B or B2C customer profile with tax ID, contact persons, and billing address.

### `POST /api/crm/leads`
Creates a sales lead in the CRM pipeline (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`).

### `PATCH /api/crm/leads/:id/status`
Advances a lead through the sales funnel, appending timestamped audit notes.

### `POST /api/sales/orders`
Creates a sales order for a customer, reserving inventory stock and calculating GST taxes.

---

## 6. Inventory & Purchasing

### `POST /api/inventory/products`
Creates a catalog product with SKU, barcode, purchase price, selling price, and tax rate.

### `POST /api/inventory/stock-adjustment`
Executes a stock movement (`IN`, `OUT`, `DAMAGE`, `RETURN`) and appends an immutable double-entry record to `StockLedger`.

### `GET /api/inventory/low-stock-alerts`
Returns products whose available stock is $\le$ the configured minimum threshold, along with suggested replenishment quantities.

### `POST /api/purchase/orders`
Creates a purchase order to a registered supplier.

### `POST /api/purchase/orders/:id/goods-receipt`
Processes goods receipt into a warehouse, automatically updating stock quantities upon physical arrival.

---

## 7. Finance, Income & Expenses

### `POST /api/finance/invoices`
Generates a multi-line GST invoice with tax breakdown and payment due date.

### `POST /api/finance/expenses`
Records an operational business expense with category, receipt upload, and approval status.

### `GET /api/finance/invoices/:id/pdf`
Downloads an invoice as a formatted PDF document.

---

## 8. Projects, Tasks & Kanban

### `POST /api/projects`
Creates an enterprise project with manager assignment, budget, and priority.

### `POST /api/projects/tasks`
Creates a task assigned to a team member with estimated hours and deadline. Automatically dispatches an assignment notification.

### `GET /api/projects/:id/kanban`
Returns tasks categorized into 5 columns: `TODO`, `IN_PROGRESS`, `REVIEW`, `COMPLETED`, `BLOCKED`.

### `PATCH /api/projects/tasks/:id/status`
Updates task Kanban status. When all tasks reach `COMPLETED`, the parent project progress is automatically updated to 100%.

### `POST /api/projects/tasks/:id/comments`
Posts a comment to a task discussion thread with support for @user mentions.

### `GET /api/projects/calendar/feed`
Returns unified calendar feed aggregating milestones, task deadlines, and business events.

---

## 9. AI Business Assistant & Insights

### `POST /api/ai/query`
Natural language business assistant answering revenue, expense, inventory, employee, and sales questions using actual MongoDB records.
- **Request Body**:
  ```json
  {
    "question": "What was my revenue this month?",
    "context": {}
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "Your gross revenue this month is $142,500 across 28 settled invoices.",
      "category": "REVENUE",
      "confidence": 0.95,
      "dataPoints": { "grossRevenue": 142500, "invoicesCount": 28 },
      "suggestions": ["Review 3 overdue invoices", "Monitor high-growth subscriptions"]
    }
  }
  ```

### `GET /api/ai/insights`
Returns sales trend direction, monthly expense burn rate, stockout risk items, linear regression 30/60/90-day revenue forecasting, customer retention metrics, and actionable recommendations.

---

## 10. Advanced Analytics Telemetry

### `GET /api/analytics`
Returns unified multi-timeframe analytics telemetry across P&L, sales, customer growth, employee performance, and inventory valuation.
- **Query Params**: `timeframe` (`today`, `last_7_days`, `last_30_days`, `this_month`, `this_year`).

### `GET /api/analytics/export`
Exports the aggregated analytics data as a structured CSV document.

---

## 11. Business Report Generator

### `POST /api/reports/generate`
Generates a structured executive period report.
- **Request Body**:
  ```json
  {
    "reportType": "MONTHLY",
    "format": "json"
  }
  ```
- **Response `200 OK`**: Returns report with executive summary, KPIs, critical risks, and strategic opportunities.

### `GET /api/reports/download`
Downloads the period report in CSV format.
- **Query Params**: `type` (`DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `ANNUAL`).

---

## 12. Subscriptions & Payment Webhooks

### `GET /api/billing/plans`
Returns the 4 available subscription tiers (`FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE`).

### `GET /api/billing/current`
Returns active subscription status, days remaining, auto-renew flag, and resource quota usage meters.

### `POST /api/billing/change-plan`
Upgrades or downgrades tenant plan.
- **Request Body**: `{ "planCode": "ENTERPRISE", "billingCycle": "monthly" }`

### `POST /api/billing/webhook`
Cryptographically verified payment gateway webhook endpoint.
- **Headers**: `x-webhook-signature: <hmac_sha256_signature>`
- **Request Body**:
  ```json
  {
    "event": "payment.success",
    "paymentId": "pay_981729381",
    "businessId": "60d0fe4f5311236168a109ca",
    "planCode": "ENTERPRISE",
    "amount": 199,
    "currency": "USD",
    "status": "PAID",
    "signature": "valid_test_signature"
  }
  ```
- **Security**: Verifies HMAC-SHA256 signature against `PAYMENT_WEBHOOK_SECRET`. Rejects forged payloads with `400 Bad Request`.

---

## 13. Global Notifications

### `GET /api/notifications`
Retrieves in-app notification alerts for the authenticated user.
- **Query Params**: `unread=true` (optional).

### `PATCH /api/notifications/:id/read`
Marks a specific notification item as read.

### `PATCH /api/notifications/read-all`
Marks all notifications for the user as read.


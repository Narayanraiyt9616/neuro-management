# BizNexus – End-User Operating Manual

Welcome to the **BizNexus Operating System**. This guide provides practical, role-by-role instructions for navigating and managing everyday business operations.

---

## 👥 The 5 Enterprise Roles

BizNexus implements strict Role-Based Access Control (RBAC) across five user personas:

```text
┌────────────────────────────────────────────────────────┐
│                   SUPER_ADMIN                          │
│   (Platform Administration, All Tenants, Pricing)      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                 BUSINESS_OWNER                         │
│  (Company Operations, P&L, HR, Billing, ERP, Reports)  │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼──────────────┐ ┌──────────▼──────────────┐
│          MANAGER           │ │        EMPLOYEE         │
│  (Operations, Approvals,   │ │ (Tasks, Attendance,     │
│   Projects, Inventory)     │ │  Leads, Check-ins)      │
└─────────────┬──────────────┘ └─────────────────────────┘
              │
┌─────────────▼──────────────┐
│          CUSTOMER          │
│ (Orders, Invoices, Portal) │
└────────────────────────────┘
```

---

## 1. 🛡️ Super Administrator Guide

### Access & Navigation
- **Console URL**: `/app/super-admin`
- **Primary Duties**: Platform oversight, multi-tenant reviews, billing subscriptions, global user directory, platform-wide settings.

### Key Workflows:
1. **Reviewing New Businesses**:
   - Access **All Tenant Hubs** or the **Pending Businesses** tab.
   - Review applicant name, GSTIN/Tax ID, address, and founder email.
   - Click **Approve** to activate the tenant account and generate an initial trial subscription, or **Reject** with an explanation.
2. **Managing Subscriptions**:
   - Access **Platform Subscriptions** to view billing health, MRR, and plan allocations.
   - Create or adjust plans (`FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE`).
3. **Security Audit**:
   - Navigate to `/app/audit` to view the immutable ledger of administrative and authentication events.

---

## 2. 💼 Business Owner Guide

### Access & Navigation
- **Hub URL**: `/app/owner`
- **Primary Duties**: Complete business execution, financial tracking, hiring, inventory levels, project oversight, and executive reports.

### Key Workflows:
1. **Multi-Business Switching**:
   - Click the business selector at the top of the sidebar.
   - Switch instantly between different companies or subsidiaries.
2. **Consulting the AI Business Copilot**:
   - Click the **AI Copilot** button in the top navigation bar or the floating sparkle icon.
   - Ask plain-English questions such as:
     - *"What was my revenue this month?"*
     - *"Which products are low in stock?"*
     - *"Which sales employees have the highest revenue?"*
   - The assistant answers using verified MongoDB records for your business only.
3. **Executive Analytics & Reporting**:
   - Navigate to **Reports** (`/app/reports`).
   - Switch between **Advanced Analytics**, **AI Business Copilot**, **Predictive Forecasts**, and **Period Reports**.
   - Download CSV reports for board meetings or accounting audits.
4. **Subscription & Quota Management**:
   - Navigate to **Platform Subscriptions** (`/app/billing`).
   - View employee count meters and storage quotas.
   - Toggle between monthly and annual plans, or upgrade to `ENTERPRISE` with one click.
5. **Business Settings & Localization**:
   - Navigate to **Settings** (`/app/settings`).
   - Customize operational currency (USD, INR, EUR, GBP), regional timezone, invoice numbering prefix, and notification policies.

---

## 3. 📋 Operations Manager Guide

### Access & Navigation
- **Dashboard URL**: `/app/manager`
- **Primary Duties**: Day-to-day workforce execution, sprint management, inventory replenishment, and customer relationship monitoring.

### Key Workflows:
1. **Project & Sprint Tracking**:
   - Navigate to **Projects & Tasks** (`/app/projects`).
   - Drag and drop tasks across the 5 Kanban columns: `To Do` → `In Progress` → `Review` → `Completed` → `Blocked`.
   - Post comments on task cards and mention team members using `@username`.
2. **Inventory & Low Stock Replenishment**:
   - Navigate to **Inventory** (`/app/inventory`).
   - Check the **Low Stock Alerts** banner.
   - Review suggested reorder quantities and generate purchase orders to suppliers.
3. **Attendance & Leave Approvals**:
   - Navigate to **HR Management** (`/app/hr`).
   - Review daily check-in logs and approve or reject employee leave requests.

---

## 4. 👷 Employee Workspace Guide

### Access & Navigation
- **Workspace URL**: `/app/employee`
- **Primary Duties**: Daily attendance check-in/out, task execution, leave requests, and CRM follow-ups.

### Key Workflows:
1. **Daily Attendance**:
   - Upon starting your workday, open the dashboard and click **Check In**.
   - At the end of your shift, click **Check Out** to record your total working hours.
2. **Task Execution**:
   - Open **Projects & Tasks** to see tasks assigned directly to you.
   - Move tasks to `In Progress` while working, and `Review` once completed.
3. **Applying for Leave**:
   - Navigate to **HR** → **Leave Application**.
   - Choose leave type (Casual, Sick, Paid), select date ranges, and submit.
   - You will receive an in-app notification when your manager reviews it.

---

## 5. 🛍️ Customer Portal Guide

### Access & Navigation
- **Client Portal URL**: `/app/customer`
- **Primary Duties**: Placing orders, monitoring fulfillment, and viewing/downloading invoices.

### Key Workflows:
1. **Viewing Orders**:
   - Navigate to **My Sales Orders** (`/app/sales`) to view order tracking status.
2. **Invoice Settlements & Downloads**:
   - Navigate to **Billing & Invoices** (`/app/invoicing`).
   - View itemized GST breakdown, due dates, and click **Download PDF** for company accounting records.

---

## 🔔 Global Notification System

- Located at the top right corner of the header.
- Displays a red badge with the number of unread alerts.
- Real-time notifications arrive for:
  - Task assignments
  - Order status changes
  - Payment settlements
  - Low stock warnings
  - Leave approval decisions
- Click **Mark all as read** to dismiss alerts.


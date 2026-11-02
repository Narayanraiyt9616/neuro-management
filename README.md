# BizNexus – Enterprise SaaS Operating System (Parts 1–10 Complete)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_%26_Mongoose-darkgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Integration_Tests-475%20Passed%20(100%25)-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Proprietary_Enterprise-purple.svg)]()

**BizNexus** is an all-in-one multi-tenant enterprise operating system engineered for conglomerate holding corporations, serial founders, and distributed multi-branch businesses. The entire platform is built in **100% strict TypeScript** with dual-layer resilient persistence (MongoDB Atlas primary + graceful in-memory failover), zero frontend placeholders, and real-time grounded telemetry.

---

## 🏛️ Comprehensive Architectural System Overview

| Part | Functional Domain | Core Deliverables & Technologies |
|---|---|---|
| **Part 1** | **Core Frontend & Landing Architecture** | React 19 + Vite 8 + Tailwind CSS v4, dynamic landing page, features matrix, pricing tiers, and public health telemetry. |
| **Part 2** | **Enterprise Authentication & RBAC** | JWT authentication, bcrypt hashing, Zod runtime validation, forgot password reset tokens, and 5 distinct roles (`SUPER_ADMIN`, `BUSINESS_OWNER`, `MANAGER`, `EMPLOYEE`, `CUSTOMER`). |
| **Part 3** | **Super Admin Platform Console** | Central platform telemetry, multi-tenant registration verification, approve/suspend business life-cycles, tenant user management, and global audit logging. |
| **Part 4** | **Business Owner Hub & Visual Analytics** | Central tenant overview, 10 MongoDB statistics, 6 Recharts interactive data visualizations, multi-timeframe filters, and rapid operational quick-actions. |
| **Part 5** | **Workforce & Human Resource Management** | Complete employee lifecycle, departmental hierarchy, QR/browser attendance check-in/out, leave policy accruals, job applicant pipeline, and automated payroll with payslip generation. |
| **Part 6** | **CRM, Leads & Customer Lifecycle** | B2B/B2C customer directory, 7-stage sales lead pipeline (`NEW` to `WON`/`LOST`), sales orders, and customer activity timelines. |
| **Part 7** | **Inventory, Stock Ledger & Purchasing** | Multi-warehouse inventory, double-entry stock movement ledgers, automated low-stock reorder alerts, and purchase orders with strict goods receipt reconciliation. |
| **Part 8** | **Financial Accounting & Invoicing** | Income & expense tracking with receipt attachments, net profit & loss telemetry, multi-line GST/tax invoicing, and automated invoice PDF generation. |
| **Part 9** | **Projects, Kanban, Collaboration & Calendar** | Multi-manager projects, drag-and-drop Kanban task boards, progress recalculations, threaded discussion comments with @mentions, document vault ($\le 10$MB), and calendar feeds. |
| **Part 10** | **AI Intelligence, Telemetry, Webhooks & Final Deployment** | Grounded AI Business Assistant, linear regression predictive revenue forecasting, period report generator (CSV), global notifications (Socket.io), HMAC-SHA256 verified payment webhooks, database indexing, and 475 automated tests. |

---

## 🚀 Key Technology Stack

### Frontend Architecture
- **Framework**: React 19 + Vite 8
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7 (Role-based Protected Routes)
- **State & Context**: `AuthContext` (JWT session management), `BusinessContext` (Multi-tenant business switcher)
- **HTTP Client**: Axios with automatic JWT injection, `x-business-id` multi-tenant header propagation, and typed error interceptors
- **Visualizations**: Recharts vector charting engine
- **Icons**: Lucide React

### Backend Architecture
- **Runtime**: Node.js v22 LTS
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB Atlas + Mongoose 8 (Compound & Single Production Indexes)
- **Schema Validation**: Zod runtime input validation
- **Security**: Helmet, CORS, bcrypt password hashing, JWT stateless tokens, HMAC-SHA256 signature verification
- **Real-Time Layer**: Socket.io event emitter
- **Testing**: Supertest + Node Test Runner (475 passing integration tests)

---

## 💻 Directory Layout

```text
biznexus/
├── client/                               # Frontend Single Page Application
│   ├── src/
│   │   ├── components/                   # UI components (Common, Layouts, Modals, AI Drawer)
│   │   ├── context/                      # AuthContext, BusinessContext
│   │   ├── hooks/                        # useApiHealth, usePermissions
│   │   ├── layouts/                      # PublicLayout, AuthLayout, DashboardLayout
│   │   ├── pages/                        # Role dashboards, HR, CRM, Inventory, Finance, Projects, Reports, Billing, Settings, Audit
│   │   ├── routes/                       # AppRoutes.tsx (Protected Route definitions)
│   │   ├── services/                     # Typed Axios API clients (AI, Billing, Reports, HR, CRM, Inventory, etc.)
│   │   ├── types/                        # Complete TypeScript interfaces
│   │   └── App.tsx                       # App entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                               # Backend REST API Server
│   ├── src/
│   │   ├── config/                       # Database connection, Mongo indexes, Environment configuration
│   │   ├── controllers/                  # Express REST controllers
│   │   ├── middleware/                   # Authentication, Role RBAC, Tenant isolation, Rate limiting, Upload validation
│   │   ├── models/                       # 45+ Strict Mongoose Document Models
│   │   ├── routes/                       # Express Route definitions mounted under /api
│   │   ├── services/                     # Business logic, AI assistant, Analytics, Billing HMAC, HR, ERP
│   │   ├── types/                        # Server TypeScript definitions
│   │   ├── utils/                        # ApiError, ApiResponse, Logger, ResilientAuthStore
│   │   ├── validators/                   # Zod schemas for all endpoints
│   │   └── server.ts                     # Express server & Socket.io initialization
│   ├── tests/
│   │   └── api.test.ts                   # 475 end-to-end integration test suite
│   ├── package.json
│   └── tsconfig.json
├── README.md                             # Platform master documentation
├── INSTALLATION.md                       # Setup and installation instructions
├── ENVIRONMENT.md                        # Environment variable configuration reference
├── API_DOCUMENTATION.md                  # Comprehensive REST API specification
├── USER_GUIDE.md                         # Role-based platform operating guide
└── DEPLOYMENT.md                         # Production containerization & deployment manual
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0+ local instance or MongoDB Atlas connection string

### 2. Installation
Clone the repository and install dependencies across root, server, and client:

```bash
# Clone repository
git clone https://github.com/biznexus/biznexus.git
cd neuro

# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Environment Configuration
Copy sample environment templates:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Ensure `server/.env` contains your `MONGODB_URI`, `JWT_SECRET`, and `PAYMENT_WEBHOOK_SECRET`. (See [ENVIRONMENT.md](ENVIRONMENT.md) for full reference).

### 4. Running Development Servers
Start both backend API server and Vite frontend simultaneously:

```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Comprehensive Automated Test Suite

BizNexus includes a complete automated test harness verifying all 10 modules:

```bash
# Run 475 end-to-end integration tests
npm test --prefix server
```

**Test Coverage Summary**:
- **475 Tests Total** (0 Failures, 100% Passing)
- Schemas & Model Integrity
- User Registration, Login & Role Authorization
- Super Admin Platform Oversight
- Business Owner Dashboards & Recharts Visualizations
- Workforce, Attendance, Leave & Automated Payroll
- Customers, CRM Pipeline & Sales Orders
- Double-Entry Inventory Stock Ledgers & Low Stock Alerts
- Accounting, Invoicing, Tax & Financial Reporting
- Projects, Drag-and-Drop Kanban, Discussions & Calendar
- Grounded AI Business Assistant & Predictive Revenue Extrapolation
- Multi-Timeframe Analytics & CSV Exports
- Subscription Lifecycle & HMAC-SHA256 Webhook Verification
- Strict Multi-Tenant Data Isolation Enforcement

---

## 🚢 Production Build

Compile the complete application into production-ready artifacts:

```bash
npm run build
```

- Builds server TypeScript to `server/dist/`
- Builds optimized client bundle to `client/dist/`

---

## 🔒 Security & Tenant Isolation

- **Role-Based Access Control (RBAC)**: All routes enforce strict access policies across `SUPER_ADMIN`, `BUSINESS_OWNER`, `MANAGER`, `EMPLOYEE`, and `CUSTOMER`.
- **Tenant Isolation**: Every operational query enforces business-level scoping via `x-business-id` header and authenticated user session.
- **Cryptographic Webhook Verification**: Payment notifications from Stripe or Razorpay must carry an authentic HMAC-SHA256 signature matching `PAYMENT_WEBHOOK_SECRET`.
- **Grounded AI Answers**: The AI Assistant strictly parses authorized MongoDB documents for the active business and never fabricates financial data.

---

## 📄 License & Intellectual Property

Proprietary Enterprise Software. Engineered for BizNexus Multi-Tenant SaaS Platform. All rights reserved.

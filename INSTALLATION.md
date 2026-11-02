# BizNexus – Installation & Setup Guide

This guide provides step-by-step instructions for installing, configuring, and running the BizNexus Enterprise Platform in both local development and production environments.

---

## 📋 System Prerequisites

Ensure your host machine or deployment server meets the following requirements:

| Component | Minimum Version | Recommended Version |
|---|---|---|
| **Node.js** | v18.16.0 LTS | v20.x or v22.x LTS |
| **npm** | v9.5.0 | v10.x |
| **MongoDB** | v6.0 | MongoDB Atlas M10+ or local MongoDB v7.0 |
| **RAM** | 4 GB | 8 GB or higher |
| **Storage** | 2 GB free disk space | SSD storage with 10 GB+ |

---

## 🛠️ Step 1: Repository Setup

Clone the project repository to your target machine:

```bash
git clone https://github.com/biznexus/biznexus.git
cd neuro
```

Verify the root directory contents:
```bash
ls -la
# You should see 'client', 'server', 'package.json', and configuration files.
```

---

## 📦 Step 2: Dependency Installation

BizNexus is structured as a unified monorepo with dedicated sub-packages for the backend and frontend.

Install all root, backend, and frontend dependencies with a single command:

```bash
npm run install:all
```

Alternatively, you can install dependencies manually:

```bash
# 1. Install root workspace dependencies
npm install

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
cd ..
```

---

## ⚙️ Step 3: Environment Variables Configuration

### 3.1 Backend Environment Configuration
Navigate to the `server/` directory and create a `.env` file based on the provided sample:

```bash
cd server
cp .env.example .env
```

Open `server/.env` and update the parameters:

```ini
# Application Port
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/biznexus
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/biznexus?retryWrites=true&w=majority

# Cryptographic Secrets
JWT_SECRET=biznexus_super_secret_jwt_key_2026_enterprise_grade
JWT_EXPIRES_IN=7d
PAYMENT_WEBHOOK_SECRET=biznexus_secure_webhook_secret_2026

# Platform Admin Seed Credentials
ADMIN_EMAIL=superadmin@biznexus.com
ADMIN_PASSWORD=AdminSecurePassword2026!

# Email Service (SMTP - Optional for Local Dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@biznexus.com
SMTP_PASS=your_app_password
SMTP_FROM="BizNexus Platform <no-reply@biznexus.com>"

# CORS Allowed Origins
CORS_ORIGIN=http://localhost:5173
```

### 3.2 Frontend Environment Configuration
Navigate to the `client/` directory and configure the `.env` file:

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:

```ini
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME="BizNexus Operating System"
```

---

## 🗄️ Step 4: Database Initialization & Seeding

When the server starts, it automatically:
1. Connects to MongoDB Atlas or local MongoDB instance.
2. Creates all production compound and single indexes on 9 core collections (`users`, `businesses`, `subscriptions`, `invoices`, `inventory`, `employees`, `attendance`, `tasks`, `activitylogs`).
3. Seeds default platform subscription tiers (`FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE`).
4. Seeds initial platform administrator account (`superadmin@biznexus.com`).

---

## 🏃 Step 5: Running the Development Environment

Start both backend and frontend applications concurrently from the root directory:

```bash
# From project root:
npm run dev
```

This launches:
- **Backend API Server**: `http://localhost:5000` (with hot-reload via `nodemon` and `ts-node`)
- **Frontend Development Server**: `http://localhost:5173` (with instant HMR via `vite`)

You can also run them in separate terminals if preferred:

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

---

## 🧪 Step 6: Verifying the Installation

### 6.1 Automated Test Execution
Run the end-to-end integration test suite to verify that all 10 modules and 475 test points pass:

```bash
npm test --prefix server
```

Expected output:
```text
======================================================
TEST SUMMARY: 475 Passed, 0 Failed
======================================================
```

### 6.2 Health Endpoint Verification
Open your browser or run curl to test the backend health check:

```bash
curl http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "success": true,
  "message": "BizNexus Central API is operational",
  "data": {
    "status": "HEALTHY",
    "timestamp": "2026-11-01T23:55:00.000Z",
    "database": {
      "connected": true,
      "state": "CONNECTED"
    }
  }
}
```

### 6.3 Browser Verification
1. Navigate to `http://localhost:5173`.
2. The BizNexus landing page will load with real-time health indicator pill (`API 200 OK`).
3. Click **Sign In** and authenticate using one of the pre-configured accounts:
   - **Super Admin**: `superadmin@biznexus.com` / `AdminPass123!`
   - **Business Owner**: `owner@nexuscorp.com` / `OwnerPass123!`
   - **Manager**: `manager@nexuscorp.com` / `ManagerPass123!`
   - **Employee**: `employee@nexuscorp.com` / `EmployeePass123!`
   - **Customer**: `customer@acmecorp.com` / `CustomerPass123!`

---

## 🏗️ Step 7: Building for Production

To create optimized production builds for deployment:

```bash
npm run build
```

- Compiles server TypeScript into `server/dist/`
- Compiles client bundle into minified, code-split assets in `client/dist/`

To start the production server:
```bash
cd server
npm start
```


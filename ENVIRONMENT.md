# BizNexus – Environment Variables Reference

This document provides a comprehensive reference for all configuration options and environment variables supported by the BizNexus backend and frontend.

---

## 🖥️ Server Environment Variables (`server/.env`)

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | The network port on which the Express HTTP and WebSocket server listens. |
| `NODE_ENV` | Optional | `development` | Runtime mode: `development`, `production`, or `test`. Affects stack trace verbosity and security headers. |
| `MONGODB_URI` | **Required** | `mongodb://127.0.0.1:27017/biznexus` | MongoDB connection URI. Can be a local MongoDB or a MongoDB Atlas replica set URI (`mongodb+srv://...`). |
| `JWT_SECRET` | **Required** | `biznexus_default_jwt_secret_change_in_prod` | Cryptographic secret key used to sign and verify JSON Web Tokens (HMAC-SHA256). |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token validity lifespan (e.g., `1d`, `7d`, `30d`, `12h`). |
| `PAYMENT_WEBHOOK_SECRET` | **Required** | `biznexus_secure_webhook_secret_2026` | Shared secret key used to compute and verify HMAC-SHA256 signatures for payment webhooks (Stripe / Razorpay). |
| `ADMIN_EMAIL` | Optional | `superadmin@biznexus.com` | Email address for seeding the default Super Administrator user account on initial boot. |
| `ADMIN_PASSWORD` | Optional | `AdminSecurePassword2026!` | Default password assigned to the Super Administrator during database seeding. |
| `CORS_ORIGIN` | Optional | `http://localhost:5173` | Comma-separated or single allowed origin for Cross-Origin Resource Sharing. In production, set to your frontend domain. |
| `SMTP_HOST` | Optional | `smtp.gmail.com` | Outgoing SMTP mail server host for transactional emails (welcome emails, password resets, business approval alerts). |
| `SMTP_PORT` | Optional | `587` | SMTP server network port (587 for TLS, 465 for SSL). |
| `SMTP_USER` | Optional | `""` | SMTP authentication username. |
| `SMTP_PASS` | Optional | `""` | SMTP authentication password or application-specific password. |
| `SMTP_FROM` | Optional | `"BizNexus <no-reply@biznexus.com>"` | Standard `From:` header display name and email address. |
| `RATE_LIMIT_WINDOW_MS` | Optional | `900000` (15 mins) | Time window in milliseconds for the global API rate limiter. |
| `RATE_LIMIT_MAX` | Optional | `1000` | Maximum allowable requests per IP address within the rate limit window. |
| `LOG_LEVEL` | Optional | `info` | Logging verbosity: `error`, `warn`, `info`, `debug`. |

---

## 🌐 Client Environment Variables (`client/.env`)

Vite requires client-side environment variables to be prefixed with `VITE_`.

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Required** | `/api` | Base path or URL prefix for REST API calls. Defaults to `/api` which is proxied by Vite in dev and Nginx in prod. |
| `VITE_SOCKET_URL` | Optional | `http://localhost:5000` | URL for Socket.io client connection to receive real-time notifications and telemetry updates. |
| `VITE_APP_NAME` | Optional | `"BizNexus Operating System"` | Brand application title rendered in headers and title tags. |

---

## 🔐 Cryptographic Secret Generation Guide

For production deployments, never use default or placeholder secrets. Generate cryptographically strong random strings using OpenSSL or Node.js:

```bash
# Generate a strong 64-byte hex JWT Secret:
openssl rand -hex 64

# Generate a strong Webhook Secret:
openssl rand -hex 32
```

Example output:
```ini
JWT_SECRET=f9a8c1e2b4d5...32e1
PAYMENT_WEBHOOK_SECRET=7c8d9e0f...1a2b
```

---

## 🏢 Multi-Tenant HTTP Headers

When interacting with tenant-isolated endpoints, client applications must provide the target business context:

| Header | Description | Required Roles |
|---|---|---|
| `Authorization` | Standard JWT bearer token header (`Bearer <token>`). | All authenticated endpoints. |
| `x-business-id` | MongoDB `_id` of the active business tenant. Automatically injected by BizNexus Axios interceptors. | `BUSINESS_OWNER`, `MANAGER`, `EMPLOYEE`, `CUSTOMER`. |
| `x-webhook-signature` | Cryptographic HMAC-SHA256 signature passed by payment gateways. | Automated payment webhooks. |


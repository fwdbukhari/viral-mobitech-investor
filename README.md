# VM Hub — Viral Mobitech Internal Platform

**VM Hub** is Viral Mobitech's internal business management platform — a central hub for running and monitoring the company's operations. It is modular by design, with each section serving a specific business function.

---

## Current Module: Investor Portal

The first module tracks monthly revenue, marketing costs, net balance, and investor profit shares.

**Features:**
- Monthly revenue tracking (Ads Revenue, Subscriptions)
- Marketing cost tracking (Ads Spend, Taxes)
- Automatic net balance and investor share calculations
- USD / PKR currency toggle with live exchange rate
- Revenue chart with show/hide toggle
- Monthly breakdown table with CSV and PDF export
- Payment status tracking per month (Received / Pending)
- Add, edit, clear, and delete monthly records
- Multi-investor support with configurable profit share per investor
- Light / Dark / System theme switcher
- Mobile responsive

---

## Tech Stack

- **Next.js 14** (Pages Router)
- **Supabase** (PostgreSQL)
- **Tailwind CSS**
- **Vercel** (hosting & deployment)

---

## Setup (One-Time)

### 1. Supabase Database
Run the schema SQL in your Supabase project → SQL Editor to create the required tables.

### 2. Environment Variables
Add these to Vercel project settings — never commit them to the repo:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

### 3. Initialize Admin
After deploying, make a POST request to `/api/admin/setup` to create the admin account.

### 4. Seed Data *(optional)*
Log in as admin → Overview → click **⚡ Seed Historical Data**.

---

## User Roles

| Role | Access |
|------|--------|
| Admin | Full access — data entry, investor management, all records |
| Investor | Personal dashboard — own share, monthly breakdown, reports |

Investor accounts are created and managed through the Admin → Investors panel. Each investor has their own username, password, and profit share percentage.

---

## Deployment

Auto-deploys via **Vercel GitHub Integration** on every push to `main`.

---

## Security

- All credentials stored as Vercel environment variables
- Passwords hashed before storage
- HttpOnly, SameSite=Lax auth cookies
- Public repo — never commit secrets or API keys

---

*VM Hub — Built for Viral Mobitech | Mobile App Development, AI Solutions & Digital Growth*

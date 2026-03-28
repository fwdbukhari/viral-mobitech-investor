# Viral Mobitech — Investor Portal

A secure, private investor dashboard for **Viral Mobitech** — built to track monthly revenue, marketing costs, net balance, and investor profit shares.

---

## Overview

This is an internal web application for managing and viewing financial performance data. It supports multiple user roles with different levels of access:

- **Admin** — Full access: data entry, investor management, monthly records
- **Investor** — Read-only access: personal dashboard showing their share of net profits
- **Multi-investor support** — Each investor has a configurable profit share percentage

---

## Features

- Monthly revenue tracking (Ads Revenue, Subscriptions, Invalid Traffic adjustments)
- Marketing cost tracking (Ads Spend, Taxes)
- Automatic net balance and investor share calculations
- USD / PKR currency toggle with live PKR rate
- Revenue chart with show/hide toggle
- Monthly breakdown table with CSV and PDF export
- Payment status tracking (Received / Pending) per month
- Add, edit, clear, and delete monthly records
- Light / Dark / System theme switcher
- Mobile responsive design
- Secure cookie-based authentication

---

## Tech Stack

- **Next.js 14** (Pages Router)
- **Supabase** (PostgreSQL database)
- **Tailwind CSS**
- **Vercel** (hosting & deployment)

---

## Setup (One-Time)

### 1. Supabase Database
Go to your Supabase project → SQL Editor → run the schema to create the required tables (`months`, `investors`, `admin_credentials`).

### 2. Environment Variables
Set the following in your Vercel project settings (never commit these to the repo):

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

### 3. Initialize Admin Account
After deployment, make a POST request to:
```
https://your-domain.vercel.app/api/admin/setup
```

### 4. Seed Historical Data *(optional)*
Log in as admin → Overview → click **⚡ Seed Historical Data** to load pre-existing records.

---

## User Management

- Admin account is configured via environment variables
- Investor accounts are created and managed through the Admin → Investors panel
- Each investor gets their own username, password, and profit share percentage

---

## Deployment

This project auto-deploys via **Vercel GitHub Integration**. Any push to the `main` branch triggers a new production deployment.

---

## Security Notes

- All credentials are stored as environment variables — never hardcoded
- Passwords are hashed before storage
- Auth uses HttpOnly cookies with SameSite=Lax
- This repo is public — **never commit secrets, passwords, or API keys**

---

*Built for Viral Mobitech — Mobile App Development, AI Solutions & Digital Growth*

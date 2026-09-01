# VM Hub — Viral Mobitech Internal Platform

**VM Hub** is Viral Mobitech's internal business management platform — a central hub for running and monitoring company operations. It is modular by design, with each section serving a specific business function.

**Live:** https://viral-mobitech-investor.vercel.app

---

## Current Module: Investor Portal

Tracks monthly revenue, marketing costs, net balance, and investor profit shares across fiscal years.

**Features:**
- Monthly revenue tracking — Ads Revenue, Subscriptions, Adj. Invalid Traffic
- Marketing cost tracking — Ads Spend, Taxes
- Automatic net balance and per-investor share calculations
- USD / PKR currency toggle with configurable exchange rate
- Year + Month cascading filter for drill-down analysis
- Revenue chart with show/hide toggle
- Monthly breakdown table with CSV and PDF export
- Payment status per month (Received / Pending)
- Add, edit, clear, and delete monthly records
- Live preview during data entry
- Multi-investor support with configurable profit share % per investor
- Light / Dark / System theme switcher
- Mobile responsive

---

## Tech Stack

- **Next.js 14** (Pages Router)
- **GitHub JSON** (data storage — `data/revenue.json`)
- **Tailwind CSS**
- **Vercel** (hosting & deployment)

> No database. All revenue data is stored as a JSON file directly in this repository.
> This means zero downtime, zero maintenance, and no service dependencies beyond GitHub and Vercel.

---

## Data Storage

All monthly revenue records are stored in `data/revenue.json` in this repo.

- **Reads** — API fetches the file from GitHub on every request
- **Writes** — API commits an updated file back to GitHub when data is saved
- **Investor accounts** — stored in a Vercel environment variable (`INVESTORS_JSON`)
- **Admin credentials** — stored in Vercel environment variables

---

## Setup (One-Time)

### 1. Fork or clone this repo

### 2. Set Environment Variables in Vercel

```
JWT_SECRET=            # any long random string
ADMIN_USERNAME=        # your admin username
ADMIN_PASSWORD=        # your admin password
GITHUB_TOKEN=          # GitHub Personal Access Token with repo scope
GITHUB_REPO=           # e.g. yourusername/your-repo-name
INVESTORS_JSON=        # JSON array of investor accounts (see format below)
```

**INVESTORS_JSON format:**
```json
[
  {"name":"Investor Name","username":"username","password":"password","sharePercent":30}
]
```

### 3. Create `data/revenue.json`
The file must exist in the repo before first use. Minimum content:
```json
{ "months": [] }
```

### 4. Deploy to Vercel
Connect your GitHub repo to Vercel. It auto-deploys on every push to `main`.

---

## User Roles

| Role | Access |
|------|--------|
| Admin | Full access — data entry, all records, investor overview |
| Investor | Personal dashboard — own share %, monthly breakdown, reports |

Investor accounts are managed via the `INVESTORS_JSON` environment variable in Vercel.

---

## Security

- All credentials stored as Vercel environment variables — never in code
- Auth uses signed JWT tokens (7-day expiry)
- HttpOnly, SameSite=Lax cookies
- No database exposed to the internet
- Repo is public — `data/revenue.json` contains financial data, keep this in mind

---

*VM Hub — Built for Viral Mobitech | Mobile App Development, AI Solutions & Digital Growth*

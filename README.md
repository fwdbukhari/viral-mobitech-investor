# Viral Mobitech Investor Portal

A secure, private investor dashboard for Viral Mobitech — showing monthly revenue, marketing costs, net balance, and 30% investor share.

## Setup (One-Time)

### 1. Supabase Database
Go to your Supabase project → **SQL Editor** → paste and run the contents of `supabase-schema.sql`

### 2. Environment Variables
Set these in Vercel project settings:
```
SUPABASE_URL=              # from Supabase → Settings → API → Project URL
SUPABASE_SERVICE_ROLE_KEY= # from Supabase → Settings → API → service_role key
JWT_SECRET=                # any long random string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=VMAdmin@2025
```

### 3. Initialize Admin
After deployment, visit: `https://your-domain.vercel.app/api/admin/setup`
(POST request — use any REST client or browser extension)

### 4. Seed Historical Data
Log in as admin → Overview → click **⚡ Seed Historical Data**

## Tech Stack
- Next.js 14 (Pages Router)
- Supabase (PostgreSQL)
- Tailwind CSS
- Vercel hosting

## Accounts
- Admin: `admin` / `VMAdmin@2025`
- Investors: managed via Admin → Investors panel
# Viral Mobitech Investor Portal — Thu Mar 26 11:29:12 UTC 2026

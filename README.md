# ETICO — Waitlist + CMS

A one-stop waitlist site for ETICO with a built-in CMS (stats, caps, per-user data).
Built with **Next.js (App Router) + TypeScript + Tailwind**, backed by the **existing
ETICO Supabase project** (server-side, service-role only — no DB keys ship to the browser).

- Public site: hero (ScrollExpand) → straight to the waitlist form.
- Admin CMS at **`/admin`**: live signups chart, breakdowns, a waitlist **cap**, and
  every entry individually (searchable + CSV export).

## Setup (5 minutes)

1. **Create the tables** — open your Supabase project → SQL Editor → paste and run
   [`supabase-setup.sql`](./supabase-setup.sql). (RLS stays on with no public policies;
   all access is via the server using the service-role key.)

2. **Configure env** — edit [`.env.local`](./.env.local):
   - `SUPABASE_URL` — already set to the existing project.
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → API → **service_role**. Paste it.
   - `ADMIN_PASSWORD` — set the password that unlocks `/admin`.

3. **Install & run**
   ```bash
   npm install
   npm run dev
   ```
   - Site: http://localhost:3000
   - CMS:  http://localhost:3000/admin

## Data collected
Name, Email, Phone, Location (state), investing experience, interests (multi),
motivations (up to 3), how-they-heard, an “Other” note, and both consent flags —
plus `created_at` and a `notified_at` slot for sending launch emails later.

## The cap
Set a maximum number of signups in the CMS (0 = unlimited). When the cap is reached,
the public form is closed server-side and the landing page shows the fill progress.

## Launch emails (later)
Every opt-in is stored with a `notified_at` column. When the app launches, a small
script/endpoint can select `consent_updates = true AND notified_at IS NULL`, send the
email via your provider, and stamp `notified_at`. (Not wired yet — no launch date.)

## Deploy
Deploy to Vercel and set the same three env vars in the project settings. It uses the
same Supabase project, so data is shared with your ops.

> Brand assets in `/public` are copied from the ETICO app. The Privacy Policy / Terms
> links in the form are placeholders — point them at your published policy pages.

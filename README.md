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
   - `EMAIL_SEND_SECRET` — server-to-server key for the shared branded email
     endpoint (same value as the proxy's + the web app's). Needed for the
     confirmation email below. Optional: `PROXY_BASE` to override the proxy URL.

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

## Email (shared branded system)
On a successful signup, `src/app/api/waitlist/route.ts` sends a **branded
confirmation email** that includes the person's **waitlist position** — via the
one shared email service all ETICO apps use (web, mobile, waitlist), so nothing
ships Moneta's default template:

- `POST ${PROXY_BASE}/api/send-email` with `{ to, type: "waitlist", data: { name, position } }`
  and header `x-cron-secret: <EMAIL_SEND_SECRET>`. Branding lives in the proxy
  (`moneta-app/api/send-email.ts` → `renderTemplate`), not here.
- The send is `await`ed (this app is Next **14**, which has no `after()`), so it
  finishes before the serverless function returns.
- Needs `EMAIL_SEND_SECRET` set in this project's env (see Setup). The
  `MONETA_EMAIL_*` merchant on the proxy must be funded or sends return
  "low balance".

> The same proxy also exposes `POST /api/send-email-attachment` (PDF attachments,
> e.g. the web app's KYC-to-PAC send). The waitlist doesn't use it, but it's the
> same auth/branding if you ever need to attach a file. Keep any attachment well
> under Vercel's ~4.5 MB request-body limit.

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

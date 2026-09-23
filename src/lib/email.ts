// Send a branded ETICO email through the shared proxy — the same centralized
// /api/send-email the web app + mobile app use. Server-to-server via
// EMAIL_SEND_SECRET (never reaches the browser). Best-effort: returns whether
// the proxy accepted it, and logs (visible in Vercel logs) when it doesn't, so
// a silent "low balance" / rejected send is diagnosable. Mirrors
// niqra-web/src/lib/email.ts so all ETICO apps send identically.

const PROXY_BASE = process.env.PROXY_BASE ?? 'https://moneta-app-ten.vercel.app'

export async function sendBrandedEmail(
  to: string,
  type: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  const secret = process.env.EMAIL_SEND_SECRET ?? ''
  if (!secret) {
    console.warn('[email] EMAIL_SEND_SECRET not set — skipping', type)
    return false
  }
  try {
    const res = await fetch(`${PROXY_BASE}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
      body: JSON.stringify({ to, type, data }),
      cache: 'no-store',
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.warn('[email] proxy rejected', type, res.status, detail.slice(0, 200))
    }
    return res.ok
  } catch (e) {
    console.warn('[email] send failed:', (e as Error).message)
    return false
  }
}

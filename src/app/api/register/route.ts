import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Creates a real ETICO account and fires our branded "welcome" email — mirrors
// niqra-web's signUpAction now that Supabase's "Confirm email" is disabled:
//   • admin.createUser({ email_confirm: true }) → account is active immediately,
//     no Supabase confirmation email is sent.
//   • send-email type "welcome" via the shared proxy (same one the app uses).
// Server-only: the service-role key and EMAIL_SEND_SECRET never reach the browser.

function validName(v: string): boolean {
  return v.trim().split(/\s+/).filter(Boolean).length >= 2 && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s'.\-]{1,99}$/.test(v.trim())
}
function validEmail(v: string): boolean {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v)
}
// Same policy as niqra-web / the mobile app: 8+ chars with an uppercase,
// lowercase, number and special character.
function passwordError(pw: string): string | null {
  if (pw.length > 72) return 'Password is too long (max 72 characters)'
  if (pw.length < 8 || !/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
    return 'Password must be 8+ characters with an uppercase, lowercase, number and special character'
  }
  return null
}

export async function POST(req: NextRequest) {
  let body: { fullName?: string; email?: string; password?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const fullName = String(body.fullName ?? '').replace(/\s+/g, ' ').trim().slice(0, 100)
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 254)
  const password = String(body.password ?? '')

  if (!validName(fullName)) return NextResponse.json({ error: 'Please include your first and last name' }, { status: 422 })
  if (!validEmail(email)) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 422 })
  const pwErr = passwordError(password)
  if (pwErr) return NextResponse.json({ error: pwErr }, { status: 422 })

  try {
    // Create the account already confirmed (no Supabase email).
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) {
      if (/already|exists|registered|duplicate/i.test(error.message)) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Could not create your account. Please try again.' }, { status: 500 })
    }

    // Branded welcome email through the shared proxy. Best-effort, awaited (Next
    // 14 has no after()), never blocks the success response.
    const PROXY_BASE = process.env.PROXY_BASE ?? 'https://moneta-app-ten.vercel.app'
    const EMAIL_SEND_SECRET = process.env.EMAIL_SEND_SECRET ?? ''
    if (EMAIL_SEND_SECRET) {
      try {
        await fetch(`${PROXY_BASE}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-cron-secret': EMAIL_SEND_SECRET },
          body: JSON.stringify({ to: email, type: 'welcome', data: { name: fullName } }),
          cache: 'no-store',
        })
      } catch { /* ignore — signup still succeeded */ }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Registration is temporarily unavailable. Please try again shortly.' }, { status: 500 })
  }
}

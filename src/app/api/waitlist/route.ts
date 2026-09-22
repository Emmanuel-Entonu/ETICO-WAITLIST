import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { waitlistSchema } from '@/lib/schema'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

async function readCap(): Promise<number> {
  const { data } = await supabaseAdmin.from('waitlist_settings').select('cap').eq('id', 1).single()
  return data?.cap ?? 0
}

async function readCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from('waitlist_entries')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

// Public: how many have joined + the cap (for the progress bar). No PII.
export async function GET() {
  try {
    const [cap, count] = await Promise.all([readCap(), readCount()])
    return NextResponse.json({ count, cap })
  } catch {
    return NextResponse.json({ count: 0, cap: 0 })
  }
}

// Public: join the waitlist.
export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const parsed = waitlistSchema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return NextResponse.json({ error: first?.message ?? 'Please check the form' }, { status: 422 })
  }
  const v = parsed.data

  try {
    const cap = await readCap()
    if (cap > 0) {
      const count = await readCount()
      if (count >= cap) {
        return NextResponse.json({ error: 'The waitlist is currently full. Check back soon.' }, { status: 403 })
      }
    }

    // One spot per person: reject if the name, email or phone already exists.
    // Values are quoted for the PostgREST `.or()` filter; for the name we also
    // neutralise ilike wildcards so it stays an exact, case-insensitive match.
    const quote = (s: string) => `"${s.replace(/"/g, '')}"`
    const quoteLike = (s: string) => quote(s.replace(/[%_\\]/g, ' '))
    const { data: existing } = await supabaseAdmin
      .from('waitlist_entries')
      .select('id')
      .or(`email.eq.${quote(v.email)},phone.eq.${quote(v.phone)},name.ilike.${quoteLike(v.name)}`)
      .limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Looks like you've already claimed a spot with that name, email or phone." },
        { status: 409 },
      )
    }

    const { error } = await supabaseAdmin.from('waitlist_entries').insert({
      name: v.name,
      email: v.email,
      phone: v.phone,
      location: v.location,
      invested_before: v.investedBefore,
      interests: v.interests,
      motivations: v.motivations,
      heard_from: v.heardFrom || null,
      other_notes: v.otherNotes || null,
      consent_updates: v.consentUpdates,
      consent_policy: v.consentPolicy,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: "You're already on the waitlist. See you at launch!" }, { status: 409 })
      }
      return NextResponse.json({ error: 'Could not save your spot. Please try again.' }, { status: 500 })
    }

    // Branded "you're on the waitlist" email — best-effort, never blocks the
    // response. Goes through the shared ETICO email proxy (same one the app +
    // mobile use). Needs EMAIL_SEND_SECRET (and optionally PROXY_BASE) in env.
    const PROXY_BASE = process.env.PROXY_BASE ?? 'https://moneta-app-ten.vercel.app'
    const EMAIL_SEND_SECRET = process.env.EMAIL_SEND_SECRET ?? ''
    // Their position = the total after their insert (they're the latest entry).
    const count = await readCount()

    // Congratulatory branded email with their waitlist number. Awaited (not
    // fire-and-forget) so it actually sends before this serverless function
    // returns; best-effort, so a failure never blocks the signup.
    if (EMAIL_SEND_SECRET) {
      try {
        await fetch(`${PROXY_BASE}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-cron-secret': EMAIL_SEND_SECRET },
          body: JSON.stringify({
            to: v.email,
            type: 'waitlist',
            data: { name: v.name, position: count },
          }),
        })
      } catch { /* ignore */ }
    }

    return NextResponse.json({ ok: true, count })
  } catch {
    return NextResponse.json({ error: 'Server not configured. Set SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 })
  }
}

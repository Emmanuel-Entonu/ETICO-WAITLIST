import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { waitlistSchema } from '@/lib/schema'
import { sendBrandedEmail } from '@/lib/email'

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

    // Their position = the total after their insert (they're the latest entry).
    const count = await readCount()

    // Branded "you're on the waitlist" email with their number — awaited (Next
    // 14 has no after()) so it sends before the function returns; best-effort,
    // so a failure never blocks the signup and is logged, not swallowed.
    await sendBrandedEmail(v.email, 'waitlist', { name: v.name, position: count })

    return NextResponse.json({ ok: true, count })
  } catch {
    return NextResponse.json({ error: 'Server not configured. Set SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 })
  }
}

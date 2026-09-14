import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

type Row = {
  id: string; name: string; email: string; phone: string; location: string
  invested_before: string; interests: string[]; motivations: string[]
  heard_from: string | null; other_notes: string | null
  consent_updates: boolean; consent_policy: boolean; created_at: string
}

function tally(values: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const v of values) { if (!v) continue; out[v] = (out[v] ?? 0) + 1 }
  return out
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: rows, error }, { data: settings }] = await Promise.all([
    supabaseAdmin.from('waitlist_entries').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('waitlist_settings').select('cap').eq('id', 1).single(),
  ])
  if (error) return NextResponse.json({ error: 'Could not load entries' }, { status: 500 })

  const list = (rows ?? []) as Row[]
  const total = list.length

  // Signups per day (last 14 days), oldest→newest.
  const days: { date: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, count: 0 })
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]))
  for (const r of list) {
    const key = (r.created_at ?? '').slice(0, 10)
    const idx = dayIndex.get(key)
    if (idx != null) days[idx].count++
  }

  const stats = {
    byInvested: tally(list.map(r => r.invested_before)),
    byInterest: tally(list.flatMap(r => (r.interests ?? []))),
    byMotivation: tally(list.flatMap(r => (r.motivations ?? []))),
    byHeardFrom: tally(list.map(r => r.heard_from ?? '')),
    byLocation: tally(list.map(r => r.location)),
    perDay: days,
    consentUpdates: list.filter(r => r.consent_updates).length,
  }

  // Spot number = place in line by signup order (oldest = #1). The list is
  // newest-first, so the newest row is the highest spot.
  const entries = list.map((r, i) => ({
    id: r.id,
    spot: total - i,
    name: r.name,
    email: r.email,
    phone: r.phone,
    location: r.location,
    investedBefore: r.invested_before,
    interests: r.interests ?? [],
    motivations: r.motivations ?? [],
    heardFrom: r.heard_from ?? '',
    otherNotes: r.other_notes ?? '',
    consentUpdates: r.consent_updates,
    consentPolicy: r.consent_policy,
    createdAt: r.created_at,
  }))

  return NextResponse.json(
    { total, cap: settings?.cap ?? 0, stats, entries },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}

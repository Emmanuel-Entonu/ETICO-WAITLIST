import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Admin: read the current cap.
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabaseAdmin.from('waitlist_settings').select('cap').eq('id', 1).single()
  return NextResponse.json({ cap: data?.cap ?? 0 })
}

// Admin: set the cap (0 = unlimited).
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: { cap?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  const cap = Math.max(0, Math.floor(Number(body.cap)))
  if (!Number.isFinite(cap)) return NextResponse.json({ error: 'Cap must be a number' }, { status: 422 })

  const { error } = await supabaseAdmin.from('waitlist_settings').upsert({ id: 1, cap })
  if (error) return NextResponse.json({ error: 'Could not update cap' }, { status: 500 })
  return NextResponse.json({ ok: true, cap })
}

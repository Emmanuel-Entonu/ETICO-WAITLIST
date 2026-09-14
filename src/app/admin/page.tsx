'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { StatCard, BarList, DayBars, BreakdownCard } from '@/components/Charts'

type Entry = {
  id: string; spot: number; name: string; email: string; phone: string; location: string
  investedBefore: string; interests: string[]; motivations: string[]
  heardFrom: string; otherNotes: string; consentUpdates: boolean; consentPolicy: boolean
  createdAt: string
}
type Data = { total: number; cap: number; entries: Entry[] }

const PW_KEY = 'etico_admin_pw'

const tally = (vals: string[]): Record<string, number> => {
  const o: Record<string, number> = {}
  for (const v of vals) { if (!v) continue; o[v] = (o[v] ?? 0) + 1 }
  return o
}

// Recompute every breakdown from a given set of entries (whole or filtered).
function computeStats(entries: Entry[]) {
  return {
    total: entries.length,
    optIns: entries.filter(e => e.consentUpdates).length,
    byInvested: tally(entries.map(e => e.investedBefore)),
    byHeardFrom: tally(entries.map(e => e.heardFrom)),
    byLocation: tally(entries.map(e => e.location)),
    byInterest: tally(entries.flatMap(e => e.interests ?? [])),
    byMotivation: tally(entries.flatMap(e => e.motivations ?? [])),
  }
}

const MS_DAY = 86_400_000
const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10)

// Signups-per-day across the active date window: the selected range when set,
// otherwise the last 14 days. Capped at 120 buckets so long ranges stay legible.
function perDayRange(entries: Entry[], from: string, to: string) {
  const parse = (s: string) => Date.parse(s + 'T00:00:00Z')
  const todayMs = parse(new Date().toISOString().slice(0, 10))
  let startMs = from ? parse(from) : todayMs - 13 * MS_DAY
  let endMs = to ? parse(to) : todayMs
  if (endMs < startMs) endMs = startMs
  let n = Math.floor((endMs - startMs) / MS_DAY) + 1
  if (n > 120) { startMs = endMs - 119 * MS_DAY; n = 120 }
  const days = Array.from({ length: n }, (_, i) => ({ date: dayKey(startMs + i * MS_DAY), count: 0 }))
  const idx = new Map(days.map((d, i) => [d.date, i]))
  for (const e of entries) {
    const i = idx.get((e.createdAt ?? '').slice(0, 10))
    if (i != null) days[i].count++
  }
  return days
}

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort()

export default function Admin() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [capInput, setCapInput] = useState('')

  // Filters
  const [q, setQ] = useState('')
  const [fExperience, setFExperience] = useState('')
  const [fLocation, setFLocation] = useState('')
  const [fChannel, setFChannel] = useState('')
  const [fConsent, setFConsent] = useState<'any' | 'yes' | 'no'>('any')
  const [fFrom, setFFrom] = useState('')
  const [fTo, setFTo] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [capMsg, setCapMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [savingCap, setSavingCap] = useState(false)

  async function load(password: string) {
    setLoading(true); setErr(null)
    try {
      const res = await fetch('/api/admin/entries', { headers: { 'x-admin-password': password } })
      if (res.status === 401) { setErr('Wrong password'); setAuthed(false); return }
      if (!res.ok) { setErr('Could not load'); return }
      const d: Data = await res.json()
      setData(d); setCapInput(String(d.cap)); setAuthed(true)
      sessionStorage.setItem(PW_KEY, password)
    } catch { setErr('Network error') } finally { setLoading(false) }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY)
    if (saved) { setPw(saved); load(saved) }
  }, [])

  async function saveCap() {
    const value = Number(capInput)
    if (!Number.isFinite(value) || value < 0) { setCapMsg({ ok: false, text: 'Enter a number (0 = unlimited)' }); return }
    setSavingCap(true); setCapMsg(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ cap: value }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok) {
        setCapMsg({ ok: true, text: `Saved — cap is now ${d.cap === 0 ? 'unlimited' : d.cap.toLocaleString()}` })
        await load(pw)
      } else {
        setCapMsg({ ok: false, text: d.error ?? `Save failed (${res.status})` })
      }
    } catch {
      setCapMsg({ ok: false, text: 'Network error while saving' })
    } finally {
      setSavingCap(false)
    }
  }

  const entries = data?.entries ?? []
  const opts = useMemo(() => ({
    experience: uniq(entries.map(e => e.investedBefore)),
    location: uniq(entries.map(e => e.location)),
    channel: uniq(entries.map(e => e.heardFrom)),
  }), [entries])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return entries.filter(e => {
      if (fExperience && e.investedBefore !== fExperience) return false
      if (fLocation && e.location !== fLocation) return false
      if (fChannel && e.heardFrom !== fChannel) return false
      if (fConsent === 'yes' && !e.consentUpdates) return false
      if (fConsent === 'no' && e.consentUpdates) return false
      const day = (e.createdAt ?? '').slice(0, 10)
      if (fFrom && day < fFrom) return false
      if (fTo && day > fTo) return false
      if (needle) {
        const hay = [e.name, e.email, e.phone, e.location, e.investedBefore, e.heardFrom, e.otherNotes,
          e.interests.join(' '), e.motivations.join(' ')].join(' ').toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [entries, q, fExperience, fLocation, fChannel, fConsent, fFrom, fTo])

  const s = useMemo(() => computeStats(filtered), [filtered])
  const perDay = useMemo(() => perDayRange(filtered, fFrom, fTo), [filtered, fFrom, fTo])
  const trendTitle = (fFrom || fTo)
    ? `Signups per day, ${perDay[0]?.date ?? fFrom} to ${perDay[perDay.length - 1]?.date ?? fTo}`
    : 'Signups, last 14 days'
  const activeFilters =
    (fExperience ? 1 : 0) + (fLocation ? 1 : 0) + (fChannel ? 1 : 0) +
    (fConsent !== 'any' ? 1 : 0) + (fFrom ? 1 : 0) + (fTo ? 1 : 0) + (q.trim() ? 1 : 0)

  function clearFilters() {
    setQ(''); setFExperience(''); setFLocation(''); setFChannel(''); setFConsent('any'); setFFrom(''); setFTo('')
  }

  function exportCsv() {
    const head = ['Spot', 'Name', 'Email', 'Phone', 'Location', 'Experience', 'Interests', 'Motivations', 'Channel', 'Other', 'Updates opt-in', 'Policy', 'Joined']
    const rows = filtered.map(e => [
      e.spot, e.name, e.email, e.phone, e.location, e.investedBefore,
      e.interests.join('; '), e.motivations.join('; '), e.heardFrom, e.otherNotes,
      e.consentUpdates ? 'yes' : 'no', e.consentPolicy ? 'yes' : 'no', new Date(e.createdAt).toISOString(),
    ])
    const csv = [head, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a'); a.href = url
    a.download = `etico-waitlist${activeFilters ? '-filtered' : ''}-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-3xl border border-cream-sand bg-white p-8 shadow-card">
          <h1 className="text-2xl font-extrabold text-green">ETICO CMS</h1>
          <p className="text-sm text-green/60 mt-1 mb-6">Waitlist admin. Enter the password.</p>
          <form onSubmit={e => { e.preventDefault(); load(pw) }}>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Admin password"
              className="w-full rounded-xl border border-cream-sand bg-cream px-4 h-12 text-green outline-none focus:border-gold focus:ring-2 focus:ring-gold/30" />
            {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
            <button disabled={loading} className="mt-5 w-full h-12 rounded-xl bg-green text-cream font-extrabold hover:bg-green-deep transition disabled:opacity-60">
              {loading ? 'Checking…' : 'Enter'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  const wholeTotal = data?.total ?? 0
  const fillPct = data && data.cap > 0 ? Math.round((wholeTotal / data.cap) * 100) : 0
  const selectCls = 'rounded-lg border border-cream-sand bg-cream px-3 h-10 text-sm text-green outline-none focus:border-gold'

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-green">Waitlist CMS</h1>
            <p className="text-sm text-green/60">
              {activeFilters > 0
                ? <>Showing <b className="text-green">{filtered.length.toLocaleString()}</b> of {wholeTotal.toLocaleString()}. Stats below reflect this segment.</>
                : <>Live signups, breakdowns and every entry.</>}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load(pw)} className="rounded-full border border-cream-sand bg-white px-4 h-10 text-sm font-bold text-green hover:border-green/40">Refresh</button>
            <button onClick={exportCsv} className="rounded-full bg-green px-4 h-10 text-sm font-bold text-cream hover:bg-green-deep">
              Export CSV{activeFilters > 0 ? ` (${filtered.length})` : ''}
            </button>
          </div>
        </div>

        {/* Stat cards + cap control (cap is a whole-list setting) */}
        <p className="text-xs font-bold tracking-wider text-green/40 mb-3">OVERVIEW</p>
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <StatCard label={activeFilters ? 'SIGNUPS IN SEGMENT' : 'TOTAL SIGNUPS'} value={s.total.toLocaleString()} sub={activeFilters ? `of ${wholeTotal.toLocaleString()} total` : undefined} />
          <StatCard label="MARKETING OPT-INS" value={s.optIns.toLocaleString()} sub="agreed to launch emails" />
          <StatCard label="CAP" value={data && data.cap > 0 ? data.cap.toLocaleString() : 'Unlimited'} sub={data && data.cap > 0 ? `${fillPct}% filled` : 'no limit set'} />
          <div className="rounded-2xl border border-cream-sand bg-white p-5 shadow-card">
            <p className="text-xs font-bold tracking-wide text-green/50 mb-2">SET CAP (0 = unlimited)</p>
            <div className="flex gap-2">
              <input type="number" min={0} value={capInput} onChange={e => setCapInput(e.target.value)}
                className="w-full rounded-lg border border-cream-sand bg-cream px-3 h-10 text-green outline-none focus:border-gold" />
              <button onClick={saveCap} disabled={savingCap} className="rounded-lg bg-gold px-4 h-10 text-sm font-extrabold text-green-ink hover:bg-gold-deep disabled:opacity-60">
                {savingCap ? 'Saving…' : 'Save'}
              </button>
            </div>
            {capMsg && (
              <p className={`mt-2 text-xs font-semibold ${capMsg.ok ? 'text-green/70' : 'text-red-600'}`}>{capMsg.text}</p>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="rounded-2xl border border-cream-sand bg-white p-4 shadow-card mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold tracking-wide text-green/50">
              FILTERS {activeFilters > 0 && <span className="text-gold-deep">· {activeFilters} active</span>}
            </p>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-xs font-bold text-green/60 hover:text-green underline decoration-gold">Clear all</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, phone, notes…"
              className={`${selectCls} w-64 max-w-full`} />
            <select value={fExperience} onChange={e => setFExperience(e.target.value)} className={selectCls}>
              <option value="">All experience</option>
              {opts.experience.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={fLocation} onChange={e => setFLocation(e.target.value)} className={selectCls}>
              <option value="">All locations</option>
              {opts.location.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={fChannel} onChange={e => setFChannel(e.target.value)} className={selectCls}>
              <option value="">All channels</option>
              {opts.channel.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={fConsent} onChange={e => setFConsent(e.target.value as 'any' | 'yes' | 'no')} className={selectCls}>
              <option value="any">Any consent</option>
              <option value="yes">Opted in to emails</option>
              <option value="no">Not opted in</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-green/60">
              From <input type="date" value={fFrom} onChange={e => setFFrom(e.target.value)} className={selectCls} />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-green/60">
              To <input type="date" value={fTo} onChange={e => setFTo(e.target.value)} className={selectCls} />
            </label>
          </div>
        </div>

        {/* Breakdowns (reflect the current filter) */}
        <p className="text-xs font-bold tracking-wider text-green/40 mb-3">BREAKDOWNS</p>
        <div className="mb-4"><DayBars days={perDay} title={trendTitle} /></div>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <BreakdownCard title="Investing experience" data={s.byInvested} />
          <BreakdownCard title="Where they heard about us" data={s.byHeardFrom} />
          <BreakdownCard title="Location" data={s.byLocation} initial="pie" />
          {Object.keys(s.byInterest).length > 0 && <BarList title="Interests" data={s.byInterest} />}
          {Object.keys(s.byMotivation).length > 0 && <BarList title="What would make them use ETICO" data={s.byMotivation} />}
        </div>

        {/* Individual entries — click a row for full detail */}
        <p className="text-xs font-bold tracking-wider text-green/40 mb-3">PEOPLE</p>
        <div className="rounded-2xl border border-cream-sand bg-white shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-cream-sand">
            <h3 className="font-extrabold text-green">Entries <span className="text-green/40 font-medium">({filtered.length.toLocaleString()})</span></h3>
            <span className="text-xs text-green/40">Click a row for full detail</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-green/60 text-left text-xs uppercase tracking-wide">
                <tr>
                  {['Spot', 'Name', 'Email', 'Phone', 'Location', 'Experience', 'Channel', 'Opt-in', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <Fragment key={e.id}>
                    <tr onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                      className="border-t border-cream-sand hover:bg-cream/60 cursor-pointer align-top">
                      <td className="px-4 py-3 font-bold text-gold-deep whitespace-nowrap tnum">#{e.spot.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-green whitespace-nowrap">{e.name}</td>
                      <td className="px-4 py-3 text-green/80 whitespace-nowrap">{e.email}</td>
                      <td className="px-4 py-3 text-green/80 whitespace-nowrap">{e.phone}</td>
                      <td className="px-4 py-3 text-green/80 whitespace-nowrap">{e.location}</td>
                      <td className="px-4 py-3 text-green/70 whitespace-nowrap">{e.investedBefore}</td>
                      <td className="px-4 py-3 text-green/70 whitespace-nowrap">{e.heardFrom || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${e.consentUpdates ? 'bg-gold-soft text-gold-deep' : 'bg-cream-sand text-green/50'}`}>
                          {e.consentUpdates ? 'yes' : 'no'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green/50 whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                    {expanded === e.id && (
                      <tr className="bg-cream/60 border-t border-cream-sand">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                            <Detail label="Full name" value={e.name} />
                            <Detail label="Email" value={e.email} />
                            <Detail label="Phone" value={e.phone} />
                            <Detail label="Location" value={e.location} />
                            <Detail label="Investing experience" value={e.investedBefore} />
                            <Detail label="Heard about us via" value={e.heardFrom || '—'} />
                            <Detail label="Interests" value={e.interests.length ? e.interests.join(', ') : '—'} />
                            <Detail label="Motivations" value={e.motivations.length ? e.motivations.join(', ') : '—'} />
                            <Detail label="Marketing opt-in" value={e.consentUpdates ? 'Yes' : 'No'} />
                            <Detail label="Accepted policy" value={e.consentPolicy ? 'Yes' : 'No'} />
                            <Detail label="Spot" value={`#${e.spot.toLocaleString()}`} />
                            <Detail label="Joined" value={new Date(e.createdAt).toLocaleString()} />
                            {e.otherNotes && <div className="sm:col-span-2 lg:col-span-4"><Detail label="Other notes" value={e.otherNotes} /></div>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-green/40">
                    {entries.length === 0 ? 'No entries yet.' : 'No entries match these filters.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-green/40">{label}</p>
      <p className="text-green/85 break-words">{value}</p>
    </div>
  )
}

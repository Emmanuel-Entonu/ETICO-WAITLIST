'use client'

import { useState } from 'react'
import {
  INVESTED_OPTIONS, INTEREST_OPTIONS, MOTIVATION_OPTIONS,
  HEARD_FROM_OPTIONS, NIGERIAN_STATES, COUNTRIES,
} from '@/lib/schema'

const MAX_MOTIVATIONS = 3

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold text-green mb-3">{children}</p>
}

function toggle(list: string[], value: string, cap?: number): string[] {
  if (list.includes(value)) return list.filter(v => v !== value)
  if (cap && list.length >= cap) return list
  return [...list, value]
}

/* ── Card icons (dark rounded-square glyphs, Rove-style) ────────────────── */
function IconUser() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" /></svg>
}
function IconTrend() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 15l4.5-5 3 2.5L19 6" /><path d="M19 6v4" /><path d="M19 6h-4" /></svg>
}
function IconSend() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 3L10.5 13.5" /><path d="M21 3l-6.5 18-4-8-8-4 18-6.5z" /></svg>
}

/* ── One card in the stack — icon square + title/subtitle, then content. ─── */
function FormCard({
  icon, title, subtitle, children,
}: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-cream-sand bg-white p-6 sm:p-7 shadow-soft">
      <div className="flex flex-col items-center text-center mb-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green text-gold">{icon}</span>
        <h3 className="font-display text-xl font-bold text-green leading-tight mt-3.5">{title}</h3>
        <p className="text-sm text-green/55 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

/* ── Brand marks for the "how did you hear" options (monochrome, currentColor) ── */
function BrandIcon({ name }: { name: string }) {
  const c = 'h-4 w-4 shrink-0'
  switch (name) {
    case 'Instagram':
      return <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth={1.9}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" /></svg>
    case 'TikTok':
      return <svg viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M16.6 3c.3 2 1.45 3.35 3.4 3.6v2.2c-1.25 0-2.4-.3-3.4-.85v6.15c0 3.2-2.3 5.4-5.15 5.4A5.1 5.1 0 0 1 6.2 14.5c0-2.9 2.35-5.05 5.35-5.05.28 0 .56.02.83.07v2.35a2.8 2.8 0 0 0-.95-.17 2.72 2.72 0 1 0 2.72 2.72V3h2.45z" /></svg>
    case 'X':
      return <svg viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M17.5 3h3.1l-6.77 7.73L21.9 21h-6.24l-4.9-6.4L5.1 21H2l7.24-8.27L2.4 3h6.4l4.42 5.85L17.5 3zm-1.09 16.1h1.72L7.67 4.8H5.83l10.58 14.3z" /></svg>
    case 'Facebook':
      return <svg viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.13h-3.1V7.87c0-.9.25-1.52 1.55-1.52h1.65V3.55c-.29-.04-1.27-.12-2.42-.12-2.4 0-4.03 1.46-4.03 4.15v2.29H7.5V13h2.75v8h3.25z" /></svg>
    case 'WhatsApp':
      return <svg viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.34.53.75 2.74-2.8-.73-.5.3A8.2 8.2 0 1 1 12 3.8zm-3.1 4c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34 1 2.5c.12.16 1.7 2.7 4.2 3.68 2.08.82 2.5.66 2.96.62.46-.04 1.48-.6 1.7-1.2.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.48-.73-1.7-.82-.24-.08-.4-.12-.58.12-.16.24-.66.82-.8.98-.16.16-.3.18-.54.06-.24-.12-1.04-.38-1.98-1.22-.72-.64-1.22-1.44-1.36-1.68-.14-.24-.02-.36.1-.48.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.36-.76-1.86-.18-.42-.36-.42-.52-.42h-.44z" /></svg>
    case 'Google':
      return <svg viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M21.35 12.2c0-.66-.06-1.29-.17-1.9H12v3.6h5.25a4.5 4.5 0 0 1-1.95 2.95v2.45h3.15c1.85-1.7 2.9-4.2 2.9-7.1z" opacity="0.95" /><path d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.15-2.45c-.87.6-2 .95-3.3.95-2.53 0-4.68-1.7-5.45-4h-3.25v2.5A9.5 9.5 0 0 0 12 21.5z" opacity="0.75" /><path d="M6.55 13.65a5.7 5.7 0 0 1 0-3.65v-2.5H3.3a9.5 9.5 0 0 0 0 8.65l3.25-2.5z" opacity="0.55" /><path d="M12 6.35c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.5 9.5 0 0 0 3.3 7.5l3.25 2.5c.77-2.3 2.92-4 5.45-4z" opacity="0.85" /></svg>
    case 'Friend/referral':
      return <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M17 9.5a3 3 0 0 0 0-3.5" /><path d="M18.5 20c0-2.2-1.2-3.8-2.8-4.5" /></svg>
    default: // Other
      return <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20l1-4.6A8.5 8.5 0 1 1 21 11.5z" /><circle cx="8.5" cy="12" r="0.6" fill="currentColor" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /><circle cx="15.5" cy="12" r="0.6" fill="currentColor" /></svg>
  }
}

export function WaitlistForm({ onJoined }: { onJoined?: (info: { count: number; name: string; email: string }) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [locationOther, setLocationOther] = useState('')
  const [investedBefore, setInvestedBefore] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [motivations, setMotivations] = useState<string[]>([])
  const [heardFrom, setHeardFrom] = useState('')
  const [otherNotes, setOtherNotes] = useState('')
  const [consentUpdates, setConsentUpdates] = useState(false)
  const [consentPolicy, setConsentPolicy] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const showOther =
    interests.includes('Other') || motivations.includes('Other') || heardFrom === 'Other'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const resolvedLocation = location === 'Other' ? locationOther.trim() : location
    if (!resolvedLocation) return setError('Tell us where you are based')
    if (!investedBefore) return setError('Let us know your investing experience')
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, location: resolvedLocation, investedBefore,
          interests, motivations, heardFrom, otherNotes,
          consentUpdates, consentPolicy,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); setLoading(false); return }
      onJoined?.({ count: data.count ?? 0, name, email })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-cream-sand bg-cream px-4 h-12 text-green placeholder:text-green/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition'

  const chip = (on: boolean, disabled = false) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      on ? 'border-gold bg-gold text-green-ink'
        : disabled ? 'border-cream-sand bg-cream text-green/30 cursor-not-allowed'
        : 'border-cream-sand bg-cream text-green hover:border-gold/50'
    }`

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Card 1 — details */}
      <FormCard icon={<IconUser />} title="Tell us about you" subtitle="Who we’re saving a spot for.">
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <Label>Full name</Label>
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
          </div>
          <div>
            <Label>Email</Label>
            <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label>Phone</Label>
            <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="080…" required />
          </div>
          <div className="sm:col-span-2">
            <Label>Location</Label>
            <select className={inputCls} value={location} onChange={e => setLocation(e.target.value)} required>
              <option value="">Select your location</option>
              <optgroup label="Nigeria (state)">
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
              <optgroup label="Other countries">
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
              <option value="Other">Other (type it in)</option>
            </select>
            {location === 'Other' && (
              <input
                className={`${inputCls} mt-3`}
                value={locationOther}
                onChange={e => setLocationOther(e.target.value)}
                placeholder="Type your city and country"
                autoFocus
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <Label>Have you invested in stocks before?</Label>
            <select className={inputCls} value={investedBefore} onChange={e => setInvestedBefore(e.target.value)} required>
              <option value="">Select one</option>
              {INVESTED_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </FormCard>

      {/* Card 2 — finish */}
      <FormCard icon={<IconSend />} title="Confirm and reserve" subtitle="One tap and your position is locked in.">
        <Label>How did you hear about us?</Label>
        <div className="flex flex-wrap gap-2 mb-5">
          {HEARD_FROM_OPTIONS.map(o => (
            <button type="button" key={o} onClick={() => setHeardFrom(o)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                heardFrom === o ? 'border-green bg-green text-cream' : 'border-cream-sand bg-cream text-green hover:border-green/40'
              }`}>
              <BrandIcon name={o} />
              {o}
            </button>
          ))}
        </div>

        {showOther && (
          <div className="mb-5">
            <Label>Tell us more <span className="font-normal text-green/45">(you picked “Other”)</span></Label>
            <textarea className={`${inputCls} h-24 py-3 resize-none`} value={otherNotes}
              onChange={e => setOtherNotes(e.target.value)} placeholder="A quick note…" />
          </div>
        )}

        <div className="space-y-3 rounded-xl bg-cream p-4">
          <label className="flex items-start gap-3 text-sm text-green cursor-pointer">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-gold" checked={consentUpdates} onChange={e => setConsentUpdates(e.target.checked)} />
            <span>I agree to receive updates about the launch and early-access opportunities.</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-green cursor-pointer">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-gold" checked={consentPolicy} onChange={e => setConsentPolicy(e.target.checked)} />
            <span>I agree to the <a className="underline decoration-gold" href="#" onClick={e => e.preventDefault()}>Privacy Policy</a> and <a className="underline decoration-gold" href="#" onClick={e => e.preventDefault()}>Terms of Use</a>.</span>
          </label>
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <button type="submit" disabled={loading}
          className="mt-5 w-full h-14 rounded-2xl bg-green text-cream font-display font-bold text-base tracking-tight hover:bg-green-deep transition disabled:opacity-60">
          {loading ? 'Joining…' : 'Lock in my position →'}
        </button>
      </FormCard>
    </form>
  )
}

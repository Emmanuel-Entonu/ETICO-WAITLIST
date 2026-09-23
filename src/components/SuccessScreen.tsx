'use client'

import { useState } from 'react'

// TODO: replace with ETICO's real social profile before launch.
const FOLLOW_URL = 'https://instagram.com/etico'
// The live ETICO app (niqra web). Confirmation links land here to sign in, and
// this matches niqra's own emailRedirectTo (already allow-listed in Supabase).
const APP_URL = 'https://www.etico.ng'

// Password policy — identical to niqra-web / the mobile app: 8+ chars with a
// number, lowercase, uppercase and special character (5 checks, all required).
function passwordRules(pw: string) {
  return {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
}
function passwordScore(pw: string): number {
  const r = passwordRules(pw)
  return [r.length, r.number, r.lower, r.upper, r.special].filter(Boolean).length
}
function passwordMeetsPolicy(pw: string): boolean {
  const r = passwordRules(pw)
  return r.length && r.number && r.lower && r.upper && r.special
}

/* ── Inline icons (no lucide dependency) ── */
const IconUser = () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" /></svg>
const IconMail = () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
const IconLock = () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
const IconEye = () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
const IconEyeOff = () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.2 2.9M6.6 6.6A13.3 13.3 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
const IconCheck = ({ className = '' }: { className?: string }) => <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${className}`} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
const IconX = ({ className = '' }: { className?: string }) => <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${className}`} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>

/* ── Input with leading icon + optional trailing element (matches niqra) ── */
function AuthField({ icon, trailing, ...props }: { icon: React.ReactNode; trailing?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green/40 pointer-events-none">{icon}</span>
      <input
        className={`w-full rounded-xl border border-cream-sand bg-cream pl-11 ${trailing ? 'pr-11' : 'pr-4'} h-12 text-green placeholder:text-green/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition`}
        {...props}
      />
      {trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  )
}

function PasswordField({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <AuthField
      icon={<IconLock />}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="new-password"
      required
      trailing={
        <button type="button" onClick={() => setVisible(v => !v)} aria-label={visible ? 'Hide password' : 'Show password'} className="text-green/40 hover:text-green transition-colors">
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      }
    />
  )
}

/* ── Strength bar + "Must contain:" checklist (mirrors the main site) ── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const r = passwordRules(password)
  const score = passwordScore(password)
  const label = score <= 2 ? 'Weak' : score < 5 ? 'Medium' : 'Strong'
  const barColor = score <= 2 ? 'bg-red-500' : score < 5 ? 'bg-gold' : 'bg-green'
  const items = [
    { ok: r.length, label: 'At least 8 characters' },
    { ok: r.number, label: 'At least 1 number' },
    { ok: r.lower, label: 'At least 1 lowercase letter' },
    { ok: r.upper, label: 'At least 1 uppercase letter' },
    { ok: r.special, label: 'At least 1 special character' },
  ]
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-cream-sand bg-cream/60 p-3">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-sand">
        <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <div className="text-sm font-bold text-green">{score < 5 ? `${label} password. Must contain:` : 'Strong password'}</div>
      <div className="flex flex-col gap-1">
        {items.map(it => (
          <div key={it.label} className="flex items-center gap-1.5 text-sm">
            {it.ok ? <IconCheck className="text-green shrink-0" /> : <IconX className="text-green/40 shrink-0" />}
            <span className={it.ok ? 'text-green' : 'text-green/60'}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Step 3: create the real ETICO account (Supabase Auth, same project as
     the niqra web app + mobile app). Mirrors niqra's register form exactly:
     full name, email, password, agree to Terms & Privacy. ─────────────────── */
function RegisterForm({ name, email, onBack }: { name: string; email: string; onBack: () => void }) {
  const [fullName, setFullName] = useState(name)
  const [emailInput, setEmailInput] = useState(email)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const canSubmit = passwordMeetsPolicy(password) && password === confirm && agree && !loading

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (fullName.trim().split(/\s+/).filter(Boolean).length < 2) return setError('Please include your first and last name')
    if (!passwordMeetsPolicy(password)) return setError("Your password doesn't meet the requirements below.")
    if (password !== confirm) return setError('Passwords do not match.')
    if (!agree) return setError('You must agree to the Terms and Privacy Policy.')
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: emailInput.trim().toLowerCase(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? 'Could not create your account.'); setLoading(false); return }
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-cream-sand bg-white shadow-card p-6 sm:p-9 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-green-ink">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-green">Account created. 🎉</h3>
        <p className="mt-3 text-green/65 text-sm max-w-sm mx-auto leading-relaxed">
          Your ETICO account is ready and we&rsquo;ve sent a welcome email to{' '}
          <span className="font-semibold text-green">{emailInput}</span>. Sign in on the app or web to complete
          your KYC the moment we go live.
        </p>
        <a href={`${APP_URL}/login`} target="_blank" rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-lg bg-green text-cream font-display font-bold text-sm tracking-tight hover:bg-green-deep transition-colors">
          Sign in
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-cream-sand bg-white shadow-card p-6 sm:p-8">
      <button type="button" onClick={onBack} className="text-xs font-bold text-green/50 hover:text-green mb-4 inline-flex items-center gap-1">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        Back
      </button>
      <h3 className="font-display text-2xl font-bold text-green">Create account</h3>
      <p className="text-sm text-green/60 mt-1 mb-6">Start investing on the Nigerian Exchange.</p>

      <div className="flex flex-col gap-4">
        <AuthField icon={<IconUser />} type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name (as on your ID)" autoComplete="name" required />
        <AuthField icon={<IconMail />} type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="Email address" autoComplete="email" required />

        <div className="flex flex-col gap-2">
          <PasswordField value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          <PasswordStrength password={password} />
        </div>

        <div className="flex flex-col gap-2">
          <PasswordField value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" />
          {confirm.length > 0 && (
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${password === confirm ? 'text-green' : 'text-red-600'}`}>
              {password === confirm ? <IconCheck /> : <IconX />}
              {password === confirm ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}
        </div>
      </div>

      <label className="flex items-start gap-2.5 mt-5 cursor-pointer">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-gold" checked={agree} onChange={e => setAgree(e.target.checked)} />
        <span className="text-sm text-green/70">
          I agree to ETICO&rsquo;s{' '}
          <a href={`${APP_URL}/terms`} target="_blank" rel="noopener noreferrer" className="underline decoration-gold text-green">Terms</a>{' '}
          and{' '}
          <a href={`${APP_URL}/privacy`} target="_blank" rel="noopener noreferrer" className="underline decoration-gold text-green">Privacy Policy</a>.
        </span>
      </label>

      {error && (
        <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
          {error}
        </div>
      )}

      <button type="submit" disabled={!canSubmit}
        className="mt-6 w-full h-14 rounded-2xl bg-green text-cream font-display font-bold text-base tracking-tight hover:bg-green-deep transition disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Creating…' : 'Create account'}
      </button>
    </form>
  )
}

/* ── Full-width confirmation shown after a successful waitlist signup ────── */
export function SuccessScreen({ name, email = '', position }: { name: string; email?: string; position: number | null }) {
  const [mode, setMode] = useState<'confirm' | 'register'>('confirm')
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? window.location.origin : 'https://waitlist.etico.ng'
  const shareText = 'Join the ETICO waitlist. Ethical stock investing on the Nigerian Exchange.'

  const shareWithFriend = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'ETICO', text: shareText, url: link }); return } catch { /* dismissed */ }
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked */ }
  }

  if (mode === 'register') {
    return (
      <div className="mx-auto max-w-2xl">
        <RegisterForm name={name} email={email} onBack={() => setMode('confirm')} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Confirmation */}
      <div className="rounded-[1.75rem] sm:rounded-[2rem] bg-green-ink text-cream shadow-panel overflow-hidden text-center px-5 sm:px-10 py-10 sm:py-14">
        <div className="mx-auto mb-5 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gold text-green-ink">
          <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tightest text-balance">
          You&rsquo;re on the list. 🎉
        </h2>
        <p className="mt-4 text-cream/75 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          You&rsquo;re now one step closer to investing with ETICO
          {name.split(' ')[0] ? `, ${name.split(' ')[0]}` : ''}. Create your account now so you&rsquo;re ready
          to sign in and complete your KYC the moment we go live.
        </p>

        {position != null && (
          <div className="mt-8 inline-flex flex-col items-center rounded-2xl border border-cream/15 bg-cream/[0.04] px-8 py-5">
            <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-cream/55">YOUR EARLY ACCESS</p>
            <p className="mt-1.5 font-display text-5xl sm:text-6xl font-extrabold tracking-tightest tnum leading-none">
              #{position.toLocaleString()}
            </p>
          </div>
        )}

        <div className="mt-8">
          <button type="button" onClick={() => setMode('register')}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-gold text-green-ink font-semibold hover:bg-gold-deep transition-colors">
            Create your account
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      {/* Move up the list */}
      <div className="mt-4 sm:mt-5 rounded-3xl border border-cream-sand bg-white shadow-card p-5 sm:p-8 text-center">
        <p className="font-display text-lg font-bold text-green">Want to move up the list?</p>
        <p className="text-sm text-green/60 mt-1 mb-5">Follow along and invite a friend to join you.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={FOLLOW_URL} target="_blank" rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl border border-cream-sand bg-white font-semibold text-green hover:border-green/40 transition-colors">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" /></svg>
            Follow us
          </a>
          <button type="button" onClick={shareWithFriend}
            className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-green text-cream font-display font-bold tracking-tight hover:bg-green-deep transition-colors">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>
            {copied ? 'Link copied ✓' : 'Share with a friend'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessScreen

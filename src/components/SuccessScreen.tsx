'use client'

import { useState } from 'react'

// A short, stable, human-friendly referral code derived from the email.
function refCode(email: string): string {
  let h = 0
  const s = email.trim().toLowerCase()
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h).toString(36).toUpperCase().slice(0, 6).padStart(6, 'X')
}

/* ── Full-width "you got a spot" screen shown after a successful signup ──── */
export function SuccessScreen({ name, email, position }: { name: string; email: string; position: number | null }) {
  const [copied, setCopied] = useState(false)
  const code = refCode(email)
  const link = (typeof window !== 'undefined' ? window.location.origin : 'https://etico.app') + '/?ref=' + code
  const shareText = `I just claimed my spot on the ETICO waitlist. Ethical stock investing on the Nigerian Exchange. Join me for early access:`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked; the field is selectable as a fallback */ }
  }
  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'ETICO', text: shareText, url: link }) } catch { /* dismissed */ }
    } else { copy() }
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + link)}`
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`

  return (
    <div className="mx-auto max-w-2xl">
      {/* Spot confirmation */}
      <div className="rounded-[1.75rem] sm:rounded-[2rem] bg-green-ink text-cream shadow-panel overflow-hidden text-center px-5 sm:px-10 py-10 sm:py-16">
        <div className="mx-auto mb-5 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gold text-green-ink">
          <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tightest text-balance">
          Your spot is secured, {name.split(' ')[0] || 'friend'}.
        </h2>
        {position != null && (
          <>
            <p className="mt-7 sm:mt-8 text-[0.72rem] font-semibold tracking-[0.3em] text-cream/55">YOUR SPOT</p>
            <div className="mt-2 flex items-baseline justify-center gap-1.5 sm:gap-2">
              <span className="text-cream/40 text-3xl sm:text-5xl font-display font-semibold">#</span>
              <span className="font-display text-6xl sm:text-8xl font-extrabold tracking-tightest tnum leading-none break-all">
                {position.toLocaleString()}
              </span>
            </div>
          </>
        )}
        <p className="mt-6 text-cream/70 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          You&rsquo;re in line for early access. We&rsquo;ll email you the moment ETICO opens. Ethical
          investing, done properly.
        </p>
      </div>

      {/* Invite card */}
      <div className="mt-4 sm:mt-5 rounded-3xl border border-cream-sand bg-white shadow-card p-5 sm:p-8">
        <div className="flex items-center gap-2 mb-1">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-deep" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M9 7h8v8" /></svg>
          <p className="font-display text-base font-bold text-green">Advance your position</p>
        </div>
        <p className="text-sm text-green/60 mb-5">
          Invite friends to the waitlist. Everyone who joins with your link moves up alongside you when we open.
        </p>

        <div className="rounded-2xl border border-cream-sand bg-cream p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <span className="text-xs font-bold tracking-wide text-green">YOUR INVITE LINK</span>
            <span className="rounded-full bg-gold-soft text-gold-deep text-[0.65rem] font-bold tracking-wide px-2.5 py-1">MOVE UP THE QUEUE</span>
          </div>
          <div className="flex items-stretch gap-2">
            <input
              readOnly
              value={link}
              onFocus={e => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border border-cream-sand bg-white px-3.5 h-11 text-sm text-green/80 outline-none tnum"
            />
            <button type="button" onClick={copy}
              className="shrink-0 rounded-xl px-4 h-11 text-sm font-bold text-cream bg-green hover:bg-green-deep transition-colors">
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl border border-cream-sand bg-white h-10 text-sm font-semibold text-green hover:border-gold/60 transition-colors">WhatsApp</a>
            <a href={x} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl border border-cream-sand bg-white h-10 text-sm font-semibold text-green hover:border-gold/60 transition-colors">X</a>
            <button type="button" onClick={nativeShare}
              className="flex items-center justify-center rounded-xl border border-cream-sand bg-white h-10 text-sm font-semibold text-green hover:border-gold/60 transition-colors">Share</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessScreen

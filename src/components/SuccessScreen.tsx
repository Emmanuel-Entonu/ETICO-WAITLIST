'use client'

import { useState } from 'react'

/* ── Full-width "you got a spot" screen shown after a successful signup ──── */
export function SuccessScreen({ name, position }: { name: string; email?: string; position: number | null }) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? window.location.origin : 'https://join.etico.ng'
  const shareText = 'Join the ETICO waitlist. Ethical stock investing on the Nigerian Exchange.'

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked; the field is selectable as a fallback */ }
  }

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'ETICO', text: shareText, url: link }) } catch { /* dismissed */ }
    } else {
      copy()
    }
  }

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

      {/* Share card */}
      <div className="mt-4 sm:mt-5 rounded-3xl border border-cream-sand bg-white shadow-card p-5 sm:p-8">
        <p className="font-display text-base font-bold text-green">Share ETICO</p>
        <p className="text-sm text-green/60 mb-5">Invite friends to join the waitlist.</p>

        <div className="flex items-stretch gap-2">
          <input
            readOnly
            value={link}
            onFocus={e => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-xl border border-cream-sand bg-cream px-3.5 h-12 text-sm text-green/80 outline-none"
          />
          <button type="button" onClick={copy}
            className="shrink-0 rounded-xl px-4 h-12 text-sm font-bold text-green border border-cream-sand bg-white hover:border-green/40 transition-colors">
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
        </div>

        <button type="button" onClick={share}
          className="mt-3 w-full h-12 rounded-xl bg-green text-cream font-display font-bold text-sm tracking-tight hover:bg-green-deep transition-colors inline-flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>
          Share
        </button>
      </div>
    </div>
  )
}

export default SuccessScreen

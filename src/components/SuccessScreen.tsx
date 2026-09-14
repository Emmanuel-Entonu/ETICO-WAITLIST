'use client'

import { useState } from 'react'

// TODO: replace with ETICO's real social profile before launch.
const FOLLOW_URL = 'https://instagram.com/etico'

/* ── Full-width confirmation shown after a successful waitlist signup ────── */
export function SuccessScreen({ name, position }: { name: string; email?: string; position: number | null }) {
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
          {name.split(' ')[0] ? `, ${name.split(' ')[0]}` : ''}. We&rsquo;re starting with a small group of
          early users before opening the platform more widely, and we&rsquo;ll contact you when your
          early-access invitation is ready.
        </p>

        {position != null && (
          <div className="mt-8 inline-flex flex-col items-center rounded-2xl border border-cream/15 bg-cream/[0.04] px-8 py-5">
            <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-cream/55">YOUR EARLY ACCESS</p>
            <p className="mt-1.5 font-display text-5xl sm:text-6xl font-extrabold tracking-tightest tnum leading-none">
              #{position.toLocaleString()}
            </p>
          </div>
        )}
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

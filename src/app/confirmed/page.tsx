'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

// Landing page for the Supabase email-confirmation redirect. By the time the
// user arrives here, Supabase has already verified the token and confirmed the
// account — this page just shows a branded success (or an error if the link was
// invalid/expired) instead of the old empty/404 destination.

export default function Confirmed() {
  const [status, setStatus] = useState<'ok' | 'error'>('ok')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    if (q.get('error') || hash.get('error')) setStatus('error')
  }, [])

  const isError = status === 'error'

  return (
    <main className="min-h-screen bg-cream text-green flex flex-col items-center justify-center px-5 py-16">
      <Image src="/etico-logo.png" alt="ETICO" width={120} height={40} className="h-9 w-auto mb-10" priority />

      <div className="w-full max-w-md rounded-[2rem] bg-green-ink text-cream shadow-panel overflow-hidden text-center px-6 sm:px-10 py-12">
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${isError ? 'bg-cream/10 text-red-400' : 'bg-gold text-green-ink'}`}>
          {isError ? (
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v5" /><path d="M12 16.5h.01" /><circle cx="12" cy="12" r="9" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
          )}
        </div>

        {isError ? (
          <>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tightest">Link expired or invalid</h1>
            <p className="mt-4 text-cream/75 text-sm sm:text-base leading-relaxed">
              This confirmation link is no longer valid. Head back and sign up again, and we&rsquo;ll send you a
              fresh confirmation email.
            </p>
          </>
        ) : (
          <>
            <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-cream/55">EMAIL CONFIRMED</p>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tightest text-balance">
              You&rsquo;re all set. 🎉
            </h1>
            <p className="mt-4 text-cream/75 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
              Your ETICO account is confirmed and ready. Sign in on the app or web to complete your KYC the
              moment we go live &mdash; we&rsquo;ll email you the second it opens.
            </p>
          </>
        )}

        <a href="/" className="mt-8 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-gold text-green-ink font-semibold hover:bg-gold-deep transition-colors">
          Back to home
        </a>
      </div>

      <p className="mt-8 text-xs text-green/45 text-center">
        © {new Date().getFullYear()} Moneta Capital Investment Limited · Ethical investing on the NGX
      </p>
    </main>
  )
}

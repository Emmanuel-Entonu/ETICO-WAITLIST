'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ScrollExpand from '@/components/ScrollExpand'
import { WaitlistForm } from '@/components/WaitlistForm'
import { SuccessScreen } from '@/components/SuccessScreen'

export default function Home() {
  const [count, setCount] = useState<number | null>(null)
  const [cap, setCap] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [joined, setJoined] = useState<{ position: number; name: string; email: string } | null>(null)
  const formRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetch('/api/waitlist')
      .then(r => r.json())
      .then(d => { setCount(d.count ?? 0); setCap(d.cap ?? 0) })
      .catch(() => setCount(0))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className="bg-cream text-green">
      {/* ── Nav — transparent over the resting hero, cream bar once scrolling ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          scrolled ? 'bg-cream/85 backdrop-blur-md border-b border-cream-sand' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-center">
          <Image src="/etico-logo.png" alt="ETICO" width={112} height={38} className="h-8 w-auto" priority />
        </div>
      </header>

      {/* ── Hero — a brand panel that expands on scroll and reveals the form ── */}
      <section className="relative bg-cream">
        <ScrollExpand
          useWindowScroll
          src="/hero-main.jpg"
          alt="A young African investor reviewing the markets on a laptop at home."
          mediaZoom={1.08}
          objectPosition="center 30%"
          startWidth={46}
          startHeight={62}
          startRadius={28}
          overlayScrim={0.55}
          scrollDistance={0.95}
          holdDistance={0.15}
          scrollHint="Scroll to get early access"
          title="Invest with purpose."
        >
          <p className="text-gold text-[0.7rem] sm:text-xs font-semibold tracking-[0.32em] mb-5">
            ETHICAL INVESTING&nbsp;·&nbsp;NIGERIAN EXCHANGE
          </p>
          <h2 className="font-display text-cream text-3xl sm:text-5xl font-extrabold tracking-tightest leading-[1.06]">
            Maximize your potential.<br />Stay true to your values.
          </h2>
          <p className="text-cream/80 mt-5 max-w-xl text-base sm:text-lg leading-relaxed">
            A new way to invest in Nigerian stocks, screened for what matters to you.
          </p>
          <button
            onClick={scrollToForm}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gold text-green-ink font-semibold px-8 h-12 hover:bg-gold-deep transition-colors"
          >
            Get early access
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M6 13l6 6 6-6" /></svg>
          </button>
        </ScrollExpand>
      </section>

      {/* ── Waitlist — split panel + form, or the success screen once joined ── */}
      <section ref={formRef} className="mx-auto max-w-6xl px-5 py-20 sm:py-28 scroll-mt-16">
        {joined ? (
          <SuccessScreen position={joined.position} name={joined.name} email={joined.email} />
        ) : (
        <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-6 lg:items-start">
          {/* Left: photo-backed panel with the brand write-up + position stat */}
          <div className="relative overflow-hidden rounded-[2rem] shadow-panel self-start lg:sticky lg:top-24 min-h-[560px] flex flex-col justify-between p-8 sm:p-10 text-cream">
            {/* stock photo background + flat dark overlay (no gradient) */}
            <Image
              src="/hero-trading.jpg"
              alt="A thoughtful investing setup: an upward market chart beside the classics of investing."
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-green-ink/75" />

            {/* top: write-up */}
            <div className="relative">
              <Image src="/etico-logo-cream.png" alt="ETICO" width={64} height={64} className="h-10 w-10 object-contain object-left opacity-90" />
              <p className="mt-8 text-gold text-[0.7rem] font-semibold tracking-[0.3em]">
                ETHICAL INVESTING&nbsp;·&nbsp;NIGERIAN EXCHANGE
              </p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tightest leading-[1.06]">
                Invest in what matters to you.
              </h2>
              <p className="mt-4 text-cream/80 text-[0.95rem] leading-relaxed max-w-sm">
                ETICO makes it easier to discover and invest in ethical companies on the NGX, helping you
                pursue strong returns without compromising your values. No questionable holdings. No
                hidden fees. Just smarter investing, aligned with your values.
              </p>
            </div>

            {/* bottom: slots status */}
            <div className="relative mt-10">
              <p className="text-[0.7rem] font-semibold tracking-[0.28em] text-cream/55">
                WAITLIST STATUS
              </p>
              {count == null ? (
                <p className="mt-1.5 font-display text-4xl sm:text-5xl font-extrabold tracking-tightest leading-none text-cream/60">···</p>
              ) : cap > 0 && count >= cap ? (
                <p className="mt-1.5 font-display text-4xl sm:text-5xl font-extrabold tracking-tightest leading-none text-red-400">Slots closed</p>
              ) : (
                <p className="mt-1.5 font-display text-4xl sm:text-5xl font-extrabold tracking-tightest leading-none text-cream">Slots open</p>
              )}
            </div>
          </div>

          {/* Right: heading + form cards */}
          <div>
            <div className="mb-7 text-center">
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="h-px w-10 bg-green/25" />
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-green-ink">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6" /><path d="M9 6h9v9" /></svg>
                </span>
                <span className="h-px w-16 border-t border-dashed border-green/25" />
              </div>
              <h2 className="font-display text-4xl sm:text-[2.9rem] font-extrabold tracking-tightest text-green leading-[1.02]">
                Get early<br />access
              </h2>
              <p className="mt-3.5 text-green/60 max-w-sm mx-auto">
                We&rsquo;re opening a limited early-access list ahead of launch. Join now to be among the
                first to experience ETICO. No commitment, no investment required.
              </p>
            </div>
            <WaitlistForm
              onJoined={({ count, name, email }) => {
                setCount(count)
                setJoined({ position: count, name, email })
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            />
          </div>
        </div>
        )}
      </section>
    </main>
  )
}

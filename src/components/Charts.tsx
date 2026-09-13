'use client'

import { useState } from 'react'

// Earthy, on-brand palette for pie segments and legends.
const PALETTE = [
  '#DAA92F', '#3A4429', '#8A8B5C', '#C0921F', '#5C6B3D', '#B89A5E',
  '#2C3420', '#9BA06B', '#7A5C33', '#6E7A4E', '#CBB37A', '#464F30',
]

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-cream-sand bg-white p-5 shadow-card">
      <p className="text-xs font-bold tracking-wide text-green/50">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-green">{value}</p>
      {sub && <p className="mt-1 text-xs text-green/60">{sub}</p>}
    </div>
  )
}

export function BarList({ title, data }: { title: string; data: Record<string, number> }) {
  const rows = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...rows.map(r => r[1]))
  return (
    <div className="rounded-2xl border border-cream-sand bg-white p-5 shadow-card">
      <h3 className="text-sm font-extrabold text-green mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-green/40">No data yet.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map(([label, val]) => (
            <div key={label}>
              <div className="flex justify-between text-xs font-medium text-green/70 mb-1">
                <span className="truncate pr-2">{label}</span>
                <span className="tabular-nums font-bold text-green">{val}</span>
              </div>
              <div className="h-2 rounded-full bg-cream-sand overflow-hidden">
                <div className="h-full rounded-full bg-gold" style={{ width: `${(val / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Rows shared by the bar view.
function BarRows({ rows, max }: { rows: [string, number][]; max: number }) {
  return (
    <div className="space-y-2.5">
      {rows.map(([label, val], i) => (
        <div key={label}>
          <div className="flex justify-between text-xs font-medium text-green/70 mb-1">
            <span className="truncate pr-2">{label}</span>
            <span className="tabular-nums font-bold text-green">{val}</span>
          </div>
          <div className="h-2 rounded-full bg-cream-sand overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(val / max) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Donut + legend view.
function Donut({ rows, total }: { rows: [string, number][]; total: number }) {
  const R = 54, C = 2 * Math.PI * R
  let acc = 0
  return (
    <div className="flex items-center gap-5">
      <svg width="150" height="150" viewBox="0 0 140 140" className="shrink-0">
        <g transform="rotate(-90 70 70)">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#ECE8DD" strokeWidth="16" />
          {rows.map(([label, val], i) => {
            const len = (val / total) * C
            const el = (
              <circle key={label} cx="70" cy="70" r={R} fill="none" stroke={PALETTE[i % PALETTE.length]}
                strokeWidth="16" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />
            )
            acc += len
            return el
          })}
        </g>
        <text x="70" y="67" textAnchor="middle" style={{ fill: '#3A4429', fontWeight: 800 }} fontSize="24">{total}</text>
        <text x="70" y="84" textAnchor="middle" style={{ fill: '#3A442988' }} fontSize="9" letterSpacing="1.5">TOTAL</text>
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
        {rows.map(([label, val], i) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="truncate text-green/75 flex-1">{label}</span>
            <span className="font-bold text-green tabular-nums">{val}</span>
            <span className="text-green/40 tabular-nums w-9 text-right">{Math.round((val / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// A breakdown card that can toggle between bars and a pie/donut.
export function BreakdownCard({ title, data, initial = 'bar' }: { title: string; data: Record<string, number>; initial?: 'bar' | 'pie' }) {
  const [view, setView] = useState<'bar' | 'pie'>(initial)
  const rows = Object.entries(data).sort((a, b) => b[1] - a[1]) as [string, number][]
  const total = rows.reduce((s, [, v]) => s + v, 0)
  const max = Math.max(1, ...rows.map(r => r[1]))
  const tab = (active: boolean) =>
    `px-2.5 h-7 rounded-md text-[0.7rem] font-bold transition-colors ${active ? 'bg-green text-cream' : 'text-green/55 hover:text-green'}`
  return (
    <div className="rounded-2xl border border-cream-sand bg-white p-5 shadow-card">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-sm font-extrabold text-green truncate">{title}</h3>
        <div className="inline-flex shrink-0 rounded-lg border border-cream-sand bg-cream p-0.5">
          <button type="button" onClick={() => setView('bar')} className={tab(view === 'bar')}>Bars</button>
          <button type="button" onClick={() => setView('pie')} className={tab(view === 'pie')}>Pie</button>
        </div>
      </div>
      {rows.length === 0
        ? <p className="text-sm text-green/40">No data yet.</p>
        : view === 'bar' ? <BarRows rows={rows} max={max} /> : <Donut rows={rows} total={total} />}
    </div>
  )
}

export function DayBars({ days, title = 'Signups, last 14 days' }: { days: { date: string; count: number }[]; title?: string }) {
  const max = Math.max(1, ...days.map(d => d.count))
  return (
    <div className="rounded-2xl border border-cream-sand bg-white p-5 shadow-card">
      <h3 className="text-sm font-extrabold text-green mb-4">{title}</h3>
      <div className="flex items-end gap-1.5 h-40">
        {days.map(d => (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end group">
            <div className="w-full rounded-t bg-green/85 hover:bg-gold transition-all relative"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green opacity-0 group-hover:opacity-100">
                {d.count}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-green/40">
        <span>{days[0]?.date.slice(5)}</span>
        <span>{days[days.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  )
}

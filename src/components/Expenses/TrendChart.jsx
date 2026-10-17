import { useMemo, useState } from 'react'
import { formatVND, formatCompact } from '../../utils/expense.utils'
import { EmptyState } from './ExpenseUI'

const W = 1000, H = 260

export default function TrendChart({ data = [], valueKey = 'cost', format = formatVND, detail }) {
  const [hover, setHover] = useState(null)
  const max = useMemo(() => Math.max(0, ...data.map((d) => d[valueKey])), [data, valueKey])
  const yMax = max || 1
  const x = (i) => (data.length > 1 ? (i / (data.length - 1)) * W : W / 2)
  const y = (v) => H - (v / yMax) * H
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[valueKey]).toFixed(1)}`).join(' ')
  const area = data.length > 1 ? `${line} L${W},${H} L0,${H} Z` : ''

  if (!data.length || max === 0) return <EmptyState />

  const ticks = [1, 0.75, 0.5, 0.25, 0].map((r) => Math.round(yMax * r))
  const step = Math.max(1, Math.ceil(data.length / 8))
  const h = hover !== null ? data[hover] : null

  return (
    <div className="grid grid-cols-[48px_1fr] gap-x-2">
      <div className="flex h-[260px] flex-col justify-between text-right text-[10px] text-on-surface-variant">
        {ticks.map((t, i) => <span key={i}>{formatCompact(t)}</span>)}
      </div>
      <div className="min-w-0">
        <div
          className="relative h-[260px] cursor-crosshair"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setHover(Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)))))
          }}
          onMouseLeave={() => setHover(null)}
        >
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {ticks.map((_, i) => <div key={i} className="border-t border-outline-variant/70" />)}
          </div>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="expTrend" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f38820" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f38820" stopOpacity="0" />
              </linearGradient>
            </defs>
            {area && <path d={area} fill="url(#expTrend)" />}
            <path d={line} fill="none" stroke="#d96f0a" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {hover !== null && (
              <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="#d96f0a" strokeOpacity="0.4" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
            )}
          </svg>
          {h && (
            <div
              className="pointer-events-none absolute top-2 z-10 rounded-xl border border-outline-variant bg-white px-3 py-2 text-xs shadow-xl"
              style={{ left: hover > data.length * 0.7 ? `calc(${(hover / (data.length - 1)) * 100}% - 150px)` : `calc(${(hover / (data.length - 1)) * 100}% + 12px)` }}
            >
              <p className="mb-1 font-mono text-[10px] text-on-surface-variant">{h.day.split('-').reverse().join('/')}</p>
              <p className="font-bold text-on-surface">{format(h[valueKey])}</p>
              {detail && <p className="text-on-surface-variant">{detail(h)}</p>}
            </div>
          )}
        </div>
        <div className="mt-1 flex justify-between border-t border-outline-variant pt-1 text-[10px] text-on-surface-variant">
          {data.map((d, i) => (i % step === 0 ? <span key={d.day}>{d.day.slice(8)}/{d.day.slice(5, 7)}</span> : null))}
        </div>
      </div>
    </div>
  )
}

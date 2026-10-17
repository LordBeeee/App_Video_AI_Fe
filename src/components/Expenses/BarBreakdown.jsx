import { formatVND, formatPct } from '../../utils/expense.utils'
import { EmptyState } from './ExpenseUI'

export default function BarBreakdown({ items = [], total = 0 }) {
  const rows = items.filter((i) => i.value > 0)
  if (!rows.length) return <EmptyState />
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-medium text-on-surface">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
              <span className="truncate" title={r.label}>{r.label}</span>
            </span>
            <span className="shrink-0 text-xs text-on-surface-variant">
              <b className="text-on-surface">{formatVND(r.value)}</b> · {formatPct(r.value, total)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: r.color }} />
          </div>
          {r.sub && <p className="mt-1 text-[11px] text-on-surface-variant">{r.sub}</p>}
        </li>
      ))}
    </ul>
  )
}

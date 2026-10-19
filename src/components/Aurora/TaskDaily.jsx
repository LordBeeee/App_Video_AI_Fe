import { useMemo, useState } from 'react'
import { GhostChart } from './AuroraUI'
import { AU_TASK, auTaskLabel, axisMoney, dayLabel, moneyShort, niceScale } from '../../utils/aurora.utils'
import { formatNum } from '../../utils/expense.utils'

const KEYS = Object.keys(AU_TASK)

export default function TaskDaily({ data = [], mode = 'requests' }) {
  const [hover, setHover] = useState(null)
  const field = mode === 'cost' ? 'cost' : 'requests'
  const fmt = mode === 'cost' ? moneyShort : formatNum

  const rows = useMemo(() => data.map((d) => {
    const parts = KEYS.map((k) => [k, d.tasks?.[k]?.[field] || 0])
    return { day: d.day, parts, total: parts.reduce((s, p) => s + p[1], 0) }
  }), [data, field])

  const max = rows.reduce((m, r) => Math.max(m, r.total), 0)
  if (!rows.length || max === 0) return <GhostChart tone="light" text="Chưa có yêu cầu thành công trong kỳ này" hint="Biểu đồ sẽ hiện số lượng theo từng tác vụ mỗi ngày khi có hoạt động." />

  const sc = niceScale(max)
  const n = rows.length
  const labelStep = Math.max(1, Math.ceil(n / 8))
  const peak = rows.reduce((b, r) => (r.total > b.total ? r : b), rows[0])
  const shown = hover !== null ? rows[hover] : null

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setHover(Math.max(0, Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n))))
  }

  return (
    <div className="au-td">
      <div className="au-td-info">
        {shown ? (
          <>
            <b>{dayLabel(shown.day)}</b>
            {shown.parts.filter((p) => p[1] > 0).map(([k, v]) => (
              <span key={k}><i style={{ background: AU_TASK[k].color }} />{auTaskLabel(k)} <b>{fmt(v)}</b></span>
            ))}
            <span className="tot">Tổng <b>{fmt(shown.total)}</b></span>
          </>
        ) : (
          <>
            <b>Cao nhất {dayLabel(peak.day)}</b>
            <span className="tot">{fmt(peak.total)}</span>
          </>
        )}
      </div>
      <div className="au-td-plot" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <div className="au-td-grid">
          {[0, 1, 2, 3].map((t) => (
            <div key={t} className="au-td-gl" style={{ bottom: `${(t / 3) * 100}%` }}>
              <span>{mode === 'cost' ? axisMoney(t * sc.step) : formatNum(t * sc.step)}</span>
            </div>
          ))}
        </div>
        <div className="au-td-cols">
          {rows.map((r, i) => (
            <div key={r.day} className={`au-td-c${hover === i ? ' on' : ''}`}>
              <div className="au-td-st" style={{ height: `${(r.total / sc.top) * 100}%` }}>
                {r.parts.filter((p) => p[1] > 0).map(([k, v]) => <i key={k} style={{ flexGrow: v, background: AU_TASK[k].color }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="au-td-x">
        {rows.map((r, i) => <span key={r.day}>{i % labelStep === 0 ? dayLabel(r.day) : ''}</span>)}
      </div>
      <ul className="au-td-lg">
        {KEYS.map((k) => <li key={k}><i style={{ background: AU_TASK[k].color }} />{auTaskLabel(k)}</li>)}
      </ul>
    </div>
  )
}

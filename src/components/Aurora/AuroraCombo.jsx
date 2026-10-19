import { GhostChart } from './AuroraUI'
import { useMemo, useState } from 'react'
import { axisMoney, dayLabel, moneyShort, niceScale } from '../../utils/aurora.utils'
import { formatNum } from '../../utils/expense.utils'

const W = 1000
const H = 300

export default function AuroraCombo({ data = [] }) {
  const [hover, setHover] = useState(null)
  const maxReq = useMemo(() => Math.max(0, ...data.map((d) => d.requests)), [data])
  const maxCost = useMemo(() => Math.max(0, ...data.map((d) => d.cost)), [data])

  if (!data.length || (maxReq === 0 && maxCost === 0)) return <GhostChart tone="light" text="Chưa có hoạt động trong kỳ này" hint="Nhân viên chưa gửi yêu cầu AI nào. Thử chọn khoảng thời gian dài hơn." />

  const rq = niceScale(maxReq)
  const cs = niceScale(maxCost)
  const n = data.length
  const px = (i) => (i + 0.5) / n
  const pts = data.map((d, i) => [px(i) * W, H - (d.cost / cs.top) * H])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const labelStep = Math.max(1, Math.ceil(n / 8))
  const h = hover !== null ? data[hover] : null

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setHover(Math.max(0, Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n))))
  }

  return (
    <div className="au-tr light">
      <div className="au-tr-plot" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <div className="au-tr-grid">
          {[0, 1, 2, 3].map((t) => (
            <div key={t} className="au-tr-gl" style={{ top: `${(1 - t / 3) * 100}%` }}>
              <span>{t ? formatNum(t * rq.step) : '0'}</span>
              <span className="r">{axisMoney(t * cs.step)}</span>
            </div>
          ))}
        </div>
        <div className="au-bars">
          {data.map((d, i) => {
            const ok = d.requests - d.failed
            return (
              <div key={d.day} className={`au-bar${hover === i ? ' hov' : ''}`}>
                {d.requests > 0 && (
                  <div style={{ height: `${(d.requests / rq.top) * 100}%` }}>
                    {d.failed > 0 && <span className="f" style={{ height: `${(d.failed / d.requests) * 100}%` }} />}
                    {ok > 0 && <span className={`s${d.failed ? '' : ' only'}`} style={{ height: `${(ok / d.requests) * 100}%` }} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <path d={line} fill="none" stroke="var(--t-primary, #d4621a)" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {h && (
          <>
            <span className="au-tr-vl" style={{ left: `${px(hover) * 100}%`, borderColor: 'var(--t-secondary, #a84a0f)' }} />
            <span className="au-tr-dot" style={{ left: `${px(hover) * 100}%`, top: `${(1 - h.cost / cs.top) * 100}%` }} />
            <div className="au-tr-tip top" style={px(hover) > 0.62 ? { right: `calc(${(1 - px(hover)) * 100}% + 14px)` } : { left: `calc(${px(hover) * 100}% + 14px)` }}>
              <i>{dayLabel(h.day)}</i>
              <b>{moneyShort(h.cost)}</b>
              <i>{formatNum(h.requests)} yêu cầu · {formatNum(h.failed)} lỗi</i>
            </div>
          </>
        )}
      </div>
      <div className="au-tr-x">
        {data.map((d, i) =>
          i % labelStep === 0 ? (
            <span key={d.day} style={{ left: `${px(i) * 100}%`, transform: 'translateX(-50%)' }}>{dayLabel(d.day)}</span>
          ) : null,
        )}
      </div>
    </div>
  )
}

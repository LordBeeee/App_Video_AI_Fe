import { useId, useMemo, useState } from 'react'
import { GhostChart } from './AuroraUI'
import { axisMoney, dayLabel, moneyShort, niceScale } from '../../utils/aurora.utils'

const W = 1000
const H = 300

export default function AuroraTrend({ data = [], valueKey = 'cost', format = moneyShort, detail, tone = 'dark' }) {
  const gid = useId()
  const [hover, setHover] = useState(null)
  const max = useMemo(() => Math.max(0, ...data.map((d) => d[valueKey])), [data, valueKey])
  const peak = useMemo(() => data.findIndex((d) => d[valueKey] === max), [data, valueKey, max])

  if (!data.length || max === 0) return <GhostChart text="Chưa có chi tiêu trong kỳ này" hint="Đường chi phí sẽ hiện ra khi nhân viên bắt đầu tạo ảnh, video, giọng nói hoặc chat AI." />

  const { step, top } = niceScale(max)
  const n = data.length
  const px = (i) => (n > 1 ? i / (n - 1) : 0.5)
  const x = (i) => px(i) * W
  const y = (v) => H - (v / top) * H
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[valueKey]).toFixed(1)}`).join(' ')
  const area = n > 1 ? `${line} L${W},${H} L0,${H} Z` : ''
  const stroke = tone === 'dark' ? '#FF7A1A' : '#C2410C'
  const fill = '#FF7A1A'
  const labelStep = Math.max(1, Math.ceil(n / 7))
  const h = hover !== null ? data[hover] : null

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - r.left) / r.width
    setHover(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))))
  }

  return (
    <div className={`au-tr ${tone === 'dark' ? '' : 'light'}`}>
      <div className="au-tr-plot" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <div className="au-tr-grid">
          {[0, 1, 2, 3].map((t) => (
            <div key={t} className="au-tr-gl" style={{ top: `${(1 - (t * step) / top) * 100}%` }}>
              <span>{axisMoney(t * step)}</span>
            </div>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity="0.32" />
              <stop offset="100%" stopColor={fill} stopOpacity="0" />
            </linearGradient>
          </defs>
          {area && <path d={area} fill={`url(#${gid})`} />}
          <path d={line} fill="none" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {peak >= 0 && hover === null && (
          <span className="au-tr-dot" style={{ left: `${px(peak) * 100}%`, top: `${(1 - data[peak][valueKey] / top) * 100}%` }} />
        )}
        {h && (
          <>
            <span className="au-tr-vl" style={{ left: `${px(hover) * 100}%` }} />
            <span className="au-tr-dot" style={{ left: `${px(hover) * 100}%`, top: `${(1 - h[valueKey] / top) * 100}%` }} />
            <div
              className="au-tr-tip"
              style={px(hover) > 0.65 ? { right: `calc(${(1 - px(hover)) * 100}% + 14px)` } : { left: `calc(${px(hover) * 100}% + 14px)` }}
            >
              <i>{dayLabel(h.day)}</i>
              <b>{format(h[valueKey])}</b>
              {detail && <i>{detail(h)}</i>}
            </div>
          </>
        )}
      </div>
      <div className="au-tr-x">
        {data.map((d, i) =>
          i % labelStep === 0 ? (
            <span key={d.day} style={{ left: `${px(i) * 100}%`, transform: `translateX(-${i === 0 ? 0 : 50}%)` }}>
              {dayLabel(d.day)}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}

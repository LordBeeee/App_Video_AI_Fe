import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, GhostChart } from './AuroraUI'
import { useCountUp } from './useReveal'
import { formatNum } from '../../utils/expense.utils'
import { DOW, auTaskLabel, axisMoney, dayLabel, moneyShort, niceScale, secText } from '../../utils/aurora.utils'

const has = (v) => v !== null && v !== undefined

export function Gauge({ rate, retry, on }) {
  const v = useCountUp(has(rate) ? rate * 100 : 0, on)
  const keep = has(retry) ? (1 - retry) * 100 : null
  return (
    <div className="au-gauge">
      <svg viewBox="0 0 42 42" role="img" aria-label="Tỷ lệ thành công">
        <circle className="au-g-t" cx="21" cy="21" r="17" />
        <circle className="au-g-t thin" cx="21" cy="21" r="12.4" />
        {has(rate) && <circle className="au-g-a" cx="21" cy="21" r="17" pathLength="100" style={{ '--p': rate * 100 }} />}
        {keep !== null && <circle className="au-g-a gold" cx="21" cy="21" r="12.4" pathLength="100" style={{ '--p': keep }} />}
      </svg>
      <div className="au-g-mid">
        <b className="au-fd">{has(rate) ? `${Math.round(v)}%` : '—'}</b>
        <span>thành công</span>
      </div>
    </div>
  )
}

export function CostLine({ data = [], base }) {
  const [hover, setHover] = useState(null)
  const vals = useMemo(() => data.map((d) => d.costPerSuccess), [data])
  const max = useMemo(() => Math.max(0, base || 0, ...vals.map((v) => v || 0)), [vals, base])
  const fmax = useMemo(() => Math.max(1, ...data.map((d) => d.failed)), [data])
  if (!data.length || max === 0) return <GhostChart tone="light" text="Chưa có lượt thành công nào" hint="Chi phí trên mỗi lượt sẽ được vẽ theo ngày khi có yêu cầu hoàn tất." />

  const { step, top } = niceScale(max)
  const n = data.length
  const px = (i) => (n > 1 ? i / (n - 1) : 0.5)
  const pts = data.map((d, i) => (has(d.costPerSuccess) ? [px(i) * 1000, 300 - (d.costPerSuccess / top) * 300] : null)).filter(Boolean)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = pts.length > 1 ? `${line} L${pts[pts.length - 1][0].toFixed(1)},300 L${pts[0][0].toFixed(1)},300 Z` : ''
  const labelStep = Math.max(1, Math.ceil(n / 7))
  const h = hover !== null ? data[hover] : null

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setHover(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))))
  }

  return (
    <div className="au-tr light">
      <div className="au-tr-plot" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <div className="au-tr-grid">
          {[0, 1, 2, 3].map((t) => (
            <div key={t} className="au-tr-gl" style={{ top: `${(1 - (t * step) / top) * 100}%` }}><span>{axisMoney(t * step)}</span></div>
          ))}
        </div>
        <div className="au-fbars">
          {data.map((d, i) => (
            <i key={d.day} style={{ height: `${(d.failed / fmax) * 100}%`, '--d': `${i * 14}ms` }} />
          ))}
        </div>
        <div className="au-wipe">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="au-cl-g" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
              </linearGradient>
            </defs>
            {area && <path d={area} fill="url(#au-cl-g)" />}
            <path d={line} fill="none" stroke="#FF7A1A" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        {has(base) && base > 0 && (
          <div className="au-bl" style={{ top: `${(1 - base / top) * 100}%` }}><span>Nhóm {moneyShort(base)}</span></div>
        )}
        {h && (
          <>
            <span className="au-tr-vl" style={{ left: `${px(hover) * 100}%` }} />
            {has(h.costPerSuccess) && <span className="au-tr-dot" style={{ left: `${px(hover) * 100}%`, top: `${(1 - h.costPerSuccess / top) * 100}%` }} />}
            <div className="au-tr-tip" style={px(hover) > 0.65 ? { right: `calc(${(1 - px(hover)) * 100}% + 14px)` } : { left: `calc(${px(hover) * 100}% + 14px)` }}>
              <i>{dayLabel(h.day)}</i>
              <b>{has(h.costPerSuccess) ? `${moneyShort(h.costPerSuccess)} / lượt` : 'Không có lượt thành công'}</b>
              <i>{formatNum(h.ok)} OK · {formatNum(h.failed)} lỗi</i>
            </div>
          </>
        )}
      </div>
      <div className="au-tr-x">
        {data.map((d, i) => (i % labelStep === 0 ? (
          <span key={d.day} style={{ left: `${px(i) * 100}%`, transform: `translateX(-${i === 0 ? 0 : 50}%)` }}>{dayLabel(d.day)}</span>
        ) : null))}
      </div>
    </div>
  )
}

export function Heatmap({ heat = [] }) {
  const { grid, max, peak } = useMemo(() => {
    const g = Array.from({ length: 7 }, () => Array(24).fill(0))
    let m = 0
    let p = null
    heat.forEach(({ dow, hr, n }) => {
      g[dow - 1][hr] = n
      if (n > m) { m = n; p = [dow - 1, hr] }
    })
    return { grid: g, max: m, peak: p }
  }, [heat])

  if (!max) return <GhostChart tone="light" text="Chưa có nhịp sử dụng" hint="Heatmap sẽ sáng dần ở những khung giờ có nhiều lượt dùng AI." />

  return (
    <>
      <div className="au-hm">
        <div className="au-hm-r head">
          <span />
          {Array.from({ length: 24 }, (_, h) => <em key={h}>{h % 3 === 0 ? h : ''}</em>)}
        </div>
        {grid.map((row, r) => (
          <div className="au-hm-r" key={DOW[r]} style={{ '--d': `${r * 55}ms` }}>
            <b>{DOW[r]}</b>
            {row.map((n, c) => (
              <i
                key={c}
                className="au-hm-c"
                title={`${DOW[r]} · ${c}h: ${formatNum(n)} lượt`}
                style={{ background: n ? `rgba(255,122,26,${(0.16 + 0.84 * Math.sqrt(n / max)).toFixed(2)})` : undefined }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="au-hm-f">
        <span>Cao điểm: <b>{DOW[peak[0]]} · {peak[1]}h</b> ({formatNum(max)} lượt)</span>
        <span className="au-hm-lg"><i />Ít<u />Nhiều</span>
      </div>
    </>
  )
}

export function ModelBars({ models = [] }) {
  return (
    <ul className="au-mb">
      {models.map((m, i) => {
        const rate = m.total ? m.ok / m.total : 0
        const kind = rate >= 0.9 ? '' : rate >= 0.7 ? 'warn' : 'bad'
        return (
          <li key={`${m.name}-${m.modality}`}>
            <div className="au-hb-r"><span title={m.name}>{m.name}</span><b>{Math.round(rate * 100)}%</b></div>
            <div className="au-trk"><div className={`au-grow ${kind}`} style={{ width: `${rate * 100}%`, '--d': `${i * 110}ms` }} /></div>
            <div className="au-hb-s">{auTaskLabel(m.modality)} · {formatNum(m.ok)}/{formatNum(m.total)} lượt{m.ok ? ` · ${moneyShort(m.cost / m.ok)}/lượt` : ''}</div>
          </li>
        )
      })}
    </ul>
  )
}

export function Latency({ rows = [] }) {
  const sorted = [...rows].sort((a, b) => b.avg - a.avg)
  const max = Math.max(1, ...sorted.map((r) => r.p90)) * 1.05
  return (
    <ul className="au-mb">
      {sorted.map((r, i) => (
        <li key={r.modality}>
          <div className="au-hb-r"><span>{auTaskLabel(r.modality)}</span><b>TB {secText(r.avg)}</b></div>
          <div className="au-trk lat">
            <div className="au-grow" style={{ width: `${(r.avg / max) * 100}%`, '--d': `${i * 110}ms` }} />
            <span className="au-p90" style={{ left: `${(r.p90 / max) * 100}%`, '--d': `${400 + i * 110}ms` }} />
          </div>
          <div className="au-hb-s">P90 {secText(r.p90)} · {formatNum(r.n)} lượt</div>
        </li>
      ))}
    </ul>
  )
}

export function Reasons({ rows = [] }) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  return (
    <ul className="au-mb">
      {rows.map((r, i) => (
        <li key={r.reason}>
          <div className="au-hb-r"><span title={r.reason}>{r.reason}</span><b>{formatNum(r.n)}</b></div>
          <div className="au-trk"><div className="au-grow bad" style={{ width: `${(r.n / max) * 100}%`, '--d': `${i * 110}ms` }} /></div>
        </li>
      ))}
    </ul>
  )
}

export function Scatter({ people = [], avg, avgCost }) {
  const [tip, setTip] = useState(null)
  const pts = useMemo(
    () => people.filter((p) => p.ok > 0).map((p) => ({ ...p, cps: p.cost / p.ok })).sort((a, b) => b.total - a.total),
    [people],
  )
  const skipped = people.length - pts.length
  if (!pts.length) return <GhostChart tone="light" text="Chưa có lượt thành công để so sánh" hint="Biểu đồ cần ít nhất một nhân viên có lượt thành công để tính chi phí mỗi lượt." />

  const maxN = Math.max(1, ...pts.map((p) => p.total))
  const baseCost = has(avgCost) && avgCost > 0 ? avgCost : null
  const costs = baseCost ? [...pts.map((p) => p.cps), baseCost] : pts.map((p) => p.cps)
  const cLo = Math.min(...costs)
  const cHi = Math.max(...costs)
  const span = cHi - cLo || cHi || 1
  const xLo = Math.max(0, cLo - span * 0.2)
  const xHi = cHi + span * 0.2
  const rates = pts.map((p) => p.successRate * 100)
  if (has(avg)) rates.push(avg * 100)
  const lo = Math.min(90, Math.floor(Math.min(...rates) / 10) * 10)
  const X = (v) => 7 + ((v - xLo) / (xHi - xLo)) * 86
  const Y = (pct) => 8 + ((100 - pct) / (100 - lo)) * 84
  const ticks = [lo, Math.round((lo + 100) / 2), 100]
  const t = tip !== null ? pts[tip] : null
  const tx = t ? X(t.cps) : 0
  const ty = t ? Y(t.successRate * 100) : 0

  return (
    <div className="au-sc">
      <div className="au-sc-lg">
        {has(avg) && <span><i className="h" />TB nhóm {Math.round(avg * 100)}% thành công</span>}
        {baseCost && <span><i className="v" />TB nhóm {moneyShort(baseCost)}/lượt</span>}
        {skipped > 0 && <span className="au-sc-sk">{skipped} người chưa có lượt thành công không hiển thị</span>}
      </div>
      <div className="au-sc-plot">
        {ticks.map((tk) => (
          <div key={tk} className="au-tr-gl" style={{ top: `${Y(tk)}%` }}><span>{tk}%</span></div>
        ))}
        {has(avg) && <div className="au-sc-hl" style={{ top: `${Y(avg * 100)}%` }} />}
        {baseCost && <div className="au-sc-vl" style={{ left: `${X(baseCost)}%` }} />}
        {pts.map((p, i) => {
          const size = 18 + Math.sqrt(p.total / maxN) * 28
          return (
            <Link
              key={p.id}
              to={`/employees/${p.id}/ai-usage`}
              aria-label={`${p.name}: ${Math.round(p.successRate * 100)}% thành công, ${moneyShort(p.cps)} mỗi lượt`}
              className={`au-bub${has(avg) && p.successRate < avg ? ' low' : ''}`}
              onMouseEnter={() => setTip(i)}
              onMouseLeave={() => setTip(null)}
              onFocus={() => setTip(i)}
              onBlur={() => setTip(null)}
              style={{ left: `${X(p.cps)}%`, top: `${Y(p.successRate * 100)}%`, width: size, height: size, '--d': `${i * 70}ms` }}
            />
          )
        })}
        {t && (
          <div className={`au-tr-tip au-sc-tip${tx > 55 ? ' r' : ''}${ty < 32 ? ' d' : ''}`} style={{ left: `${tx}%`, top: `${ty}%` }}>
            <i>{t.name}</i>
            <b>{Math.round(t.successRate * 100)}% thành công</b>
            <i>{moneyShort(t.cps)}/lượt · {formatNum(t.total)} lượt · tổng {moneyShort(t.cost)}</i>
          </div>
        )}
      </div>
      <div className="au-sc-x"><span>← Rẻ hơn mỗi lượt</span><span>Đắt hơn mỗi lượt →</span></div>
    </div>
  )
}

export function ScoreRank({ rows = [] }) {
  return (
    <ul className="au-sr">
      {rows.map((r, i) => (
        <li key={r.id}>
          <span className="au-sr-n">{i + 1}</span>
          <Link to={`/employees/${r.id}/ai-usage`} className="au-sr-m">
            <Avatar name={r.name} src={r.avatarUrl} size={26} />
            <span className="au-ell" title={r.name}>{r.name}</span>
          </Link>
          <div className="au-trk"><div className={`au-grow ${r.score >= 85 ? '' : r.score >= 65 ? 'warn' : 'bad'}`} style={{ width: `${r.score}%`, '--d': `${i * 80}ms` }} /></div>
          <b className="au-fd">{r.score}</b>
        </li>
      ))}
    </ul>
  )
}

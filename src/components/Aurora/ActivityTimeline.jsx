import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getEmployeeAiTimelineApi } from '../../services/user.service'
import { Card, Empty, Skeleton } from './AuroraUI'
import { INFO } from './metricInfo'
import { AU_TASK, auTaskLabel, isCustomRange, moneyShort, rangeParams, shiftDay, todayStr } from '../../utils/aurora.utils'

const LANES = ['chat', 'image', 'video', 'audio']
const ICON = { chat: 'chat', image: 'image', video: 'movie', audio: 'graphic_eq' }
const ST = { succeeded: 'Thành công', failed: 'Lỗi', pending: 'Đang xử lý' }
const MIN_SPAN = 15
const pad = (n) => String(n).padStart(2, '0')
const clock = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
const dm = (d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`

function tickStep(span) {
  if (span > 720) return 180
  if (span > 360) return 60
  if (span > 180) return 30
  if (span > 90) return 15
  if (span > 40) return 10
  if (span > 20) return 5
  return 2
}

function nowMinute() {
  const [h, m] = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }).split(':')
  return Number(h) * 60 + Number(m)
}

export default function ActivityTimeline({ userId, range, className = '' }) {
  const today = todayStr()
  const to = isCustomRange(range) ? range.to : today
  const from = isCustomRange(range) ? range.from : shiftDay(today, -(range.days - 1))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [day, setDay] = useState(to)
  const [hover, setHover] = useState(null)
  const [tick, setTick] = useState(0)
  const [view, setView] = useState({ s: 0, e: 1440 })
  const bodyRef = useRef(null)
  const gridRef = useRef(null)
  const viewRef = useRef(view)
  useEffect(() => { viewRef.current = view }, [view])

  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    getEmployeeAiTimelineApi(userId, rangeParams(range))
      .then((d) => live && setData(d))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [userId, range, tick])

  useEffect(() => { setDay(to); setHover(null) }, [to, from])
  useEffect(() => { setView({ s: 0, e: 1440 }) }, [day, userId])

  const byDay = useMemo(() => {
    const m = new Map()
    ;(data?.items || []).forEach((it) => { const a = m.get(it.day) || []; a.push(it); m.set(it.day, a) })
    return m
  }, [data])

  const items = byDay.get(day) || []
  const ok = items.filter((i) => i.status === 'succeeded').length
  const bad = items.filter((i) => i.status === 'failed').length
  const cost = items.reduce((s, i) => (i.status === 'succeeded' ? s + i.cost : s), 0)
  const single = from === to

  const hasData = !loading && !error && (byDay.get(day) || []).length > 0

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return undefined
    const onWheel = (ev) => {
      ev.preventDefault()
      const rect = gridRef.current?.getBoundingClientRect()
      if (!rect || !rect.width) return
      const { s: vs, e: ve } = viewRef.current
      const span = ve - vs
      const frac = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width))
      const next = Math.min(1440, Math.max(MIN_SPAN, span * (ev.deltaY > 0 ? 1.25 : 0.8)))
      const anchor = vs + frac * span
      const ns = Math.min(1440 - next, Math.max(0, anchor - frac * next))
      setView({ s: ns, e: ns + next })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [hasData])

  const startDrag = useCallback((ev) => {
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect || !rect.width) return
    const x0 = ev.clientX
    const { s: s0, e: e0 } = viewRef.current
    const span = e0 - s0
    const move = (m) => {
      const ns = Math.min(1440 - span, Math.max(0, s0 - ((m.clientX - x0) / rect.width) * span))
      setView({ s: ns, e: ns + span })
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }, [])

  const span = view.e - view.s
  const zoomed = span < 1440
  const pct = (m) => ((m - view.s) / span) * 100
  const stepM = tickStep(span)
  const ticks = []
  for (let t = Math.ceil(view.s / stepM) * stepM; t <= view.e; t += stepM) ticks.push(t)
  const tickLabel = (t) => (stepM >= 60 ? `${pad((t / 60) % 24)}h` : clock(t % 1440))

  const step = (n) => { setDay((d) => shiftDay(d, n)); setHover(null) }
  const nowM = day === today ? nowMinute() : null
  const h = hover ? items.find((i) => i.id === hover) : null
  const hp = h ? pct(h.minute) : 0

  const nav = (
    <div className="au-ac-nav">
      {!single && (
        <button type="button" className="au-ico" onClick={() => step(-1)} disabled={day <= from} aria-label="Ngày trước">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      )}
      {zoomed && (
        <button type="button" className="au-fl" onClick={() => setView({ s: 0, e: 1440 })}>Đặt lại</button>
      )}
      <b>{day === today ? 'Hôm nay' : dm(day)}</b>
      {!single && (
        <button type="button" className="au-ico" onClick={() => step(1)} disabled={day >= to} aria-label="Ngày sau">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      )}
    </div>
  )

  return (
    <Card
      className={className}
      icon="timeline"
      title="Hoạt động trong ngày"
      info={INFO.empDaily}
      sub={loading ? ' ' : items.length ? `${items.length} lượt · ${ok} thành công · ${bad} lỗi · ${moneyShort(cost)}` : 'Chưa có hoạt động'}
      action={nav}
    >
      {error ? (
        <div className="au-empty">
          <span>{error}</span>
          <button type="button" className="au-btn" onClick={() => setTick((t) => t + 1)}>Thử lại</button>
        </div>
      ) : loading && !data ? <Skeleton h="100%" />
        : items.length === 0 ? <Empty text="Không có hoạt động trong ngày này" icon="timeline" hint={single ? 'Chọn khoảng thời gian dài hơn để xem các ngày khác.' : 'Dùng mũi tên để chuyển sang ngày khác trong khoảng đã chọn.'} />
        : (
          <div className={`au-ac${loading ? ' au-dim' : ''}`}>
            <div className={`au-ac-body${zoomed ? ' zoomed' : ''}`} ref={bodyRef} onMouseDown={startDrag} title="Cuộn chuột để phóng to · kéo để di chuyển">
              <div className="au-ac-lanes">
                {LANES.map((k) => (
                  <div key={k} className="au-ac-lane">
                    <span className="au-ac-lb"><span className="material-symbols-outlined">{ICON[k]}</span>{auTaskLabel(k)}</span>
                    <div className="au-ac-tr" onMouseLeave={() => setHover(null)}>
                      {items.filter((i) => i.modality === k).map((i) => (
                        <i
                          key={i.id}
                          className={`au-ev ${i.status}${hover === i.id ? ' on' : ''}`}
                          style={{ left: `${pct(i.minute)}%`, width: `max(10px, ${((i.sec || 0) / 60 / span) * 100}%)`, background: i.status === 'failed' ? undefined : AU_TASK[k].color }}
                          onMouseEnter={() => setHover(i.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="au-ac-grid" ref={gridRef}>
                {ticks.map((t) => <span key={t} style={{ left: `${pct(t)}%` }} />)}
                {nowM !== null && nowM >= view.s && nowM <= view.e && <em style={{ left: `${pct(nowM)}%` }} />}
                {h && (
                  <div className="au-tr-tip au-ac-tip" style={hp > 60 ? { right: `${100 - hp + 1}%` } : { left: `${hp + 1}%` }}>
                    <i>{clock(h.minute)} · {auTaskLabel(h.modality)}</i>
                    <b>{h.model}</b>
                    <i>{ST[h.status] || h.status}{h.sec ? ` · ${h.sec}s` : ''}{h.status === 'succeeded' ? ` · ${moneyShort(h.cost)}` : ''}</i>
                  </div>
                )}
              </div>
            </div>
            <div className="au-ac-x">
              <span />
              <div>{ticks.map((t) => <span key={t} style={{ left: `${pct(t)}%` }}>{tickLabel(t)}</span>)}</div>
            </div>
          </div>
        )}
    </Card>
  )
}

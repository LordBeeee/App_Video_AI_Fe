import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMySpendingApi } from '../../services/user.service'
import { getWallet } from '../../services/wallet.service'
import { useSpendingStore } from '../../store/spending.store'
import { useCountUp } from '../Aurora/useReveal'
import { formatVND, formatNum } from '../../utils/expense.utils'
import { AU_TASK_DARK, DOW, auTaskLabel, moneyParts, moneyShort, pctOf } from '../../utils/aurora.utils'
import './spending.css'

const dowOf = (day) => DOW[(new Date(`${day}T00:00:00`).getDay() + 6) % 7]

function deltaText(now, before, same) {
  if (!before) return now ? { kind: 'up', text: same } : { kind: '', text: 'Chưa có chi tiêu' }
  const d = Math.round(((now - before) / before) * 100)
  if (d === 0) return { kind: '', text: 'Ngang' }
  return { kind: d > 0 ? 'up' : 'down', text: `${d > 0 ? '+' : ''}${d}%` }
}

export default function SpendingBubble() {
  const open = useSpendingStore((s) => s.open)
  const setOpen = useSpendingStore((s) => s.setOpen)
  const budget = useSpendingStore((s) => s.budget)
  const setBudget = useSpendingStore((s) => s.setBudget)
  const pos = useSpendingStore((s) => s.pos)
  const setPos = useSpendingStore((s) => s.setPos)
  const [drag, setDrag] = useState(null)
  const [, setSize] = useState(0)
  const dragRef = useRef(null)
  const [data, setData] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [failed, setFailed] = useState(false)
  const [pop, setPop] = useState(0)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const last = useRef(null)

  const load = useCallback(() => {
    Promise.all([getMySpendingApi(), getWallet().catch(() => null)])
      .then(([s, w]) => {
        if (last.current !== null && s.today.cost > last.current) {
          setPop(s.today.cost - last.current)
          setTimeout(() => setPop(0), 6000)
        }
        last.current = s.today.cost
        setData(s)
        setWallet(w)
        setFailed(false)
      })
      .catch(() => setFailed(true))
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, open ? 20000 : 60000)
    window.addEventListener('spending:refresh', load)
    return () => {
      clearInterval(t)
      window.removeEventListener('spending:refresh', load)
    }
  }, [load, open])

  const today = data?.today.cost || 0
  const month = data?.month.cost || 0
  const shown = useCountUp(today, open && !!data)
  const parts = moneyParts(open ? shown : today)
  const dToday = data ? deltaText(today, data.yesterday.cost, 'Hôm qua chưa chi') : null
  const dMonth = data ? deltaText(month, data.month.prevSameCost, 'Tháng trước chưa chi') : null
  const max = useMemo(() => Math.max(1, ...(data?.daily || []).map((d) => d.cost)), [data])

  const now = new Date()
  const dom = now.getDate()
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const forecast = dom ? Math.round((month / dom) * dim) : 0
  const used = budget ? pctOf(month, budget) : 0
  const level = used >= 100 ? 'bad' : used >= 80 ? 'warn' : ''
  const avail = wallet?.availableVnd ?? wallet?.balanceVnd

  useEffect(() => {
    const onResize = () => setSize((n) => n + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const clampPos = (p) => {
    const fab = 58
    const maxRight = open ? window.innerWidth - 330 - 8 : window.innerWidth - fab - 8
    return {
      right: Math.min(Math.max(8, p.right), Math.max(8, maxRight)),
      bottom: Math.min(Math.max(8, p.bottom), Math.max(8, window.innerHeight - fab - 8)),
    }
  }
  const cur = clampPos(drag || pos)

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return
    dragRef.current = { x: e.clientX, y: e.clientY, start: cur, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 5) return
    d.moved = true
    setDrag(clampPos({ right: d.start.right - dx, bottom: d.start.bottom - dy }))
  }
  const onUp = (e) => {
    const d = dragRef.current
    if (!d) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (d.moved) {
      setPos(clampPos({ right: d.start.right - (e.clientX - d.x), bottom: d.start.bottom - (e.clientY - d.y) }))
      setDrag(null)
    }
    setTimeout(() => { dragRef.current = null }, 0)
  }
  const onFabClick = () => {
    if (dragRef.current?.moved) return
    setOpen(!open)
  }

  const saveBudget = () => {
    setBudget(Number(String(draft).replace(/\D/g, '')))
    setEditing(false)
  }

  if (failed && !data) return null

  return (
    <div className={`sp${open ? ' open' : ''}`} style={{ right: cur.right, bottom: cur.bottom }}>
      {open && data && (
        <section className="sp-panel" role="dialog" aria-label="Chi tiêu của tôi" style={{ maxHeight: `calc(100vh - ${cur.bottom + 76}px)` }}>
          <header className="sp-h">
            <span className="sp-hic"><span className="material-symbols-outlined">savings</span></span>
            <h3>Chi tiêu của tôi</h3>
            <button type="button" className="sp-x" onClick={() => setOpen(false)} title="Thu gọn" aria-label="Thu gọn">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </header>

          <div className="sp-hero">
            <div>
              <div className="sp-lab">Hôm nay</div>
              <div className="sp-big" title={formatVND(today)}>{parts.v}<small>{parts.u}</small></div>
            </div>
            <span className={`sp-dl ${dToday.kind}`} title="So với hôm qua">{dToday.text}</span>
          </div>

          <div className="sp-bars" aria-label="Chi tiêu 7 ngày gần nhất">
            {data.daily.map((d, i) => (
              <div key={d.day} className={`sp-bc${i === data.daily.length - 1 ? ' now' : ''}`} title={`${d.day.slice(8, 10)}/${d.day.slice(5, 7)} · ${formatVND(d.cost)} · ${formatNum(d.requests)} lượt`}>
                <div className="sp-bt"><i style={{ height: `${(d.cost / max) * 100}%`, '--d': `${i * 60}ms` }} /></div>
                <span>{dowOf(d.day)}</span>
              </div>
            ))}
          </div>

          <div className="sp-chips">
            <div title={`${formatNum(data.week.requests)} lượt trong 7 ngày`}><span>7 ngày</span><b>{moneyShort(data.week.cost)}</b></div>
            <div title={`${formatNum(data.month.requests)} lượt trong tháng`}>
              <span>Tháng này</span><b>{moneyShort(month)}</b>
              <em className={dMonth.kind} title="So với cùng kỳ tháng trước">{dMonth.text}</em>
            </div>
            <div title={wallet ? `Đang giữ ${formatVND(wallet.heldVnd)}` : ''}><span>Số dư ví</span><b>{wallet ? moneyShort(avail) : '—'}</b></div>
          </div>

          {data.byTask.some((t) => t.cost > 0) && (
            <div className="sp-mix">
              <div className="sp-mixbar">
                {data.byTask.filter((t) => t.cost > 0).map((t) => <i key={t.modality} style={{ flexGrow: t.cost, background: AU_TASK_DARK[t.modality] || '#FFB070' }} title={`${auTaskLabel(t.modality)} · ${formatVND(t.cost)}`} />)}
              </div>
              <div className="sp-mixl">
                {data.byTask.filter((t) => t.cost > 0).slice(0, 3).map((t) => (
                  <span key={t.modality}><i style={{ background: AU_TASK_DARK[t.modality] || '#FFB070' }} />{auTaskLabel(t.modality)} <b>{pctOf(t.cost, month)}%</b></span>
                ))}
              </div>
            </div>
          )}

          <div className="sp-bud">
            {editing ? (
              <div className="sp-edit">
                <input autoFocus inputMode="numeric" value={draft} placeholder="Ngân sách tháng (₫)" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveBudget(); if (e.key === 'Escape') setEditing(false) }} />
                <button type="button" onClick={saveBudget}>Lưu</button>
              </div>
            ) : budget ? (
              <>
                <div className="sp-bud-t">
                  <span>Ngân sách tháng</span>
                  <button type="button" onClick={() => { setDraft(String(budget)); setEditing(true) }} title="Sửa ngân sách" aria-label="Sửa ngân sách"><span className="material-symbols-outlined">edit</span></button>
                </div>
                <div className="sp-trk"><div className={level} style={{ width: `${Math.min(used, 100)}%` }} /></div>
                <div className="sp-bud-s">
                  <span>{used}% · còn {month >= budget ? '0₫' : moneyShort(budget - month)}</span>
                  <span className={forecast > budget ? 'bad' : ''} title="Ước tính theo tốc độ chi hiện tại">Dự kiến {moneyShort(forecast)}</span>
                </div>
              </>
            ) : (
              <button type="button" className="sp-set" onClick={() => { setDraft(''); setEditing(true) }}>
                <span className="material-symbols-outlined">flag</span>Đặt ngân sách tháng để theo dõi
              </button>
            )}
          </div>

          <Link to="/wallet" className="sp-go">Ví & thanh toán<span className="material-symbols-outlined">arrow_forward</span></Link>
        </section>
      )}

      <div className="sp-row">
        {!open && pop > 0 && <span className="sp-pop" key={pop}>Vừa chi {moneyShort(pop)}</span>}
        <button
          type="button"
          className="sp-fab"
          onClick={onFabClick}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          title={open ? 'Thu gọn' : `Hôm nay: ${formatVND(today)}`}
          aria-label={open ? 'Thu gọn chi tiêu' : 'Mở chi tiêu của tôi'}
          aria-expanded={open}
        >
          <span className="material-symbols-outlined">{open ? 'close' : 'savings'}</span>
          {!open && data && today > 0 && <em>{moneyShort(today)}</em>}
        </button>
      </div>
    </div>
  )
}

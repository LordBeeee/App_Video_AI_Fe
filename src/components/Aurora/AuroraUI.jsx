import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { getInitials } from '../../utils/employee.utils'
import './aurora.css'

export function Page({ children, after, hint = 'Hiệu quả sử dụng AI' }) {
  if (!after) return <div className="au">{children}</div>
  return (
    <div className="au scroll">
      <div className="au-fold">
        {children}
        <button type="button" className="au-more" onClick={() => document.getElementById('au-eff')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="au-more-m"><span className="material-symbols-outlined">analytics</span></span>
          <span className="au-more-t"><b>Cuộn xuống để xem chi tiết</b><small>{hint}</small></span>
          <span className="material-symbols-outlined">keyboard_double_arrow_down</span>
        </button>
      </div>
      {after}
    </div>
  )
}

export function Avatar({ name, src, size = 40, onInk = false }) {
  return (
    <div className={`au-av${onInk ? ' onink' : ''}`} style={{ '--s': `${size}px` }}>
      <span>{src ? <img src={src} alt="" /> : getInitials(name)}</span>
    </div>
  )
}

export function Pills({ items, value, onChange }) {
  return (
    <div className="au-pills" role="tablist">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={`au-pill${value === it.value ? ' on' : ''}`}
        >
          {it.icon && <span className="material-symbols-outlined">{it.icon}</span>}
          {it.label}
        </button>
      ))}
    </div>
  )
}

export function InfoTip({ info, label = 'Giải thích', tone = '', className = '' }) {
  const id = useId()
  const btn = useRef(null)
  const pop = useRef(null)
  const timer = useRef(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)

  const place = useCallback(() => {
    const b = btn.current
    const p = pop.current
    if (!b || !p) return
    const r = b.getBoundingClientRect()
    const pw = p.offsetWidth
    const ph = p.offsetHeight
    const m = 10
    let left = r.left + r.width / 2 - pw / 2
    left = Math.max(m, Math.min(left, window.innerWidth - pw - m))
    const below = r.bottom + 8
    const above = r.top - ph - 8
    const top = below + ph + m <= window.innerHeight || above < m ? below : above
    setPos({ left, top: Math.max(m, top), arrow: Math.max(14, Math.min(r.left + r.width / 2 - left, pw - 14)), up: top === above && above >= m })
  }, [])

  useLayoutEffect(() => { if (open) place(); else setPos(null) }, [open, place])

  useEffect(() => {
    if (!open) return undefined
    const close = () => setOpen(false)
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    const onDown = (e) => { if (!btn.current?.contains(e.target) && !pop.current?.contains(e.target)) setOpen(false) }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', close, true)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', close, true)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open, place])

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!info) return null
  const hoverOn = (e) => { if (e.pointerType === 'mouse') { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(true), 120) } }
  const hoverOff = (e) => { if (e.pointerType === 'mouse') { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(false), 140) } }

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={`au-info ${tone} ${className}${open ? ' on' : ''}`}
        aria-label={`${label}: ${typeof info === 'string' ? info : info.title || ''}`.trim()}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        onPointerEnter={hoverOn}
        onPointerLeave={hoverOff}
      >
        ?
      </button>
      {open && createPortal(
        <div
          ref={pop}
          id={id}
          role="tooltip"
          className={`au-tip${pos?.up ? ' up' : ''}`}
          style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? 'visible' : 'hidden', '--ax': `${pos?.arrow ?? 20}px` }}
          onPointerEnter={hoverOn}
          onPointerLeave={hoverOff}
        >
          {typeof info === 'string' ? <p>{info}</p> : (
            <>
              {info.title && <b className="au-tip-t">{info.title}</b>}
              {info.what && <p>{info.what}</p>}
              {info.read && <p><em>Cách đọc</em>{info.read}</p>}
              {info.note && <p className="note"><em>Lưu ý</em>{info.note}</p>}
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}

export function Card({ title, sub, icon, action, info, tone = '', className = '', children }) {
  return (
    <section className={`au-card ${tone} ${className}`}>
      {(title || action) && (
        <header className="au-ch" title={info ? undefined : sub}>
          <div className="au-chl">
            {icon && <span className="au-hic"><span className="material-symbols-outlined">{icon}</span></span>}
            <h3 className="au-h3 au-fd au-ell">{title}</h3>
            {info && <InfoTip info={info} tone={tone} />}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Tile({ label, value, hint, icon, tone = '', loading, title, note, info }) {
  return (
    <div className={`au-tile ${tone}`} title={loading || info ? undefined : hint}>
      <div className="au-tl"><span>{label}</span>{info && <InfoTip info={info} tone={tone} />}</div>
      {loading ? (
        <div className="au-sk" style={{ height: 30, width: '70%' }} />
      ) : (
        <div className="au-tv au-fd" title={title}>{value}</div>
      )}
      {icon && <span className="au-ti"><span className="material-symbols-outlined">{icon}</span></span>}
      {note && !loading && <div className="au-th">{note}</div>}
    </div>
  )
}

export function Skeleton({ h = 120, w = '100%', className = '' }) {
  if (h === '100%') return <div className={`au-sk fill ${className}`} />
  return <div className={`au-sk ${className}`} style={{ height: h, width: w }} />
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="au-err">
      <span className="material-symbols-outlined">error</span>
      <p>{message}</p>
      {onRetry && <button type="button" className="au-btn solid" onClick={onRetry}>Thử lại</button>}
    </div>
  )
}

export function Empty({ text = 'Chưa có dữ liệu trong kỳ này', hint, icon = 'inbox', tone = '', to, cta }) {
  return (
    <div className={`au-empty ${tone}`}>
      <span className="au-emo"><span className="material-symbols-outlined">{icon}</span></span>
      <b>{text}</b>
      {hint && <p>{hint}</p>}
      {to && <Link to={to} className="au-btn solid sm">{cta}</Link>}
    </div>
  )
}

export function GhostChart({ text, hint, tone = 'dark' }) {
  const d = 'M0,92 C40,84 62,38 104,50 S164,104 206,72 S274,18 316,44 S372,64 400,28'
  return (
    <div className={`au-ghost ${tone}`}>
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
        <path className="au-gh-a" d={`${d} L400,120 L0,120 Z`} />
        <path className="au-gh-l" d={d} fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="au-gh-m">
        <b>{text}</b>
        {hint && <p>{hint}</p>}
      </div>
    </div>
  )
}

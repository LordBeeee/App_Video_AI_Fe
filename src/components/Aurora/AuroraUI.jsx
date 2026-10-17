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

export function Card({ title, sub, icon, action, tone = '', className = '', children }) {
  return (
    <section className={`au-card ${tone} ${className}`}>
      {(title || action) && (
        <header className="au-ch" title={sub}>
          <div className="au-chl">
            {icon && <span className="au-hic"><span className="material-symbols-outlined">{icon}</span></span>}
            <h3 className="au-h3 au-fd au-ell">{title}</h3>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Tile({ label, value, hint, icon, tone = '', loading, title, note }) {
  return (
    <div className={`au-tile ${tone}`} title={loading ? undefined : hint}>
      <div className="au-tl">{label}</div>
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

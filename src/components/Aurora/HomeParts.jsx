import { Link } from 'react-router-dom'
import { Empty } from './AuroraUI'
import { HEALTH, TASK_STATUS, timeAgo } from '../../utils/operations.utils'
import { auTaskLabel } from '../../utils/aurora.utils'

const ICON = { chat: 'chat_bubble', image: 'image', video: 'smart_display', audio: 'graphic_eq' }
const DOT = { ok: '#22A559', degraded: 'var(--t-primary, #d4621a)', down: '#DC2626', idle: '#BBA796' }
const HEALTH_ICON = { ok: ['ok', 'check_circle'], degraded: ['warn', 'warning'], down: ['bad', 'error'], idle: ['', 'hourglass_empty'] }
const RUNNING = ['pending', 'queued', 'processing', 'running']

export function Dot({ status }) {
  return <i className="au-dot" style={{ background: DOT[status] || DOT.idle }} />
}

export function StatusTag({ status }) {
  const s = TASK_STATUS[status] || { label: status }
  const m = status === 'succeeded' ? ['ok', 'check_circle'] : status === 'failed' ? ['bad', 'error'] : RUNNING.includes(status) ? ['run', 'autorenew'] : ['', 'schedule']
  return <span className={`au-st ${m[0]}`} title={s.label}><span className="material-symbols-outlined">{m[1]}</span></span>
}

export function TaskFeed({ items = [], showUser, empty, hint, icon = 'inbox', to, cta }) {
  if (!items.length) return <Empty text={empty} hint={hint} icon={icon} to={to} cta={cta} />
  return (
    <div className="au-scroll">
      <ul className="au-list">
        {items.map((t) => (
          <li key={t.id} className="au-tk">
            <span className="au-ic"><span className="material-symbols-outlined">{ICON[t.modality] || 'bolt'}</span></span>
            <div className="au-tk-m">
              <b title={t.model}>{t.model}</b>
              <small>{auTaskLabel(t.modality)}{showUser && t.userName ? ` · ${t.userName}` : ''} · {timeAgo(t.createdAt)}</small>
            </div>
            <StatusTag status={t.status} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ErrorFeed({ items = [], showUser }) {
  if (!items.length) return <Empty tone="ok" icon="verified" text="Không có lỗi nào" hint="Hệ thống đang chạy trơn tru. Lỗi mới sẽ được báo tại đây." />
  return (
    <div className="au-scroll">
      <ul className="au-list">
        {items.map((e) => (
          <li key={e.id} className="au-er">
            <div className="au-er-t"><span className="au-ell" title={e.model}>{e.model}</span><small>{timeAgo(e.createdAt)}</small></div>
            <div className="au-er-s">{auTaskLabel(e.modality)}{showUser && e.userName ? ` · ${e.userName}` : ''}</div>
            <p>{e.message || 'Không có thông báo lỗi'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function serviceMeta(s) {
  if (s.key === 'database') return `Phản hồi ${s.latencyMs} ms`
  if (s.key === 'payments') return `${s.pending} chờ thanh toán · ${s.paid24h} đã thanh toán · ${s.cancelled24h} đã hủy (24h)`
  return s.total24h ? `${s.failed24h}/${s.total24h} lỗi (24h) · thành công gần nhất ${timeAgo(s.lastSuccessAt)}` : 'Không có yêu cầu trong 24h'
}

export function ServiceFeed({ services = [], alerts = [] }) {
  return (
    <div className="au-scroll">
      {alerts.length === 0 ? (
        <div className="au-al ok"><span className="material-symbols-outlined">check_circle</span><span>Ổn định</span></div>
      ) : alerts.map((a) => (
        <div key={a.code} className={`au-al ${a.level === 'critical' ? 'critical' : 'warn'}`}>
          <span className="material-symbols-outlined">{a.level === 'critical' ? 'error' : 'warning'}</span>
          <span>{a.message}</span>
        </div>
      ))}
      <ul className="au-list">
        {services.map((s) => {
          const h = HEALTH[s.status] || HEALTH.idle
          return (
            <li key={s.key} className="au-sv">
              <div className="au-tk-m">
                <b><Dot status={s.status} />{s.label}</b>
                <small title={serviceMeta(s)}>{serviceMeta(s)}</small>
              </div>
              <span className={`au-st ${(HEALTH_ICON[s.status] || HEALTH_ICON.idle)[0]}`} title={h.label}><span className="material-symbols-outlined">{(HEALTH_ICON[s.status] || HEALTH_ICON.idle)[1]}</span></span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function QuickLinks({ actions }) {
  return (
    <div className="au-ql">
      {actions.map((a) => (
        <Link key={a.to} to={a.to} className="au-qlk">
          <span className="material-symbols-outlined">{a.icon}</span>
          <span>{a.label}</span>
        </Link>
      ))}
    </div>
  )
}

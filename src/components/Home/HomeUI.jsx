import { Link } from 'react-router-dom'
import { Panel, EmptyState } from '../Expenses/ExpenseUI'
import { HEALTH, TASK_STATUS, timeAgo } from '../../utils/operations.utils'
import { taskLabel } from '../../utils/expense.utils'

export function StatusBadge({ status }) {
  const s = TASK_STATUS[status] || { label: status, cls: 'bg-surface-variant text-on-surface-variant' }
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>
}

export function Stat({ icon, label, value, tone = 'default', loading }) {
  const toneCls = tone === 'danger' ? 'bg-red-50 text-red-600' : tone === 'warn' ? 'bg-amber-50 text-amber-600' : 'bg-primary-container text-primary'
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-white p-5 shadow-[0_10px_30px_rgba(92,55,24,0.06)]">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneCls}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">{label}</p>
        {loading ? <div className="mt-1 h-7 w-16 animate-pulse rounded bg-surface-container-high" /> : <p className="text-2xl font-bold text-on-surface">{value}</p>}
      </div>
    </div>
  )
}

export function ServiceStatus({ services = [] }) {
  return (
    <Panel title="Trạng thái dịch vụ" subtitle="Cơ sở dữ liệu được kiểm tra trực tiếp; các dịch vụ khác suy luận từ hoạt động 24 giờ qua">
      <ul className="divide-y divide-outline-variant/60">
        {services.map((s) => {
          const h = HEALTH[s.status] || HEALTH.idle
          return (
            <li key={s.key} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  <span className={`h-2.5 w-2.5 rounded-full ${h.dot}`} />{s.label}
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {s.key === 'database' && `Phản hồi ${s.latencyMs} ms`}
                  {s.key === 'payments' && `${s.pending} chờ thanh toán · ${s.paid24h} đã thanh toán · ${s.cancelled24h} đã hủy (24h)`}
                  {s.key !== 'database' && s.key !== 'payments' && (s.total24h ? `${s.failed24h}/${s.total24h} lỗi (24h) · thành công gần nhất: ${timeAgo(s.lastSuccessAt)}` : 'Không có yêu cầu trong 24h')}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${h.cls}`}>{h.label}</span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export function AlertsPanel({ alerts = [] }) {
  return (
    <Panel title="Cảnh báo vận hành">
      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <span className="material-symbols-outlined">check_circle</span>Không có cảnh báo nào.
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.code} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${a.level === 'critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
              <span className="material-symbols-outlined text-xl">{a.level === 'critical' ? 'error' : 'warning'}</span>
              <span>{a.message}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export function TaskList({ title, subtitle, items = [], showUser, empty }) {
  return (
    <Panel title={title} subtitle={subtitle}>
      {items.length === 0 ? <EmptyState text={empty} /> : (
        <ul className="divide-y divide-outline-variant/60">
          {items.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-on-surface" title={t.model}>{t.model}</p>
                <p className="truncate text-xs text-on-surface-variant">
                  {taskLabel(t.modality)}{showUser && t.userName ? ` · ${t.userName}` : ''} · {timeAgo(t.createdAt)}
                </p>
              </div>
              <StatusBadge status={t.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export function ErrorList({ items = [], showUser }) {
  return (
    <Panel title="Lỗi gần đây">
      {items.length === 0 ? <EmptyState text="Không có lỗi nào gần đây" /> : (
        <ul className="divide-y divide-outline-variant/60">
          {items.map((e) => (
            <li key={e.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-on-surface" title={e.model}>{e.model}</p>
                <span className="shrink-0 text-xs text-on-surface-variant">{timeAgo(e.createdAt)}</span>
              </div>
              <p className="text-xs text-on-surface-variant">{taskLabel(e.modality)}{showUser && e.userName ? ` · ${e.userName}` : ''}</p>
              <p className="mt-1 line-clamp-2 text-xs text-red-700">{e.message || 'Không có thông báo lỗi'}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export function QuickActions({ actions }) {
  return (
    <Panel title="Thao tác nhanh">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="flex items-center gap-3 rounded-xl border border-outline-variant bg-white px-3 py-3 text-sm font-medium text-on-surface transition hover:border-primary hover:bg-primary-container hover:text-primary">
            <span className="material-symbols-outlined text-xl text-primary">{a.icon}</span>
            <span className="truncate">{a.label}</span>
          </Link>
        ))}
      </div>
    </Panel>
  )
}

export function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-outline-variant bg-white p-5 shadow-[0_10px_30px_rgba(92,55,24,0.06)] sm:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-on-surface">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function KpiCard({ label, value, hint, icon, loading }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant bg-white p-5 shadow-[0_10px_30px_rgba(92,55,24,0.06)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-primary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
      </div>
      {loading
        ? <div className="h-8 w-32 animate-pulse rounded bg-surface-container-high" />
        : <span className="truncate text-2xl font-bold text-on-surface">{value}</span>}
      <span className="min-h-4 text-xs text-on-surface-variant">{loading ? '' : hint}</span>
    </div>
  )
}

export function EmptyState({ text = 'Chưa có dữ liệu trong khoảng thời gian này' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-on-surface-variant">
      <span className="material-symbols-outlined text-3xl text-outline">inbox</span>
      <span className="text-sm">{text}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <span className="material-symbols-outlined text-3xl text-red-500">error</span>
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover">
          Thử lại
        </button>
      )}
    </div>
  )
}

export function ChartSkeleton({ height = 240 }) {
  return <div className="animate-pulse rounded-xl bg-surface-container-high" style={{ height }} />
}

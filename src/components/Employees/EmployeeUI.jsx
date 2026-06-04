// StatCard, Dot, Skeleton, SkeletonRow, ActionBtn, PageBtn

export function StatCard({ label, loading, children }) {
  return (
    <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
      <span className="text-label-caps text-outline uppercase tracking-widest">{label}</span>
      <div className="mt-5">
        {loading ? <Skeleton className="h-9 w-16" /> : children}
      </div>
    </div>
  )
}

export function Dot({ color }) {
  return color === 'green'
    ? <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
    : <span className="w-2 h-2 rounded-full bg-[#f87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
}

export function Skeleton({ className }) {
  return <div className={`animate-pulse rounded bg-surface-container-highest/50 ${className}`} />
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-highest/50" />
          <div className="h-4 w-32 rounded bg-surface-container-highest/50" />
        </div>
      </td>
      {[40, 28, 20, 32].map((w, i) => (
        <td key={i} className="px-6 py-5">
          <div className={`h-4 w-${w} rounded bg-surface-container-highest/50`} />
        </td>
      ))}
      <td className="px-6 py-5 flex justify-end gap-2">
        <div className="h-8 w-24 rounded bg-surface-container-highest/50" />
      </td>
    </tr>
  )
}

export function ActionBtn({ icon, title, hoverClass, disabled, onClick }) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-2 transition-colors rounded-lg text-on-surface-variant ${hoverClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </button>
  )
}

export function PageBtn({ icon, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-10 h-10 rounded-lg border border-outline-variant/20 hover:bg-surface-container-highest text-on-surface disabled:opacity-30 flex items-center justify-center transition-colors"
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  )
}
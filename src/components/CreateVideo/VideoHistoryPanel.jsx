import { useEffect } from 'react'

const STATUS_DOT = {
  succeeded: 'bg-green-400',
  processing: 'bg-blue-400 animate-pulse',
  queued: 'bg-yellow-400 animate-pulse',
  failed: 'bg-red-400',
}

export default function VideoHistoryPanel({ history, loading, selectedId, onSelect }) {
  return (
    <section className="flex w-[88px] flex-col overflow-hidden border-l border-slate-800/80 bg-slate-900/40 backdrop-blur-lg">
      <div className="scrollbar-hide flex flex-col gap-2 overflow-y-auto p-2">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square w-full animate-pulse rounded-lg bg-slate-800" />
          ))
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center gap-1 pt-4">
            <span className="material-symbols-outlined text-2xl text-slate-600">movie</span>
            <p className="text-center text-[9px] text-slate-600">Chưa có video</p>
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`group relative h-[72px] w-[72px] shrink-0 aspect-square w-full overflow-hidden rounded-lg border-2 transition-all ${
                selectedId === item.id
                  ? 'border-indigo-500'
                  : 'border-transparent hover:border-slate-600'
              }`}
            >
              {/* Thumbnail */}
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt="thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800">
                  <span className="material-symbols-outlined text-xl text-slate-600">movie</span>
                </div>
              )}

              {/* Status dot */}
              <span className={`absolute right-1 top-1 h-2 w-2 rounded-full ${STATUS_DOT[item.status] ?? 'bg-slate-500'}`} />

              {/* Overlay khi hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="material-symbols-outlined text-lg text-white">
                  {item.status === 'succeeded' ? 'play_arrow' : 'hourglass_empty'}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  )
}
const money = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} ₫`;

export default function GenerationHistory({ history, resultId, onRefresh, onSelect }) {
  return (
    <aside className="hidden min-h-0 w-48 shrink-0 flex-col border-l border-outline-variant bg-white p-3 xl:flex">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Gần đây</h3>
        <button
          onClick={onRefresh}
          className="text-on-surface-variant hover:text-primary"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
        </button>
      </div>
      <div className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`flex w-full gap-3 rounded-xl border p-2 text-left transition ${resultId === item.id ? "border-primary bg-primary-container" : "border-outline-variant bg-white hover:border-primary/40 hover:bg-surface-container-low"}`}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/40">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined flex h-full items-center justify-center text-slate-600">
                  smart_display
                </span>
              )}
              <span
                className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-black/50 ${item.status === "succeeded" ? "bg-emerald-400" : item.status === "failed" ? "bg-red-400" : "animate-pulse bg-amber-400"}`}
              />
            </div>
            <div className="min-w-0 flex-1 py-1">
              <p className="line-clamp-2 text-sm text-on-surface">
                {item.prompt}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="truncate">
                  {item.displayQuality || item.modelName}
                </span>
                <span className="shrink-0">
                  {money(item.displayPriceVnd)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

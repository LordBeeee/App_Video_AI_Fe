export default function ReferenceCard({ item, onSelect, onToggleFavorite }) {
  const mediaType = item.role === "voice"
    ? "VOICE"
    : item.type === "video" ? "VIDEO" : "IMG";
  const status = item.status === "succeed"
    ? "Sẵn sàng"
    : item.status === "failed" ? "Lỗi" : "Đang xử lý";

  return (
    <article className="overflow-hidden rounded-xl border border-outline-variant bg-white">
      {item.role === "voice" ? (
        <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 bg-primary-container p-4">
          <span className="material-symbols-outlined text-6xl text-primary">graphic_eq</span>
          <audio controls src={item.trialUrl || item.src} className="w-full" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          className="relative aspect-[4/5] w-full bg-surface-variant"
        >
          {item.type === "video" ? (
            <video src={item.videoSrc || item.src} muted className="h-full w-full object-cover" />
          ) : (
            <img src={item.src} alt={item.name || "Element"} className="h-full w-full object-cover" />
          )}
        </button>
      )}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-on-surface-variant">{item.provider} · {mediaType}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(item.id)}
          aria-label="Favorite"
          className={item.favorite ? "text-red-500" : "text-on-surface-variant"}
        >
          <span className="material-symbols-outlined">favorite</span>
        </button>
      </div>
      <div className="flex items-center justify-between border-t border-outline-variant px-3 pb-3 pt-2 text-xs text-on-surface-variant">
        <span>{status}</span>
        {item.role === "voice" && item.voiceId && (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(String(item.voiceId))}
            className="text-primary hover:underline"
          >
            Sao chép Voice ID
          </button>
        )}
      </div>
      {item.error && <p className="px-3 pb-3 text-xs text-red-500">{item.error}</p>}
    </article>
  );
}

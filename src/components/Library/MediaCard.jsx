export default function MediaCard({
  item,
  onSelect,
  onToggleFavorite,
  menuOpenId,
  setMenuOpenId,
  onDownload,
  onDelete,
}) {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className="media-card group relative flex aspect-[4/5] cursor-pointer flex-col overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_10px_24px_rgba(243,136,32,0.12)]"
    >
      <div className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          src={item.src}
          alt={item.alt}
        />

        {item.status && item.status !== "succeeded" && (
          <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">
            {item.status === "failed" ? (
              <span className="text-red-400">Lỗi</span>
            ) : (
              <>
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-slate-500 border-t-yellow-400" />
                <span className="text-yellow-300">Đang xử lý</span>
              </>
            )}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm bg-black/40 transition-opacity duration-200 z-10 ${
            item.favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-colors ${
              item.favorite ? "text-red-500" : "text-white hover:text-red-400"
            }`}
            style={item.favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>

        {item.type === "video" && (
          <div className="play-overlay absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm">
              <span
                className="material-symbols-outlined text-white ml-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-outline-variant bg-white p-3">
        {item.type === "video" ? (
          <div className="rounded bg-surface-variant px-2 py-1 font-mono text-xs font-medium text-on-surface-variant">
            {item.duration}
          </div>
        ) : (
          <div className="flex items-center gap-1 rounded bg-surface-variant px-2 py-1 font-mono text-xs font-medium text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">image</span>
            IMG
          </div>
        )}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpenId((id) => (id === item.id ? null : item.id));
            }}
            className={`text-on-surface-variant transition-colors hover:text-primary ${
              menuOpenId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>

          {menuOpenId === item.id && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(null);
                }}
              />
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full right-0 z-40 mb-2 w-36 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl"
              >
                <button
                  onClick={(e) => onDownload(item, e)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface transition-colors hover:bg-primary-container hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download
                </button>

                {item.category === "element" && onDelete && (        // ← THÊM
                  <button
                    onClick={(e) => onDelete(item, e)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Xóa
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

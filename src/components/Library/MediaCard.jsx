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
      className="media-card group relative bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500/60 transition-colors cursor-pointer flex flex-col aspect-[4/5]"
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
            <div className="w-12 h-12 rounded-full bg-indigo-600/90 flex items-center justify-center backdrop-blur-sm">
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
      <div className="p-3 bg-slate-800/60 border-t border-slate-700 flex justify-between items-center shrink-0">
        {item.type === "video" ? (
          <div className="bg-slate-900 px-2 py-1 rounded text-xs font-mono text-slate-400 font-medium">
            {item.duration}
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded text-xs font-mono text-slate-400 font-medium">
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
            className={`text-slate-400 hover:text-indigo-400 transition-colors ${
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
                className="absolute bottom-full right-0 mb-2 w-36 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-40 overflow-hidden"
              >
                <button
                  onClick={(e) => onDownload(item, e)}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download
                </button>

                {item.category === "element" && onDelete && (        // ← THÊM
                  <button
                    onClick={(e) => onDelete(item, e)}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
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

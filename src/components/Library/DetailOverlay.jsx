import PreviewPanel from "./PreviewPanel";
import InfoPanel from "./InfoPanel";
import ThumbnailRail from "./ThumbnailRail";

export default function DetailOverlay({
  item,
  items,
  onClose,
  onPrev,
  onNext,
  onSelect,
  onToggleFavorite,
  onDownload,
  onDelete,
  overlayMenuOpen,
  setOverlayMenuOpen,
  onCopyPrompt,
  promptCopied,
  thumbRefs,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-150">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-16 shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-white font-medium text-sm">
            {item.name || `${item.type}_${item.id}.${item.type === "video" ? "mp4" : "png"}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                item.favorite ? "text-red-500" : "text-slate-300"
              }`}
              style={item.favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
          <div className="relative">
            <button
              onClick={() => setOverlayMenuOpen((o) => !o)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>

            {overlayMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOverlayMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-40 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-40 overflow-hidden">
                  <button
                    onClick={(e) => onDownload(item, e)}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download
                  </button>

                  {item.category === "element" && onDelete && (      // ← THÊM
                    <button
                      onClick={(e) => onDelete(item, e)}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
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

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <PreviewPanel item={item} onPrev={onPrev} onNext={onNext} />

        {(item.category === "creative" || item.category === "element") && (
          <InfoPanel item={item} onCopyPrompt={onCopyPrompt} promptCopied={promptCopied} />
        )}

        <ThumbnailRail
          items={items}
          selectedId={item.id}
          onSelect={onSelect}
          thumbRefs={thumbRefs}
        />
      </div>
    </div>
  );
}

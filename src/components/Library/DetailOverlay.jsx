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
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-on-background animate-in fade-in duration-150">
      {/* Top bar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-white px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-sm font-medium text-on-surface">
            {item.name || `${item.type}_${item.id}.${item.type === "video" ? "mp4" : "png"}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                item.favorite ? "text-red-500" : "text-on-surface-variant"
              }`}
              style={item.favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
          <div className="relative">
            <button
              onClick={() => setOverlayMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary-container hover:text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>

            {overlayMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOverlayMenuOpen(false)} />
                <div className="absolute right-0 z-40 mt-2 w-40 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl">
                  <button
                    onClick={(e) => onDownload(item, e)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-on-surface transition-colors hover:bg-primary-container hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download
                  </button>

                  {item.category === "element" && onDelete && (      // ← THÊM
                    <button
                      onClick={(e) => onDelete(item, e)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
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

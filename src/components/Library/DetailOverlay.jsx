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
  deleting,
  overlayMenuOpen,
  setOverlayMenuOpen,
  onCopyPrompt,
  promptCopied,
  thumbRefs,
}) {
  const fileName = item.name || `${item.type}_${item.id}.${item.type === "video" ? "mp4" : item.type === "audio" ? "mp3" : "png"}`;

  return (
    <div className="au lb-ov">
      <header className="au-head">
        <div className="lb-ov-l">
          <button type="button" onClick={onClose} className="au-back" aria-label="Quay lại" title="Quay lại">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="lb-ov-t au-fd au-ell" title={fileName}>{fileName}</h2>
        </div>

        <div className="au-tools">
          <button
            type="button"
            onClick={() => onToggleFavorite(item.id)}
            className={`au-btn icon lb-fv${item.favorite ? " on" : ""}`}
            aria-label={item.favorite ? "Bỏ yêu thích" : "Yêu thích"}
            title={item.favorite ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <span className="material-symbols-outlined" style={item.favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
          </button>
          <div className="lb-mn">
            <button type="button" onClick={() => setOverlayMenuOpen((o) => !o)} className="au-btn icon" aria-label="Tùy chọn" title="Tùy chọn">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>

            {overlayMenuOpen && (
              <>
                <div className="lb-bk" onClick={() => setOverlayMenuOpen(false)} />
                <div className="lb-menu dn">
                  <button type="button" onClick={(e) => onDownload(item, e)} className="lb-mi">
                    <span className="material-symbols-outlined">download</span>
                    Tải xuống
                  </button>
                  {["element", "voice"].includes(item.category) && onDelete && (
                    <button
                      type="button"
                      onClick={(e) => onDelete(item, e)}
                      disabled={deleting || ["submitting", "submitted", "processing"].includes(item.deleteStatus)}
                      className="lb-mi bad"
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Xóa
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="lb-ov-body">
        <PreviewPanel item={item} onPrev={onPrev} onNext={onNext} />

        {(["creative", "element", "voice"].includes(item.category)) && (
          <InfoPanel item={item} onCopyPrompt={onCopyPrompt} promptCopied={promptCopied} />
        )}

        <ThumbnailRail items={items} selectedId={item.id} onSelect={onSelect} thumbRefs={thumbRefs} />
      </div>
    </div>
  );
}

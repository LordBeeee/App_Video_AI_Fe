const TYPE_META = {
  video: { icon: "movie", label: "Video" },
  audio: { icon: "graphic_eq", label: "Âm thanh" },
  image: { icon: "image", label: "Ảnh" },
};

export default function MediaCard({
  item,
  onSelect,
  onToggleFavorite,
  menuOpenId,
  setMenuOpenId,
  onDownload,
  onDelete,
  deleting,
}) {
  const isReference = item.category === "reference";
  const deletePending = deleting || ["submitting", "submitted", "processing"].includes(item.deleteStatus);
  const refStatus = deletePending ? "Đang xóa" : item.deleteStatus === "failed" ? "Xóa thất bại" : item.status === "failed" ? "Lỗi" : item.status && item.status !== "succeed" ? "Đang xử lý" : null;
  const badge = isReference ? refStatus : item.status && item.status !== "succeeded" ? (item.status === "failed" ? "Lỗi" : "Đang xử lý") : null;
  const bad = badge === "Lỗi" || badge === "Xóa thất bại";
  const meta = TYPE_META[item.type] || TYPE_META.image;
  const caption = item.name || (item.type === "video" && !isReference ? item.duration : "");
  const open = menuOpenId === item.id;

  return (
    <div
      onClick={() => onSelect(item.id)}
      title={isReference ? [item.name, item.provider, item.deleteError || item.error].filter(Boolean).join(" · ") : undefined}
      className="lb-it"
    >
      <div className="lb-m">
        {item.type === "audio" ? (
          <div className="lb-au">
            <span className="material-symbols-outlined">graphic_eq</span>
            <audio controls src={item.trialUrl || item.src} onClick={(e) => e.stopPropagation()} />
          </div>
        ) : item.type === "video" ? (
          <video src={item.videoSrc || item.src} muted />
        ) : (
          <img src={item.src} alt={item.alt} />
        )}

        {badge && (
          <span className={`lb-bd${bad ? " bad" : ""}`} title={item.deleteError || item.error}>
            <span className={`material-symbols-outlined${bad ? "" : " spin"}`}>{bad ? "error" : "progress_activity"}</span>
            {badge}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          aria-label={item.favorite ? "Bỏ yêu thích" : "Yêu thích"}
          title={item.favorite ? "Bỏ yêu thích" : "Yêu thích"}
          aria-pressed={item.favorite}
          className={`lb-fav${item.favorite ? " on" : ""}`}
        >
          <span className="material-symbols-outlined" style={item.favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
        </button>

        {item.type === "video" && (
          <div className="lb-play">
            <span className="c"><span className="material-symbols-outlined">play_arrow</span></span>
          </div>
        )}
      </div>

      <div className="lb-ft">
        <span className="lb-ty" title={meta.label}>
          <span className="material-symbols-outlined">{meta.icon}</span>
          {caption && <span className="t">{caption}</span>}
        </span>
        <div className="lb-mn">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpenId((id) => (id === item.id ? null : item.id));
            }}
            aria-label="Mở menu tài nguyên"
            title="Tùy chọn"
            className={`au-ico${open ? " open" : ""}`}
          >
            <span className="material-symbols-outlined">more_horiz</span>
          </button>

          {open && (
            <>
              <div
                className="lb-bk"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(null);
                }}
              />
              <div onClick={(e) => e.stopPropagation()} className="lb-menu">
                <button type="button" onClick={(e) => onDownload(item, e)} className="lb-mi">
                  <span className="material-symbols-outlined">download</span>
                  Tải xuống
                </button>
                {isReference && onDelete && (
                  <button type="button" onClick={(e) => onDelete(item, e)} disabled={deletePending} className="lb-mi bad">
                    <span className="material-symbols-outlined">delete</span>
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

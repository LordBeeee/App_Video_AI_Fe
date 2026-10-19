export default function ThumbnailRail({ items, selectedId, onSelect, thumbRefs }) {
  return (
    <div className="lb-rail">
      <div className="au-scroll">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            ref={(el) => { thumbRefs.current[item.id] = el; }}
            onClick={() => onSelect(item.id)}
            className={`lb-th${item.id === selectedId ? " on" : ""}`}
          >
            {item.type === "audio" ? (
              <span className="material-symbols-outlined">graphic_eq</span>
            ) : item.type === "video" ? (
              <video src={item.videoSrc || item.src} muted />
            ) : (
              <img src={item.src} alt={item.alt} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

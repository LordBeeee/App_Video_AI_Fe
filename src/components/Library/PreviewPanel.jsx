export default function PreviewPanel({ item, onPrev, onNext }) {
  return (
    <div className="lb-pv">
      <button type="button" onClick={onPrev} className="lb-nv l" aria-label="Trước" title="Trước">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button type="button" onClick={onNext} className="lb-nv r" aria-label="Sau" title="Sau">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="lb-stage">
        {item.type === "audio" ? (
          <div className="lb-au">
            <span className="material-symbols-outlined">graphic_eq</span>
            <audio key={item.id} src={item.trialUrl || item.src} controls />
          </div>
        ) : item.type === "video" ? (
          <video key={item.id} src={item.videoSrc || item.src} controls autoPlay />
        ) : (
          <img src={item.src} alt={item.alt} />
        )}
      </div>
    </div>
  );
}

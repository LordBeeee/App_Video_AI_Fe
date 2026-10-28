import { videoSyncTitle } from "../../utils/videoSyncStatus";

const money = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} ₫`;

export default function GenerationHistory({ history, resultId, onRefresh, onSelect }) {
  return (
    <aside className="au-card dark st-hist">
      <header className="au-ch">
        <div className="au-chl">
          <span className="au-hic"><span className="material-symbols-outlined">history</span></span>
          <h3 className="au-h3 au-fd">Gần đây</h3>
        </div>
        <button type="button" className="au-ico" onClick={onRefresh} aria-label="Làm mới" title="Làm mới">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>
      <div className="au-scroll st-list">
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`st-li${resultId === item.id ? " on" : ""}`}
            title={item.modality === "video" && item.status !== "succeeded" ? videoSyncTitle(item) : undefined}
          >
            <div className="st-th">
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt="" />
              ) : (
                <span className="material-symbols-outlined">smart_display</span>
              )}
              <span className={`st-dot${item.status === "succeeded" ? "" : item.status === "failed" ? " fail" : " run"}`} />
            </div>
            <div className="tx">
              <p>{item.prompt}</p>
              <div className="sub">
                <span>{item.displayQuality || item.modelName}</span>
                <span>{money(item.displayPriceVnd)}</span>
              </div>
              {item.modality === "video" && item.status !== "succeeded" && <div className="sub"><span>{videoSyncTitle(item)}</span></div>}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

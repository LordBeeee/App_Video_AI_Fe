import { useEffect, useState } from "react";
import { getLibraryAssetsApi } from "../../services/asset.service";
import { Pills, Empty } from "../Aurora/AuroraUI";
import "./library.css";

const TABS = [
  { value: "creative", label: "Sáng tạo", icon: "auto_awesome" },
  { value: "upload", label: "Tải lên", icon: "cloud_upload" },
];

export default function AssetPicker({ type = "image", max = 1, onConfirm, onClose }) {
  const [tab, setTab] = useState("upload");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getLibraryAssetsApi({ tab, type: type === "voice-sample" ? "all" : type, favorite: favoritesOnly })
      .then((data) => { if (active) { setItems((data.items || []).filter((item) => type !== "voice-sample" || ["audio", "video"].includes(item.assetType))); setError(""); } })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [tab, type, favoritesOnly]);

  return (
    <div className="au-mo lb-mo top" onMouseDown={onClose}>
      <div className="lb-mb lg" onMouseDown={(e) => e.stopPropagation()}>
        <div className="lb-mh">
          <div className="au-chl">
            <span className="au-hic"><span className="material-symbols-outlined">{type === "voice-sample" ? "graphic_eq" : type === "video" ? "smart_display" : "image"}</span></span>
            <h2 className="au-h3 au-fd">Chọn {type === "voice-sample" ? "mẫu giọng" : type === "video" ? "video" : "ảnh"} ({selected.length}/{max})</h2>
          </div>
          <button type="button" onClick={onClose} className="au-ico" aria-label="Đóng" title="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="lb-pkbar">
          <Pills items={TABS} value={tab} onChange={(value) => { setTab(value); setSelected([]); }} />
          <button type="button" onClick={() => setFavoritesOnly((v) => !v)} aria-pressed={favoritesOnly} className={`au-fl${favoritesOnly ? " on" : ""}`}>
            <span className="material-symbols-outlined" style={favoritesOnly ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
            Yêu thích
          </button>
        </div>

        <div className="lb-mbd au-scroll">
          {error && <p role="alert" className="lb-er">{error}</p>}
          {!error && items.length === 0 && <Empty icon="perm_media" text="Chưa có tài nguyên phù hợp" />}
          <div className="lb-pks">
            {items.map((item) => {
              const chosen = selected.some((id) => String(id) === String(item.id));
              return (
                <div key={item.id} style={{ minWidth: 0 }}>
                  <button
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => setSelected((current) => chosen ? current.filter((id) => String(id) !== String(item.id)) : [...current, item.id].slice(-max))}
                    className={`lb-pk${chosen ? " on" : ""}`}
                  >
                    {item.assetType === "audio" ? (
                      <span className="vo"><span className="material-symbols-outlined">graphic_eq</span>#{item.id}</span>
                    ) : item.assetType === "video" ? (
                      <video src={item.storedUrl} muted />
                    ) : (
                      <img src={item.storedUrl} alt={`Ảnh ${item.id}`} />
                    )}
                    {chosen && <span className="ck"><span className="material-symbols-outlined">check</span></span>}
                  </button>
                  {type === "voice-sample" && item.assetType === "audio" && <audio controls src={item.storedUrl} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lb-mf">
          <button type="button" onClick={onClose} className="au-btn">Hủy</button>
          <button
            type="button"
            disabled={!selected.length}
            onClick={() => { onConfirm(selected.map((id) => items.find((item) => String(item.id) === String(id))).filter(Boolean)); onClose(); }}
            className="au-btn solid"
          >
            <span className="material-symbols-outlined">check</span>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

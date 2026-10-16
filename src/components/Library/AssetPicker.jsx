import { useEffect, useState } from "react";
import { getLibraryAssetsApi } from "../../services/asset.service";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="text-lg font-semibold">Chọn {type === "voice-sample" ? "mẫu giọng" : type === "video" ? "video" : "ảnh"} ({selected.length}/{max})</h2>
          <button type="button" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="flex items-center gap-5 border-b border-outline-variant px-6">
          {[["creative", "Sáng tạo"], ["upload", "Tải lên"]].map(([value, label]) => (
            <button key={value} type="button" onClick={() => { setTab(value); setSelected([]); }} className={`border-b-2 py-3 text-sm ${tab === value ? "border-primary font-semibold text-primary" : "border-transparent text-on-surface-variant"}`}>{label}</button>
          ))}
          <button type="button" onClick={() => setFavoritesOnly((v) => !v)} className={`ml-auto rounded-lg border px-3 py-1.5 text-sm ${favoritesOnly ? "border-primary text-primary" : "border-outline-variant"}`}>♡ Favorites</button>
        </div>
        <div className="min-h-56 flex-1 overflow-y-auto p-6">
          {error && <p role="alert" className="text-red-500">{error}</p>}
          {!error && items.length === 0 && <p className="text-center text-on-surface-variant">Chưa có tài nguyên phù hợp.</p>}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {items.map((item) => {
              const chosen = selected.some((id) => String(id) === String(item.id));
              return <div key={item.id} className="min-w-0"><button type="button" aria-pressed={chosen} onClick={() => setSelected((current) => chosen ? current.filter((id) => String(id) !== String(item.id)) : [...current, item.id].slice(-max))} className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 ${chosen ? "border-primary" : "border-outline-variant"}`}>
                {item.assetType === "audio" ? <span className="flex h-full w-full flex-col items-center justify-center bg-primary-container text-primary-hover"><span className="material-symbols-outlined text-4xl">graphic_eq</span><span className="text-xs">Audio #{item.id}</span></span> : item.assetType === "video" ? <video src={item.storedUrl} muted className="h-full w-full object-cover" /> : <img src={item.storedUrl} alt={`Ảnh ${item.id}`} className="h-full w-full object-cover" />}
                {chosen && <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 text-xs text-on-primary">✓</span>}
              </button>{type === "voice-sample" && item.assetType === "audio" && <audio controls src={item.storedUrl} className="mt-1 h-8 w-full" />}</div>;
            })}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-outline-variant px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-4 py-2">Hủy</button>
          <button type="button" disabled={!selected.length} onClick={() => { onConfirm(selected.map((id) => items.find((item) => String(item.id) === String(id))).filter(Boolean)); onClose(); }} className="rounded-lg bg-primary px-4 py-2 font-medium text-on-primary disabled:opacity-40">Xác nhận</button>
        </div>
      </div>
    </div>
  );
}

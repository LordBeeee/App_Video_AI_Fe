import { Pills } from "../Aurora/AuroraUI";

export const FILTER_TABS = [
  { value: "Creative", label: "Sáng tạo", icon: "auto_awesome" },
  { value: "Upload", label: "Tải lên", icon: "cloud_upload" },
  { value: "Reference", label: "Reference", icon: "bookmark" },
];

export const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả", icon: "apps" },
  { value: "image", label: "Ảnh", icon: "image" },
  { value: "video", label: "Video", icon: "smart_display" },
  { value: "audio", label: "Âm thanh", icon: "graphic_eq" },
];

export function TabBar({ activeTab, setActiveTab }) {
  return <Pills items={FILTER_TABS} value={activeTab} onChange={setActiveTab} />;
}

export function LibraryAction({ activeTab, uploading, fileInputRef, onUploadFile, onCreateReference }) {
  return (
    <>
      {activeTab === "Reference" && (
        <button type="button" onClick={onCreateReference} className="au-btn solid">
          <span className="material-symbols-outlined">add</span>
          Tạo Reference
        </button>
      )}
      {activeTab === "Upload" && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" multiple onChange={onUploadFile} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="au-btn solid">
            <span className={`material-symbols-outlined${uploading ? " lb-spin" : ""}`}>{uploading ? "progress_activity" : "upload"}</span>
            {uploading ? "Đang tải lên..." : "Tải lên"}
          </button>
        </>
      )}
    </>
  );
}

export default function FilterBar({
  activeTab,
  typeFilter,
  setTypeFilter,
  favoritesOnly,
  setFavoritesOnly,
  providerFilter,
  setProviderFilter,
  count,
}) {
  return (
    <div className="lb-bar">
      <div className="lb-fls">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTypeFilter(opt.value)}
            aria-pressed={typeFilter === opt.value}
            className={`au-fl${typeFilter === opt.value ? " on" : ""}`}
          >
            <span className="material-symbols-outlined">{opt.icon}</span>
            {activeTab === "Reference" && opt.value === "audio" ? "Voice" : opt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFavoritesOnly((v) => !v)}
          aria-pressed={favoritesOnly}
          className={`au-fl${favoritesOnly ? " on" : ""}`}
        >
          <span className="material-symbols-outlined" style={favoritesOnly ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
          Yêu thích
        </button>
        {activeTab === "Reference" && (
          <select aria-label="Provider" className="au-sel" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
            <option value="all">Mọi provider</option>
            <option value="Kling AI">Kling AI</option>
          </select>
        )}
      </div>
      <span className="au-cnt">{count} mục</span>
    </div>
  );
}

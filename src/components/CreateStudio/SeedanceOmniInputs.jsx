const KINDS = [
  { type: "image", label: "Ảnh tham chiếu", icon: "add_photo_alternate", accept: "image/jpeg,image/png,image/webp,image/heic,image/heif", max: 30 },
  { type: "video", label: "Video tham chiếu", icon: "smart_display", accept: "video/mp4,video/quicktime", max: 10 },
  { type: "audio", label: "Âm thanh tham chiếu", icon: "graphic_eq", accept: "audio/mpeg,audio/mp3,audio/wav,audio/x-wav", max: 10 },
];

const MODES = [
  { value: "reference", label: "Tạo từ tham chiếu" },
  { value: "edit", label: "Chỉnh sửa video" },
  { value: "extend", label: "Kéo dài video" },
];

export default function SeedanceOmniInputs({ mode, onModeChange, assets, valid, uploading, onUpload, onPick, onRemove, onInsertMention }) {
  return <>
    <div className="st-box">
      <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">tune</span></span><span className="g">Cách tạo video</span></p>
      <select className="st-ref-role" aria-label="Cách tạo video Seedance Omni" value={mode} onChange={(event) => onModeChange(event.target.value)}>
        {MODES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      {mode !== "reference" && <p className="st-note">Chọn ít nhất một video và mô tả rõ {mode === "edit" ? "nội dung cần chỉnh sửa" : "cách kéo dài video"} trong prompt.</p>}
      {assets.length > 0 && !valid && <p className="st-note bad">Mỗi video/audio cần dài 2–30 giây (video chỉnh sửa: 4–30 giây); tổng thời lượng mỗi loại tối đa 30 giây.</p>}
    </div>
    {KINDS.map((kind) => {
      const selected = assets.filter((asset) => asset.type === kind.type);
      return <div className="st-box" key={kind.type}>
        <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">{kind.icon}</span></span><span className="g">{kind.label}{kind.type === "video" && mode !== "reference" && <span className="st-required">*</span>}</span><em>{selected.length}/{kind.max}</em></p>
        <div className="st-refs">
          {selected.map((asset) => {
            const mention = `@${kind.type}_${asset.id}`;
            return <div className="st-ref st-element" key={asset.id}>
              {kind.type === "image" && <img src={asset.url} alt={kind.label} />}
              {kind.type === "video" && <video src={asset.url} muted playsInline />}
              {kind.type === "audio" && <span className="material-symbols-outlined st-audio-ref-icon">graphic_eq</span>}
              <button type="button" className="st-element-remove" aria-label={`Gỡ ${kind.label}`} onClick={() => onRemove(asset)}>×</button>
              <button type="button" className="cap st-element-mention" onClick={() => onInsertMention(mention)}>{mention}</button>
            </div>;
          })}
          {selected.length < kind.max && <div className="st-add">
            <label title={`Tải ${kind.label.toLowerCase()}`}><span className={`material-symbols-outlined${uploading ? " au-spin" : ""}`}>{uploading ? "progress_activity" : kind.icon}</span>
              <input type="file" accept={kind.accept} style={{ display: "none" }} disabled={uploading} onChange={(event) => onUpload(event, kind.type)} />
            </label>
            <button type="button" onClick={() => onPick(kind.type)}>Lịch sử</button>
          </div>}
        </div>
        {kind.type === "audio" && selected.length > 0 && <audio controls src={selected.at(-1).url} className="st-omni-audio-preview" />}
      </div>;
    })}
  </>;
}

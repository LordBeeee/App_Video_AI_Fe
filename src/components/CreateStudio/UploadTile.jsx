import { useRef } from "react";

export default function UploadTile({ title, accept, icon, uploading, onChange, onHistory }) {
  const inputRef = useRef(null);

  return <div className="st-add">
    <input ref={inputRef} type="file" accept={accept} disabled={uploading}
      style={{ display: "none" }} onChange={onChange} />
    <button type="button" className="st-add-upload" aria-label={title} title={title}
      disabled={uploading} onClick={() => inputRef.current?.click()}>
      <span className={`material-symbols-outlined${uploading ? " au-spin" : ""}`} aria-hidden="true">
        {uploading ? "progress_activity" : icon}
      </span>
    </button>
    <button type="button" className="st-add-history" onClick={onHistory}>Lịch sử</button>
  </div>;
}

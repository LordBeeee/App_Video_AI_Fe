import { InfoTip } from "../Aurora/AuroraUI";

export default function ReferenceInputs({
  modality,
  options,
  referenceLimit,
  references,
  setReferences,
  uploading,
  uploadReference,
  setReferencePickerOpen,
  elements,
  onRemoveElement,
  setElementPickerOpen,
  onInsertElementMention,
}) {
  const frameMode = modality === "video" && options.referenceMode !== "refer_image";

  return (
    <>
      {referenceLimit > 0 && (
        <div className="st-box">
          <p className="st-lb">
            <span className="ic"><span className="material-symbols-outlined">add_photo_alternate</span></span>
            <span className="g">{frameMode ? "Ảnh khung hình" : "Ảnh tham chiếu"}</span>
          </p>
          <div className="st-refs">
            {references.map((reference, index) => (
              <button
                key={reference.id}
                type="button"
                onClick={() => setReferences((items) => items.filter((_, i) => i !== index))}
                className="st-ref"
              >
                {reference.type === "video" ? (
                  <video src={reference.url} muted />
                ) : (
                  <img src={reference.url} alt="Reference" />
                )}
                <span className="del">Xóa</span>
                {frameMode && <span className="cap">{index === 0 ? "Ảnh đầu" : "Ảnh cuối"}</span>}
              </button>
            ))}
            {references.length < referenceLimit && (
              <div className="st-add">
                <label title={uploading ? "Đang tải ảnh" : "Tải ảnh"}>
                  <span className={`material-symbols-outlined${uploading ? " au-spin" : ""}`} aria-hidden="true">
                    {uploading ? "progress_activity" : "add_photo_alternate"}
                  </span>
                  <input
                    type="file"
                    aria-label="Tải ảnh"
                    accept={modality === "video" ? "image/jpeg,image/png" : "image/*"}
                    className="hidden"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={uploadReference}
                  />
                </label>
                <button type="button" onClick={() => setReferencePickerOpen(true)}>Lịch sử</button>
              </div>
            )}
          </div>
        </div>
      )}
      {elements && (
        <div className="st-box">
          <p className="st-lb">
            <span className="ic"><span className="material-symbols-outlined">bookmark</span></span>
            <span className="g">Ref · Element ({elements.length}/3)</span>
            <InfoTip info="Chọn tối đa 3 Element. Nhấn @element để chèn vào prompt." label="Hướng dẫn Ref Element" tone="dark" />
          </p>
          <div className="st-refs">
            {elements.map((element) => (
              <div className="st-element" key={element.id} title={element.name || `Element ${element.id}`}>
                <img src={element.url} alt={element.name || `Element ${element.id}`} />
                <button type="button" className="st-element-remove" aria-label={`Gỡ ${element.name || `Element ${element.id}`}`} onClick={() => onRemoveElement(element)}>×</button>
                <button type="button" className="st-element-mention" title="Chèn vào prompt" onClick={() => onInsertElementMention(element)}>@element_{element.id}</button>
              </div>
            ))}
            {elements.length < 3 && (
              <button type="button" className="st-add st-element-add" onClick={() => setElementPickerOpen(true)}>
                <span className="material-symbols-outlined">add</span>
                <span>Ref</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

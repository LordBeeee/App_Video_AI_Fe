import { InfoTip } from "../Aurora/AuroraUI";

export default function GenerationInputs({
  modality,
  options,
  referenceLimit,
  references,
  setReferences,
  uploading,
  uploadReference,
  setReferencePickerOpen,
  isOmni,
  requiresFrame,
  onRemoveReference,
  videoReference,
  onRemoveVideoReference,
  onVideoRoleChange,
  setVideoPickerOpen,
  uploadVideoReference,
  elements,
  onRemoveElement,
  setElementPickerOpen,
  onInsertElementMention,
}) {
  const frameMode = modality === "video" && !isOmni && options.referenceMode !== "refer_image";
  const frames = references.filter((reference) => ["first_frame", "last_frame"].includes(reference.role));
  const referenceImages = references.filter((reference) => reference.role === "refer_image");
  const addImage = (target) => (
    <div className="st-add">
      <label title={uploading ? "Đang tải ảnh" : "Tải ảnh"}>
        <span className={`material-symbols-outlined${uploading ? " au-spin" : ""}`} aria-hidden="true">
          {uploading ? "progress_activity" : "add_photo_alternate"}
        </span>
        <input type="file" aria-label={target === "frame" ? "Tải ảnh khung hình" : "Tải ảnh tham chiếu"}
          accept={modality === "video" ? "image/jpeg,image/png" : "image/*"}
          style={{ display: "none" }} disabled={uploading}
          onChange={(event) => uploadReference(event, target)} />
      </label>
      <button type="button" onClick={() => setReferencePickerOpen(target)}>Lịch sử</button>
    </div>
  );
  const imageCard = (reference, label) => (
    <div className="st-ref" key={reference.id}>
      <img src={reference.url} alt={label} />
      <button type="button" className="del" aria-label={`Xóa ${label}`}
        onClick={() => onRemoveReference(reference.id)}>Xóa</button>
      <span className="cap">{label}</span>
    </div>
  );

  return (
    <>
      {isOmni && referenceLimit > 0 && <>
        <div className="st-box">
          <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">add_photo_alternate</span></span><span className="g">Ảnh khung hình</span></p>
          <div className="st-refs">
            {frames.map((reference) => imageCard(reference, reference.role === "first_frame" ? "Ảnh đầu" : "Ảnh cuối"))}
            {frames.length < 2 && references.length < referenceLimit && addImage("frame")}
          </div>
        </div>
        <div className="st-box">
          <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">add_photo_alternate</span></span><span className="g">Ảnh tham chiếu</span><InfoTip info="Ảnh tham chiếu giúp giữ nhân vật, vật thể, bối cảnh hoặc phong cách. Ảnh này không được dùng làm ảnh đầu hay ảnh cuối." label="Hướng dẫn ảnh tham chiếu" tone="dark" /></p>
          <div className="st-refs">
            {referenceImages.map((reference) => imageCard(reference, "Ảnh tham chiếu"))}
            {references.length < referenceLimit && addImage("reference")}
          </div>
        </div>
      </>}
      {!isOmni && referenceLimit > 0 && (
        <div className="st-box">
          <p className="st-lb">
            <span className="ic"><span className="material-symbols-outlined">add_photo_alternate</span></span>
            <span className="g">{frameMode ? "Ảnh khung hình" : "Ảnh tham chiếu"}{frameMode && requiresFrame && <span className="st-required" title="Ảnh đầu bắt buộc; ảnh cuối tùy chọn" aria-label="Ảnh đầu bắt buộc">*</span>}</span>
          </p>
          <div className="st-refs">
            {references.map((reference, index) => (
              <div key={reference.id} className="st-ref"
              >
                {reference.type === "video" ? (
                  <video src={reference.url} muted />
                ) : (
                  <img src={reference.url} alt="Ảnh đầu vào" />
                )}
                <button type="button" className="del" onClick={() => setReferences((items) => items.filter((_, i) => i !== index))}>Xóa</button>
                {frameMode && <span className="cap">{index === 0 ? "Ảnh đầu" : "Ảnh cuối"}</span>}
              </div>
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
                    onChange={(event) => uploadReference(event, "reference")}
                  />
                </label>
                <button type="button" onClick={() => setReferencePickerOpen("reference")}>Lịch sử</button>
              </div>
            )}
          </div>
        </div>
      )}
      {isOmni && <div className="st-box">
        <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">smart_display</span></span><span className="g">Video tham chiếu</span><InfoTip info="Dùng tối đa một video MP4/MOV để tham chiếu đặc điểm hình ảnh hoặc làm video gốc cần chỉnh sửa. Khả năng tạo âm thanh và nhiều cảnh phụ thuộc cách dùng video." label="Hướng dẫn video tham chiếu" tone="dark" /></p>
        {videoReference ? <div className="st-refs"><div className="st-ref st-element"><video src={videoReference.url} muted playsInline /><button type="button" className="st-element-remove" onClick={onRemoveVideoReference}>×</button></div>
          <select className="st-ref-role" aria-label="Cách dùng video" value={videoReference.role} onChange={(event) => onVideoRoleChange(event.target.value)}>
            <option value="feature_video">Tham chiếu đặc điểm</option><option value="base_video">Chỉnh sửa video</option>
          </select></div> : <div className="st-add"><label title="Tải video"><span className="material-symbols-outlined">upload</span><input type="file" accept="video/mp4,video/quicktime" style={{ display: "none" }} disabled={uploading} onChange={uploadVideoReference} /></label><button type="button" onClick={() => setVideoPickerOpen(true)}>Lịch sử</button></div>}
      </div>}
      {elements && (
        <div className="st-box">
          <p className="st-lb">
            <span className="ic"><span className="material-symbols-outlined">bookmark</span></span>
            <span className="g">Element</span>
            <InfoTip info="Chọn tối đa 3 Element. Kéo Element vào prompt hoặc nhấn @element để chèn." label="Hướng dẫn Element" tone="dark" />
          </p>
          <div className="st-refs">
            {elements.map((element) => (
              <div className="st-ref st-element" key={element.id} title={`Kéo vào prompt hoặc nhấn @element_${element.id}`}>
                <div draggable onDragStart={(event) => {
                  event.dataTransfer.clearData();
                  event.dataTransfer.setData("text/plain", `@element_${element.id}`);
                  event.dataTransfer.effectAllowed = "copy";
                }}>
                  {element.type === "video" ? <video src={element.url} muted playsInline /> : <img src={element.url} alt={element.name || `Element ${element.id}`} />}
                </div>
                <button type="button" className="st-element-remove" aria-label={`Gỡ ${element.name || `Element ${element.id}`}`} onClick={() => onRemoveElement(element)}>×</button>
                <button type="button" className="cap st-element-mention" title="Chèn vào prompt" onClick={() => onInsertElementMention(element)}>@element_{element.id}</button>
              </div>
            ))}
            {elements.length < 3 && (
              <button type="button" className="st-add st-element-add" onClick={() => setElementPickerOpen(true)}>
                <span className="material-symbols-outlined">add</span>
                <span>Thêm Element</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

import { InfoTip } from "../Aurora/AuroraUI";
import useUploadLimits from "../../hooks/useUploadLimits";
import { formatUploadLimit } from "../../services/asset.service";
import { dragMention } from "../../utils/createStudio.utils";
import UploadTile from "./UploadTile";

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
  onInsertMention,
}) {
  const uploadLimits = useUploadLimits();
  const frameMode = modality === "video" && !isOmni && options.referenceMode !== "refer_image";
  const frames = references.filter((reference) => ["first_frame", "last_frame"].includes(reference.role));
  const referenceImages = references.filter((reference) => reference.role === "refer_image");
  const frameInfo = `Ảnh JPG/PNG, tải lên tối đa ${formatUploadLimit(Math.min(uploadLimits.image, 10_000_000))}. Chiều rộng và chiều cao đều phải từ 300 px trở lên. ${requiresFrame ? "Ảnh đầu bắt buộc; ảnh cuối tùy chọn." : "Có thể thêm ảnh đầu hoặc ảnh cuối để định hướng video."}`;
  const addImage = (target) => (
    <UploadTile title={target === "frame" ? "Tải ảnh khung hình" : "Tải ảnh tham chiếu"}
      accept={modality === "video" ? "image/jpeg,image/png" : "image/*"}
      icon="add_photo_alternate" uploading={uploading}
      onChange={(event) => uploadReference(event, target)}
      onHistory={() => setReferencePickerOpen(target)} />
  );
  const imageCard = (reference, label) => (
    <div className={`st-ref${isOmni ? " st-mention-ref" : ""}`} key={reference.id}>
      <img src={reference.url} alt={label} draggable={isOmni}
        onDragStart={isOmni ? (event) => dragMention(event, `@image_${reference.id}`) : undefined} />
      <button type="button" className="del" aria-label={`Xóa ${label}`}
        onClick={() => onRemoveReference(reference.id)}>Xóa</button>
      {isOmni ? <button type="button" className="cap st-element-mention" title="Chèn vào prompt"
        onClick={() => onInsertMention(`@image_${reference.id}`)}>{label} · @image_{reference.id}</button>
        : <span className="cap">{label}</span>}
    </div>
  );

  return (
    <>
      {isOmni && referenceLimit > 0 && <>
        <div className="st-box">
          <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">add_photo_alternate</span></span><span className="g">Ảnh khung hình</span><InfoTip info={frameInfo} label="Yêu cầu ảnh khung hình" tone="dark" /></p>
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
            {frameMode && <InfoTip info={frameInfo} label="Yêu cầu ảnh khung hình" tone="dark" />}
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
              <UploadTile title="Tải ảnh" accept={modality === "video" ? "image/jpeg,image/png" : "image/*"}
                icon="add_photo_alternate" uploading={uploading}
                onChange={(event) => uploadReference(event, "reference")}
                onHistory={() => setReferencePickerOpen("reference")} />
            )}
          </div>
        </div>
      )}
      {isOmni && <div className="st-box">
        <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">smart_display</span></span><span className="g">Video tham chiếu</span><InfoTip info="Dùng tối đa một video MP4/MOV để tham chiếu đặc điểm hình ảnh hoặc làm video gốc cần chỉnh sửa. Khả năng tạo âm thanh và nhiều cảnh phụ thuộc cách dùng video." label="Hướng dẫn video tham chiếu" tone="dark" /></p>
        {videoReference ? <div className="st-refs"><div className="st-ref st-element"><div draggable
          onDragStart={(event) => dragMention(event, `@video_${videoReference.id}`)}><video src={videoReference.url} muted playsInline /></div><button type="button" className="st-element-remove" onClick={onRemoveVideoReference}>×</button><button type="button" className="cap st-element-mention" title="Chèn vào prompt" onClick={() => onInsertMention(`@video_${videoReference.id}`)}>@video_{videoReference.id}</button></div>
          <select className="st-ref-role" aria-label="Cách dùng video" value={videoReference.role} onChange={(event) => onVideoRoleChange(event.target.value)}>
            <option value="feature_video">Tham chiếu đặc điểm</option><option value="base_video">Chỉnh sửa video</option>
          </select></div> : <UploadTile title="Tải video" accept="video/mp4,video/quicktime"
            icon="upload" uploading={uploading} onChange={uploadVideoReference}
            onHistory={() => setVideoPickerOpen(true)} />}
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
                <div draggable onDragStart={(event) => dragMention(event, `@element_${element.id}`)}>
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

import { InfoTip } from "../Aurora/AuroraUI";
import useUploadLimits from "../../hooks/useUploadLimits";
import { formatUploadLimit } from "../../services/asset.service";
import { MenuSelect } from "./OptionFields";
import { dragMention } from "../../utils/createStudio.utils";

const KINDS = [
  { type: "image", label: "Ảnh tham chiếu", icon: "add_photo_alternate", accept: "image/jpeg,image/png,image/webp,image/heic,image/heif", limit: "maxReferenceImages" },
  { type: "video", label: "Video tham chiếu", icon: "smart_display", accept: "video/mp4,video/quicktime", limit: "maxReferenceVideos" },
  { type: "audio", label: "Âm thanh tham chiếu", icon: "graphic_eq", accept: "audio/mpeg,audio/mp3,audio/wav,audio/x-wav", limit: "maxReferenceAudios" },
];

const MODES = [
  { value: "reference", label: "Tạo từ tham chiếu" },
  { value: "edit", label: "Chỉnh sửa video" },
  { value: "extend", label: "Kéo dài video" },
];

const MODE_INFO = {
  reference: "Chọn ít nhất một ảnh hoặc video tham chiếu; có thể thêm âm thanh. Có thể chọn tỷ lệ khung hình và thời lượng đầu ra.",
  edit: "Chọn ít nhất một video dài 4–30 giây và mô tả rõ phần cần sửa. Tỷ lệ khung hình theo video gốc; thời lượng đầu ra tự động.",
  extend: "Chọn ít nhất một video và mô tả rõ cách kéo dài về trước hoặc sau. Tỷ lệ khung hình theo video được kéo dài.",
};

const MODE_INFO_20 = {
  reference: "Chọn ít nhất một ảnh hoặc video; có thể thêm âm thanh. Mô tả video mới và nêu rõ tài nguyên nào dùng làm tham chiếu.",
  edit: "Chọn video gốc và viết rõ nội dung cần thêm, xóa hoặc thay đổi trong video đó.",
  extend: "Chọn video gốc và viết rõ muốn kéo dài về trước hay sau, cùng nội dung cần tạo thêm.",
};

export default function SeedanceOmniInputs({ mode, onModeChange, assets, errors, uploading, onUpload, onPick, onRemove, onInsertMention, capabilities, isSeedance25 }) {
  const uploadLimits = useUploadLimits();
  const videoSeconds = capabilities.maxReferenceVideoSeconds || 30;
  const audioSeconds = capabilities.maxReferenceAudioSeconds || 30;
  const info = {
    image: `Tối đa ${capabilities.maxReferenceImages} ảnh tham chiếu. Ảnh tải lên tối đa ${formatUploadLimit(Math.min(uploadLimits.image, 10_000_000))}, kích thước mỗi chiều 300–6.000 px và tỷ lệ rộng/cao từ 0,4 đến 2,5.`,
    video: `Tối đa ${capabilities.maxReferenceVideos} video MP4/MOV, tổng thời lượng không quá ${videoSeconds} giây. Mỗi video dài 2–${videoSeconds} giây${isSeedance25 ? "; khi chỉnh sửa cần dài 4–30 giây" : ""}. Mỗi file tối đa ${formatUploadLimit(Math.min(uploadLimits.video, 200_000_000))}.`,
    audio: `Âm thanh dùng kèm ảnh hoặc video tham chiếu. Tối đa ${capabilities.maxReferenceAudios} tệp MP3/WAV, mỗi tệp dài 2–${audioSeconds} giây và tối đa ${formatUploadLimit(Math.min(uploadLimits.audio, 15_000_000))}. Tổng thời lượng không quá ${audioSeconds} giây.`,
  };
  return <>
    <div className="st-box">
      <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">tune</span></span><span className="g">Mục đích tạo video</span><InfoTip info={isSeedance25 ? MODE_INFO[mode] : MODE_INFO_20[mode]} label="Hướng dẫn cách tạo video Seedance Omni" tone="dark" /></p>
      <MenuSelect label="Cách tạo video Seedance Omni" icon="movie_edit" value={mode} onChange={onModeChange} options={MODES} />
      {errors.length > 0 && <div role="alert" className="st-omni-errors">
        {errors.map((error) => <p className="st-note bad" key={error}>{error}</p>)}
      </div>}
    </div>
    {KINDS.map((kind) => {
      const max = capabilities[kind.limit] || 0;
      const selected = assets.filter((asset) => asset.type === kind.type);
      return <div className="st-box" key={kind.type}>
        <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">{kind.icon}</span></span><span className="g">{kind.label}{(kind.type === "video" || (kind.type === "image" && mode === "reference")) && <span className="st-required" title={mode === "reference" ? "Cần ít nhất một ảnh hoặc video tham chiếu" : "Cần ít nhất một video tham chiếu"} aria-label={mode === "reference" ? "Cần ít nhất một ảnh hoặc video tham chiếu" : "Cần ít nhất một video tham chiếu"}>*</span>}</span><InfoTip info={info[kind.type]} label={`Giới hạn ${kind.label.toLowerCase()}`} tone="dark" /><em>{selected.length}/{max}</em></p>
        <div className="st-refs">
          {selected.map((asset) => {
            const mention = `@${kind.type}_${asset.id}`;
            return <div className="st-ref st-element" key={asset.id} title={`Kéo vào prompt hoặc nhấn ${mention}`}>
              <div draggable onDragStart={(event) => dragMention(event, mention)}>
                {kind.type === "image" && <img src={asset.url} alt={kind.label} draggable={false} />}
                {kind.type === "video" && <video src={asset.url} muted playsInline />}
                {kind.type === "audio" && <span className="material-symbols-outlined st-audio-ref-icon">graphic_eq</span>}
              </div>
              <button type="button" className="st-element-remove" aria-label={`Gỡ ${kind.label}`} onClick={() => onRemove(asset)}>×</button>
              <button type="button" className="cap st-element-mention" onClick={() => onInsertMention(mention)}>{mention}</button>
            </div>;
          })}
          {selected.length < max && <div className="st-add">
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

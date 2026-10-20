import GenerationOptions from "./GenerationOptions";
import { videoAspectRatioApplies } from "../../utils/createStudio.utils";

const money = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} ₫`;

export default function GenerationControls({ modality, options, capabilities, model, setOptions, setReferences, videoReference, quote, quoteError, generating, prompt, references, requiresReference = true, ready, onGenerate }) {
  const label = modality === "image" ? "ảnh" : modality === "video" ? "video" : "audio";
  const videoSettings = modality === "video" ? [
    ...(videoAspectRatioApplies(capabilities, references, videoReference) && options.aspectRatio ? [options.aspectRatio] : []),
    options.resolution || "Độ phân giải",
    `${options.duration || 5}s`,
    capabilities.nativeAudioIncluded ? "Có âm thanh mặc định"
      : capabilities.referenceVideos && options.audioMode === "original" ? "Giữ âm thanh gốc"
      : (capabilities.referenceVideos ? options.audioMode === "native" : options.generateAudio) ? "Có âm thanh" : "Tắt âm thanh",
  ].join(" · ") : "";

  return (
    <div className="st-foot">
      <div className={modality === "video" && capabilities.multiShot ? "st-video-tools" : undefined}>
        <details className="st-det" key={`${modality}:${model?.id || ""}`}>
          <summary className="st-sum">
          <span className="au-hic"><span className="material-symbols-outlined">tune</span></span>
          <span className="t">
            <b>{modality === "video" && capabilities.multiShot ? "Cài đặt" : `Cài đặt ${modality === "image" ? "ảnh" : modality === "video" ? "video" : "audio"}`}</b>
            <span className="s">
              {modality === "video" && (
                <span>{videoSettings}</span>
              )}
              {modality === "image" && (
                <>
                  {options.aspectRatio && <span>{options.aspectRatio}</span>}
                  {options.resolution && <span>· {options.resolution}</span>}
                  {options.quality && <span>· {options.quality}</span>}
                  {options.n && <span>· {options.n} ảnh</span>}
                </>
              )}
              {modality === "audio" && (
                <>
                  {options.voice && <span>{options.voice}</span>}
                  {options.speed && <span>· {options.speed}x</span>}
                </>
              )}
            </span>
          </span>
          <span className="material-symbols-outlined">expand_more</span>
          </summary>
          <div className={`st-det-in${modality === "video" ? " st-video-det-in" : ""}`}>
            <GenerationOptions modality={modality} options={options} capabilities={capabilities} model={model} setOptions={setOptions} setReferences={setReferences} references={references} videoReference={videoReference} />
          </div>
        </details>
        {modality === "video" && capabilities.multiShot && (
          <div className="st-multi">
            <button
              type="button"
              className={`st-multi-toggle${options.multiShot ? " on" : ""}`}
              aria-pressed={!!options.multiShot}
              disabled={!!videoReference}
              title={videoReference ? "Chế độ nhiều cảnh được cố định theo loại video tham chiếu" : undefined}
              onClick={() => setOptions((current) => ({ ...current, multiShot: !current.multiShot, customShots: false, shots: [] }))}
            >
              <span className="st-multi-switch" /> Nhiều cảnh
            </button>
            <button
              type="button"
              className={`st-multi-custom${options.customShots ? " on" : ""}`}
              disabled={!options.multiShot}
              aria-pressed={!!options.customShots}
              onClick={() => setOptions((current) => ({
                ...current,
                customShots: !current.customShots,
                shots: current.customShots ? [] : [
                  { prompt: "", duration: 2 },
                  { prompt: "", duration: Number(current.duration || 5) - 2 },
                ],
              }))}
            >
              Tùy chỉnh
            </button>
          </div>
        )}
      </div>

      {quoteError && <p className="st-note">{quoteError}</p>}

      <div className="st-bar">
        <div className="st-price">
          <small>Tạm tính</small>
          <b className={quote ? "" : "none"} title={quote ? money(quote.maxPriceVnd) : "Chưa có báo giá"}>
            {quote ? money(quote.maxPriceVnd) : "— ₫"}
          </b>
          {quote && quote.minPriceVnd !== quote.maxPriceVnd && <span>Từ {money(quote.minPriceVnd)}</span>}
        </div>
        <button
          type="button"
          className="au-btn solid st-go"
          disabled={!quote || generating || !prompt.trim() || !ready || (modality === "video" && requiresReference && !references.length)}
          onClick={onGenerate}
        >
          <span className="material-symbols-outlined">bolt</span>
          {generating ? "Đang xử lý..." : `Tạo ${label}`}
        </button>
      </div>
    </div>
  );
}

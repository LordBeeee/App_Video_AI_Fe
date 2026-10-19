import GenerationOptions from "./GenerationOptions";

const money = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} ₫`;

export default function GenerationControls({ modality, options, capabilities, model, setOptions, setReferences, quote, quoteError, generating, prompt, references, onGenerate }) {
  const label = modality === "image" ? "ảnh" : modality === "video" ? "video" : "audio";

  return (
    <div className="st-foot">
      <details className="st-det" key={`${modality}:${model?.id || ""}`}>
        <summary className="st-sum">
          <span className="au-hic"><span className="material-symbols-outlined">tune</span></span>
          <span className="t">
            <b>Cài đặt {modality === "image" ? "ảnh" : modality === "video" ? "video" : "audio"}</b>
            <span className="s">
              {modality === "video" && (
                <span>
                  {options.aspectRatio && `${options.aspectRatio} · `}
                  {options.resolution || "Độ phân giải"} · {options.duration || 5}s
                  {capabilities.nativeAudioIncluded && " · Có âm thanh"}
                  {capabilities.generateAudio && (options.generateAudio ? " · Có âm thanh" : " · Tắt âm thanh")}
                  {capabilities.multiShot && options.multiShot && " · Nhiều cảnh"}
                </span>
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
        <div className="st-det-in">
          <GenerationOptions modality={modality} options={options} capabilities={capabilities} model={model} setOptions={setOptions} setReferences={setReferences} />
        </div>
      </details>

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
          disabled={!quote || generating || !prompt.trim() || (modality === "video" && !references.length)}
          onClick={onGenerate}
        >
          <span className="material-symbols-outlined">bolt</span>
          {generating ? "Đang xử lý..." : `Tạo ${label}`}
        </button>
      </div>
    </div>
  );
}

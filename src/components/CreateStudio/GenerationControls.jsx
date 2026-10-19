import { useEffect, useRef, useState } from "react";
import GenerationOptions from "./GenerationOptions";

const money = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} ₫`;

export default function GenerationControls({ modality, selectedModel, options, capabilities, model, setOptions, setReferences, quote, quoteError, generating, prompt, references, onGenerate }) {
  const [videoSettingsOpen, setVideoSettingsOpen] = useState(false);
  const videoSettingsRef = useRef(null);

  useEffect(() => {
    if (!videoSettingsOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!videoSettingsRef.current?.contains(event.target)) {
        setVideoSettingsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setVideoSettingsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [videoSettingsOpen]);

  useEffect(() => {
    setVideoSettingsOpen(false);
  }, [modality, selectedModel]);

  const label = modality === "image" ? "ảnh" : modality === "video" ? "video" : "audio";

  return (
    <div className="st-foot">
      {modality === "video" ? (
        <div ref={videoSettingsRef} style={{ position: "relative" }}>
          {videoSettingsOpen && (
            <div id="video-settings-panel" className="st-pop">
              <div className="st-pop-h">
                <h2 className="au-fd">Cài đặt video</h2>
                <button type="button" className="au-ico" aria-label="Đóng cài đặt video" onClick={() => setVideoSettingsOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <GenerationOptions modality={modality} options={options} capabilities={capabilities} model={model} setOptions={setOptions} setReferences={setReferences} />
            </div>
          )}
          <button
            type="button"
            aria-expanded={videoSettingsOpen}
            aria-controls="video-settings-panel"
            onClick={() => setVideoSettingsOpen((open) => !open)}
            className={`st-trig${videoSettingsOpen ? " on" : ""}`}
          >
            <span className="au-hic"><span className="material-symbols-outlined">tune</span></span>
            <span className="t">
              {options.aspectRatio && `${options.aspectRatio} · `}
              {options.resolution || "Độ phân giải"} · {options.duration || 5}s
              {capabilities.nativeAudioIncluded && " · Có âm thanh"}
              {capabilities.generateAudio && (options.generateAudio ? " · Có âm thanh" : " · Tắt âm thanh")}
              {capabilities.multiShot && options.multiShot && " · Nhiều cảnh"}
            </span>
            <span className="material-symbols-outlined">
              {videoSettingsOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
            </span>
          </button>
        </div>
      ) : (
        <details className="st-det">
          <summary className="st-sum">
            <span className="au-hic"><span className="material-symbols-outlined">tune</span></span>
            <span className="t">
              <b>Cài đặt {modality === "image" ? "ảnh" : "audio"}</b>
              <span className="s">
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
      )}

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

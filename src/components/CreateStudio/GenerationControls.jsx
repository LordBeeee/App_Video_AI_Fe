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

  return (
    <div className="space-y-2 border-t border-outline-variant bg-white p-3 sm:p-4">
      {modality === "video" ? (
        <div ref={videoSettingsRef} className="relative">
          {videoSettingsOpen && (
            <div
              id="video-settings-panel"
              className="absolute bottom-[calc(100%+0.75rem)] left-0 z-30 max-h-[min(65vh,480px)] w-[min(440px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-outline-variant bg-white p-4 shadow-[0_18px_55px_rgba(92,55,24,0.18)] sm:p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-on-surface">Cài đặt video</h2>
                <button
                  type="button"
                  aria-label="Đóng cài đặt video"
                  onClick={() => setVideoSettingsOpen(false)}
                  className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-variant"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
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
            className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left transition ${
              videoSettingsOpen
                ? "border-primary bg-primary-container/60"
                : "border-outline-variant bg-surface-container-low hover:border-primary/50"
            }`}
          >
            <span className="material-symbols-outlined text-xl text-primary">tune</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">
              {options.aspectRatio && `${options.aspectRatio} · `}
              {options.resolution || "Độ phân giải"} · {options.duration || 5}s
              {capabilities.nativeAudioIncluded && " · Có âm thanh"}
              {capabilities.generateAudio && (options.generateAudio ? " · Có âm thanh" : " · Tắt âm thanh")}
              {capabilities.multiShot && options.multiShot && " · Nhiều cảnh"}
            </span>
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              {videoSettingsOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
            </span>
          </button>
        </div>
      ) : (
      <details className="group rounded-2xl border border-outline-variant bg-surface-container-low shadow-[0_6px_20px_rgba(92,55,24,0.05)]">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-2xl px-3 py-2.5 transition hover:bg-primary-container/40 [&::-webkit-details-marker]:hidden">
          <span className="material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container text-[19px] text-primary">
            tune
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-on-surface">
              Cài đặt {modality === "image" ? "ảnh" : "audio"}
            </span>
            <span className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-slate-500">
              {modality === "image" && (
                <>
                  {options.aspectRatio && <span className="truncate">{options.aspectRatio}</span>}
                  {options.resolution && <span className="truncate">· {options.resolution}</span>}
                  {options.quality && <span className="truncate">· {options.quality}</span>}
                  {options.n && <span className="truncate">· {options.n} ảnh</span>}
                </>
              )}
              {modality === "audio" && (
                <>
                  {options.voice && <span className="truncate">{options.voice}</span>}
                  {options.speed && <span className="truncate">· {options.speed}x</span>}
                </>
              )}
            </span>
          </span>
          <span className="material-symbols-outlined shrink-0 text-xl text-slate-500 transition-transform duration-200 group-open:rotate-180">
            expand_more
          </span>
        </summary>
        <div className="max-h-[36vh] overflow-y-auto border-t border-outline-variant p-3">
          <GenerationOptions modality={modality} options={options} capabilities={capabilities} model={model} setOptions={setOptions} setReferences={setReferences} />
        </div>
      </details>
      )}

      {quoteError && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {quoteError}
        </p>
      )}

      <div className="grid grid-cols-[minmax(112px,0.85fr)_minmax(0,1.45fr)] gap-2">
        <div className="flex min-h-14 min-w-0 flex-col justify-center rounded-xl border border-outline-variant bg-surface-container-low px-3 shadow-[0_2px_8px_rgba(92,55,24,0.04)]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Tạm tính
          </span>
          <span
            className={`mt-0.5 truncate text-sm font-bold ${quote ? "text-primary-hover" : "text-slate-400"}`}
            title={quote ? money(quote.maxPriceVnd) : "Chưa có báo giá"}
          >
            {quote ? money(quote.maxPriceVnd) : "— ₫"}
          </span>
          {quote && quote.minPriceVnd !== quote.maxPriceVnd && (
            <span className="truncate text-[10px] text-slate-500">
              Từ {money(quote.minPriceVnd)}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!quote || generating || !prompt.trim() || (modality === "video" && !references.length)}
          onClick={onGenerate}
          className="flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-xl bg-primary px-3 font-semibold text-on-primary shadow-[0_8px_20px_rgba(243,136,32,0.22)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-container-highest disabled:text-outline"
        >
          <span className="material-symbols-outlined text-[21px]">
            bolt
          </span>
          <span className="truncate">
            {generating
              ? "Đang xử lý..."
              : `Tạo ${modality === "image" ? "ảnh" : modality === "video" ? "video" : "audio"}`}
          </span>
        </button>
      </div>
    </div>
  );
}

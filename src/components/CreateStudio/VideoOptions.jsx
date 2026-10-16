import { FieldSelect, SeedField } from "./OptionFields";

export default function VideoOptions({ options, capabilities, setOption, setOptions, setReferences }) {
  return (
        <div className="grid grid-cols-12 gap-2">
          {(!capabilities.referenceModes || options.referenceMode === "refer_image") && (
            <FieldSelect
              label="Tỷ lệ"
              icon="aspect_ratio"
              value={options.aspectRatio || ""}
              onChange={(v) =>
                setOptions((current) => ({
                  ...current,
                  aspectRatio: v,
                  size: "",
                }))
              }
              options={capabilities.aspectRatios || []}
              className="col-span-4"
            />
          )}
          {capabilities.referenceModes?.length > 0 && (
            <FieldSelect
              label="Cách dùng ảnh"
              icon="photo_library"
              value={options.referenceMode || "first_frame"}
              onChange={(v) => {
                setOption("referenceMode", v);
                if (v === "first_frame") setReferences((items) => items.slice(0, 2));
              }}
              options={capabilities.referenceModes}
              className="col-span-6"
            />
          )}
          {capabilities.multiShot && (
            <label className="col-span-6 flex min-h-12 items-center gap-2 rounded-xl border border-outline-variant bg-white px-3 text-xs font-semibold text-on-surface">
              <input
                type="checkbox"
                checked={!!options.multiShot}
                onChange={(event) => setOption("multiShot", event.target.checked)}
                className="accent-primary"
              />
              Nhiều cảnh
            </label>
          )}
          {capabilities.resolutions?.length > 0 && (
            <div className="col-span-12">
              <p className="mb-2 text-xs font-semibold text-on-surface-variant">Độ phân giải</p>
              <div className="flex gap-1 rounded-xl bg-surface-variant p-1">
                {capabilities.resolutions.map((resolution) => (
                  <button
                    key={resolution}
                    type="button"
                    aria-pressed={options.resolution === resolution}
                    onClick={() =>
                      setOptions((current) => ({ ...current, resolution, size: "" }))
                    }
                    className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-semibold transition ${
                      options.resolution === resolution
                        ? "bg-white text-primary-hover shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {resolution}
                  </button>
                ))}
              </div>
            </div>
          )}
          {capabilities.seed && (
            <SeedField
              value={options.seed}
              onChange={(v) => setOption("seed", v)}
              className="col-span-4"
            />
          )}
          {capabilities.durations?.length > 0 && (
            <div className="col-span-12 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                <span>Thời lượng</span>
                <span className="rounded-lg bg-primary-container px-2.5 py-1 text-sm text-primary-hover">
                  {options.duration}s
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  aria-label="Thời lượng video"
                  min="0"
                  max={capabilities.durations.length - 1}
                  step="1"
                  disabled={capabilities.durations.length === 1}
                  value={Math.max(
                    0,
                    capabilities.durations.findIndex(
                      (duration) =>
                        String(duration) === String(options.duration),
                    ),
                  )}
                  onChange={(event) =>
                    setOption(
                      "duration",
                      capabilities.durations[Number(event.target.value)],
                    )
                  }
                  className="h-2 min-w-0 flex-1 cursor-pointer accent-primary disabled:cursor-default disabled:opacity-50"
                />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-on-surface-variant">
                <span>{capabilities.durations[0]}s</span>
                <span>{capabilities.durations.at(-1)}s</span>
              </div>
            </div>
          )}
          {capabilities.nativeAudioIncluded && (
            <p className="col-span-12 flex items-center gap-2 rounded-xl bg-primary-container/70 px-3 py-2.5 text-xs text-on-primary-container">
              <span className="material-symbols-outlined text-[18px]">volume_up</span>
              Model này tạo âm thanh mặc định.
            </p>
          )}
          <FieldSelect
            label="Kích thước"
            icon="crop_free"
            value={options.size || ""}
            onChange={(v) =>
              setOptions((current) => ({
                ...current,
                size: v,
                resolution: "",
                aspectRatio: "",
              }))
            }
            options={capabilities.sizes || []}
            emptyLabel="Theo tỷ lệ và độ phân giải"
            className={
              capabilities.generateAudio ? "col-span-10" : "col-span-12"
            }
          />
          {capabilities.generateAudio && (
            <button
              type="button"
              aria-label={
                options.generateAudio ? "Tắt âm thanh" : "Bật âm thanh"
              }
              aria-pressed={options.generateAudio}
              title={options.generateAudio ? "Tắt âm thanh" : "Bật âm thanh"}
              onClick={() =>
                setOption("generateAudio", !options.generateAudio)
              }
              className={`col-span-2 flex min-h-12 items-center justify-center rounded-xl border shadow-[0_2px_8px_rgba(92,55,24,0.04)] transition hover:-translate-y-0.5 ${options.generateAudio ? "border-primary bg-primary text-on-primary shadow-[0_6px_16px_rgba(243,136,32,0.22)]" : "border-outline-variant bg-white text-slate-500 hover:border-primary/40 hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-[21px]">
                {options.generateAudio ? "volume_up" : "volume_off"}
              </span>
            </button>
          )}
        </div>
      );
}

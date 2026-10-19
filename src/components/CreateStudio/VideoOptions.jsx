import { FieldSelect, SeedField } from "./OptionFields";

export default function VideoOptions({ options, capabilities, setOption, setOptions, setReferences, videoReference }) {
  return (
        <div className="st-g g12">
          {(!capabilities.referenceModes || capabilities.referenceVideos || options.referenceMode === "refer_image") && (
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
              className="c4"
            />
          )}
          {!capabilities.referenceVideos && capabilities.referenceModes?.length > 0 && (
            <FieldSelect
              label="Cách dùng ảnh"
              icon="photo_library"
              value={options.referenceMode || "first_frame"}
              onChange={(v) => {
                setOption("referenceMode", v);
                if (v === "first_frame") setReferences((items) => items.slice(0, 2));
              }}
              options={capabilities.referenceModes}
              className="c6"
            />
          )}
          {capabilities.resolutions?.length > 0 && (
            <div className="c12">
              <p className="st-lb"><span className="g">Độ phân giải</span></p>
              <div className="au-pills st-seg">
                {capabilities.resolutions.map((resolution) => (
                  <button
                    key={resolution}
                    type="button"
                    aria-pressed={options.resolution === resolution}
                    onClick={() =>
                      setOptions((current) => ({ ...current, resolution, size: "" }))
                    }
                    className={`au-pill${options.resolution === resolution ? " on" : ""}`}
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
              className="c4"
            />
          )}
          {capabilities.durations?.length > 0 && (
            <div className="c12">
              <div className="st-row">
                <span>Thời lượng</span>
                <span className="st-chip">{options.duration}s</span>
              </div>
              <div>
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
                  className="st-range"
                />
              </div>
              <div className="st-ends">
                <span>{capabilities.durations[0]}s</span>
                <span>{capabilities.durations.at(-1)}s</span>
              </div>
            </div>
          )}
          {capabilities.nativeAudioIncluded && (
            <p className="st-note c12">
              <span className="material-symbols-outlined">volume_up</span>
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
              capabilities.generateAudio ? "c10" : "c12"
            }
          />
          {capabilities.referenceVideos && <FieldSelect
            label="Âm thanh" icon="volume_up" value={options.audioMode || "off"}
            onChange={(value) => setOptions((current) => ({ ...current, audioMode: value, generateAudio: value === "native" }))}
            options={videoReference?.role === "base_video" ? ["off", "original"] : videoReference ? ["off"] : ["off", "native"]}
            className="c10"
          />}
          {capabilities.generateAudio && !capabilities.referenceVideos && (
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
              className={`st-sw c2${options.generateAudio ? " on" : ""}`}
            >
              <span className="material-symbols-outlined">
                {options.generateAudio ? "volume_up" : "volume_off"}
              </span>
            </button>
          )}
        </div>
      );
}

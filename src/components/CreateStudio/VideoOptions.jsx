import { FieldSelect, SeedField } from "./OptionFields";
import { videoAspectRatioApplies } from "../../utils/createStudio.utils";

const RATIO_SHAPES = {
  "21:9": [28, 12],
  "16:9": [28, 16],
  "4:3": [24, 18],
  "1:1": [20, 20],
  "3:4": [18, 24],
  "9:16": [14, 25],
};

export default function VideoOptions({ options, capabilities, setOption, setOptions, setReferences, references, videoReference }) {
  const showAspectRatio = capabilities.omniTaskTypes
    ? !capabilities.locksOmniOutput || options.omniTaskType === "reference"
    : videoAspectRatioApplies(capabilities, references, videoReference);
  const audioChoices = capabilities.referenceVideos
    ? videoReference?.role === "base_video" ? ["off", "original"]
      : videoReference ? ["off"] : ["off", "native"]
    : capabilities.generateAudio ? ["off", "native"] : [];
  const selectedAudio = capabilities.referenceVideos
    ? options.audioMode || "off" : options.generateAudio ? "native" : "off";
  const audioLabels = {
    off: "Tắt âm thanh",
    native: "Bật âm thanh",
    original: "Giữ âm thanh gốc",
  };
  const setAudio = (value) => {
    if (capabilities.referenceVideos) {
      setOptions((current) => ({ ...current, audioMode: value, generateAudio: value === "native" }));
    } else {
      setOption("generateAudio", value === "native");
    }
  };

  return (
    <div className="st-g g12 st-video-options">
      {!capabilities.referenceVideos && capabilities.referenceModes?.length > 0 && (
        <FieldSelect
          label="Cách dùng ảnh"
          icon="photo_library"
          value={options.referenceMode || "first_frame"}
          onChange={(value) => {
            setOption("referenceMode", value);
            if (value === "first_frame") setReferences((items) => items.slice(0, 2));
          }}
          options={capabilities.referenceModes}
          className="c12"
        />
      )}
      {showAspectRatio && (
        <div className="c12">
          <p className="st-lb"><span className="g">Tỷ lệ khung hình</span></p>
          <div className="st-ratio-grid" role="group" aria-label="Tỷ lệ khung hình">
            {capabilities.aspectRatios.map((ratio) => (
              <button
                key={ratio}
                type="button"
                className={`st-ratio-option${(options.aspectRatio || "adaptive") === ratio ? " on" : ""}`}
                aria-pressed={(options.aspectRatio || "adaptive") === ratio}
                onClick={() => setOptions((current) => ({ ...current, aspectRatio: ratio, size: "" }))}
              >
                {ratio === "adaptive"
                  ? <span className="material-symbols-outlined" aria-hidden="true">crop_free</span>
                  : <span className="st-ratio-shape" aria-hidden="true" style={{ width: RATIO_SHAPES[ratio]?.[0], height: RATIO_SHAPES[ratio]?.[1] }} />}
                <span>{ratio === "adaptive" ? "Tự động" : ratio}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {capabilities.locksOmniOutput && options.omniTaskType !== "reference" && (
        <p className="st-note c12">Tỷ lệ khung hình: adaptive, theo video được chọn.</p>
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
                onClick={() => setOptions((current) => ({ ...current, resolution, size: "" }))}
                className={`au-pill${options.resolution === resolution ? " on" : ""}`}
              >
                {resolution}
              </button>
            ))}
          </div>
        </div>
      )}
      {capabilities.locksOmniOutput && options.omniTaskType === "edit" ? (
        <p className="st-note c12">Thời lượng: tự động theo video gốc.</p>
      ) : capabilities.durations?.length > 0 && (
        <div className="c12">
          <div className="st-row">
            <span>Thời lượng</span>
            <span className="st-chip">{options.duration === -1 ? "Tự động" : `${options.duration}s`}</span>
          </div>
          <input
            type="range"
            aria-label="Thời lượng video"
            min="0"
            max={capabilities.durations.length - 1}
            step="1"
            disabled={capabilities.durations.length === 1}
            value={Math.max(0, capabilities.durations.findIndex((duration) => String(duration) === String(options.duration)))}
            onChange={(event) => setOption("duration", capabilities.durations[Number(event.target.value)])}
            className="st-range"
          />
          <div className="st-ends">
            <span>{capabilities.durations[0] === -1 ? "Tự động" : `${capabilities.durations[0]}s`}</span>
            <span>{capabilities.durations.at(-1)}s</span>
          </div>
        </div>
      )}
      <div className="c12">
        <p className="st-lb"><span className="g">Âm thanh</span></p>
        {capabilities.nativeAudioIncluded ? (
          <p className="st-note st-video-audio-note">
            <span className="material-symbols-outlined">volume_up</span>
            Có âm thanh mặc định
          </p>
        ) : audioChoices.length === 1 ? (
          <p className="st-note st-video-audio-note">
            <span className="material-symbols-outlined">volume_off</span>
            Tắt âm thanh khi dùng video tham chiếu đặc điểm
          </p>
        ) : (
          <div className="au-pills st-seg">
            {audioChoices.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={selectedAudio === value}
                onClick={() => setAudio(value)}
                className={`au-pill${selectedAudio === value ? " on" : ""}`}
              >
                {audioLabels[value]}
              </button>
            ))}
          </div>
        )}
      </div>
      <FieldSelect
        label="Kích thước"
        icon="crop_free"
        value={options.size || ""}
        onChange={(value) => setOptions((current) => ({
          ...current, size: value, resolution: "", aspectRatio: "",
        }))}
        options={capabilities.sizes || []}
        emptyLabel="Theo tỷ lệ và độ phân giải"
        className="c12"
      />
      {capabilities.seed && (
        <SeedField value={options.seed} onChange={(value) => setOption("seed", value)} className="c12" />
      )}
    </div>
  );
}

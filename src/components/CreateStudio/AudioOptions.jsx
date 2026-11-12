import { MenuSelect } from "./OptionFields";

export default function AudioOptions({ options, model, setOption }) {
  return (
      <div className="st-g g6">
        <MenuSelect
          label="Giọng đọc"
          icon="record_voice_over"
          value={options.voice || ""}
          onChange={(v) => setOption("voice", v)}
          options={model?.voices || []}
          className="c4 st-choice-up"
        />
        <MenuSelect
          label="Tốc độ"
          icon="speed"
          value={options.speed || 1}
          onChange={(v) => setOption("speed", Number(v))}
          options={model?.capabilities?.speeds || []}
          className="c2 st-choice-up"
        />
      </div>
    );
}

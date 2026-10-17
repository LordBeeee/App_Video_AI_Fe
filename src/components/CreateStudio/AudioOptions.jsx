import { FieldSelect } from "./OptionFields";

export default function AudioOptions({ options, model, setOption }) {
  return (
      <div className="st-g g6">
        <FieldSelect
          label="Giọng đọc"
          icon="record_voice_over"
          value={options.voice || ""}
          onChange={(v) => setOption("voice", v)}
          options={model?.voices || []}
          className="c4"
        />
        <FieldSelect
          label="Tốc độ"
          icon="speed"
          value={options.speed || 1}
          onChange={(v) => setOption("speed", Number(v))}
          options={[0.75, 1, 1.25, 1.5]}
          className="c2"
        />
      </div>
    );
}

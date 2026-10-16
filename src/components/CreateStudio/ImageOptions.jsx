import { FieldSelect, SeedField } from "./OptionFields";
import { values } from "../../utils/createStudio.utils";

export default function ImageOptions({ options, capabilities, setOption }) {
  return (
        <div className="grid grid-cols-6 gap-2">
          <FieldSelect
            label="Tỷ lệ"
            icon="aspect_ratio"
            value={options.aspectRatio || ""}
            onChange={(v) => setOption("aspectRatio", v)}
            options={values(capabilities, "aspect_ratio")}
            className="col-span-2"
          />
          <FieldSelect
            label="Độ phân giải"
            icon="high_quality"
            value={options.resolution || ""}
            onChange={(v) => setOption("resolution", v)}
            options={values(capabilities, "resolution")}
            className="col-span-2"
          />
          <FieldSelect
            label="Chất lượng"
            icon="auto_awesome"
            value={options.quality || ""}
            onChange={(v) => setOption("quality", v)}
            options={values(capabilities, "quality")}
          />
          <FieldSelect
            label="Định dạng"
            icon="image"
            value={options.outputFormat || ""}
            onChange={(v) => setOption("outputFormat", v)}
            options={values(capabilities, "output_format")}
          />
          <FieldSelect
            label="Số lượng"
            icon="stacks"
            value={options.n || 1}
            onChange={(v) => setOption("n", Number(v))}
            options={values(capabilities, "n")}
            className="col-span-2"
          />
          {Object.hasOwn(capabilities, "seed") && (
            <SeedField
              value={options.seed}
              onChange={(v) => setOption("seed", v)}
              className="col-span-6"
            />
          )}
        </div>
      );
}

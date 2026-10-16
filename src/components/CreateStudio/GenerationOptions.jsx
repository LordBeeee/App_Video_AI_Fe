import ImageOptions from "./ImageOptions";
import VideoOptions from "./VideoOptions";
import AudioOptions from "./AudioOptions";

export default function GenerationOptions({ modality, options, capabilities, model, setOptions, setReferences }) {
  const setOption = (key, value) =>
    setOptions((current) => ({ ...current, [key]: value }));

  if (modality === "image") {
    return <ImageOptions options={options} capabilities={capabilities} setOption={setOption} />;
  }
  if (modality === "video") {
    return <VideoOptions options={options} capabilities={capabilities} setOption={setOption} setOptions={setOptions} setReferences={setReferences} />;
  }
  return <AudioOptions options={options} model={model} setOption={setOption} />;
}

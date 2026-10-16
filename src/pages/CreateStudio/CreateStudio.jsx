import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { countTokens, decode, encode } from "gpt-tokenizer";
import ModelPicker from "../../components/CreateStudio/ModelPicker";
import InfoPanel from "../../components/Library/InfoPanel";
import { uploadAssetApi } from "../../services/asset.service";
import {
  createGeneration,
  createPriceQuote,
  getAiCatalog,
  getGeneration,
  getGenerations,
} from "../../services/aiPlatform.service";

const MODALITIES = [
  { id: "image", label: "Image", icon: "image" },
  { id: "video", label: "Video", icon: "smart_display" },
  { id: "audio", label: "Audio", icon: "graphic_eq" },
  { id: "chat", label: "Chat", icon: "chat_bubble" },
];

const MEDIA_PROMPT_TOKEN_LIMIT = 4000;

function limitMediaPrompt(value) {
  const tokens = encode(value);
  return tokens.length <= MEDIA_PROMPT_TOKEN_LIMIT
    ? value
    : decode(tokens.slice(0, MEDIA_PROMPT_TOKEN_LIMIT));
}

const money = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} ₫`;
const optionLabel = (value) => ({
  first_frame: "Ảnh đầu / ảnh cuối",
  refer_image: "Ảnh tham chiếu",
})[value] || String(value);

function values(capabilities, key, fallback = []) {
  const value = capabilities?.[key];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.values)) return value.values;
  if (
    value?.type === "range" &&
    Number.isInteger(value.min) &&
    Number.isInteger(value.max) &&
    value.max >= value.min &&
    value.max - value.min <= 50
  ) {
    return Array.from(
      { length: value.max - value.min + 1 },
      (_, index) => value.min + index,
    );
  }
  return fallback;
}

function referenceLimitFor(modality, capabilities) {
  if (modality === "image") {
    return Math.max(0, Number(capabilities?.input_references?.max) || 0);
  }
  if (modality === "video") {
    return Number(capabilities?.maxReferenceImages || 0);
  }
  return 0;
}

function FieldSelect({
  label,
  icon,
  value,
  onChange,
  options,
  emptyLabel,
  className = "col-span-3",
}) {
  if (!options?.length) return null;
  return (
    <label
      title={label}
      className={`group relative flex min-h-12 min-w-0 items-center rounded-xl border border-outline-variant bg-white px-2 shadow-[0_2px_8px_rgba(92,55,24,0.04)] transition hover:border-primary/50 hover:shadow-[0_5px_14px_rgba(243,136,32,0.10)] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 ${className}`}
    >
      <span className="sr-only">{label}</span>
      <span className="material-symbols-outlined shrink-0 text-[18px] text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1 whitespace-nowrap px-1.5 text-[13px] font-bold text-on-surface">
        {value ? optionLabel(value) : emptyLabel || "Chọn"}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {emptyLabel && <option value="">{emptyLabel}</option>}
        {options.map((option) => (
          <option key={String(option)} value={option}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function SeedField({ value, onChange, className = "col-span-3" }) {
  return (
    <label
      title="Seed"
      className={`group flex min-h-12 min-w-0 items-center rounded-xl border border-outline-variant bg-white px-2 shadow-[0_2px_8px_rgba(92,55,24,0.04)] transition hover:border-primary/50 hover:shadow-[0_5px_14px_rgba(243,136,32,0.10)] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 ${className}`}
    >
      <span className="sr-only">Seed</span>
      <span className="material-symbols-outlined shrink-0 text-[18px] text-primary">
        casino
      </span>
      <input
        aria-label="Seed"
        type="number"
        step="1"
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? "" : Number(event.target.value),
          )
        }
        placeholder="Ngẫu nhiên"
        className="min-w-0 flex-1 appearance-none bg-transparent px-1.5 text-[13px] font-bold text-on-surface outline-none placeholder:font-semibold placeholder:text-slate-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  );
}

export default function CreateStudio() {
  const { modality: routeModality = "image" } = useParams();
  const navigate = useNavigate();
  const modality = ["image", "video", "audio"].includes(routeModality)
    ? routeModality
    : "image";
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState({
    n: 1,
    speed: 1,
    maxOutputTokens: 1024,
  });
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [references, setReferences] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const quoteSequence = useRef(0);

  const model = useMemo(
    () => models.find((item) => item.id === selectedModel),
    [models, selectedModel],
  );
  const capabilities = model?.capabilities || {};
  const referenceLimit = modality === "video" && options.referenceMode !== "refer_image"
    ? Math.min(2, referenceLimitFor(modality, capabilities))
    : referenceLimitFor(modality, capabilities);
  const isMediaPrompt = modality === "image" || modality === "video";
  const promptTokenCount = useMemo(
    () => (isMediaPrompt ? countTokens(prompt) : 0),
    [isMediaPrompt, prompt],
  );

  useEffect(() => {
    if (isMediaPrompt) setPrompt((current) => limitMediaPrompt(current));
  }, [isMediaPrompt]);

  const loadHistory = useCallback(async () => {
    try {
      setHistory((await getGenerations(modality)).items || []);
    } catch {
      setHistory([]);
    }
  }, [modality]);

  useEffect(() => {
    let active = true;
    setModels([]);
    setSelectedModel("");
    setQuote(null);
    setResult(null);
    setReferences([]);
    getAiCatalog(modality)
      .then((items) => {
        if (!active) return;
        setModels(items);
        if (items[0]) setSelectedModel(items[0].id);
      })
      .catch((err) => setError(err.response?.data?.message || err.message));
    loadHistory();
    return () => {
      active = false;
    };
  }, [modality, loadHistory]);

  useEffect(() => {
    if (!model) return;
    if (modality === "image") {
      const ratios = values(capabilities, "aspect_ratio");
      const resolutions = values(capabilities, "resolution", []);
      const qualities = values(capabilities, "quality");
      const formats = values(capabilities, "output_format");
      const counts = values(capabilities, "n");
      setOptions({
        ...(ratios.length ? { aspectRatio: ratios[0] } : {}),
        ...(resolutions.length ? { resolution: resolutions[0] } : {}),
        ...(qualities.length ? { quality: qualities[0] } : {}),
        ...(formats.length ? { outputFormat: formats[0] } : {}),
        ...(counts.length ? { n: counts[0] } : {}),
        ...(Object.hasOwn(capabilities, "seed") ? { seed: "" } : {}),
      });
    }
    if (modality === "video") {
      setOptions({
        ...(capabilities.resolutions?.length
          ? { resolution: capabilities.resolutions[0] }
          : {}),
        ...(capabilities.aspectRatios?.length
          ? { aspectRatio: capabilities.aspectRatios[0] }
          : {}),
        ...(capabilities.durations?.length
          ? { duration: capabilities.durations.includes(5) ? 5 : capabilities.durations[0] }
          : {}),
        ...(capabilities.sizes?.length ? { size: "" } : {}),
        ...(capabilities.generateAudio ? { generateAudio: false } : {}),
        ...(capabilities.referenceModes?.length
          ? { referenceMode: capabilities.referenceModes[0] }
          : {}),
        ...(capabilities.multiShot ? { multiShot: false } : {}),
        ...(capabilities.seed ? { seed: "" } : {}),
      });
    }
    if (modality === "audio") {
      setOptions({ voice: model.voices?.[0] || "", speed: 1 });
    }
    setReferences((current) => current.slice(0, referenceLimit));
  }, [model, modality, capabilities, referenceLimit]);

  useEffect(() => {
    setQuote(null);
    setQuoteError("");
    if (!selectedModel || (modality !== "video" && !prompt.trim())) return;
    const sequence = ++quoteSequence.current;
    const timer = setTimeout(async () => {
      try {
        const next = await createPriceQuote({
          modality,
          modelSlug: selectedModel,
          prompt,
          options,
        });
        if (sequence === quoteSequence.current) setQuote(next);
      } catch (err) {
        if (sequence === quoteSequence.current) {
          setQuoteError(err.response?.data?.message || err.message);
          setQuote(null);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [modality, selectedModel, prompt, options]);

  const setOption = (key, value) =>
    setOptions((current) => ({ ...current, [key]: value }));

  const uploadReference = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const asset = await uploadAssetApi(file);
      setReferences((current) =>
        [
          ...current,
          { id: Number(asset.id), url: asset.storedUrl, type: asset.assetType },
        ].slice(-referenceLimit),
      );
    } catch (err) {
      setError(err.message || "Upload thất bại");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const copyPrompt = async (text) => {
    await navigator.clipboard.writeText(text);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 1500);
  };

  const pollVideo = async (id) => {
    for (let attempt = 0; attempt < 120; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const current = await getGeneration(id);
      setResult(current);
      if (["succeeded", "failed"].includes(current.status)) return current;
    }
    throw new Error("Video vẫn đang xử lý. Bạn có thể xem lại trong lịch sử.");
  };

  const generate = async () => {
    if (!quote || generating || !prompt.trim() || (modality === "video" && !references.length)) return;
    setGenerating(true);
    setError("");
    try {
      let created = await createGeneration({
        quoteId: quote.quoteId,
        prompt,
        referenceUrls: references.map((item) => item.url),
        referenceAssetIds: references.map((item) => item.id),
      });
      setResult(created);
      setQuote(null);
      if (
        modality === "video" &&
        !["succeeded", "failed"].includes(created.status)
      ) {
        created = await pollVideo(created.id);
      }
      await loadHistory();
    } catch (err) {
      const detail = err.response?.data?.message;
      setError(
        typeof detail === "object" ? detail.message : detail || err.message,
      );
    } finally {
      setGenerating(false);
    }
  };

  const renderOptions = () => {
    if (modality === "image")
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
    if (modality === "video")
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
          <FieldSelect
            label="Độ phân giải"
            icon="high_quality"
            value={options.resolution || ""}
            onChange={(v) =>
              setOptions((current) => ({
                ...current,
                resolution: v,
                size: "",
              }))
            }
            options={capabilities.resolutions || []}
            className="col-span-4"
          />
          {capabilities.seed && (
            <SeedField
              value={options.seed}
              onChange={(v) => setOption("seed", v)}
              className="col-span-4"
            />
          )}
          {capabilities.durations?.length > 0 && (
            <div className="col-span-12 rounded-xl border border-outline-variant bg-white px-3 py-2.5 shadow-[0_2px_8px_rgba(92,55,24,0.04)]">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <span className="material-symbols-outlined text-[17px] text-primary">
                    schedule
                  </span>
                  Thời lượng
                </span>
                <span className="rounded-md bg-primary-container px-2 py-0.5 font-bold text-primary-hover">
                  {options.duration}s
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="w-6 text-[10px] font-medium text-slate-400">
                  {capabilities.durations[0]}s
                </span>
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
                  className="h-1.5 min-w-0 flex-1 cursor-pointer accent-primary disabled:cursor-default disabled:opacity-50"
                />
                <span className="w-7 text-right text-[10px] font-medium text-slate-400">
                  {capabilities.durations.at(-1)}s
                </span>
              </div>
            </div>
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
    return (
      <div className="grid grid-cols-6 gap-2">
        <FieldSelect
          label="Giọng đọc"
          icon="record_voice_over"
          value={options.voice || ""}
          onChange={(v) => setOption("voice", v)}
          options={model?.voices || []}
          className="col-span-4"
        />
        <FieldSelect
          label="Tốc độ"
          icon="speed"
          value={options.speed || 1}
          onChange={(v) => setOption("speed", Number(v))}
          options={[0.75, 1, 1.25, 1.5]}
          className="col-span-2"
        />
      </div>
    );
  };

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-background text-on-background">
      <section className="flex w-full shrink-0 flex-col border-r border-outline-variant bg-white lg:w-[380px]">
        <div className="grid grid-cols-4 gap-1 border-b border-outline-variant px-3 py-4">
          {MODALITIES.map((item) =>
            item.id === "chat" ? (
              <button
                key={item.id}
                onClick={() => navigate("/chat")}
                className="flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm text-on-surface-variant hover:bg-primary-container hover:text-primary"
              >
                <span className="material-symbols-outlined text-lg">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                to={`/create/${item.id}`}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm ${modality === item.id ? "bg-primary-container font-medium text-primary-hover" : "text-on-surface-variant hover:bg-primary-container hover:text-primary"}`}
              >
                <span className="material-symbols-outlined text-lg">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
          <ModelPicker
            modality={modality}
            models={models}
            value={selectedModel}
            onChange={setSelectedModel}
          />

          {referenceLimit > 0 && (
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
              <p className="mb-3 text-sm font-semibold">
                 {modality === "video" && options.referenceMode === "refer_image"
                   ? "Ảnh tham chiếu"
                   : modality === "video" ? "Ảnh khung hình" : "Ảnh tham chiếu"}{" "}
                <span className="font-normal text-slate-500">
                   ({modality === "video" ? "cần ít nhất 1 ảnh, " : "tùy chọn, "}tối đa {referenceLimit})
                </span>
              </p>
              <div className="flex flex-wrap gap-3">
                {references.map((reference, index) => (
                  <button
                    key={reference.id}
                    type="button"
                    onClick={() =>
                      setReferences((items) =>
                        items.filter((_, i) => i !== index),
                      )
                    }
                    className="group relative h-24 w-24 overflow-hidden rounded-xl border border-outline-variant"
                  >
                    {reference.type === "video" ? (
                      <video
                        src={reference.url}
                        className="h-full w-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={reference.url}
                        className="h-full w-full object-cover"
                        alt="Reference"
                      />
                    )}
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/60 group-hover:flex">
                      Xóa
                    </span>
                    {modality === "video" && options.referenceMode !== "refer_image" && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/65 py-1 text-center text-[10px] text-white">
                        {index === 0 ? "Ảnh đầu" : "Ảnh cuối"}
                      </span>
                    )}
                  </button>
                ))}
                {references.length < referenceLimit && (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-white text-on-surface-variant hover:border-primary hover:text-primary">
                    <span className="material-symbols-outlined">
                      add_photo_alternate
                    </span>
                    <span className="mt-1 text-xs">
                      {uploading ? "Đang tải" : "Tải ảnh"}
                    </span>
                    <input
                      type="file"
                      accept={modality === "video" ? "image/jpeg,image/png" : "image/*"}
                      className="hidden"
                      disabled={uploading}
                      onChange={uploadReference}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">
                {modality === "audio" ? "Kịch bản" : "Prompt"}
              </p>
              <span className="text-xs text-slate-600">
                {modality === "video" && capabilities.maxPromptCharacters
                  ? `${prompt.length.toLocaleString("vi-VN")} / ${capabilities.maxPromptCharacters.toLocaleString("vi-VN")} ký tự`
                  : isMediaPrompt
                  ? `${promptTokenCount.toLocaleString("vi-VN")} / ${MEDIA_PROMPT_TOKEN_LIMIT.toLocaleString("vi-VN")} token`
                  : `${prompt.length.toLocaleString("vi-VN")} ký tự`}
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={(event) => {
                const nextPrompt = event.target.value;
                if (!isMediaPrompt) {
                  setPrompt(nextPrompt);
                  return;
                }
                setPrompt(modality === "video" && capabilities.maxPromptCharacters
                  ? nextPrompt.slice(0, capabilities.maxPromptCharacters)
                  : limitMediaPrompt(nextPrompt));
              }}
              rows={8}
              placeholder={
                modality === "audio"
                  ? "Nhập nội dung bạn muốn chuyển thành giọng nói..."
                  : "Mô tả nội dung bạn muốn tạo..."
              }
              className="w-full resize-none bg-transparent text-sm leading-6 text-on-surface outline-none placeholder:text-outline"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {result && (
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 lg:hidden">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Kết quả gần nhất</p>
                <span className="text-xs text-slate-500">{result.status}</span>
              </div>
              {result.outputUrls?.length > 0 && (
                <InfoPanel
                  item={result}
                  variant="inline"
                  onCopyPrompt={copyPrompt}
                  promptCopied={promptCopied}
                />
              )}
              {!result.outputUrls?.length && (
                <p
                  className={
                    result.status === "failed"
                      ? "text-sm text-red-300"
                      : "text-sm text-on-surface-variant"
                  }
                >
                  {result.errorMessage || "Nội dung đang được xử lý…"}
                </p>
              )}
              {result.outputUrls?.map((url) => (
                <div
                  key={url}
                  className="mb-3 overflow-hidden rounded-xl bg-black/30"
                >
                  {modality === "image" && (
                    <img
                      src={url}
                      className="max-h-80 w-full object-contain"
                      alt="Generated"
                    />
                  )}
                  {modality === "video" && (
                    <video src={url} controls className="max-h-80 w-full" />
                  )}
                  {modality === "audio" && (
                    <audio src={url} controls className="w-full p-3" />
                  )}
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border-t border-outline-variant px-3 py-2 text-center text-xs text-primary"
                  >
                    Mở hoặc tải xuống
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-outline-variant bg-white p-3 sm:p-4">
          <details className="group rounded-2xl border border-outline-variant bg-surface-container-low shadow-[0_6px_20px_rgba(92,55,24,0.05)]">
            <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-2xl px-3 py-2.5 transition hover:bg-primary-container/40 [&::-webkit-details-marker]:hidden">
              <span className="material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container text-[19px] text-primary">
                tune
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-on-surface">
                  Cài đặt {modality === "image" ? "ảnh" : modality === "video" ? "video" : "audio"}
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
                  {modality === "video" && (
                    <>
                      {options.aspectRatio && <span className="truncate">{options.aspectRatio}</span>}
                      {options.resolution && <span className="truncate">· {options.resolution}</span>}
                      {options.size && <span className="truncate">{options.size}</span>}
                      {options.duration && <span className="truncate">· {options.duration}s</span>}
                      {capabilities.generateAudio && (
                        <span className="truncate">· {options.generateAudio ? "Có âm thanh" : "Tắt âm thanh"}</span>
                      )}
                      {capabilities.nativeAudioIncluded && <span className="truncate">· Có âm thanh</span>}
                      {capabilities.multiShot && options.multiShot && <span className="truncate">· Nhiều cảnh</span>}
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
              {renderOptions()}
            </div>
          </details>

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
              onClick={generate}
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
      </section>

      <section className="relative hidden min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-background px-4 xl:px-6 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(243,136,32,0.10),transparent_48%)]" />
        <div className="relative z-10 flex w-full flex-col items-center">
          {!result && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary-container">
                <span className="material-symbols-outlined text-4xl text-primary">
                  {MODALITIES.find((item) => item.id === modality)?.icon}
                </span>
              </div>
              <h2 className="text-2xl font-semibold">Sẵn sàng sáng tạo</h2>
              <p className="mt-2 text-sm text-slate-500">
                Chọn model, nhập prompt và xem giá trước khi tạo.
              </p>
            </div>
          )}
          {result && !result.outputUrls?.length && (
            <div className="text-center">
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
              <h2 className="text-xl font-semibold">
                {result.status === "failed"
                  ? "Tạo nội dung thất bại"
                   : "Kling đang xử lý..."}
              </h2>
              <p
                className={`mt-2 text-sm ${result.status === "failed" ? "text-red-300" : "text-slate-500"}`}
              >
                {result.errorMessage ||
                  "Video thường mất vài phút để hoàn tất."}
              </p>
            </div>
          )}
          {result?.outputUrls?.length > 0 && (
            <div className="w-full">
              <InfoPanel
                item={result}
                variant="inline"
                onCopyPrompt={copyPrompt}
                promptCopied={promptCopied}
              />
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl">
                {modality === "image" && (
                  <div className={`grid gap-2 ${result.outputUrls.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                    {result.outputUrls.map((url) => (
                      <img
                        key={url}
                        src={url}
                        className="max-h-[72vh] w-full object-contain xl:max-h-[76vh]"
                        alt="Generated"
                      />
                    ))}
                  </div>
                )}
                {modality === "video" && (
                  <video
                    src={result.outputUrls[0]}
                    controls
                    className="max-h-[72vh] w-full object-contain xl:max-h-[76vh]"
                  />
                )}
                {modality === "audio" && (
                  <div className="p-6 lg:p-8">
                    <audio
                      src={result.outputUrls[0]}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center justify-between text-sm text-on-surface-variant">
                <span>Đã lưu vào Thư viện</span>
                <div className="flex items-center gap-4">
                  <a
                    href={result.outputUrls[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:text-primary-hover"
                  >
                    Tải xuống
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="hidden min-h-0 w-48 shrink-0 flex-col border-l border-outline-variant bg-white p-3 xl:flex">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Gần đây</h3>
          <button
            onClick={loadHistory}
            className="text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        </div>
        <div className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => setResult(item)}
              className={`flex w-full gap-3 rounded-xl border p-2 text-left transition ${result?.id === item.id ? "border-primary bg-primary-container" : "border-outline-variant bg-white hover:border-primary/40 hover:bg-surface-container-low"}`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/40">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined flex h-full items-center justify-center text-slate-600">
                    smart_display
                  </span>
                )}
                <span
                  className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-black/50 ${item.status === "succeeded" ? "bg-emerald-400" : item.status === "failed" ? "bg-red-400" : "animate-pulse bg-amber-400"}`}
                />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="line-clamp-2 text-sm text-on-surface">
                  {item.prompt}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="truncate">
                    {item.displayQuality || item.modelName}
                  </span>
                  <span className="shrink-0">
                    {money(item.displayPriceVnd)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ModelPicker from "../../components/CreateStudio/ModelPicker";
import GenerationControls from "../../components/CreateStudio/GenerationControls";
import ReferenceInputs from "../../components/CreateStudio/ReferenceInputs";
import PromptEditor from "../../components/CreateStudio/PromptEditor";
import {
  MobileGenerationResult,
  DesktopGenerationResult,
} from "../../components/CreateStudio/GenerationResult";
import GenerationHistory from "../../components/CreateStudio/GenerationHistory";
import { referenceLimitFor, values } from "../../utils/createStudio.utils";
import { usePriceQuote } from "./usePriceQuote";
import { uploadAssetApi } from "../../services/asset.service";
import {
  createGeneration,
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
  const { quote, quoteError, clearQuote } = usePriceQuote({
    modality,
    modelSlug: selectedModel,
    prompt,
    options,
  });
  const [references, setReferences] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [referencePickerOpen, setReferencePickerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const generationRun = useRef(0);
  const historyRequest = useRef(0);
  const model = useMemo(
    () => models.find((item) => item.id === selectedModel),
    [models, selectedModel],
  );
  const capabilities = useMemo(() => model?.capabilities || {}, [model]);
  const referenceLimit =
    modality === "video" && options.referenceMode !== "refer_image"
      ? Math.min(2, referenceLimitFor(modality, capabilities))
      : referenceLimitFor(modality, capabilities);
  const loadHistory = useCallback(async () => {
    const request = ++historyRequest.current;
    try {
      const response = await getGenerations(modality);
      if (request === historyRequest.current) setHistory(response.items || []);
    } catch {
      if (request === historyRequest.current) setHistory([]);
    }
  }, [modality]);

  useEffect(() => {
    let active = true;
    setModels([]);
    setSelectedModel("");
    setResult(null);
    setReferences([]);
    setGenerating(false);
    getAiCatalog(modality)
      .then((items) => {
        if (!active) return;
        setModels(items);
        if (items[0]) setSelectedModel(items[0].id);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || err.message);
      });
    loadHistory();
    return () => {
      active = false;
      generationRun.current += 1;
      historyRequest.current += 1;
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
  }, [model, modality, capabilities]);

  useEffect(() => {
    setReferences((current) =>
      current.length > referenceLimit ? current.slice(0, referenceLimit) : current,
    );
  }, [referenceLimit]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(""), 6000);
    return () => clearTimeout(timer);
  }, [error]);

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

  const pollVideo = async (id, run) => {
    for (let attempt = 0; attempt < 120; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      if (run !== generationRun.current) return;
      const current = await getGeneration(id);
      if (run !== generationRun.current) return;
      setResult(current);
      if (["succeeded", "failed"].includes(current.status)) return current;
    }
    throw new Error("Video vẫn đang xử lý. Bạn có thể xem lại trong lịch sử.");
  };

  const generate = async () => {
    if (
      !quote ||
      generating ||
      !prompt.trim() ||
      (modality === "video" && !references.length)
    ) return;
    const run = generationRun.current;
    setGenerating(true);
    setError("");
    try {
      let created = await createGeneration({
        quoteId: quote.quoteId,
        prompt,
        referenceUrls: references.map((item) => item.url),
        referenceAssetIds: references.map((item) => item.id),
      });
      if (run !== generationRun.current) return;
      setResult(created);
      clearQuote();
      if (
        modality === "video" &&
        !["succeeded", "failed"].includes(created.status)
      ) {
        created = await pollVideo(created.id, run);
      }
      if (run !== generationRun.current) return;
      await loadHistory();
    } catch (err) {
      if (run !== generationRun.current) return;
      const detail = err.response?.data?.message;
      setError(
        typeof detail === "object" ? detail.message : detail || err.message,
      );
    } finally {
      if (run === generationRun.current) setGenerating(false);
    }
  };

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-background text-on-background">
      <section className="relative z-20 flex w-full shrink-0 flex-col border-r border-outline-variant bg-white lg:w-[380px]">
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

          <ReferenceInputs
            modality={modality}
            options={options}
            referenceLimit={referenceLimit}
            references={references}
            setReferences={setReferences}
            uploading={uploading}
            uploadReference={uploadReference}
            referencePickerOpen={referencePickerOpen}
            setReferencePickerOpen={setReferencePickerOpen}
          />
          <PromptEditor
            modality={modality}
            capabilities={capabilities}
            prompt={prompt}
            setPrompt={setPrompt}
          />
          <MobileGenerationResult
            result={result}
            modality={modality}
            onCopyPrompt={copyPrompt}
            promptCopied={promptCopied}
          />
        </div>

        <GenerationControls
          modality={modality}
          selectedModel={selectedModel}
          options={options}
          capabilities={capabilities}
          model={model}
          setOptions={setOptions}
          setReferences={setReferences}
          quote={quote}
          quoteError={quoteError}
          generating={generating}
          prompt={prompt}
          references={references}
          onGenerate={generate}
        />
      </section>

      <DesktopGenerationResult
        result={result}
        modality={modality}
        icon={MODALITIES.find((item) => item.id === modality)?.icon}
        onCopyPrompt={copyPrompt}
        promptCopied={promptCopied}
      />

      <GenerationHistory
        history={history}
        resultId={result?.id}
        onRefresh={loadHistory}
        onSelect={setResult}
      />
      {error && (
        <div
          role="alert"
          className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-xl"
        >
          <span className="material-symbols-outlined text-xl">error</span>
          <span className="min-w-0 flex-1">{error}</span>
          <button
            type="button"
            aria-label="Đóng thông báo lỗi"
            onClick={() => setError("")}
            className="rounded p-0.5 hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

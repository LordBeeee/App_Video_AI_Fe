import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ModelPicker from "../../components/CreateStudio/ModelPicker";
import GenerationControls from "../../components/CreateStudio/GenerationControls";
import GenerationInputs from "../../components/CreateStudio/GenerationInputs";
import PromptEditor from "../../components/CreateStudio/PromptEditor";
import {
  MobileGenerationResult,
  DesktopGenerationResult,
} from "../../components/CreateStudio/GenerationResult";
import GenerationHistory from "../../components/CreateStudio/GenerationHistory";
import StudioTabs from "../../components/CreateStudio/StudioTabs";
import AssetPicker from "../../components/Library/AssetPicker";
import "../../components/Aurora/aurora.css";
import "../../components/CreateStudio/studio.css";
import { formatVideoShots, referenceLimitFor, validVideoShots, values } from "../../utils/createStudio.utils";
import { usePriceQuote } from "./usePriceQuote";
import { uploadAssetApi } from "../../services/asset.service";
import {
  createGeneration,
  getAiCatalog,
  getGeneration,
  getGenerations,
} from "../../services/aiPlatform.service";

const MODALITIES = {
  image: { title: "Tạo ảnh", icon: "image" },
  video: { title: "Tạo video", icon: "smart_display" },
  audio: { title: "Tạo giọng nói", icon: "graphic_eq" },
};

export default function CreateStudio() {
  const { modality: routeModality = "image" } = useParams();
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
  const [references, setReferences] = useState([]);
  const [videoReference, setVideoReference] = useState(null);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [elements, setElements] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [referencePickerOpen, setReferencePickerOpen] = useState(false);
  const [elementPickerOpen, setElementPickerOpen] = useState(false);
  const [activeShot, setActiveShot] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const generationRun = useRef(0);
  const historyRequest = useRef(0);
  const studioBody = useRef(null);
  const dragScroll = useRef({ frame: 0, direction: 0 });
  const model = useMemo(
    () => models.find((item) => item.id === selectedModel),
    [models, selectedModel],
  );
  const capabilities = useMemo(() => model?.capabilities || {}, [model]);
  const customShots = modality === "video" && options.multiShot && options.customShots;
  const shotsValid = !customShots || validVideoShots(options.shots, options.duration, capabilities.maxPromptCharacters);
  const generationPrompt = customShots
    ? shotsValid ? formatVideoShots(options.shots) : ""
    : prompt;
  const supportsElements = ["kling/kling-3.0", "kling/kling-3.0-omni"].includes(selectedModel);
  const isOmni = selectedModel === "kling/kling-3.0-omni";
  const orderedImageReferences = useMemo(() => isOmni
    ? [
        ...references.filter((item) => item.role === "first_frame"),
        ...references.filter((item) => item.role === "last_frame"),
        ...references.filter((item) => item.role === "refer_image"),
      ]
    : references, [isOmni, references]);
  const quoteOptions = useMemo(() => ({
    ...options,
    ...(supportsElements ? { elementAssetIds: elements.map((element) => element.id) } : {}),
    ...(isOmni ? { referenceInputs: [
      ...orderedImageReferences.map((reference) => ({ assetId: reference.id, type: reference.role || "refer_image" })),
      ...(videoReference ? [{ assetId: videoReference.id, type: videoReference.role }] : []),
    ] } : {}),
  }), [supportsElements, isOmni, options, elements, orderedImageReferences, videoReference]);
  const { quote, quoteError, clearQuote } = usePriceQuote({
    modality,
    modelSlug: selectedModel,
    prompt: generationPrompt,
    options: quoteOptions,
    enabled: shotsValid,
  });
  const referenceLimit =
    modality === "video" && !isOmni && options.referenceMode !== "refer_image"
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
    setVideoReference(null);
    setElements([]);
    setReferencePickerOpen(false);
    setElementPickerOpen(false);
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
      setElements([]);
      setReferences([]);
      setVideoReference(null);
      setElementPickerOpen(false);
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
        ...(!capabilities.referenceVideos && capabilities.referenceModes?.length
          ? { referenceMode: capabilities.referenceModes[0] }
          : {}),
        ...(capabilities.multiShot ? { multiShot: false, customShots: false, shots: [] } : {}),
        ...(capabilities.referenceVideos ? { audioMode: "off" } : {}),
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

  const uploadReference = async (event, target = "reference") => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const asset = await uploadAssetApi(file);
      setReferences((current) => {
        const frameCount = current.filter((item) => ["first_frame", "last_frame"].includes(item.role)).length;
        if (current.length >= referenceLimit || (isOmni && target === "frame" && frameCount >= 2)) return current;
        const role = isOmni ? target === "frame"
          ? (frameCount === 0 ? "first_frame" : "last_frame")
          : "refer_image" : undefined;
        return [...current, { id: Number(asset.id), url: asset.storedUrl, type: asset.assetType, role }];
      });
    } catch (err) {
      setError(err.message || "Upload thất bại");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const addSelectedAssets = (assets, target = "reference") => {
    setReferences((current) => {
      const existingIds = new Set(current.map((item) => String(item.id)));
      const selected = [];
      let frameCount = current.filter((item) => ["first_frame", "last_frame"].includes(item.role)).length;
      for (const asset of assets) {
        if (existingIds.has(String(asset.id)) || current.length + selected.length >= referenceLimit) continue;
        if (isOmni && target === "frame" && frameCount >= 2) break;
        selected.push({ id: Number(asset.id), url: asset.storedUrl, type: asset.assetType,
          role: isOmni ? target === "frame"
            ? (frameCount++ === 0 ? "first_frame" : "last_frame")
            : "refer_image" : undefined });
        existingIds.add(String(asset.id));
      }
      return [...current, ...selected];
    });
    setReferencePickerOpen(false);
  };

  const addSelectedElements = (assets) => {
    setElements((current) => [...current, ...assets
      .filter((asset) => !current.some((item) => item.id === Number(asset.id)))
      .map((asset) => ({ id: Number(asset.id), name: asset.metadata?.name, url: asset.thumbnailUrl || asset.storedUrl, type: asset.assetType }))].slice(0, 3));
    setElementPickerOpen(false);
  };
  const addSelectedVideo = (assets) => {
    const asset = assets[0];
    if (asset) {
      setVideoReference({ id: Number(asset.id), url: asset.storedUrl, role: "feature_video" });
      setOptions((current) => ({ ...current, multiShot: true, audioMode: "off", generateAudio: false }));
    }
    setVideoPickerOpen(false);
  };
  const uploadVideoReference = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadAssetApi(file);
      setVideoReference({ id: Number(asset.id), url: asset.storedUrl, role: "feature_video" });
      setOptions((current) => ({ ...current, multiShot: true, audioMode: "off", generateAudio: false }));
    } catch (err) { setError(err.message || "Upload video thất bại"); }
    finally { setUploading(false); event.target.value = ""; }
  };
  const removeMention = (mention) => {
    const pattern = new RegExp(`${mention}(?=\\s|$)`, "g");
    setPrompt((current) => current.replace(pattern, ""));
    setOptions((current) => !Array.isArray(current.shots) ? current : ({
      ...current,
      shots: current.shots.map((shot) => ({ ...shot, prompt: shot.prompt.replace(pattern, "") })),
    }));
  };
  const removeReference = (id) => {
    if (isOmni) removeMention(`@image_${id}`);
    setReferences((current) => {
      const removed = current.find((item) => item.id === id);
      const remaining = current.filter((item) => item.id !== id);
      return removed?.role === "first_frame"
        ? remaining.map((item) => item.role === "last_frame" ? { ...item, role: "first_frame" } : item)
        : remaining;
    });
  };
  const setVideoRole = (role) => {
    setVideoReference((current) => current && ({ ...current, role }));
    setOptions((current) => ({ ...current, multiShot: role === "feature_video", customShots: false, shots: [], audioMode: "off", generateAudio: false }));
  };
  const removeVideoReference = () => {
    if (videoReference) removeMention(`@video_${videoReference.id}`);
    setVideoReference(null);
    setOptions((current) => ({ ...current, audioMode: "off", generateAudio: false }));
  };

  const insertMention = (mention) => {
    if (customShots) {
      const index = activeShot != null && activeShot < options.shots.length ? activeShot : 0;
      setOptions((current) => ({ ...current, shots: current.shots.map((shot, i) => i === index
        ? { ...shot, prompt: `${shot.prompt}${shot.prompt && !shot.prompt.endsWith(" ") ? " " : ""}${mention} `.slice(0, 512) }
        : shot) }));
    } else {
      setPrompt((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${mention} `.slice(0, capabilities.maxPromptCharacters || 2500));
    }
  };

  const insertElementMention = (element) => insertMention(`@element_${element.id}`);

  const stopDragScroll = () => {
    dragScroll.current.direction = 0;
    if (dragScroll.current.frame) cancelAnimationFrame(dragScroll.current.frame);
    dragScroll.current.frame = 0;
  };

  const scrollWhileDragging = () => {
    const body = studioBody.current;
    const direction = dragScroll.current.direction;
    if (!body || !direction) {
      dragScroll.current.frame = 0;
      return;
    }
    body.scrollTop += direction * 9;
    dragScroll.current.frame = requestAnimationFrame(scrollWhileDragging);
  };

  const handleStudioDragOver = (event) => {
    if (!event.dataTransfer.types.includes("application/x-kling-mention")) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const edge = 90;
    dragScroll.current.direction = event.clientY < bounds.top + edge ? -1
      : event.clientY > bounds.bottom - edge ? 1 : 0;
    if (dragScroll.current.direction && !dragScroll.current.frame) {
      dragScroll.current.frame = requestAnimationFrame(scrollWhileDragging);
    }
  };

  const handleStudioDragLeave = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) stopDragScroll();
  };

  const removeElement = (element) => {
    setElements((current) => current.filter((item) => item.id !== element.id));
    removeMention(`@element_${element.id}`);
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
      !generationPrompt.trim() ||
      !shotsValid ||
      (modality === "video" && !isOmni && !references.length)
    ) return;
    const run = generationRun.current;
    setGenerating(true);
    setError("");
    try {
      let created = await createGeneration({
        quoteId: quote.quoteId,
        prompt: generationPrompt,
        referenceUrls: orderedImageReferences.map((item) => item.url),
        referenceAssetIds: [...orderedImageReferences.map((item) => item.id), ...(videoReference ? [videoReference.id] : [])],
        ...(isOmni ? { elementAssetIds: elements.map((item) => item.id) } : {}),
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
    <div className="au st">
      <header className="au-head">
        <h1 key={modality} className="au-title au-fd st-ttl">{MODALITIES[modality].title}</h1>
        <div className="au-tools">
          <StudioTabs active={modality} />
        </div>
      </header>

      <div className="st-grid">
        <section className="au-card st-ctl">
          <div key={modality} className="st-body" ref={studioBody}
            onDragOver={handleStudioDragOver}
            onDragLeave={handleStudioDragLeave}
            onDragEndCapture={stopDragScroll}
            onDropCapture={stopDragScroll}>
            <ModelPicker
              modality={modality}
              models={models}
              value={selectedModel}
              onChange={setSelectedModel}
            />
            <GenerationInputs
              modality={modality}
              options={options}
              referenceLimit={referenceLimit}
              references={references}
              setReferences={setReferences}
              uploading={uploading}
              uploadReference={uploadReference}
              setReferencePickerOpen={setReferencePickerOpen}
              isOmni={isOmni}
              requiresFrame={["kling/kling-3.0-turbo", "kling/kling-3.0"].includes(selectedModel)}
              onRemoveReference={removeReference}
              videoReference={videoReference}
              onRemoveVideoReference={removeVideoReference}
              onVideoRoleChange={setVideoRole}
              setVideoPickerOpen={setVideoPickerOpen}
              uploadVideoReference={uploadVideoReference}
              elements={supportsElements ? elements : undefined}
              onRemoveElement={removeElement}
              setElementPickerOpen={setElementPickerOpen}
              onInsertElementMention={insertElementMention}
              onInsertMention={insertMention}
            />
            <PromptEditor
              modality={modality}
              modelId={selectedModel}
              capabilities={capabilities}
              prompt={prompt}
              setPrompt={setPrompt}
              options={options}
              setOptions={setOptions}
              onFocusShot={setActiveShot}
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
            options={options}
            capabilities={capabilities}
            model={model}
            setOptions={setOptions}
            setReferences={setReferences}
            videoReference={videoReference}
            quote={quote}
            quoteError={quoteError}
            generating={generating}
            prompt={generationPrompt}
            references={references}
            ready={shotsValid && (!isOmni || (!videoReference || !options.generateAudio) && (!videoReference || videoReference.role !== "base_video" || !options.multiShot))}
            requiresReference={!isOmni}
            onGenerate={generate}
          />
        </section>

        <DesktopGenerationResult
          result={result}
          modality={modality}
          icon={MODALITIES[modality].icon}
          onCopyPrompt={copyPrompt}
          promptCopied={promptCopied}
        />

        <GenerationHistory
          history={history}
          resultId={result?.id}
          onRefresh={loadHistory}
          onSelect={setResult}
        />
      </div>

      {referencePickerOpen && referenceLimit > references.length && (
        <AssetPicker
          type="image"
          max={isOmni && referencePickerOpen === "frame"
            ? Math.min(2 - references.filter((item) => ["first_frame", "last_frame"].includes(item.role)).length, referenceLimit - references.length)
            : referenceLimit - references.length}
          onClose={() => setReferencePickerOpen(false)}
          onConfirm={(assets) => addSelectedAssets(assets, referencePickerOpen)}
        />
      )}
      {elementPickerOpen && supportsElements && elements.length < 3 && (
        <AssetPicker
          type="element"
          max={3 - elements.length}
          allowVideoElements={selectedModel === "kling/kling-3.0-omni"}
          excludedIds={elements.map((element) => element.id)}
          onClose={() => setElementPickerOpen(false)}
          onConfirm={addSelectedElements}
        />
      )}
      {videoPickerOpen && isOmni && (
        <AssetPicker type="video" max={1} onClose={() => setVideoPickerOpen(false)} onConfirm={addSelectedVideo} />
      )}

      {error && (
        <div role="alert" className="st-toast">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
          <button type="button" aria-label="Đóng thông báo lỗi" onClick={() => setError("")}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
      )}
    </div>
  );
}

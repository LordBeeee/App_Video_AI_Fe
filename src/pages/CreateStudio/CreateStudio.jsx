import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ModelPicker from "../../components/CreateStudio/ModelPicker";
import GenerationControls from "../../components/CreateStudio/GenerationControls";
import GenerationInputs from "../../components/CreateStudio/GenerationInputs";
import SeedanceOmniInputs from "../../components/CreateStudio/SeedanceOmniInputs";
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
import { formatVideoShots, referenceLimitFor, validVideoShots, values, videoAspectRatioApplies } from "../../utils/createStudio.utils";
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

function seedanceOmniErrors(assets, mode) {
  const errors = [];
  const videos = assets.filter((asset) => asset.type === "video");
  const audios = assets.filter((asset) => asset.type === "audio");
  if (assets.length > 50) errors.push("Chỉ được chọn tối đa 50 tài nguyên tham chiếu.");

  for (const asset of assets) {
    const label = `${asset.type === "image" ? "Ảnh" : asset.type === "video" ? "Video" : "Âm thanh"} #${asset.id}`;
    const seconds = asset.durationSeconds;
    const { width, height } = asset;
    if (!asset.url?.startsWith("https://")) errors.push(`${label}: URL không hợp lệ.`);
    if (asset.type === "image") {
      if (!["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(asset.mimeType)) errors.push(`${label}: định dạng ảnh không được hỗ trợ.`);
      if (asset.fileSizeBytes != null && asset.fileSizeBytes > 10_000_000) errors.push(`${label}: vượt 10 MB.`);
      if ((width != null && (width < 300 || width > 6000)) || (height != null && (height < 300 || height > 6000)) ||
        (width != null && height != null && (width / height < 0.4 || width / height > 2.5))) errors.push(`${label}: kích thước hoặc tỷ lệ ảnh không hợp lệ.`);
    } else if (asset.type === "video") {
      if (!["video/mp4", "video/quicktime"].includes(asset.mimeType)) errors.push(`${label}: chỉ hỗ trợ MP4/MOV.`);
      if (!Number.isFinite(seconds) || seconds < (mode === "edit" ? 4 : 2) || seconds > 30) errors.push(`${label}: cần dài ${mode === "edit" ? "4" : "2"}–30 giây.`);
      if (asset.fileSizeBytes != null && asset.fileSizeBytes > 200_000_000) errors.push(`${label}: vượt 200 MB.`);
      if ((width != null && (width < 300 || width > 6000)) || (height != null && (height < 300 || height > 6000)) ||
        (width != null && height != null && (width / height < 0.4 || width / height > 2.5 || width * height < 407696 || width * height > 8295044))) errors.push(`${label}: kích thước hoặc tỷ lệ video không hợp lệ.`);
      if (asset.fps != null && (asset.fps < 24 || asset.fps > 60)) errors.push(`${label}: FPS phải từ 24 đến 60.`);
    } else if (asset.type === "audio") {
      if (!["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"].includes(asset.mimeType)) errors.push(`${label}: chỉ hỗ trợ MP3/WAV.`);
      if (!Number.isFinite(seconds) || seconds < 2 || seconds > 30) errors.push(`${label}: cần dài 2–30 giây.`);
      if (asset.fileSizeBytes != null && asset.fileSizeBytes > 15_000_000) errors.push(`${label}: vượt 15 MB.`);
    }
  }
  if (videos.reduce((sum, asset) => sum + asset.durationSeconds, 0) > 30) errors.push("Tổng thời lượng video tham chiếu vượt 30 giây.");
  if (audios.reduce((sum, asset) => sum + asset.durationSeconds, 0) > 30) errors.push("Tổng thời lượng âm thanh tham chiếu vượt 30 giây.");
  return errors;
}

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
  const [seedanceAssets, setSeedanceAssets] = useState([]);
  const [seedancePickerType, setSeedancePickerType] = useState(null);
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
  const isSeedanceOmni = selectedModel === "seedance/seedance-2.5-omni";
  const isSeedance = model?.provider === "seedance";
  const seedanceErrors = useMemo(() => seedanceOmniErrors(seedanceAssets, options.omniTaskType || "reference"), [seedanceAssets, options.omniTaskType]);
  const hasSeedanceReference = seedanceAssets.some((asset) => asset.type === "video" ||
    ((options.omniTaskType || "reference") === "reference" && asset.type === "image"));
  const seedanceAssetsValid = hasSeedanceReference && seedanceErrors.length === 0;
  const orderedImageReferences = useMemo(() => isOmni
    ? [
        ...references.filter((item) => item.role === "first_frame"),
        ...references.filter((item) => item.role === "last_frame"),
        ...references.filter((item) => item.role === "refer_image"),
      ]
    : references, [isOmni, references]);
  const mentionAssets = useMemo(() => [
    ...(isOmni ? references.map((reference) => ({
      mention: `@image_${reference.id}`,
      url: reference.url,
      kind: "image",
      label: reference.role === "first_frame" ? "Ảnh đầu" : reference.role === "last_frame" ? "Ảnh cuối" : "Ảnh tham chiếu",
    })) : []),
    ...(isOmni && videoReference ? [{
      mention: `@video_${videoReference.id}`, url: videoReference.url, kind: "video", label: "Video tham chiếu",
    }] : []),
    ...(isSeedanceOmni ? seedanceAssets.map((asset) => ({
      mention: `@${asset.type}_${asset.id}`, url: asset.url, kind: asset.type,
      label: `${asset.type === "image" ? "Ảnh" : asset.type === "video" ? "Video" : "Âm thanh"} tham chiếu`,
    })) : []),
    ...(supportsElements ? elements.map((element) => ({
      mention: `@element_${element.id}`, url: element.url, kind: element.type, label: element.name || "Element",
    })) : []),
  ], [isOmni, isSeedanceOmni, seedanceAssets, references, videoReference, supportsElements, elements]);
  const quoteOptions = useMemo(() => ({
    ...options,
    ...(isSeedance && !isSeedanceOmni ? { referenceAssetIds: references.map((item) => item.id) } : {}),
    ...(isSeedanceOmni ? { referenceInputs: seedanceAssets.map((asset) => ({ assetId: asset.id, type: `reference_${asset.type}` })) } : {}),
    ...(isOmni && !videoAspectRatioApplies(capabilities, references, videoReference) ? { aspectRatio: undefined } : {}),
    ...(supportsElements ? { elementAssetIds: elements.map((element) => element.id) } : {}),
    ...(isOmni ? { referenceInputs: [
      ...orderedImageReferences.map((reference) => ({ assetId: reference.id, type: reference.role || "refer_image" })),
      ...(videoReference ? [{ assetId: videoReference.id, type: videoReference.role }] : []),
    ] } : {}),
  }), [supportsElements, isOmni, isSeedance, isSeedanceOmni, seedanceAssets, options, capabilities, references, elements, orderedImageReferences, videoReference]);
  const { quote, quoteError, clearQuote } = usePriceQuote({
    modality,
    modelSlug: selectedModel,
    prompt: generationPrompt,
    options: quoteOptions,
    enabled: shotsValid && (!isSeedance || (isSeedanceOmni ? seedanceAssetsValid : references.length > 0)),
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

  const changeModel = (nextModel) => {
    if (nextModel === selectedModel) return;
    generationRun.current += 1;
    clearQuote();
    setPrompt("");
    setActiveShot(null);
    setOptions({});
    setReferences([]);
    setSeedanceAssets([]);
    setSeedancePickerType(null);
    setVideoReference(null);
    setElements([]);
    setReferencePickerOpen(false);
    setElementPickerOpen(false);
    setVideoPickerOpen(false);
    setUploading(false);
    setGenerating(false);
    setResult(null);
    setError("");
    setSelectedModel(nextModel);
  };

  useEffect(() => {
    let active = true;
    setModels([]);
    setSelectedModel("");
    setPrompt("");
    setActiveShot(null);
    setResult(null);
    setReferences([]);
    setSeedanceAssets([]);
    setSeedancePickerType(null);
    setVideoReference(null);
    setElements([]);
    setReferencePickerOpen(false);
    setElementPickerOpen(false);
    setVideoPickerOpen(false);
    setUploading(false);
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
        ...(isSeedanceOmni ? { omniTaskType: "reference", aspectRatio: "adaptive" } : {}),
      });
    }
    if (modality === "audio") {
      setOptions({ voice: model.voices?.[0] || "", speed: 1 });
    }
  }, [model, modality, capabilities, isSeedanceOmni]);

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
    const run = generationRun.current;
    setUploading(true);
    setError("");
    try {
      const asset = await uploadAssetApi(file);
      if (run !== generationRun.current) return;
      setReferences((current) => {
        if (run !== generationRun.current) return current;
        const frameCount = current.filter((item) => ["first_frame", "last_frame"].includes(item.role)).length;
        if (current.length >= referenceLimit || (isOmni && target === "frame" && frameCount >= 2)) return current;
        const role = isOmni ? target === "frame"
          ? (frameCount === 0 ? "first_frame" : "last_frame")
          : "refer_image" : undefined;
        return [...current, { id: Number(asset.id), url: asset.storedUrl, type: asset.assetType, role }];
      });
    } catch (err) {
      if (run === generationRun.current) setError(err.message || "Upload thất bại");
    } finally {
      if (run === generationRun.current) setUploading(false);
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
    const run = generationRun.current;
    setUploading(true);
    try {
      const asset = await uploadAssetApi(file);
      if (run !== generationRun.current) return;
      setVideoReference({ id: Number(asset.id), url: asset.storedUrl, role: "feature_video" });
      setOptions((current) => ({ ...current, multiShot: true, audioMode: "off", generateAudio: false }));
    } catch (err) { if (run === generationRun.current) setError(err.message || "Upload video thất bại"); }
    finally { if (run === generationRun.current) setUploading(false); event.target.value = ""; }
  };
  const addSeedanceAssets = (assets, type) => {
    const limit = type === "image" ? 30 : 10;
    setSeedanceAssets((current) => {
      const existing = new Set(current.map((item) => item.id));
      let count = current.filter((item) => item.type === type).length;
      const additions = assets.filter((asset) => asset.assetType === type && !existing.has(Number(asset.id)))
        .filter(() => ++count <= limit)
        .map((asset) => ({ id: Number(asset.id), type, url: asset.storedUrl,
          mimeType: asset.mimeType, fileSizeBytes: asset.fileSizeBytes == null ? null : Number(asset.fileSizeBytes),
          width: asset.width, height: asset.height, fps: asset.fps,
          durationSeconds: Number(asset.metadata?.mediaDurationSeconds ?? asset.durationSeconds ?? asset.duration) }));
      return [...current, ...additions];
    });
    setSeedancePickerType(null);
  };
  const uploadSeedanceAsset = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (type === "audio" && file.size > 15_000_000) {
      setError("Âm thanh tham chiếu không được vượt quá 15 MB");
      event.target.value = "";
      return;
    }
    const run = generationRun.current;
    setUploading(true);
    try {
      const asset = await uploadAssetApi(file);
      if (run === generationRun.current) addSeedanceAssets([asset], type);
    } catch (err) {
      if (run === generationRun.current) setError(err.message || "Tải tài nguyên thất bại");
    } finally {
      if (run === generationRun.current) setUploading(false);
      event.target.value = "";
    }
  };
  const changeSeedanceTask = (mode) => {
    setOptions((current) => ({ ...current, omniTaskType: mode,
      aspectRatio: "adaptive", duration: mode === "edit" ? -1 : 5 }));
  };
  const removeMention = (mention) => {
    const pattern = new RegExp(`${mention}(?=\\s|$)`, "g");
    const withoutMention = (text) => {
      const next = text.replace(pattern, "");
      return next.trim() ? next : "";
    };
    setPrompt(withoutMention);
    setOptions((current) => !Array.isArray(current.shots) ? current : ({
      ...current,
      shots: current.shots.map((shot) => ({ ...shot, prompt: withoutMention(shot.prompt) })),
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
      (modality === "video" && !isOmni && !isSeedanceOmni && !references.length) ||
      (isSeedanceOmni && !seedanceAssetsValid)
    ) return;
    const run = generationRun.current;
    setGenerating(true);
    setError("");
    try {
      let created = await createGeneration({
        quoteId: quote.quoteId,
        prompt: generationPrompt,
        referenceUrls: orderedImageReferences.map((item) => item.url),
        referenceAssetIds: isSeedanceOmni ? seedanceAssets.map((item) => item.id)
          : [...orderedImageReferences.map((item) => item.id), ...(videoReference ? [videoReference.id] : [])],
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
              onChange={changeModel}
            />
            {isSeedanceOmni ? <SeedanceOmniInputs
              mode={options.omniTaskType || "reference"}
              onModeChange={changeSeedanceTask}
              assets={seedanceAssets}
              errors={seedanceErrors}
              uploading={uploading}
              onUpload={uploadSeedanceAsset}
              onPick={setSeedancePickerType}
              onRemove={(asset) => { removeMention(`@${asset.type}_${asset.id}`); setSeedanceAssets((current) => current.filter((item) => item.id !== asset.id)); }}
              onInsertMention={insertMention}
            /> : <GenerationInputs
              modality={modality}
              options={options}
              referenceLimit={referenceLimit}
              references={references}
              setReferences={setReferences}
              uploading={uploading}
              uploadReference={uploadReference}
              setReferencePickerOpen={setReferencePickerOpen}
              isOmni={isOmni}
              requiresFrame={capabilities.requiresImage}
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
            />}
            <PromptEditor
              modality={modality}
              modelId={selectedModel}
              mentionAssets={mentionAssets}
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
            ready={shotsValid && (!isOmni || (!videoReference || !options.generateAudio) && (!videoReference || videoReference.role !== "base_video" || !options.multiShot)) &&
              (!isSeedanceOmni || seedanceAssetsValid)}
            requiresReference={!isOmni && !isSeedanceOmni}
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
      {seedancePickerType && isSeedanceOmni && (
        <AssetPicker type={seedancePickerType} max={seedancePickerType === "image" ? 30 : 10}
          excludedIds={seedanceAssets.map((asset) => asset.id)}
          onClose={() => setSeedancePickerType(null)}
          onConfirm={(assets) => addSeedanceAssets(assets, seedancePickerType)} />
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

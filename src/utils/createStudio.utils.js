import { decode, encode } from "gpt-tokenizer";

export const MEDIA_PROMPT_TOKEN_LIMIT = 4000;

export function studioErrorMessage(error, fallback = "Không thể hoàn tất yêu cầu. Vui lòng thử lại.") {
  const detail = error?.response?.data?.message ?? error?.errorMessage ?? error?.message;
  if (typeof detail === "string") return detail.trim() || fallback;
  if (Array.isArray(detail)) return detail.filter((item) => typeof item === "string").join("; ") || fallback;
  return typeof detail?.message === "string" ? detail.message : fallback;
}

export async function validateFrameImageSize(source) {
  const isFile = source instanceof Blob;
  let { width, height } = source;
  if (isFile || width == null || height == null) {
    const url = isFile ? URL.createObjectURL(source) : source.storedUrl;
    try {
      ({ width, height } = await new Promise((resolve, reject) => {
        const image = new Image();
        const timer = setTimeout(() => finish(new Error("Không thể đọc kích thước ảnh. Vui lòng chọn lại ảnh.")), 15000);
        const finish = (error) => {
          clearTimeout(timer);
          image.onload = null;
          image.onerror = null;
          if (error) reject(error);
          else resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onload = () => finish();
        image.onerror = () => finish(new Error("Không thể đọc kích thước ảnh. Vui lòng chọn lại ảnh."));
        image.src = url;
      }));
    } finally {
      if (isFile) URL.revokeObjectURL(url);
    }
  }
  if (!Number.isFinite(Number(width)) || !Number.isFinite(Number(height)) || width < 300 || height < 300) {
    throw new Error("Ảnh cần có chiều rộng và chiều cao tối thiểu 300 px.");
  }
}

export function dragMention(event, mention) {
  event.dataTransfer.clearData();
  event.dataTransfer.setData("application/x-kling-mention", mention);
  event.dataTransfer.setData("text/plain", mention);
  event.dataTransfer.effectAllowed = "copy";
}

export function limitMediaPrompt(value) {
  const tokens = encode(value);
  return tokens.length <= MEDIA_PROMPT_TOKEN_LIMIT
    ? value
    : decode(tokens.slice(0, MEDIA_PROMPT_TOKEN_LIMIT));
}

export function values(capabilities, key, fallback = []) {
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

export function referenceLimitFor(modality, capabilities) {
  if (modality === "image") {
    return Math.max(0, Number(capabilities?.input_references?.max) || 0);
  }
  if (modality === "video") {
    return Number(capabilities?.maxReferenceImages || 0);
  }
  return 0;
}

export function videoAspectRatioApplies(capabilities, references = [], videoReference = null) {
  if (!capabilities?.aspectRatios?.length) return false;
  if (!capabilities.referenceVideos) return true;
  return !videoReference && !references.some((reference) => reference.role === "first_frame");
}

export function formatVideoShots(shots) {
  return shots.map((shot, index) =>
    `shot ${index + 1}, ${shot.duration}, ${shot.prompt.trim()};`,
  ).join(" ");
}

export function validVideoShots(shots, duration, maxPromptCharacters) {
  if (!Array.isArray(shots) || shots.length < 1 || shots.length > 6) return false;
  if (shots.some((shot) =>
    !Number.isInteger(Number(shot.duration)) || Number(shot.duration) < 1 ||
    !shot.prompt?.trim() || shot.prompt.trim().length > 512 || shot.prompt.includes(";"),
  )) return false;
  return shots.reduce((total, shot) => total + Number(shot.duration), 0) === Number(duration) &&
    formatVideoShots(shots).length <= Number(maxPromptCharacters || 3072);
}


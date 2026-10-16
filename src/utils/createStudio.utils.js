import { decode, encode } from "gpt-tokenizer";

export const MEDIA_PROMPT_TOKEN_LIMIT = 4000;

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


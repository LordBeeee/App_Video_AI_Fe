import { useEffect, useMemo } from "react";
import { countTokens } from "gpt-tokenizer";
import {
  limitMediaPrompt,
  MEDIA_PROMPT_TOKEN_LIMIT,
} from "../../utils/createStudio.utils";

export default function PromptEditor({ modality, capabilities, prompt, setPrompt }) {
  const isMediaPrompt = modality === "image" || modality === "video";
  const promptTokenCount = useMemo(
    () => (isMediaPrompt ? countTokens(prompt) : 0),
    [isMediaPrompt, prompt],
  );

  useEffect(() => {
    if (isMediaPrompt) setPrompt((current) => limitMediaPrompt(current));
  }, [isMediaPrompt, setPrompt]);

  const handleChange = (event) => {
    const value = event.target.value;
    if (!isMediaPrompt) {
      setPrompt(value);
    } else if (modality === "video" && capabilities.maxPromptCharacters) {
      setPrompt(value.slice(0, capabilities.maxPromptCharacters));
    } else {
      setPrompt(limitMediaPrompt(value));
    }
  };

  const countLabel = modality === "video" && capabilities.maxPromptCharacters
    ? `${prompt.length.toLocaleString("vi-VN")} / ${capabilities.maxPromptCharacters.toLocaleString("vi-VN")} ký tự`
    : isMediaPrompt
      ? `${promptTokenCount.toLocaleString("vi-VN")} / ${MEDIA_PROMPT_TOKEN_LIMIT.toLocaleString("vi-VN")} token`
      : `${prompt.length.toLocaleString("vi-VN")} ký tự`;

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">
          {modality === "audio" ? "Kịch bản" : "Prompt"}
        </p>
        <span className="text-xs text-slate-600">{countLabel}</span>
      </div>
      <textarea
        value={prompt}
        onChange={handleChange}
        rows={8}
        placeholder={
          modality === "audio"
            ? "Nhập nội dung bạn muốn chuyển thành giọng nói..."
            : "Mô tả nội dung bạn muốn tạo..."
        }
        className="w-full resize-none bg-transparent text-sm leading-6 text-on-surface outline-none placeholder:text-outline"
      />
    </div>
  );
}

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
    <div className="st-box">
      <p className="st-lb">
        <span className="ic"><span className="material-symbols-outlined">edit_note</span></span>
        <span className="g">{modality === "audio" ? "Kịch bản" : "Prompt"}</span>
        <em>{countLabel}</em>
      </p>
      <textarea
        value={prompt}
        onChange={handleChange}
        rows={8}
        placeholder={
          modality === "audio"
            ? "Nhập nội dung bạn muốn chuyển thành giọng nói..."
            : "Mô tả nội dung bạn muốn tạo..."
        }
        className="st-ta"
      />
    </div>
  );
}

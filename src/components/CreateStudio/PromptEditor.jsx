import { useEffect, useMemo } from "react";
import { countTokens } from "gpt-tokenizer";
import {
  limitMediaPrompt,
  MEDIA_PROMPT_TOKEN_LIMIT,
  validVideoShots,
} from "../../utils/createStudio.utils";

export default function PromptEditor({ modality, capabilities, prompt, setPrompt, options, setOptions, onFocusShot }) {
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

  if (modality === "video" && options?.multiShot && options.customShots) {
    const shots = options.shots || [];
    const total = shots.reduce((sum, shot) => sum + Number(shot.duration || 0), 0);
    const valid = validVideoShots(shots, options.duration, capabilities.maxPromptCharacters);
    const updateShot = (index, change) => setOptions((current) => ({
      ...current,
      shots: current.shots.map((shot, i) => i === index ? { ...shot, ...change } : shot),
    }));
    return (
      <div className="st-shots">
        {shots.map((shot, index) => (
          <div className="st-shot st-box" key={index}>
            <div className="st-shot-head">
              <b>Shot {index + 1}</b>
              <div className="st-shot-actions">
                <button type="button" aria-label={`Giảm thời lượng shot ${index + 1}`} disabled={shot.duration <= 1} onClick={() => updateShot(index, { duration: Number(shot.duration) - 1 })}>−</button>
                <span>{shot.duration}s</span>
                <button type="button" aria-label={`Tăng thời lượng shot ${index + 1}`} disabled={shot.duration >= options.duration} onClick={() => updateShot(index, { duration: Number(shot.duration) + 1 })}>+</button>
                <button type="button" aria-label={`Xóa shot ${index + 1}`} disabled={shots.length === 1} onClick={() => setOptions((current) => ({ ...current, shots: current.shots.filter((_, i) => i !== index) }))}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
            <textarea
              className="st-ta"
              rows={3}
              maxLength={512}
              aria-label={`Mô tả shot ${index + 1}`}
              placeholder={`Mô tả hành động cho shot ${index + 1}...`}
              value={shot.prompt}
              onFocus={() => onFocusShot?.(index)}
              onChange={(event) => updateShot(index, { prompt: event.target.value })}
            />
            <small>{shot.prompt.length}/512 ký tự</small>
          </div>
        ))}
        <button type="button" className="st-shot-add" disabled={shots.length >= 6} onClick={() => setOptions((current) => ({ ...current, shots: [...current.shots, { prompt: "", duration: 1 }] }))}>
          <span className="material-symbols-outlined">add</span> Thêm shot
        </button>
        <div className={`st-shot-total${valid ? "" : " bad"}`}>
          <span>Tổng thời gian shot</span>
          <b>{total}s / {options.duration}s</b>
        </div>
        {!valid && <p className="st-shot-help">Nhập mô tả cho từng shot, tối đa 512 ký tự, không dùng dấu ; và chỉnh tổng thời gian bằng thời lượng video.</p>}
      </div>
    );
  }

  return (
    <div className="st-box">
      <p className="st-lb">
        <span className="ic"><span className="material-symbols-outlined">edit_note</span></span>
        <span className="g">{modality === "audio" ? "Kịch bản" : "Prompt"}</span>
        <em>{countLabel}</em>
      </p>
      <textarea
        value={prompt}
        onFocus={() => onFocusShot?.(null)}
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

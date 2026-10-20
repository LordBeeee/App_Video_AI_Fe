import { useEffect, useMemo } from "react";
import { countTokens } from "gpt-tokenizer";
import { InfoTip } from "../Aurora/AuroraUI";
import MentionPrompt from "./MentionPrompt";
import {
  limitMediaPrompt,
  MEDIA_PROMPT_TOKEN_LIMIT,
  validVideoShots,
} from "../../utils/createStudio.utils";

export default function PromptEditor({ modality, modelId, mentionAssets = [], capabilities, prompt, setPrompt, options, setOptions, onFocusShot }) {
  const isMediaPrompt = modality === "image" || modality === "video";
  const richPrompt = ["kling/kling-3.0", "kling/kling-3.0-omni"].includes(modelId);
  const promptTokenCount = useMemo(
    () => (isMediaPrompt ? countTokens(prompt) : 0),
    [isMediaPrompt, prompt],
  );

  useEffect(() => {
    if (modality === "video" && capabilities.maxPromptCharacters) {
      setPrompt((current) => current.slice(0, capabilities.maxPromptCharacters));
    } else if (isMediaPrompt) {
      setPrompt((current) => limitMediaPrompt(current));
    }
  }, [modality, capabilities.maxPromptCharacters, isMediaPrompt, setPrompt]);

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

  const handleMentionDragOver = (event) => {
    if (!event.dataTransfer.types.includes("application/x-kling-mention")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleMentionDrop = (event, shotIndex) => {
    const mention = event.dataTransfer.getData("application/x-kling-mention");
    if (!/^@(image|video|element)_\d+$/.test(mention)) return;
    event.preventDefault();
    const field = event.currentTarget;
    const value = field.value;
    const start = document.activeElement === field ? field.selectionStart : value.length;
    const end = document.activeElement === field ? field.selectionEnd : value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const next = `${before}${before && !/\s$/.test(before) ? " " : ""}${mention}${after && !/^\s/.test(after) ? " " : ""}${after}`;
    const limit = shotIndex == null ? capabilities.maxPromptCharacters || 2500 : 512;
    if (next.length > limit) return;
    if (shotIndex == null) setPrompt(next);
    else setOptions((current) => ({
      ...current,
      shots: current.shots.map((shot, index) => index === shotIndex ? { ...shot, prompt: next } : shot),
    }));
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
              <b>Shot {index + 1}<span className="st-required" title="Mô tả shot bắt buộc" aria-label="Mô tả shot bắt buộc">*</span></b>
              <div className="st-shot-actions">
                <button type="button" aria-label={`Giảm thời lượng shot ${index + 1}`} disabled={shot.duration <= 1} onClick={() => updateShot(index, { duration: Number(shot.duration) - 1 })}>−</button>
                <span>{shot.duration}s</span>
                <button type="button" aria-label={`Tăng thời lượng shot ${index + 1}`} disabled={shot.duration >= options.duration} onClick={() => updateShot(index, { duration: Number(shot.duration) + 1 })}>+</button>
                <button type="button" aria-label={`Xóa shot ${index + 1}`} disabled={shots.length === 1} onClick={() => setOptions((current) => ({ ...current, shots: current.shots.filter((_, i) => i !== index) }))}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
            {richPrompt ? <MentionPrompt
              value={shot.prompt}
              onChange={(value) => updateShot(index, { prompt: value })}
              assets={mentionAssets}
              maxLength={512}
              ariaLabel={`Mô tả shot ${index + 1}`}
              placeholder={`Mô tả hành động cho shot ${index + 1}...`}
              rows={3}
              onFocus={() => onFocusShot?.(index)}
            /> : <textarea
              className="st-ta"
              rows={3}
              maxLength={512}
              aria-label={`Mô tả shot ${index + 1}`}
              placeholder={`Mô tả hành động cho shot ${index + 1}...`}
              value={shot.prompt}
              onFocus={() => onFocusShot?.(index)}
              onChange={(event) => updateShot(index, { prompt: event.target.value.slice(0, 512) })}
              onDragOver={handleMentionDragOver}
              onDrop={(event) => handleMentionDrop(event, index)}
            />}
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
        <span className="g">{modality === "audio" ? "Kịch bản" : "Prompt"}{modality === "video" && <span className="st-required" title="Prompt bắt buộc" aria-label="Prompt bắt buộc">*</span>}</span>
        {modality === "video" && capabilities.maxPromptCharacters === 3072 && (
          <InfoTip
            info="Giới hạn tối đa 3.072 ký tự; Kling khuyến nghị không quá 2.500 ký tự."
            label="Giới hạn prompt Kling 3.0"
            tone="dark"
          />
        )}
        {modality === "video" && modelId === "kling/kling-3.0-turbo" && (
          <InfoTip
            info="Có thể mô tả nội dung mong muốn và những điều cần tránh. Tối đa 2.500 ký tự."
            label="Hướng dẫn prompt Kling 3.0 Turbo"
            tone="dark"
          />
        )}
        {modality === "video" && modelId === "seedance/seedance-2.5" && (
          <InfoTip
            info="Giới hạn tối đa 2.500 ký tự. BytePlus khuyến nghị prompt không quá 1.000 từ tiếng Anh để model ít bỏ sót chi tiết."
            label="Hướng dẫn prompt Seedance 2.5"
            tone="dark"
          />
        )}
        <em>{countLabel}</em>
      </p>
      {richPrompt ? <MentionPrompt
        value={prompt}
        onChange={setPrompt}
        assets={mentionAssets}
        maxLength={capabilities.maxPromptCharacters || 2500}
        ariaLabel="Prompt"
        placeholder="Mô tả nội dung bạn muốn tạo..."
        onFocus={() => onFocusShot?.(null)}
      /> : <textarea
        value={prompt}
        maxLength={modality === "video" ? capabilities.maxPromptCharacters : undefined}
        onFocus={() => onFocusShot?.(null)}
        onChange={handleChange}
        onDragOver={handleMentionDragOver}
        onDrop={(event) => handleMentionDrop(event, null)}
        rows={8}
        placeholder={
          modality === "audio"
            ? "Nhập nội dung bạn muốn chuyển thành giọng nói..."
            : "Mô tả nội dung bạn muốn tạo..."
        }
        className="st-ta"
      />}
    </div>
  );
}

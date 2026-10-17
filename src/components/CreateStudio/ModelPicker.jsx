import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Empty } from "../Aurora/AuroraUI";
import "./studio.css";

const MODALITY_META = {
  image: { label: "ảnh" },
  video: { label: "video" },
  audio: { label: "giọng nói" },
};

function modelIdentity(model) {
  const name = model?.name || model?.id || "Chưa chọn model";
  const separator = name.indexOf(":");
  if (separator < 0) {
    return {
      provider: model?.provider || model?.id?.split("/")[0] || "AI",
      name,
    };
  }
  return {
    provider: name.slice(0, separator).trim(),
    name: name.slice(separator + 1).trim(),
  };
}

function capabilityValues(capabilities, key) {
  const value = capabilities?.[key];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.values)) return value.values;
  return [];
}

function capabilityTags(model, modality) {
  const capabilities = model?.capabilities || {};
  const tags = [];

  if (modality === "image") {
    const resolutions = capabilityValues(capabilities, "resolution");
    const qualities = capabilityValues(capabilities, "quality");
    if (resolutions.length) tags.push(resolutions.join(" · "));
    if (qualities.length) tags.push(`${qualities.length} mức chất lượng`);
    if (capabilities.input_references?.max) {
      tags.push(`Tối đa ${capabilities.input_references.max} ảnh tham chiếu`);
    }
  }

  if (modality === "video") {
    if (capabilities.resolutions?.length) {
      tags.push(capabilities.resolutions.join(" · "));
    }
    if (capabilities.durations?.length) {
      const durations = capabilities.durations;
      tags.push(`${Math.min(...durations)}–${Math.max(...durations)} giây`);
    }
    if (capabilities.generateAudio) tags.push("Có âm thanh");
    if (capabilities.nativeAudioIncluded) tags.push("Có âm thanh mặc định");
    if (model?.pricing?.unitType === "unpublished_api_rate") tags.push("Chưa có giá API");
  }

  if (modality === "audio" && model?.voices?.length) {
    tags.push(`${model.voices.length} giọng đọc`);
  }

  return tags.slice(0, 3);
}

export default function ModelPicker({ modality, models, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [closing, setClosing] = useState(false);
  const selectedModel = useMemo(
    () => models.find((item) => item.id === value),
    [models, value],
  );
  const selectedIdentity = modelIdentity(selectedModel);
  const meta = MODALITY_META[modality] || MODALITY_META.image;

  const filteredModels = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    if (!normalizedQuery) return models;
    return models.filter((item) =>
      [item.name, item.id, item.description]
        .filter(Boolean)
        .some((field) =>
          String(field).toLocaleLowerCase("vi-VN").includes(normalizedQuery),
        ),
    );
  }, [models, query]);

  const closeDrawer = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, closing]);

  const chooseModel = (modelId) => {
    onChange(modelId);
    setQuery("");
    closeDrawer();
  };

  const dialog = open && (
    <div
      className={`au-mo st-mo${closing ? " out" : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDrawer();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-picker-title"
        className="au-mo-box"
      >
        <div className="st-mh">
          <div className="st-mh-t">
            <div>
              <small>Model AI</small>
              <h2 id="model-picker-title" className="au-fd">Chọn model tạo {meta.label}</h2>
              <p>{models.length} model khả dụng</p>
            </div>
            <button type="button" className="au-ico" aria-label="Đóng danh sách model" onClick={closeDrawer}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <label className="au-search">
            <span className="material-symbols-outlined">search</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên model, provider hoặc mô tả..."
            />
            {query && (
              <button type="button" className="au-ico" style={{ width: 24, height: 24 }} aria-label="Xóa tìm kiếm" onClick={() => setQuery("")}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            )}
          </label>
        </div>

        <div className="st-ml">
          {filteredModels.map((item) => {
            const identity = modelIdentity(item);
            const tags = capabilityTags(item, modality);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseModel(item.id)}
                className={`st-mi${item.id === value ? " on" : ""}`}
              >
                <span className="tx">
                  <span className="nm">
                    {identity.name}
                    <span className="pv">{identity.provider}</span>
                  </span>
                  {item.description && <span className="ds">{item.description}</span>}
                  {tags.length > 0 && (
                    <span className="tags">
                      {tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </span>
                  )}
                </span>
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            );
          })}
          {filteredModels.length === 0 && (
            <Empty tone="dark" icon="search_off" text="Không tìm thấy model" hint="Thử tìm bằng tên model hoặc provider khác." />
          )}
        </div>
      </section>
    </div>
  );

  return (
    <div className="st-box">
      <p className="st-lb"><span className="ic"><span className="material-symbols-outlined">neurology</span></span><span className="g">Model</span></p>
      <button
        type="button"
        className="st-pick"
        onClick={() => setOpen(true)}
        disabled={!models.length}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>
          <small>{models.length ? selectedIdentity.provider : "Đang tải catalog..."}</small>
          <b>{models.length ? selectedIdentity.name : "Vui lòng chờ"}</b>
        </span>
        <span className="material-symbols-outlined">unfold_more</span>
      </button>
      {typeof document !== "undefined" && createPortal(dialog, document.body)}
    </div>
  );
}

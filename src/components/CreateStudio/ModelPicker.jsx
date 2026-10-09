import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const MODALITY_META = {
  image: { icon: "image", label: "ảnh" },
  video: { icon: "smart_display", label: "video" },
  audio: { icon: "graphic_eq", label: "giọng nói" },
};

function modelIdentity(model) {
  const name = model?.name || model?.id || "Chưa chọn model";
  const separator = name.indexOf(":");
  if (separator < 0) {
    return {
      provider: model?.id?.split("/")[0] || "OpenRouter",
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
  }

  if (modality === "audio" && model?.voices?.length) {
    tags.push(`${model.voices.length} giọng đọc`);
  }

  return tags.slice(0, 3);
}

export default function ModelPicker({ modality, models, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const selectedModel = useMemo(
    () => models.find((item) => item.id === value),
    [models, value],
  );
  const selectedIdentity = modelIdentity(selectedModel);
  const hasLongDescription = (selectedModel?.description?.length || 0) > 180;
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

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const chooseModel = (modelId) => {
    onChange(modelId);
    setOpen(false);
    setQuery("");
  };

  const dialog = open && (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-picker-title"
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#171a1f] shadow-2xl sm:max-h-[76vh] sm:max-w-2xl sm:rounded-3xl"
      >
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Model AI
              </p>
              <h2
                id="model-picker-title"
                className="mt-1 text-xl font-semibold text-white"
              >
                Chọn model tạo {meta.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {models.length} model khả dụng từ OpenRouter
              </p>
            </div>
            <button
              type="button"
              aria-label="Đóng danh sách model"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <label className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-[#111418] px-4 py-3 focus-within:border-cyan-400/50">
            <span className="material-symbols-outlined text-xl text-slate-500">
              search
            </span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên model, provider hoặc mô tả..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
            {query && (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => setQuery("")}
                className="text-slate-500 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">
                  cancel
                </span>
              </button>
            )}
          </label>
        </div>

        <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-3 sm:p-4">
          {filteredModels.map((item) => {
            const identity = modelIdentity(item);
            const tags = capabilityTags(item, modality);
            const selected = item.id === value;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseModel(item.id)}
                className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition sm:p-4 ${
                  selected
                    ? "border-cyan-400/60 bg-cyan-400/10"
                    : "border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.055]"
                }`}
              >
                <span
                  className={`material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-cyan-400/15 text-cyan-300" : "bg-white/[0.06] text-slate-400 group-hover:text-white"}`}
                >
                  {meta.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="break-words text-sm font-semibold leading-5 text-white sm:text-base">
                      {identity.name}
                    </span>
                    <span className="rounded-md bg-white/[0.07] px-2 py-0.5 text-[11px] font-medium text-slate-400">
                      {identity.provider}
                    </span>
                  </span>
                  {item.description && (
                    <span className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm">
                      {item.description}
                    </span>
                  )}
                  {tags.length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/[0.08] bg-black/15 px-2 py-1 text-[11px] text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span
                  className={`material-symbols-outlined mt-2 text-xl ${selected ? "text-cyan-300" : "text-transparent"}`}
                >
                  check_circle
                </span>
              </button>
            );
          })}

          {filteredModels.length === 0 && (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-600">
                search_off
              </span>
              <p className="mt-3 font-medium text-slate-300">
                Không tìm thấy model
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Thử tìm bằng tên model hoặc provider khác.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#181b20] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Model
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!models.length}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          {meta.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium text-slate-500">
            {models.length ? selectedIdentity.provider : "Đang tải catalog..."}
          </span>
          <span className="mt-0.5 line-clamp-2 break-words text-sm font-semibold leading-5 text-white">
            {models.length ? selectedIdentity.name : "Vui lòng chờ"}
          </span>
        </span>
        <span className="material-symbols-outlined shrink-0 text-xl text-slate-500">
          unfold_more
        </span>
      </button>

      {selectedModel?.description && (
        <div className="mt-3 border-t border-white/[0.07] pt-3">
          <p
            className={`${!hasLongDescription || descriptionExpanded ? "" : "line-clamp-3"} text-xs leading-5 text-slate-500`}
          >
            {selectedModel.description}
          </p>
          {hasLongDescription && (
            <button
              type="button"
              onClick={() => setDescriptionExpanded((current) => !current)}
              className="mt-1.5 text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              {descriptionExpanded ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </div>
      )}

      {typeof document !== "undefined" && createPortal(dialog, document.body)}
    </div>
  );
}

import { useEffect, useRef } from "react";

const optionLabel = (value) => ({
  first_frame: "Ảnh đầu / ảnh cuối",
  refer_image: "Ảnh tham chiếu",
})[value] || String(value);

export function FieldSelect({ label, icon, value, onChange, options, emptyLabel, className = "c3" }) {
  if (!options?.length) return null;
  return (
    <label title={label} className={`st-fs ${className}`}>
      <span className="material-symbols-outlined">{icon}</span>
      <span className="v">{value ? optionLabel(value) : emptyLabel || "Chọn"}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {emptyLabel && <option value="">{emptyLabel}</option>}
        {options.map((option) => (
          <option key={String(option)} value={option}>{optionLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}

export function MenuSelect({ label, icon, value, onChange, options, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const closeOutside = (event) => {
      if (ref.current?.open && !ref.current.contains(event.target)) ref.current.open = false;
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <details className={`st-choice ${className}`} ref={ref}>
      <summary className="st-fs" aria-label={label}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="v">{options.find((item) => (item.value ?? item) === value)?.label ?? optionLabel(value)}</span>
        <span className="material-symbols-outlined st-choice-chevron">expand_more</span>
      </summary>
      <div className="st-choice-options">
        {options.map((item) => {
          const optionValue = item.value ?? item;
          return (
            <button
              key={optionValue}
              type="button"
              className={`st-dd-it${optionValue === value ? " on" : ""}`}
              aria-current={optionValue === value ? "true" : undefined}
              onClick={() => { onChange(optionValue); ref.current.open = false; ref.current.querySelector("summary")?.focus(); }}
            >
              <span className="nm">{item.label ?? optionLabel(optionValue)}</span>
              <span className="material-symbols-outlined">check</span>
            </button>
          );
        })}
      </div>
    </details>
  );
}

export function SeedField({ value, onChange, className = "c3" }) {
  return (
    <label title="Seed" className={`st-fs ${className}`}>
      <span className="material-symbols-outlined">casino</span>
      <input
        aria-label="Seed"
        type="number"
        step="1"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
        placeholder="Ngẫu nhiên"
      />
    </label>
  );
}

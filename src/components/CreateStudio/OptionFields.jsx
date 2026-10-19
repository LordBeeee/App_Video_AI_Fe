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

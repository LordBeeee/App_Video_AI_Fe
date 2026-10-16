const optionLabel = (value) => ({
  first_frame: "Ảnh đầu / ảnh cuối",
  refer_image: "Ảnh tham chiếu",
})[value] || String(value);

export function FieldSelect({
  label,
  icon,
  value,
  onChange,
  options,
  emptyLabel,
  className = "col-span-3",
}) {
  if (!options?.length) return null;
  return (
    <label
      title={label}
      className={`group relative flex min-h-12 min-w-0 items-center rounded-xl border border-outline-variant bg-white px-2 shadow-[0_2px_8px_rgba(92,55,24,0.04)] transition hover:border-primary/50 hover:shadow-[0_5px_14px_rgba(243,136,32,0.10)] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 ${className}`}
    >
      <span className="sr-only">{label}</span>
      <span className="material-symbols-outlined shrink-0 text-[18px] text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1 whitespace-nowrap px-1.5 text-[13px] font-bold text-on-surface">
        {value ? optionLabel(value) : emptyLabel || "Chọn"}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {emptyLabel && <option value="">{emptyLabel}</option>}
        {options.map((option) => (
          <option key={String(option)} value={option}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SeedField({ value, onChange, className = "col-span-3" }) {
  return (
    <label
      title="Seed"
      className={`group flex min-h-12 min-w-0 items-center rounded-xl border border-outline-variant bg-white px-2 shadow-[0_2px_8px_rgba(92,55,24,0.04)] transition hover:border-primary/50 hover:shadow-[0_5px_14px_rgba(243,136,32,0.10)] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 ${className}`}
    >
      <span className="sr-only">Seed</span>
      <span className="material-symbols-outlined shrink-0 text-[18px] text-primary">
        casino
      </span>
      <input
        aria-label="Seed"
        type="number"
        step="1"
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? "" : Number(event.target.value),
          )
        }
        placeholder="Ngẫu nhiên"
        className="min-w-0 flex-1 appearance-none bg-transparent px-1.5 text-[13px] font-bold text-on-surface outline-none placeholder:font-semibold placeholder:text-slate-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  );
}


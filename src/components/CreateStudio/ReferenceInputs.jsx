import AssetPicker from "../Library/AssetPicker";

export default function ReferenceInputs({
  modality,
  options,
  referenceLimit,
  references,
  setReferences,
  uploading,
  uploadReference,
  referencePickerOpen,
  setReferencePickerOpen,
}) {
  const addSelectedAssets = (assets) => {
    setReferences((current) => {
      const existingIds = new Set(current.map((item) => String(item.id)));
      const selected = assets
        .filter((asset) => !existingIds.has(String(asset.id)))
        .map((asset) => ({
          id: Number(asset.id),
          url: asset.storedUrl,
          type: asset.assetType,
        }));
      return [...current, ...selected].slice(0, referenceLimit);
    });
    setReferencePickerOpen(false);
  };

  return (
    <>
      {referenceLimit > 0 && (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <p className="mb-3 text-sm font-semibold">
            {modality === "video" && options.referenceMode !== "refer_image"
              ? "Ảnh khung hình"
              : "Ảnh tham chiếu"}
          </p>
          <div className="flex flex-wrap gap-3">
            {references.map((reference, index) => (
              <button
                key={reference.id}
                type="button"
                onClick={() =>
                  setReferences((items) => items.filter((_, i) => i !== index))
                }
                className="group relative h-24 w-24 overflow-hidden rounded-xl border border-outline-variant"
              >
                {reference.type === "video" ? (
                  <video src={reference.url} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={reference.url} className="h-full w-full object-cover" alt="Reference" />
                )}
                <span className="absolute inset-0 hidden items-center justify-center bg-black/60 group-hover:flex">
                  Xóa
                </span>
                {modality === "video" && options.referenceMode !== "refer_image" && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/65 py-1 text-center text-[10px] text-white">
                    {index === 0 ? "Ảnh đầu" : "Ảnh cuối"}
                  </span>
                )}
              </button>
            ))}
            {references.length < referenceLimit && (
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-white text-on-surface-variant">
                <label className="flex cursor-pointer flex-col items-center hover:text-primary">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <span className="mt-1 text-xs">{uploading ? "Đang tải" : "Tải ảnh"}</span>
                  <input
                    type="file"
                    accept={modality === "video" ? "image/jpeg,image/png" : "image/*"}
                    className="hidden"
                    disabled={uploading}
                    onChange={uploadReference}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setReferencePickerOpen(true)}
                  className="mt-1 rounded border border-outline-variant px-1.5 text-[11px] hover:text-primary"
                >
                  History
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {referencePickerOpen && (
        <AssetPicker
          type="image"
          max={referenceLimit - references.length}
          onClose={() => setReferencePickerOpen(false)}
          onConfirm={addSelectedAssets}
        />
      )}
    </>
  );
}

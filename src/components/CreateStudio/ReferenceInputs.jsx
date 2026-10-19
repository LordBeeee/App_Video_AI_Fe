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

  const frameMode = modality === "video" && options.referenceMode !== "refer_image";

  return (
    <>
      {referenceLimit > 0 && (
        <div className="st-box">
          <p className="st-lb">
            <span className="ic"><span className="material-symbols-outlined">add_photo_alternate</span></span>
            <span className="g">{frameMode ? "Ảnh khung hình" : "Ảnh tham chiếu"}</span>
          </p>
          <div className="st-refs">
            {references.map((reference, index) => (
              <button
                key={reference.id}
                type="button"
                onClick={() => setReferences((items) => items.filter((_, i) => i !== index))}
                className="st-ref"
              >
                {reference.type === "video" ? (
                  <video src={reference.url} muted />
                ) : (
                  <img src={reference.url} alt="Reference" />
                )}
                <span className="del">Xóa</span>
                {frameMode && <span className="cap">{index === 0 ? "Ảnh đầu" : "Ảnh cuối"}</span>}
              </button>
            ))}
            {references.length < referenceLimit && (
              <div className="st-add">
                <label title={uploading ? "Đang tải ảnh" : "Tải ảnh"}>
                  <span className={`material-symbols-outlined${uploading ? " au-spin" : ""}`} aria-hidden="true">
                    {uploading ? "progress_activity" : "add_photo_alternate"}
                  </span>
                  <input
                    type="file"
                    aria-label="Tải ảnh"
                    accept={modality === "video" ? "image/jpeg,image/png" : "image/*"}
                    className="hidden"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={uploadReference}
                  />
                </label>
                <button type="button" onClick={() => setReferencePickerOpen(true)}>Lịch sử</button>
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

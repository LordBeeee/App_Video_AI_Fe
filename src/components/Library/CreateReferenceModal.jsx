import { useEffect, useRef, useState } from "react";
import { createElementApi, createVoiceApi, getReferencesApi, uploadAssetApi } from "../../services/asset.service";
import AssetPicker from "./AssetPicker";

const inputClass = "mt-2 w-full rounded-lg border border-outline-variant bg-surface-variant p-3 outline-primary";
const selectedClass = "border-primary bg-primary-container text-primary-hover";
const unselectedClass = "border-outline-variant bg-surface-variant";

export default function CreateReferenceModal({ onClose, onCreated }) {
  const [kind, setKind] = useState("image");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [main, setMain] = useState(null);
  const [additional, setAdditional] = useState([]);
  const [video, setVideo] = useState(null);
  const [sample, setSample] = useState(null);
  const [picker, setPicker] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    getReferencesApi().then((data) => setAvailableVoices((data.items || []).filter(
      (item) => item.assetRole === "voice" && item.metadata?.status === "succeed" && item.metadata?.voiceId,
    ))).catch(() => {});
  }, []);

  const upload = async (event) => {
    const files = [...(event.target.files || [])];
    event.target.value = "";
    if (!files.length) return;
    setBusy(true); setError("");
    try {
      const assets = [];
      for (const file of files) assets.push(await uploadAssetApi(file));
      if (targetRef.current === "main") setMain(assets[0]);
      if (targetRef.current === "video") setVideo(assets[0]);
      if (targetRef.current === "additional") setAdditional((current) => [...current, ...assets].slice(0, 3));
      if (targetRef.current === "sample") setSample(assets[0]);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const chooseFile = (target) => {
    targetRef.current = target;
    inputRef.current.accept = target === "sample"
      ? ".mp3,.wav,.mp4,.mov,audio/mpeg,audio/wav,video/mp4,video/quicktime"
      : target === "video" ? "video/mp4,video/quicktime" : "image/jpeg,image/png";
    inputRef.current.multiple = target === "additional";
    inputRef.current.click();
  };

  const save = async () => {
    setBusy(true); setError("");
    try {
      if (kind === "voice") {
        await createVoiceApi({ name: voiceName.trim(), sampleAssetId: sample.id });
      } else {
        await createElementApi({ name: name.trim(), description: description.trim(), referenceType: kind,
          mainAssetId: main?.id, additionalAssetIds: additional.map((item) => item.id), videoAssetId: video?.id,
          voiceId: voiceId.trim() });
      }
      onCreated(); onClose();
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setBusy(false); }
  };

  const selectFromHistory = (assets) => {
    if (picker === "main") setMain(assets[0]);
    if (picker === "video") setVideo(assets[0]);
    if (picker === "sample") setSample(assets[0]);
    if (picker === "additional") setAdditional((current) => [...current, ...assets.filter((asset) => !current.some((item) => String(item.id) === String(asset.id)))].slice(0, 3));
  };

  const tile = (asset, target, label) => <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-dashed border-outline-variant bg-surface-variant">
    {asset ? <>
      {target === "sample" && asset.assetType === "audio" ? <div className="flex h-full w-full flex-col items-center justify-center text-primary"><span className="material-symbols-outlined text-4xl">graphic_eq</span><span className="text-xs">Audio #{asset.id}</span></div> : target === "video" || target === "sample" ? <video src={asset.storedUrl} muted className="h-full w-full object-cover" /> : <img src={asset.storedUrl} alt={label} className="h-full w-full object-cover" />}
      <button type="button" onClick={() => setPicker(target)} className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-outline-variant bg-surface px-2 py-1 text-xs">History</button>
    </> : <div className="flex h-full flex-col items-center justify-center gap-2">
      <button type="button" onClick={() => chooseFile(target)} aria-label={`Tải lên ${label}`} className="flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined">{target === "sample" ? "record_voice_over" : target === "video" ? "video_call" : "add_photo_alternate"}</span></button>
      <button type="button" onClick={() => setPicker(target)} className="rounded-md border border-outline-variant bg-surface px-2 py-1 text-xs">History</button>
    </div>}
  </div>;

  const canSave = kind === "voice" ? !!voiceName.trim() && !!sample : !!name.trim() && !!description.trim() && (kind === "image" ? !!main && !!additional.length : !!video);
  return <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4"><h2 className="text-lg font-semibold">Tạo Reference</h2><button type="button" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button></div>
        <div className="space-y-5 overflow-y-auto p-6">
          <div><p className="mb-2 text-sm font-medium">Loại Reference</p><div className="grid grid-cols-3 gap-2">{[["image", "Ảnh"], ["video", "Video"], ["voice", "Voice"]].map(([value, label]) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => { setKind(value); setError(""); }} className={`rounded-lg border p-2.5 ${kind === value ? selectedClass : unselectedClass}`}>{label}</button>)}</div></div>
          <label className="block text-sm font-medium">Provider<select className={inputClass} value="Kling AI" disabled><option>Kling AI</option></select></label>
          {kind === "voice" ? <>
            <label className="block text-sm font-medium">Tên Reference <span className="float-right text-xs text-on-surface-variant">{voiceName.length}/20</span><input maxLength={20} value={voiceName} onChange={(e) => setVoiceName(e.target.value)} placeholder="Giọng MC" className={inputClass} /></label>
            <div><p className="mb-2 text-sm font-medium">Mẫu giọng <span className="text-red-500">*</span></p>
              {tile(sample, "sample", "Mẫu giọng")}
              {sample && <div className="mt-3 max-w-sm">{sample.assetType === "video" ? <video controls src={sample.storedUrl} className="max-h-48 w-full rounded-lg" /> : <audio controls src={sample.storedUrl} className="w-full" />}<div className="mt-1 flex gap-3"><button type="button" onClick={() => chooseFile("sample")} className="text-sm text-primary">Thay file</button><button type="button" onClick={() => setSample(null)} className="text-sm text-on-surface-variant">Xóa</button></div></div>}
              <p className="mt-2 text-xs text-on-surface-variant">MP3, WAV, MP4 hoặc MOV; một giọng người rõ, ít tạp âm, dài 5–30 giây.</p>
            </div>
          </> : <>
            <label className="block text-sm font-medium">Tên Reference <span className="float-right text-xs text-on-surface-variant">{name.length}/20</span><input maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mèo MC" className={inputClass} /></label>
            <label className="block text-sm font-medium">Mô tả <span className="float-right text-xs text-on-surface-variant">{description.length}/100</span><textarea maxLength={100} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhân vật mèo MC đại diện thương hiệu" rows={2} className={inputClass} /></label>
            {kind === "image" ? <>
              <div><p className="mb-2 text-sm font-medium">Ảnh chính diện <span className="text-red-500">*</span></p>{tile(main, "main", "Ảnh chính diện")}{main && <button type="button" onClick={() => setMain(null)} className="mt-1 block text-xs text-on-surface-variant">Xóa ảnh</button>}</div>
              <div><p className="mb-2 text-sm font-medium">Ảnh tham chiếu bổ sung <span className="text-red-500">*</span> <span className="float-right text-xs text-on-surface-variant">{additional.length}/3</span></p><div className="flex flex-wrap gap-2">{additional.map((asset) => <div key={asset.id} className="relative">{tile(asset, "additional", "Ảnh bổ sung")}<button type="button" onClick={() => setAdditional((items) => items.filter((item) => item.id !== asset.id))} className="absolute right-1 top-1 rounded-full bg-surface px-1 text-xs">✕</button></div>)}{additional.length < 3 && tile(null, "additional", "Thêm ảnh")}</div></div>
            </> : <div><p className="mb-2 text-sm font-medium">Video nhân vật <span className="text-red-500">*</span></p>{tile(video, "video", "Video nhân vật")}<p className="mt-2 text-xs text-on-surface-variant">MP4/MOV, 3–8 giây, 1080p, 16:9 hoặc 9:16, tối đa 200 MB.</p>{video && <button type="button" onClick={() => setVideo(null)} className="text-xs text-on-surface-variant">Xóa video</button>}</div>}
            <label className="block text-sm font-medium">Giọng nói gắn kèm (tùy chọn)<input list="reference-voice-list" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} placeholder="Chọn giọng đã tạo hoặc dán Voice ID" className={inputClass} /><datalist id="reference-voice-list">{availableVoices.map((item) => <option key={item.id} value={item.metadata.voiceId}>{item.metadata.name}</option>)}</datalist></label>
          </>}
          {error && <p role="alert" className="text-sm text-red-500">{Array.isArray(error) ? error.join(", ") : error}</p>}
          <input ref={inputRef} type="file" className="hidden" onChange={upload} />
        </div>
        <div className="flex justify-end gap-3 border-t border-outline-variant px-6 py-4"><button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-4 py-2">Hủy</button><button type="button" onClick={save} disabled={busy || !canSave} className="rounded-lg bg-primary px-5 py-2 font-medium text-on-primary disabled:opacity-40">{busy ? "Đang xử lý..." : "Tạo Reference"}</button></div>
      </div>
    </div>
    {picker && <AssetPicker type={picker === "sample" ? "voice-sample" : picker === "video" ? "video" : "image"} max={picker === "additional" ? 3 - additional.length : 1} onConfirm={selectFromHistory} onClose={() => setPicker(null)} />}
  </>;
}

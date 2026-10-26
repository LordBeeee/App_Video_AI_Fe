import { useEffect, useRef, useState } from "react";
import { createElementApi, createVoiceApi, getVoicesApi, uploadAssetApi, formatUploadLimit } from "../../services/asset.service";
import AssetPicker from "./AssetPicker";
import { InfoTip, Pills } from "../Aurora/AuroraUI";
import useUploadLimits from "../../hooks/useUploadLimits";
import "./library.css";

const KINDS = [
  { value: "image", label: "Ảnh", icon: "image" },
  { value: "video", label: "Video", icon: "smart_display" },
];

export default function CreateCustomAssetModal({ assetKind = "element", onClose, onCreated }) {
  const [kind, setKind] = useState("image");
  const uploadLimits = useUploadLimits();
  const imageLimit = Math.min(uploadLimits.image, 10_000_000);
  const videoLimit = Math.min(uploadLimits.video, 200_000_000);
  const isVoice = assetKind === "voice";
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
    getVoicesApi().then((data) => setAvailableVoices((data.items || []).filter(
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
      if (isVoice) {
        await createVoiceApi({ name: voiceName.trim(), sampleAssetId: sample.id });
      } else {
        await createElementApi({ name: name.trim(), description: description.trim(), elementType: kind,
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

  const tile = (asset, target, label) => (
    <div className="lb-up">
      {asset ? (
        <>
          {target === "sample" && asset.assetType === "audio" ? (
            <div className="vo"><span className="material-symbols-outlined">graphic_eq</span>Audio #{asset.id}</div>
          ) : target === "video" || target === "sample" ? (
            <video src={asset.storedUrl} muted />
          ) : (
            <img src={asset.storedUrl} alt={label} />
          )}
          <button type="button" onClick={() => setPicker(target)} className="au-ico hs" aria-label="Chọn từ lịch sử" title="Chọn từ lịch sử">
            <span className="material-symbols-outlined">history</span>
          </button>
        </>
      ) : (
        <div className="btns">
          <button type="button" onClick={() => chooseFile(target)} className="au-ico" aria-label={`Tải lên ${label}`} title={`Tải lên ${label}`}>
            <span className="material-symbols-outlined">{target === "sample" ? "record_voice_over" : target === "video" ? "video_call" : "add_photo_alternate"}</span>
          </button>
          <button type="button" onClick={() => setPicker(target)} className="au-fl lb-history" title="Chọn từ lịch sử">Lịch sử</button>
        </div>
      )}
    </div>
  );

  const canSave = isVoice ? !!voiceName.trim() && !!sample : !!name.trim() && !!description.trim() && (kind === "image" ? !!main && !!additional.length : !!video);
  const req = <b className="lb-req">*</b>;

  return (
    <>
      <div className="au-mo lb-mo" onMouseDown={onClose}>
        <div className="lb-mb" onMouseDown={(e) => e.stopPropagation()}>
          <div className="lb-mh">
            <div className="au-chl">
              <span className="au-hic"><span className="material-symbols-outlined">bookmark_add</span></span>
              <h2 className="au-h3 au-fd">Tạo {isVoice ? "Voice" : "Element"}</h2>
              {!isVoice && <InfoTip label="Element là gì?" info="Element là đối tượng tham chiếu tái sử dụng để giữ ngoại hình nhân vật hoặc vật thể nhất quán khi tạo nội dung." />}
            </div>
            <button type="button" onClick={onClose} className="au-ico" aria-label="Đóng" title="Đóng"><span className="material-symbols-outlined">close</span></button>
          </div>

          <div className="lb-mbd au-scroll">
            {!isVoice && <div className="lb-kind-tabs">
              <p className="lb-lab">Loại Element</p>
              <Pills items={KINDS} value={kind} onChange={(value) => { setKind(value); setError(""); }} />
            </div>}

            <label className="lb-fld">Provider
              <select className="lb-in" value="Kling AI" disabled><option>Kling AI</option></select>
            </label>

            {isVoice ? (
              <>
                <label className="lb-fld">Tên Voice <span className="lb-cnt">{voiceName.length}/20</span>
                  <input maxLength={20} value={voiceName} onChange={(e) => setVoiceName(e.target.value)} placeholder="Giọng MC" className="lb-in" />
                </label>
                <div>
                  <p className="lb-lab">Mẫu giọng {req}</p>
                  {tile(sample, "sample", "Mẫu giọng")}
                  {sample && (
                    <div className="lb-prev">
                      {sample.assetType === "video" ? <video controls src={sample.storedUrl} /> : <audio controls src={sample.storedUrl} />}
                      <div className="lb-row" style={{ marginTop: 6 }}>
                        <button type="button" onClick={() => chooseFile("sample")} className="lb-link">Thay file</button>
                        <button type="button" onClick={() => setSample(null)} className="lb-link mute">Xóa</button>
                      </div>
                    </div>
                  )}
                  <p className="lb-hint">MP3, WAV, MP4 hoặc MOV; một giọng người rõ, ít tạp âm, dài 5–30 giây.</p>
                </div>
              </>
            ) : (
              <>
                <label className="lb-fld">Tên Element <span className="lb-cnt">{name.length}/20</span>
                  <input maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mèo MC" className="lb-in" />
                </label>
                <label className="lb-fld">Mô tả <span className="lb-cnt">{description.length}/100</span>
                  <textarea maxLength={100} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhân vật mèo MC đại diện thương hiệu" rows={2} className="lb-in" />
                </label>
                {kind === "image" ? (
                  <>
                    <div>
                      <p className="lb-lab"><span>Ảnh chính diện {req} <InfoTip label="Yêu cầu ảnh chính diện" info={`JPG/PNG, tối đa ${formatUploadLimit(imageLimit)}, mỗi chiều từ 300 px, tỉ lệ 1:2,5 đến 2,5:1.`} /></span></p>
                      {tile(main, "main", "Ảnh chính diện")}
                      {main && <button type="button" onClick={() => setMain(null)} className="lb-link mute" style={{ marginTop: 6 }}>Xóa ảnh</button>}
                    </div>
                    <div>
                      <p className="lb-lab"><span style={{ color: "var(--ink)", fontSize: 13, fontWeight: 600 }}>Ảnh tham chiếu bổ sung {req} <InfoTip label="Yêu cầu ảnh tham chiếu bổ sung" info={`Thêm 1–3 ảnh từ góc khác hoặc cận cảnh, khác ảnh chính diện. JPG/PNG, mỗi ảnh tối đa ${formatUploadLimit(imageLimit)}, mỗi chiều từ 300 px, tỉ lệ 1:2,5 đến 2,5:1.`} /></span><span>{additional.length}/3</span></p>
                      <div className="lb-row">
                        {additional.map((asset) => (
                          <div key={asset.id} style={{ position: "relative" }}>
                            {tile(asset, "additional", "Ảnh bổ sung")}
                            <button type="button" onClick={() => setAdditional((items) => items.filter((item) => item.id !== asset.id))} className="lb-x" aria-label="Xóa ảnh" title="Xóa ảnh">
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </div>
                        ))}
                        {additional.length < 3 && tile(null, "additional", "Thêm ảnh")}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="lb-lab"><span>Video nhân vật {req} <InfoTip label="Yêu cầu video Element" info={`MP4/MOV, tối đa ${formatUploadLimit(videoLimit)}, dài 3–8 giây, 1080p, tỉ lệ 16:9 hoặc 9:16. Kling hiện hỗ trợ Element video cho nhân vật dạng người, phong cách chân thực.`} /></span></p>
                    {tile(video, "video", "Video nhân vật")}
                    {video && <button type="button" onClick={() => setVideo(null)} className="lb-link mute" style={{ marginTop: 6 }}>Xóa video</button>}
                  </div>
                )}
                <label className="lb-fld">Giọng nói gắn kèm (tùy chọn)
                  <input list="element-voice-list" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} placeholder="Chọn giọng đã tạo hoặc dán Voice ID" className="lb-in" />
                  <datalist id="element-voice-list">{availableVoices.map((item) => <option key={item.id} value={item.metadata.voiceId}>{item.metadata.name}</option>)}</datalist>
                </label>
              </>
            )}

            {error && <p role="alert" className="lb-er">{Array.isArray(error) ? error.join(", ") : error}</p>}
            <input ref={inputRef} type="file" className="hidden" onChange={upload} />
          </div>

          <div className="lb-mf">
            <button type="button" onClick={onClose} className="au-btn">Hủy</button>
            <button type="button" onClick={save} disabled={busy || !canSave} className="au-btn solid">
              <span className="material-symbols-outlined">{busy ? "progress_activity" : "add"}</span>
              {busy ? "Đang xử lý..." : `Tạo ${isVoice ? "Voice" : "Element"}`}
            </button>
          </div>
        </div>
      </div>
      {picker && <AssetPicker type={picker === "sample" ? "voice-sample" : picker === "video" ? "video" : "image"} max={picker === "additional" ? 3 - additional.length : 1} onConfirm={selectFromHistory} onClose={() => setPicker(null)} />}
    </>
  );
}

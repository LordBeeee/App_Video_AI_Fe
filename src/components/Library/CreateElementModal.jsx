import { useState, useEffect, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import AssetPickerModal from "../CreateVideo/AssetPickerModal"
import { getElementModels } from "../../services/aiModel.service"

const REFERENCE_TYPES = [
  { value: "image_refer", label: "Ảnh" },
  { value: "video_refer", label: "Video" },
]

export default function CreateElementModal({ open, onClose, createElementHook, onCreated }) {
  const { submitCreateElement, isSubmitting } = createElementHook

  const [models, setModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)

  const [providerId, setProviderId] = useState("")
  const [referenceType, setReferenceType] = useState("image_refer")

  const [elementName, setElementName] = useState("")
  const [elementDescription, setElementDescription] = useState("")
  const [elementVoiceId, setElementVoiceId] = useState("")

  const [frontal, setFrontal] = useState(null)       // { preview, file, assetId }
  const [referSlots, setReferSlots] = useState([])   // tối đa 3: { preview, file, assetId }
  const [video, setVideo] = useState(null)           // { preview, file, assetId }

  const [pickerTarget, setPickerTarget] = useState(null) // 'frontal' | 'refer' | 'video' | null
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (!open) return
    setProviderId("")
    setReferenceType("image_refer")
    setElementName("")
    setElementDescription("")
    setElementVoiceId("")
    setFrontal(null)
    setReferSlots([])
    setVideo(null)
    setFormError(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    setModelsLoading(true)
    getElementModels()
      .then((data) => setModels(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => setModels([]))
      .finally(() => setModelsLoading(false))
  }, [open])

  const providers = useMemo(() => {
    const map = new Map()
    models.forEach((m) => {
      if (m.provider && !map.has(m.provider.id)) map.set(m.provider.id, m.provider)
    })
    return Array.from(map.values())
  }, [models])

  useEffect(() => {
    if (providers.length > 0 && !providerId) setProviderId(String(providers[0].id))
  }, [providers, providerId])

  const handleFrontalUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) return alert("Chỉ được upload file ảnh")
    if (frontal?.file) URL.revokeObjectURL(frontal.preview)
    setFrontal({ preview: URL.createObjectURL(file), file, assetId: null })
  }
  const removeFrontal = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (frontal?.file) URL.revokeObjectURL(frontal.preview)
    setFrontal(null)
  }

  const handleReferUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) return alert("Chỉ được upload file ảnh")
    if (referSlots.length >= 3) return
    setReferSlots((prev) => [...prev, { preview: URL.createObjectURL(file), file, assetId: null }])
  }
  const removeReferAt = (idx) => {
    setReferSlots((prev) => {
      const target = prev[idx]
      if (target?.file) URL.revokeObjectURL(target.preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("video/")) return alert("Chỉ được upload file video")
    if (video?.file) URL.revokeObjectURL(video.preview)
    setVideo({ preview: URL.createObjectURL(file), file, assetId: null })
  }
  const removeVideo = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (video?.file) URL.revokeObjectURL(video.preview)
    setVideo(null)
  }

  const handleSelectFromLibrary = useCallback(
    (asset) => {
      if (pickerTarget === "frontal") {
        if (frontal?.file) URL.revokeObjectURL(frontal.preview)
        setFrontal({ preview: asset.storedUrl, file: null, assetId: asset.id })
      } else if (pickerTarget === "refer") {
        if (referSlots.length < 3) {
          setReferSlots((prev) => [...prev, { preview: asset.storedUrl, file: null, assetId: asset.id }])
        }
      } else if (pickerTarget === "video") {
        if (video?.file) URL.revokeObjectURL(video.preview)
        setVideo({ preview: asset.storedUrl, file: null, assetId: asset.id })
      }
      setPickerTarget(null)
    },
    [pickerTarget, frontal, referSlots, video],
  )

  const handleSubmit = async () => {
    setFormError(null)
    if (!providerId) return setFormError("Vui lòng chọn Provider")
    if (!elementName.trim()) return setFormError("Tên Element là bắt buộc")
    if (elementName.length > 20) return setFormError("Tên Element tối đa 20 ký tự")
    if (!elementDescription.trim()) return setFormError("Mô tả là bắt buộc")
    if (elementDescription.length > 100) return setFormError("Mô tả tối đa 100 ký tự")

    if (referenceType === "image_refer") {
      if (!frontal) return setFormError("Ảnh chính diện là bắt buộc")
      if (referSlots.length < 1) return setFormError("Cần ít nhất 1 ảnh tham chiếu bổ sung")
    } else {
      if (!video) return setFormError("Video tham chiếu là bắt buộc")
    }

    try {
      await submitCreateElement(
        {
          providerId,
          referenceType,
          elementName: elementName.trim(),
          elementDescription: elementDescription.trim(),
          elementVoiceId: referenceType === "image_refer" ? elementVoiceId.trim() || undefined : undefined,
          frontalImageAssetId: frontal?.assetId ?? undefined,
          frontalImageFile: frontal?.file ?? undefined,
          referImages: referSlots.map((r) => ({ assetId: r.assetId, file: r.file })),
          videoAssetId: video?.assetId ?? undefined,
          videoFile: video?.file ?? undefined,
        },
        () => onCreated?.(),
      )
      onCreated?.()
      onClose()
    } catch (err) {
      setFormError(err.message)
    }
  }

  if (!open) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
        <div
          className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <h3 className="text-base font-semibold text-white">Tạo Element</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          <div className="scrollbar-hide flex-1 space-y-5 overflow-y-auto p-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Provider</label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                disabled={modelsLoading}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              >
                {modelsLoading ? <option>Đang tải...</option> : providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Loại tham chiếu</label>
              <div className="flex gap-2">
                {REFERENCE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setReferenceType(t.value)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      referenceType === t.value
                        ? "border-indigo-500 bg-indigo-600/15 text-indigo-300"
                        : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Tên Element</label>
                <span className="text-[11px] text-slate-500">{elementName.length}/20</span>
              </div>
              <input
                type="text"
                value={elementName}
                maxLength={20}
                onChange={(e) => setElementName(e.target.value)}
                placeholder="Mèo MC"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Mô tả</label>
                <span className="text-[11px] text-slate-500">{elementDescription.length}/100</span>
              </div>
              <textarea
                value={elementDescription}
                maxLength={100}
                onChange={(e) => setElementDescription(e.target.value)}
                rows={2}
                placeholder="Nhân vật mèo MC đại diện thương hiệu"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>

            {referenceType === "image_refer" ? (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Ảnh chính diện <span className="text-red-400">*</span>
                  </label>
                  <label className="group relative flex h-[140px] w-[140px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 hover:border-indigo-500/50">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFrontalUpload} />
                    {frontal ? (
                      <>
                        <img src={frontal.preview} alt="frontal" className="h-full w-full object-cover" />
                        <div className="absolute right-1.5 top-1.5 z-10 flex gap-1">
                          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerTarget("frontal") }} className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80">
                            <span className="material-symbols-outlined text-[14px]">history</span>
                          </button>
                          <button type="button" onClick={removeFrontal} className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80">
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-400">add_photo_alternate</span>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerTarget("frontal") }} className="relative z-10 mt-2 rounded-md border border-slate-600 px-2.5 py-1 text-[10px] font-medium text-slate-300 hover:border-indigo-500 hover:text-indigo-400">
                          History
                        </button>
                      </>
                    )}
                  </label>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">
                      Ảnh tham chiếu bổ sung <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">{referSlots.length}/3</span>
                  </div>
                  <div className="flex gap-3">
                    {referSlots.map((slot, idx) => (
                      <div key={idx} className="relative h-[100px] w-[100px] overflow-hidden rounded-xl border-2 border-slate-700">
                        <img src={slot.preview} alt={`refer-${idx}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeReferAt(idx)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80">
                          <span className="material-symbols-outlined text-[12px]">delete</span>
                        </button>
                      </div>
                    ))}
                    {referSlots.length < 3 && (
                      <label className="group flex h-[100px] w-[100px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 hover:border-indigo-500/50">
                        <input type="file" accept="image/*" className="hidden" onChange={handleReferUpload} />
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-400">add</span>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerTarget("refer") }} className="relative z-10 rounded-md border border-slate-600 px-2 py-0.5 text-[9px] font-medium text-slate-300 hover:border-indigo-500 hover:text-indigo-400">
                          History
                        </button>
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">Element Voice ID (tùy chọn)</label>
                  <input
                    type="text"
                    value={elementVoiceId}
                    onChange={(e) => setElementVoiceId(e.target.value)}
                    placeholder="Dán Voice ID từ thư viện giọng nói"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Video tham chiếu <span className="text-red-400">*</span>
                </label>
                <label className="group relative flex h-[160px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 hover:border-indigo-500/50">
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  {video ? (
                    <>
                      <video src={video.preview} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                      <div className="absolute right-1.5 top-1.5 z-10 flex gap-1">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerTarget("video") }} className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80">
                          <span className="material-symbols-outlined text-[14px]">history</span>
                        </button>
                        <button type="button" onClick={removeVideo} className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80">
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-400">video_call</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerTarget("video") }} className="relative z-10 mt-2 rounded-md border border-slate-600 px-2.5 py-1 text-[10px] font-medium text-slate-300 hover:border-indigo-500 hover:text-indigo-400">
                        History
                      </button>
                    </>
                  )}
                </label>
              </div>
            )}

            {formError && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{formError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
            <button onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white">
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {isSubmitting ? "Đang tạo..." : "Tạo Element"}
            </button>
          </div>
        </div>
      </div>

      <AssetPickerModal
        open={!!pickerTarget}
        onClose={() => setPickerTarget(null)}
        onSelect={handleSelectFromLibrary}
        assetType={pickerTarget === "video" ? "video" : "image"}
      />
    </>,
    document.body,
  )
}
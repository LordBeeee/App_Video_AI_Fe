import { useEffect, useRef, useState, useCallback } from "react"
import CustomSettingVideoMotion from "./CustomSettingVideoMotion"
import { useAiModels } from "../../../hooks/useAiModels"

export default function FromCreateVideoMotionControl({ onSubmit, isSubmitting, status }) {
  const { models = [], loading: modelsLoading } = useAiModels("kling")

  const [modelId, setModelId] = useState("")
  const [characterOrientation, setCharacterOrientation] = useState("video")
  const [prompt, setPrompt] = useState("")
  const [mode, setMode] = useState("pro")
  const [keepOriginalSound, setKeepOriginalSound] = useState("yes")

  const [referenceVideo, setReferenceVideo] = useState(null)
  const [referenceVideoPreview, setReferenceVideoPreview] = useState(null)

  const [characterImage, setCharacterImage] = useState(null)
  const [characterImagePreview, setCharacterImagePreview] = useState(null)

  // Track blob URLs đang được dùng bởi hook result — KHÔNG revoke khi reset
  const submittedBlobsRef = useRef({ char: null, video: null })

  useEffect(() => {
    if (!modelsLoading && models.length > 0 && !modelId) {
      const defaultModel =
        models.find((m) => m.code === "kling-v3") ??
        models.find((m) => m.providerCode === "kling" || m.provider_code === "kling") ??
        models[0]
      setModelId(String(defaultModel.id))
    }
  }, [models, modelsLoading, modelId])

  // ── Reset form về mặc định ──
  const resetForm = useCallback(() => {
    // Chỉ revoke nếu KHÔNG phải blob đã submit (hook đang dùng)
    if (referenceVideoPreview && referenceVideoPreview !== submittedBlobsRef.current.video) {
      URL.revokeObjectURL(referenceVideoPreview)
    }
    if (characterImagePreview && characterImagePreview !== submittedBlobsRef.current.char) {
      URL.revokeObjectURL(characterImagePreview)
    }

    setReferenceVideo(null)
    setReferenceVideoPreview(null)
    setCharacterImage(null)
    setCharacterImagePreview(null)
    setPrompt("")
    setMode("pro")
    setKeepOriginalSound("yes")
    setCharacterOrientation("video")

    if (models.length > 0) {
      const defaultModel =
        models.find((m) => m.code === "kling-v3") ??
        models.find((m) => m.providerCode === "kling" || m.provider_code === "kling") ??
        models[0]
      setModelId(String(defaultModel.id))
    }
  }, [referenceVideoPreview, characterImagePreview, models])

  // ── Auto-reset 1.5s sau khi succeeded ──
  const hasAutoResetRef = useRef(false)
  const resetFormRef = useRef(null)
  useEffect(() => { resetFormRef.current = resetForm }, [resetForm])

  useEffect(() => {
    if (status === 'succeeded' && !hasAutoResetRef.current) {
      hasAutoResetRef.current = true
      const t = setTimeout(() => resetFormRef.current?.(), 1500)
      return () => clearTimeout(t)
    }
    if (status === null) {
      hasAutoResetRef.current = false
    }
  }, [status])

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (referenceVideoPreview && referenceVideoPreview !== submittedBlobsRef.current.video) {
        URL.revokeObjectURL(referenceVideoPreview)
      }
      if (characterImagePreview && characterImagePreview !== submittedBlobsRef.current.char) {
        URL.revokeObjectURL(characterImagePreview)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // const handleReferenceVideoChange = (e) => {
  //   const file = e.target.files?.[0]
  //   if (!file) return
  //   if (referenceVideoPreview && referenceVideoPreview !== submittedBlobsRef.current.video) {
  //     URL.revokeObjectURL(referenceVideoPreview)
  //   }
  //   const url = URL.createObjectURL(file)
  //   setReferenceVideo(file)
  //   setReferenceVideoPreview(url)
  // }

  // const handleCharacterImageChange = (e) => {
  //   const file = e.target.files?.[0]
  //   if (!file) return
  //   if (characterImagePreview && characterImagePreview !== submittedBlobsRef.current.char) {
  //     URL.revokeObjectURL(characterImagePreview)
  //   }
  //   const url = URL.createObjectURL(file)
  //   setCharacterImage(file)
  //   setCharacterImagePreview(url)
  // }
  const handleReferenceVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (referenceVideoPreview && referenceVideoPreview !== submittedBlobsRef.current.video) {
      URL.revokeObjectURL(referenceVideoPreview)
    }
    const url = URL.createObjectURL(file)
    setReferenceVideo(file)
    setReferenceVideoPreview(url)
    e.target.value = ''  // ✅ Thêm dòng này
  }

  const handleCharacterImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (characterImagePreview && characterImagePreview !== submittedBlobsRef.current.char) {
      URL.revokeObjectURL(characterImagePreview)
    }
    const url = URL.createObjectURL(file)
    setCharacterImage(file)
    setCharacterImagePreview(url)
    e.target.value = ''  // ✅ Thêm dòng này
  }
  const removeReferenceVideo = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (referenceVideoPreview && referenceVideoPreview !== submittedBlobsRef.current.video) {
      URL.revokeObjectURL(referenceVideoPreview)
    }
    setReferenceVideo(null)
    setReferenceVideoPreview(null)
  }

  const removeCharacterImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (characterImagePreview && characterImagePreview !== submittedBlobsRef.current.char) {
      URL.revokeObjectURL(characterImagePreview)
    }
    setCharacterImage(null)
    setCharacterImagePreview(null)
  }

  const handleSubmit = () => {
    if (!modelId) return alert("Vui lòng chọn model")
    if (!characterImage) return alert("Vui lòng upload hình ảnh nhân vật")
    if (!referenceVideo) return alert("Vui lòng upload video tham chiếu")

    const selectedModel = models.find((m) => String(m.id) === modelId)

    // Lưu lại blob URLs đang submit để KHÔNG revoke khi form reset
    submittedBlobsRef.current = {
      char: characterImagePreview,
      video: referenceVideoPreview,
    }

    onSubmit?.({
      modelId,
      modelName: selectedModel?.name ?? '',
      characterImageFile: characterImage,
      referenceVideoFile: referenceVideo,
      prompt,
      characterOrientation,
      keepOriginalSound,
      mode,
    })
  }

  const isProcessing = status === 'queued' || status === 'processing'

  return (
    <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">

          {/* Model selector */}
          <div className="shrink-0">
            <div className="relative">
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                disabled={modelsLoading || models.length === 0}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {modelsLoading ? (
                  <option value="">Đang tải...</option>
                ) : models.length > 0 ? (
                  models.map((m) => (
                    <option key={m.id} value={String(m.id)}>{m.name}</option>
                  ))
                ) : (
                  <option value="">Không có model Kling</option>
                )}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          {/* Upload area */}
          <div className="grid shrink-0 grid-cols-2 items-start gap-3">

            {/* Reference Video */}
            <div>
              <label
                style={{ height: "180px", borderRadius: "12px 12px 0 0" }}
                className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50"
              >
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/mov,video/*"
                  className="hidden"
                  onChange={handleReferenceVideoChange}
                />
                {referenceVideoPreview ? (
                  <video
                    src={referenceVideoPreview}
                    className="h-full w-full object-cover"
                    muted loop autoPlay playsInline
                  />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
                      video_library
                    </span>
                    <span className="mt-1 text-center text-[10px] text-slate-500">
                      Thêm video mô phỏng<br />hành động của nhân vật.
                    </span>
                  </>
                )}
                {referenceVideo && (
                  <button
                    type="button"
                    onClick={removeReferenceVideo}
                    className="absolute right-1 top-1 z-10 rounded-full bg-slate-900/80 p-0.5 text-slate-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-b-lg border-slate-700/70 bg-slate-800 px-1 py-2 text-xs text-slate-300">
                <input
                  type="radio"
                  name="orientation-match"
                  checked={characterOrientation === "video"}
                  onChange={() => setCharacterOrientation("video")}
                  className="h-4 w-4 accent-indigo-500"
                />
                <span className="truncate">Hướng nhân vật khớp với video</span>
              </label>
            </div>

            {/* Character Image */}
            <div>
              <label
                style={{ height: "180px", borderRadius: "12px 12px 0 0" }}
                className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCharacterImageChange}
                />
                {characterImagePreview ? (
                  <img src={characterImagePreview} alt="Character" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
                      add_photo_alternate
                    </span>
                    <span className="mt-1 text-center text-[10px] text-slate-500">Thêm hình ảnh nhân vật</span>
                  </>
                )}
                {characterImage && (
                  <button
                    type="button"
                    onClick={removeCharacterImage}
                    className="absolute right-1 top-1 z-10 rounded-full bg-slate-900/80 p-0.5 text-slate-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-b-lg border-slate-700/70 bg-slate-800 px-1 py-2 text-xs text-slate-300">
                <input
                  type="radio"
                  name="orientation-match"
                  checked={characterOrientation === "image"}
                  onChange={() => setCharacterOrientation("image")}
                  className="h-4 w-4 accent-indigo-500"
                />
                <span className="truncate">Hướng nhân vật khớp với hình ảnh</span>
              </label>
            </div>
          </div>

          {/* Prompt */}
          <div className="shrink-0">
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[160px] w-full resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Khi hướng nhân vật khớp với video, các chuyển động phức tạp sẽ được thực hiện tốt hơn; khi hướng nhân vật khớp với hình ảnh, chuyển động máy quay sẽ được hỗ trợ tốt hơn."
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Để biết thêm kỹ năng, vui lòng tham khảo{" "}
              <a
                href="https://kling.ai/quickstart/motion-control-user-guide"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 underline underline-offset-2 transition-colors hover:text-indigo-300"
              >
                Hướng dẫn sử dụng
              </a>.
            </p>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-2">
            {/* Settings */}
            <CustomSettingVideoMotion
              resolution={mode === "pro" ? "1080p" : "720p"}
              setResolution={(r) => setMode(r === "1080p" ? "pro" : "std")}
              nativeAudio={keepOriginalSound}
              setNativeAudio={setKeepOriginalSound}
            />

            {/* Reset button */}
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting || isProcessing}
              title="Reset form"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 transition-all hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isProcessing || modelsLoading || !modelId || !characterImage || !referenceVideo}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting || isProcessing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {isSubmitting ? 'Đang xử lý...' : 'Đang tạo video...'}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">bolt</span>
                Tạo Video
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
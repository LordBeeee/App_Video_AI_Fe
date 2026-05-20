import { useRef, useState, useCallback, useEffect } from "react"
import CustomSettingVideo from "./CustomSettingVideo"
import MultiShotPanel from "./MultiShotPanel"
import { useAiModels } from '../../hooks/useAiModels'

const STATUS_LABEL = {
  queued: 'Đang chờ xử lý...',
  processing: 'Đang tạo video...',
  succeeded: 'Tạo video thành công!',
  failed: 'Tạo video thất bại',
}

const STATUS_COLOR = {
  queued: 'text-yellow-400',
  processing: 'text-blue-400',
  succeeded: 'text-green-400',
  failed: 'text-red-400',
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Tạo 2 shot mặc định, thời lượng chia đều theo totalDuration */
function buildDefaultShots(totalDuration) {
  const half = Math.floor(totalDuration / 2)
  const rest = totalDuration - half
  return [
    { id: 1, prompt: '', duration: half },
    { id: 2, prompt: '', duration: rest },
  ]
}

/** Gộp shots → chuỗi prompt gửi Kling
 *  VD: "cười ha ha trong 3 giây. khóc trong 2 giây"
 */
function buildMultiShotPrompt(shots) {
  return shots
    .map((s) => `${s.prompt.trim()} trong ${s.duration} giây`)
    .join('. ')
}

// ────────────────────────────────────────────────────────────────────────────

export default function FromCreateVideo({ createVideoHook }) {
  const textareaRef = useRef(null)

  // ── frame ──
  const [startFrame, setStartFrame] = useState(null)
  const [endFrame, setEndFrame] = useState(null)
  const [startFile, setStartFile] = useState(null)
  const [endFile, setEndFile] = useState(null)

  // ── model ──
  const { models, loading: modelsLoading } = useAiModels('kling')
  const [selectedModel, setSelectedModel] = useState('')

  useEffect(() => {
    if (models.length > 0) {
      const defaultModel =
        models.find((m) => m.code === 'kling-v3') ?? models[models.length - 1]
      setSelectedModel(String(defaultModel.id))
    }
  }, [models])

  // ── settings ──
  const [resolution, setResolution] = useState('4K')
  const [length, setLength] = useState(5)   // tổng giây video
  const [nativeAudio, setNativeAudio] = useState(false)

  // ── prompt thường ──
  const [prompt, setPrompt] = useState('')

  // ── multi-shot ──
  const [multiShotEnabled, setMultiShotEnabled] = useState(false)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [shots, setShots] = useState(() => buildDefaultShots(5))

  // Khi length thay đổi mà custom mode chưa mở → reset shots mặc định
  useEffect(() => {
    if (!isCustomMode) {
      setShots(buildDefaultShots(length))
    }
  }, [length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── hook create video ──
  const { submitCreateVideo, isSubmitting, status, error } = createVideoHook

  // ── derived ──
  const totalShotDuration = shots.reduce((sum, s) => sum + s.duration, 0)
  const isShotOverLimit = isCustomMode && totalShotDuration > length

  // ── handlers ──
  const handleImageUpload = useCallback(
    (event, type) => {
      const file = event.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) {
        alert('Chỉ được upload file ảnh')
        event.target.value = ''
        return
      }
      const imageUrl = URL.createObjectURL(file)
      if (type === 'start') {
        if (startFrame) URL.revokeObjectURL(startFrame)
        if (endFrame) URL.revokeObjectURL(endFrame)
        setStartFrame(imageUrl)
        setStartFile(file)
        setEndFrame(null)
        setEndFile(null)
      } else {
        if (endFrame) URL.revokeObjectURL(endFrame)
        setEndFrame(imageUrl)
        setEndFile(file)
      }
      event.target.value = ''
    },
    [startFrame, endFrame],
  )

  const handleRemoveFrame = useCallback(
    (event, type) => {
      event.preventDefault()
      event.stopPropagation()
      if (type === 'start') {
        if (startFrame) URL.revokeObjectURL(startFrame)
        if (endFrame) URL.revokeObjectURL(endFrame)
        setStartFrame(null)
        setStartFile(null)
        setEndFrame(null)
        setEndFile(null)
      } else {
        if (endFrame) URL.revokeObjectURL(endFrame)
        setEndFrame(null)
        setEndFile(null)
      }
    },
    [startFrame, endFrame],
  )

  const handlePromptInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  // ── reset toàn bộ form về mặc định ──
  const resetForm = useCallback(() => {
    if (startFrame) URL.revokeObjectURL(startFrame)
    if (endFrame) URL.revokeObjectURL(endFrame)
    setStartFrame(null)
    setEndFrame(null)
    setStartFile(null)
    setEndFile(null)
    setPrompt('')
    setResolution('4K')
    setLength(5)
    setNativeAudio(false)
    setMultiShotEnabled(false)
    setIsCustomMode(false)
    setShots(buildDefaultShots(5))
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    if (models.length > 0) {
      const def = models.find((m) => m.code === 'kling-v3') ?? models[models.length - 1]
      setSelectedModel(String(def.id))
    }
  }, [startFrame, endFrame, models]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-reset 1.5s sau khi tạo video thành công
  const prevStatusRef = useRef(null)
  useEffect(() => {
    if (prevStatusRef.current !== 'succeeded' && status === 'succeeded') {
      const t = setTimeout(() => resetForm(), 1500)
      return () => clearTimeout(t)
    }
    prevStatusRef.current = status
  }, [status, resetForm])

  // ── toggle multi-shot ──
  const handleToggleMultiShot = () => {
    const next = !multiShotEnabled
    setMultiShotEnabled(next)
    // Tắt multi-shot → thoát custom mode
    if (!next) {
      setIsCustomMode(false)
    }
  }

  // ── toggle custom multi-shot panel ──
  const handleToggleCustomMode = () => {
    if (!isCustomMode) {
      // Mở panel → reset shots theo length hiện tại
      setShots(buildDefaultShots(length))
    }
    setIsCustomMode((prev) => !prev)
  }

  // ── submit ──
  const handleSubmit = async () => {
    if (!startFile) {
      alert('Vui lòng chọn Start Frame')
      return
    }
    if (!selectedModel) {
      alert('Vui lòng chọn model')
      return
    }

    // Xác định prompt cuối
    let finalPrompt = ''

    if (multiShotEnabled && isCustomMode) {
      // Kiểm tra mỗi shot có prompt chưa
      if (shots.some((s) => !s.prompt.trim())) {
        alert('Vui lòng điền nội dung cho tất cả các shot')
        return
      }
      if (isShotOverLimit) {
        alert(`Tổng thời gian shot (${totalShotDuration}s) vượt quá thời lượng video (${length}s)`)
        return
      }
      finalPrompt = buildMultiShotPrompt(shots)
    } else {
      if (!prompt.trim()) {
        alert('Vui lòng nhập prompt')
        return
      }
      finalPrompt = prompt.trim()
    }

    await submitCreateVideo({
      modelId: selectedModel,
      resolution: resolution.toLowerCase(),
      duration: String(length),
      mode: 'pro',
      sound: nativeAudio ? 'on' : 'off',
      prompt: finalPrompt,
      startImageFile: startFile,
      endImageFile: endFile,
    })
  }

  // ────────────────────────────────────────────────────────────────────────
  return (
    <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-lg">
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">

          {/* ── Model selector ── */}
          <div className="shrink-0">
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={modelsLoading}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {modelsLoading ? (
                  <option>Đang tải...</option>
                ) : (
                  models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))
                )}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          {/* ── Frame upload ── */}
          <div className="grid shrink-0 grid-cols-2 items-start gap-3">
            {/* Start Frame */}
            <label
              className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${
                startFrame ? 'aspect-square' : 'h-[150px]'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'start')}
              />
              {startFrame ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <img
                      src={startFrame}
                      alt="Start Frame"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFrame(e, 'start')}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
                    Start Frame
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
                    add_photo_alternate
                  </span>
                  <span className="mt-1 text-[10px] text-slate-500">Start Frame</span>
                </>
              )}
            </label>

            {/* End Frame */}
            <label
              className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${
                startFrame ? 'aspect-square' : 'h-[150px]'
              } ${!startFrame ? 'pointer-events-none opacity-40' : ''}`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!startFrame}
                onChange={(e) => handleImageUpload(e, 'end')}
              />
              {endFrame ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <img
                      src={endFrame}
                      alt="End Frame"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFrame(e, 'end')}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
                    End Frame
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
                    add_photo_alternate
                  </span>
                  <span className="mt-1 text-[10px] text-slate-500">
                    {startFrame ? 'End Frame' : 'Upload Start First'}
                  </span>
                </>
              )}
            </label>
          </div>

          {/* ── Prompt hoặc Multi-Shot Panel ── */}
          {multiShotEnabled && isCustomMode ? (
            // ── Hiển thị Custom Multi-Shot Panel ──
            <div className="shrink-0">
              <MultiShotPanel
                shots={shots}
                onShotsChange={setShots}
                totalDuration={length}
              />
            </div>
          ) : (
            // ── Hiển thị Textarea thường ──
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onInput={handlePromptInput}
              rows={1}
              className="min-h-[240px] w-full shrink-0 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Bạn nhập prompt để tạo video..."
            />
          )}

          {/* ── Status ── */}
          {status && (
            <div className="shrink-0 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-center gap-2">
                {(status === 'queued' || status === 'processing') && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-indigo-400" />
                )}
                <span className={`text-sm font-medium ${STATUS_COLOR[status]}`}>
                  {STATUS_LABEL[status]}
                </span>
              </div>
              {status === 'failed' && error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
              )}
            </div>
          )}

          {/* Error submit */}
          {error && !status && (
            <p className="shrink-0 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* ── Bottom actions ── */}
        <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">

          {/* Row 1: Settings + Reset + Multi-Shot controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: settings */}
            <CustomSettingVideo
              resolution={resolution}
              setResolution={setResolution}
              length={length}
              setLength={setLength}
              nativeAudio={nativeAudio}
              setNativeAudio={setNativeAudio}
            />

            {/* Center: Reset button */}
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting || status === 'queued' || status === 'processing'}
              title="Reset form"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 transition-all hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>

            {/* Right: Multi-Shot toggle + Custom button */}
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/60 p-1">
              {/* Toggle pill */}
              <button
                type="button"
                onClick={handleToggleMultiShot}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                  multiShotEnabled
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {/* Toggle switch visual */}
                <span
                  className={`relative inline-flex h-3.5 w-6 shrink-0 rounded-full transition-colors ${
                    multiShotEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition-all ${
                      multiShotEnabled ? 'left-3' : 'left-0.5'
                    }`}
                  />
                </span>
                Multi-Shot
              </button>

              {/* Divider */}
              <span className="h-4 w-px bg-slate-700" />

              {/* Custom Multi-Shot button */}
              <button
                type="button"
                onClick={handleToggleCustomMode}
                disabled={!multiShotEnabled}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                  !multiShotEnabled
                    ? 'cursor-not-allowed text-slate-600'
                    : isCustomMode
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Custom
                <span className="material-symbols-outlined text-[13px]">
                  {isCustomMode ? 'keyboard_arrow_down' : 'chevron_right'}
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: preview prompt sẽ gửi khi multi-shot */}
          {multiShotEnabled && isCustomMode && shots.some((s) => s.prompt.trim()) && (
            <div
              className={`rounded-lg border px-3 py-2 text-[11px] leading-5 ${
                isShotOverLimit
                  ? 'border-red-500/30 bg-red-500/5 text-red-400'
                  : 'border-slate-700/50 bg-slate-800/40 text-slate-400'
              }`}
            >
              <span className="mr-1.5 font-semibold text-slate-500">Prompt:</span>
              <span className="line-clamp-2">
                {buildMultiShotPrompt(shots)}
              </span>
            </div>
          )}

          {/* Row 3: Submit */}
          <button
            type="button"
            disabled={
              isSubmitting ||
              status === 'queued' ||
              status === 'processing' ||
              isShotOverLimit
            }
            onClick={handleSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xử lý...
              </>
            ) : status === 'queued' || status === 'processing' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang tạo video...
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
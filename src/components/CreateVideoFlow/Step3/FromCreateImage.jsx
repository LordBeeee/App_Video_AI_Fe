import { useState, useCallback, useRef } from "react"

export default function FromCreateImage({ onGenerate, isRunning = false, status = null, error = null }) {
  const [selectedModel, setSelectedModel] = useState("1")
  const [prompt, setPrompt]               = useState("")
  const [refImage, setRefImage]           = useState(null)
  // const [imgCount, setImgCount]           = useState(4)
  // const textareaRef                       = useRef(null)

  const [aspectRatio, setAspectRatio]     = useState("9:16")
  const [settingsOpen, setSettingsOpen]   = useState(false)

  const textareaRef                       = useRef(null)
  const settingRef                        = useRef(null)

  const MODELS = [
    { id: "1", name: "Flux Pro 1.1" },
    { id: "2", name: "Flux Dev"     },
    { id: "3", name: "DALL·E 3"    },
  ]

  const handlePromptInput = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }

  const handleRefUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (refImage) URL.revokeObjectURL(refImage)
    setRefImage(URL.createObjectURL(file))
    e.target.value = ""
  }, [refImage])

  const handleRemoveRef = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    if (refImage) URL.revokeObjectURL(refImage)
    setRefImage(null)
  }, [refImage])

  // const handleSubmit = () => {
  //   onGenerate?.({ modelId: selectedModel, prompt, imgCount, refImage })
  // }

  const handleSubmit = () => {
    onGenerate?.({ modelId: selectedModel, prompt, aspectRatio, refImage })
  }

  const STATUS_TEXT = {
    queued:     { label: "Đang chờ xử lý...", color: "text-yellow-400" },
    processing: { label: "Đang tạo ảnh...",   color: "text-blue-400"   },
    done:       { label: "Tạo ảnh thành công!", color: "text-green-400" },
    failed:     { label: "Tạo ảnh thất bại",  color: "text-red-400"    },
  }

  return (
    <section className="flex h-full w-[380px] flex-shrink-0 flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-lg">
      <div className="flex h-full min-h-0 flex-col p-6">

        {/* Scrollable area */}
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">

          {/* Model */}
          <div className="flex-shrink-0">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">AI Model</p>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">expand_more</span>
            </div>
          </div>

          {/* Reference image */}
          <div className="flex-shrink-0">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Reference Image
              <span className="ml-2 font-normal normal-case text-slate-600">(optional)</span>
            </p>
            <label className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/60 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5 ${refImage ? "aspect-video" : "h-[110px]"}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleRefUpload} />
              {refImage ? (
                <>
                  <img src={refImage} alt="Reference" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveRef}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white hover:bg-red-500/80"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">Reference</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-2xl text-slate-500 group-hover:text-indigo-400">add_photo_alternate</span>
                  <span className="mt-1.5 text-xs text-slate-500 group-hover:text-slate-400">Upload reference image</span>
                  <span className="text-[10px] text-slate-600">PNG, JPG · max 10 MB</span>
                </>
              )}
            </label>
          </div>

          {/* Prompt */}
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Prompt</p>
              <span className="text-[10px] text-slate-600">Auto-generated · editable</span>
            </div>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onInput={handlePromptInput}
              rows={1}
              placeholder="Nhập prompt để tạo hình ảnh..."
              className="scrollbar-hide min-h-[160px] w-full flex-1 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status */}
          {status && STATUS_TEXT[status] && (
            <div className="flex-shrink-0 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-center gap-2">
                {(status === "queued" || status === "processing") && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-indigo-400" />
                )}
                <span className={`text-sm font-medium ${STATUS_TEXT[status].color}`}>
                  {STATUS_TEXT[status].label}
                </span>
              </div>
              {status === "failed" && error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Fixed bottom */}
        <div className="flex-shrink-0 space-y-3 border-t border-slate-800/80 pt-4">
          {/* <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Số lượng ảnh</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImgCount((c) => Math.max(1, c - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              >−</button>
              <span className="w-6 text-center text-sm font-bold text-white">{imgCount}</span>
              <button
                type="button"
                onClick={() => setImgCount((c) => Math.min(8, c + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              >+</button>
            </div>
          </div> */}
          <div ref={settingRef} className="relative">
  <button
    type="button"
    onClick={() => setSettingsOpen((prev) => !prev)}
    className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 text-[11px] font-semibold text-white transition-all hover:bg-slate-800"
  >
    <span className="flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">crop</span>
      <span>Khung hình</span>
    </span>

    <span className="flex items-center gap-1">
      <span>{aspectRatio}</span>
      <span className="material-symbols-outlined text-[14px]">
        {settingsOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
      </span>
    </span>
  </button>

  {settingsOpen && (
    <div className="absolute bottom-full left-0 z-50 mb-3 w-full rounded-xl border border-slate-700 bg-[#18191d] p-4 text-white shadow-2xl">
      <p className="mb-2 text-sm text-slate-300">Khung hình</p>

      <div className="grid grid-cols-3 overflow-hidden rounded-lg bg-[#222328] p-0">
        {["9:16", "16:9", "1:1"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setAspectRatio(item)
              setSettingsOpen(false)
            }}
            className={`py-3 text-sm font-semibold transition ${
              aspectRatio === item
                ? "bg-[#3a3b40] text-white"
                : "text-slate-300 hover:bg-white/5"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
          <button
            type="button"
            disabled={isRunning}
            onClick={handleSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang tạo ảnh...
              </>
            ) : status === "done" ? (
              <>
                <span className="material-symbols-outlined text-lg">refresh</span>
                Tạo ảnh lại
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                Tạo ảnh
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}

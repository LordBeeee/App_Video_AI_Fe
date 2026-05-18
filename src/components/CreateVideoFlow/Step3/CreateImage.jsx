import { useState } from "react"
import FromCreateImage from "./FromCreateImage"

// Mock images để xem UI — xóa khi gắn API thật
const MOCK_IMAGES = [
  { id: 1, url: null, prompt: "A sanitary pad centered, clean, sharp. Bright blue lighting, cinematic FMCG style." },
  { id: 2, url: null, prompt: "A sanitary pad centered, clean, sharp. Bright blue lighting, cinematic FMCG style." },
  { id: 3, url: null, prompt: "A sanitary pad centered, clean, sharp. Bright blue lighting, cinematic FMCG style." },
  { id: 4, url: null, prompt: "A sanitary pad centered, clean, sharp. Bright blue lighting, cinematic FMCG style." },
]

export default function CreateImage({ onNext, onBack }) {
  // UI state only — thay bằng hook thật sau
  const [status, setStatus]           = useState(null) // null | "generating" | "done" | "failed"
  const [images, setImages]           = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filter, setFilter]           = useState("all")
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const [error]                       = useState(null)

  const isDone       = status === "done"
  const isGenerating = status === "generating"

  const handleGenerate = () => {
    setStatus("generating")
    setSelectedIds(new Set())
    setFilter("all")
    // Xóa setTimeout này khi gắn API thật
    setTimeout(() => {
      setImages(MOCK_IMAGES)
      setStatus("done")
    }, 2000)
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const displayImages = filter === "selected"
    ? images.filter((img) => selectedIds.has(img.id))
    : images

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-white">

      {/* Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left panel */}
        <FromCreateImage
          onGenerate={handleGenerate}
          isRunning={isGenerating}
          status={status}
          error={error}
        />

        {/* Center */}
        <section className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-6">

          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-2xl text-indigo-400">image_search</span>
              <span className="text-lg font-bold text-white">Generated Images</span>
              {isDone && (
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                  {images.length}
                </span>
              )}
            </div>

            {isDone && (
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900 p-1">
                {["all", "selected"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                      filter === tab ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab === "all" ? "Tất cả" : `Đã chọn (${selectedIds.size})`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State 1: Empty */}
          {!status && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
                <span className="material-symbols-outlined relative z-10 text-[64px] text-slate-800">image</span>
              </div>
              <div className="space-y-1.5 text-center">
                <p className="text-xl font-bold text-white">Ready to Generate</p>
                <p className="text-sm text-slate-500">Nhập prompt và nhấn Generate Images để bắt đầu</p>
              </div>
            </div>
          )}

          {/* State 2: Generating */}
          {isGenerating && (
            <div className="flex flex-1 flex-col items-center justify-center gap-5">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
                <div className="absolute inset-2 animate-pulse rounded-full bg-indigo-500/20" />
              </div>
              <div className="space-y-1.5 text-center">
                <p className="text-lg font-bold text-white">Đang tạo hình ảnh...</p>
                <p className="text-sm text-slate-500">Thường mất 15 – 30 giây</p>
              </div>
            </div>
          )}

          {/* State 3: Failed */}
          {status === "failed" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-6xl text-red-400">error</span>
              <div className="space-y-1.5 text-center">
                <p className="text-lg font-bold text-white">Tạo ảnh thất bại</p>
                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>
            </div>
          )}

          {/* State 4: Image grid */}
          {isDone && (
            <div className="scrollbar-hide grid min-h-0 flex-1 auto-rows-max grid-cols-2 gap-4 overflow-y-auto pr-1 xl:grid-cols-3 2xl:grid-cols-4">
              {displayImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => toggleSelect(img.id)}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedIds.has(img.id)
                      ? "border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.25)]"
                      : "border-transparent hover:border-slate-600"
                  }`}
                >
                  {/* Thumbnail — thay div này bằng <img src={img.url} /> khi có ảnh thật */}
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg,
                        hsl(${220 + img.id * 15},60%,${8 + img.id * 2}%) 0%,
                        hsl(${230 + img.id * 10},55%,${14 + img.id * 2}%) 100%)`,
                    }}
                  />

                  {/* Check badge */}
                  <div className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                    selectedIds.has(img.id)
                      ? "bg-indigo-500 opacity-100"
                      : "border border-white/30 bg-black/40 opacity-0 group-hover:opacity-100"
                  }`}>
                    <span className="material-symbols-outlined text-[13px] text-white">
                      {selectedIds.has(img.id) ? "check" : "add"}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="line-clamp-2 flex-1 text-[10px] leading-4 text-slate-300">{img.prompt}</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); if (img.url) setLightboxUrl(img.url) }}
                      className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm hover:bg-indigo-500/80"
                    >
                      <span className="material-symbols-outlined text-base">zoom_in</span>
                    </button>
                  </div>
                </div>
              ))}

              {filter === "selected" && displayImages.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16">
                  <span className="material-symbols-outlined text-5xl text-slate-800">check_box_outline_blank</span>
                  <p className="text-sm text-slate-600">Chưa có ảnh nào được chọn</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Bottom nav */}
      <div className="flex flex-shrink-0 items-center justify-between border-t border-slate-800/80 px-8 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-800/60 hover:text-white"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>

        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <span className="text-xs text-slate-500">
              <span className="font-bold text-indigo-400">{selectedIds.size}</span> ảnh đã chọn
            </span>
          )}
          <button
            type="button"
            onClick={() => onNext?.({ selectedIds: [...selectedIds], images })}
            disabled={isDone && selectedIds.size === 0}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next Step
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightboxUrl} alt="Preview" className="max-h-[90vh] max-w-[90vw] object-contain" />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

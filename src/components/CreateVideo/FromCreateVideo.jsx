// import { useRef, useState, useCallback ,useEffect} from "react"
// import CustomSettingVideo from "./CustomSettingVideo"
// import { useAiModels } from '../../hooks/useAiModels'
// import { useCreateVideo } from '../../hooks/useCreateVideo'

// // projectId tạm hardcode, sau này lấy từ context/store
// const DEFAULT_PROJECT_ID = 1

// const STATUS_LABEL = {
//   queued: 'Đang chờ xử lý...',
//   processing: 'Đang tạo video...',
//   succeeded: 'Tạo video thành công!',
//   failed: 'Tạo video thất bại',
// }

// const STATUS_COLOR = {
//   queued: 'text-yellow-400',
//   processing: 'text-blue-400',
//   succeeded: 'text-green-400',
//   failed: 'text-red-400',
// }

// export default function FromCreateVideo({ createVideoHook }) {
//   const textareaRef = useRef(null)

//   // Ảnh preview (object URL)
//   const [startFrame, setStartFrame] = useState(null)
//   const [endFrame, setEndFrame] = useState(null)

//   // File thực (gửi lên BE)
//   const [startFile, setStartFile] = useState(null)
//   const [endFile, setEndFile] = useState(null)

//   // Model
//   const { models, loading: modelsLoading } = useAiModels('kling')
//   const [selectedModel, setSelectedModel] = useState('')

//   useEffect(() => {
//     if (models.length > 0) {
//       // Ưu tiên tìm kling-v3, không có thì lấy model cuối
//       const defaultModel = models.find(m => m.code === 'kling-v3') ?? models[models.length - 1]
//       setSelectedModel(String(defaultModel.id))
//     }
//   }, [models])

//   // Settings từ CustomSettingVideo
//   const [resolution, setResolution] = useState('4K')
//   const [length, setLength] = useState(5)

//   // Prompt
//   const [prompt, setPrompt] = useState('')

//   // Hook tạo video
//   // const { submitCreateVideo, isSubmitting, status, videoUrl, error } = useCreateVideo()
//   const { submitCreateVideo, isSubmitting, status, videoUrl, error } = createVideoHook

//   const [nativeAudio, setNativeAudio] = useState(false)

//   const handleImageUpload = useCallback((event, type) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     if (!file.type.startsWith("image/")) {
//       alert("Chỉ được upload file ảnh")
//       event.target.value = ""
//       return
//     }

//     const imageUrl = URL.createObjectURL(file)

//     if (type === "start") {
//       if (startFrame) URL.revokeObjectURL(startFrame)
//       if (endFrame) URL.revokeObjectURL(endFrame)
//       setStartFrame(imageUrl)
//       setStartFile(file)
//       setEndFrame(null)
//       setEndFile(null)
//     } else {
//       if (endFrame) URL.revokeObjectURL(endFrame)
//       setEndFrame(imageUrl)
//       setEndFile(file)
//     }

//     event.target.value = ""
//   }, [startFrame, endFrame])

//   const handleRemoveFrame = useCallback((event, type) => {
//     event.preventDefault()
//     event.stopPropagation()

//     if (type === "start") {
//       if (startFrame) URL.revokeObjectURL(startFrame)
//       if (endFrame) URL.revokeObjectURL(endFrame)
//       setStartFrame(null)
//       setStartFile(null)
//       setEndFrame(null)
//       setEndFile(null)
//     } else {
//       if (endFrame) URL.revokeObjectURL(endFrame)
//       setEndFrame(null)
//       setEndFile(null)
//     }
//   }, [startFrame, endFrame])

//   const handlePromptInput = () => {
//     const textarea = textareaRef.current
//     if (!textarea) return
//     textarea.style.height = "auto"
//     textarea.style.height = `${textarea.scrollHeight}px`
//   }

//   const handleSubmit = async () => {
//     if (!startFile) {
//       alert('Vui lòng chọn Start Frame')
//       return
//     }
//     if (!prompt.trim()) {
//       alert('Vui lòng nhập prompt')
//       return
//     }
//     if (!selectedModel) {
//       alert('Vui lòng chọn model')
//       return
//     }

//     await submitCreateVideo({
//       modelId: selectedModel,
//       projectId: DEFAULT_PROJECT_ID,
//       resolution: resolution.toLowerCase(), // '720p' | '1080p' | '4k'
//       duration: String(length),  // Kling chỉ hỗ trợ 5 hoặc 10
//       mode: 'pro',
//       sound: nativeAudio ? 'on' : 'off',
//       prompt: prompt.trim(),
//       startImageFile: startFile,
//       endImageFile: endFile,
//     })
//   }

//   return (
//     <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
//       <div className="flex h-full min-h-0 flex-col">
//         <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">

//           {/* Model selector */}
//           <div className="shrink-0">
//             <div className="relative">
//               <select
//                 value={selectedModel}
//                 onChange={(e) => setSelectedModel(e.target.value)}
//                 disabled={modelsLoading}
//                 className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
//               >
//                 {modelsLoading ? (
//                   <option>Đang tải...</option>
//                 ) : (
//                   models.map((model) => (
//                     <option key={model.id} value={model.id}>
//                       {model.name}
//                     </option>
//                   ))
//                 )}
//               </select>
//               <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">
//                 expand_more
//               </span>
//             </div>
//           </div>

//           {/* Frame upload */}
//           <div className="grid shrink-0 grid-cols-2 items-start gap-3">
//             {/* Start Frame */}
//             <label className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${startFrame ? "aspect-square" : "h-[150px]"}`}>
//               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "start")} />
//               {startFrame ? (
//                 <>
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
//                     <img src={startFrame} alt="Start Frame" className="max-h-full max-w-full object-contain" />
//                   </div>
//                   <button type="button" onClick={(e) => handleRemoveFrame(e, "start")} className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80">
//                     <span className="material-symbols-outlined text-base">delete</span>
//                   </button>
//                   <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">Start Frame</span>
//                 </>
//               ) : (
//                 <>
//                   <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">add_photo_alternate</span>
//                   <span className="mt-1 text-[10px] text-slate-500">Start Frame</span>
//                 </>
//               )}
//             </label>

//             {/* End Frame */}
//             <label className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${startFrame ? "aspect-square" : "h-[150px]"} ${!startFrame ? "pointer-events-none opacity-40" : ""}`}>
//               <input type="file" accept="image/*" className="hidden" disabled={!startFrame} onChange={(e) => handleImageUpload(e, "end")} />
//               {endFrame ? (
//                 <>
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
//                     <img src={endFrame} alt="End Frame" className="max-h-full max-w-full object-contain" />
//                   </div>
//                   <button type="button" onClick={(e) => handleRemoveFrame(e, "end")} className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80">
//                     <span className="material-symbols-outlined text-base">delete</span>
//                   </button>
//                   <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">End Frame</span>
//                 </>
//               ) : (
//                 <>
//                   <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">add_photo_alternate</span>
//                   <span className="mt-1 text-[10px] text-slate-500">{startFrame ? "End Frame" : "Upload Start First"}</span>
//                 </>
//               )}
//             </label>
//           </div>

//           {/* Prompt */}
//           <textarea
//             ref={textareaRef}
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             onInput={handlePromptInput}
//             rows={1}
//             className="min-h-[240px] w-full shrink-0 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
//             placeholder="Bạn nhập prompt để tạo video..."
//           />

//           {/* Status + Video result */}
//           {status && (
//             <div className="shrink-0 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
//               <div className="flex items-center gap-2">
//                 {status === 'processing' || status === 'queued' ? (
//                   <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-indigo-400" />
//                 ) : null}
//                 <span className={`text-sm font-medium ${STATUS_COLOR[status]}`}>
//                   {STATUS_LABEL[status]}
//                 </span>
//               </div>

//               {status === 'succeeded' && videoUrl && (
//                 <video
//                   src={videoUrl}
//                   controls
//                   autoPlay
//                   loop
//                   className="mt-3 w-full rounded-lg"
//                 />
//               )}

//               {status === 'failed' && error && (
//                 <p className="mt-2 text-xs text-red-400">{error}</p>
//               )}
//             </div>
//           )}

//           {/* Error khi submit */}
//           {error && !status && (
//             <p className="shrink-0 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
//               {error}
//             </p>
//           )}
//         </div>

//         {/* Bottom actions */}
//         <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">
//           <CustomSettingVideo
//             resolution={resolution}
//             setResolution={setResolution}
//             length={length}
//             setLength={setLength}
//             nativeAudio={nativeAudio}
//             setNativeAudio={setNativeAudio}
//           />

//           <button
//             type="button"
//             disabled={isSubmitting || status === 'queued' || status === 'processing'}
//             onClick={handleSubmit}
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {isSubmitting ? (
//               <>
//                 <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//                 Đang xử lý...
//               </>
//             ) : status === 'queued' || status === 'processing' ? (
//               <>
//                 <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//                 Đang tạo video...
//               </>
//             ) : (
//               <>
//                 <span className="material-symbols-outlined text-lg">bolt</span>
//                 Tạo Video
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </section>
//   )
// }
import { useRef, useState, useCallback, useEffect } from "react"
import CustomSettingVideo from "./CustomSettingVideo"
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

export default function FromCreateVideo({ createVideoHook }) {
  const textareaRef = useRef(null)

  const [startFrame, setStartFrame] = useState(null)
  const [endFrame, setEndFrame] = useState(null)
  const [startFile, setStartFile] = useState(null)
  const [endFile, setEndFile] = useState(null)

  const { models, loading: modelsLoading } = useAiModels('kling')
  const [selectedModel, setSelectedModel] = useState('')

  useEffect(() => {
    if (models.length > 0) {
      const defaultModel = models.find(m => m.code === 'kling-v3') ?? models[models.length - 1]
      setSelectedModel(String(defaultModel.id))
    }
  }, [models])

  const [resolution, setResolution] = useState('4K')
  const [length, setLength] = useState(5)
  const [prompt, setPrompt] = useState('')
  const [nativeAudio, setNativeAudio] = useState(false)

  const { submitCreateVideo, isSubmitting, status, error } = createVideoHook

  const handleImageUpload = useCallback((event, type) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Chỉ được upload file ảnh")
      event.target.value = ""
      return
    }

    const imageUrl = URL.createObjectURL(file)

    if (type === "start") {
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

    event.target.value = ""
  }, [startFrame, endFrame])

  const handleRemoveFrame = useCallback((event, type) => {
    event.preventDefault()
    event.stopPropagation()

    if (type === "start") {
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
  }, [startFrame, endFrame])

  const handlePromptInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleSubmit = async () => {
    if (!startFile) {
      alert('Vui lòng chọn Start Frame')
      return
    }
    if (!prompt.trim()) {
      alert('Vui lòng nhập prompt')
      return
    }
    if (!selectedModel) {
      alert('Vui lòng chọn model')
      return
    }

    await submitCreateVideo({
      modelId: selectedModel,
      resolution: resolution.toLowerCase(),
      duration: String(length),
      mode: 'pro',
      sound: nativeAudio ? 'on' : 'off',
      prompt: prompt.trim(),
      startImageFile: startFile,
      endImageFile: endFile,
    })
  }

  return (
    <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">

          {/* Model selector */}
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

          {/* Frame upload */}
          <div className="grid shrink-0 grid-cols-2 items-start gap-3">
            {/* Start Frame */}
            <label className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${startFrame ? "aspect-square" : "h-[150px]"}`}>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "start")} />
              {startFrame ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <img src={startFrame} alt="Start Frame" className="max-h-full max-w-full object-contain" />
                  </div>
                  <button type="button" onClick={(e) => handleRemoveFrame(e, "start")} className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">Start Frame</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">add_photo_alternate</span>
                  <span className="mt-1 text-[10px] text-slate-500">Start Frame</span>
                </>
              )}
            </label>

            {/* End Frame */}
            <label className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${startFrame ? "aspect-square" : "h-[150px]"} ${!startFrame ? "pointer-events-none opacity-40" : ""}`}>
              <input type="file" accept="image/*" className="hidden" disabled={!startFrame} onChange={(e) => handleImageUpload(e, "end")} />
              {endFrame ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <img src={endFrame} alt="End Frame" className="max-h-full max-w-full object-contain" />
                  </div>
                  <button type="button" onClick={(e) => handleRemoveFrame(e, "end")} className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">End Frame</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">add_photo_alternate</span>
                  <span className="mt-1 text-[10px] text-slate-500">{startFrame ? "End Frame" : "Upload Start First"}</span>
                </>
              )}
            </label>
          </div>

          {/* Prompt */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onInput={handlePromptInput}
            rows={1}
            className="min-h-[240px] w-full shrink-0 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Bạn nhập prompt để tạo video..."
          />

          {/* Status */}
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

          {/* Error khi submit */}
          {error && !status && (
            <p className="shrink-0 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Bottom actions */}
        <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">
          <CustomSettingVideo
            resolution={resolution}
            setResolution={setResolution}
            length={length}
            setLength={setLength}
            nativeAudio={nativeAudio}
            setNativeAudio={setNativeAudio}
          />

          <button
            type="button"
            disabled={isSubmitting || status === 'queued' || status === 'processing'}
            onClick={handleSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xử lý...
              </>
            ) : (status === 'queued' || status === 'processing') ? (
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
// import { useRef, useState, useCallback, useEffect, useMemo } from "react"
// import CustomSettingVideo from "./CustomSettingVideo"
// import MultiShotPanel from "./MultiShotPanel"
// import { useAiModels } from '../../hooks/useAiModels'
// import { calcVideoPrice } from '../../constants/videoPricing'
// import { RESOLUTION_TO_MODE } from '../../constants/videoOptions'

// const STATUS_LABEL = {
//   queued:     'Đang chờ xử lý...',
//   processing: 'Đang tạo video...',
//   succeeded:  'Tạo video thành công!',
//   failed:     'Tạo video thất bại',
// }

// const STATUS_COLOR = {
//   queued:     'text-yellow-400',
//   processing: 'text-blue-400',
//   succeeded:  'text-green-400',
//   failed:     'text-red-400',
// }

// const RESOLUTION_MODE_MAP = {
//   '720p':  'std',
//   '1080p': 'pro',
//   '4k':    '4k',
// }

// function buildDefaultShots(totalDuration) {
//   const half = Math.floor(totalDuration / 2)
//   const rest = totalDuration - half
//   return [
//     { id: 1, prompt: '', duration: half },
//     { id: 2, prompt: '', duration: rest },
//   ]
// }

// export default function FromCreateVideo({ createVideoHook }) {
//   const textareaRef = useRef(null)

//   const [startFrame, setStartFrame] = useState(null)
//   const [endFrame,   setEndFrame]   = useState(null)
//   const [startFile,  setStartFile]  = useState(null)
//   const [endFile,    setEndFile]    = useState(null)

//   const { models, loading: modelsLoading } = useAiModels({ modelType: 'video_generation' })
//   const [selectedModel, setSelectedModel]  = useState('')

//   // ── derived: model code + provider ──────────────────────────────────────
//   const selectedModelData = models.find((m) => String(m.id) === selectedModel)
//   const selectedModelCode = selectedModelData?.code ?? ''
//   const isByteplus        = selectedModelData?.provider?.code === 'byteplus'

//   const prevModelRef = useRef(null)
//   useEffect(() => {
//     if (prevModelRef.current !== null && prevModelRef.current !== selectedModel) {
//       setResolution('1080p')
//       setRatio('adaptive')
//       setLength(5)
//       // setNativeAudio(false)
//       setNativeAudio(isByteplus)
//       // BytePlus chưa hỗ trợ multi-shot → auto tắt khi đổi sang model BytePlus
//       if (isByteplus) {
//         setMultiShotEnabled(false)
//         setIsCustomMode(false)
//       }
//     }
//     prevModelRef.current = selectedModel
//   }, [selectedModel]) // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     if (models.length > 0) {
//       const defaultModel =
//         models.find((m) => m.code === 'kling-v3') ?? models[models.length - 1]
//       setSelectedModel(String(defaultModel.id))
//     }
//   }, [models])

//   // ── settings ──
//   const [resolution,  setResolution]  = useState('1080p')
//   const [ratio,       setRatio]       = useState('adaptive')   // ← NEW, chỉ dùng khi isByteplus
//   const [length,      setLength]      = useState(5)
//   const [nativeAudio, setNativeAudio] = useState(false)

//   const priceInfo = useMemo(
//     () => calcVideoPrice({ modelCode: selectedModelCode, resolution, duration: length, nativeAudio }),
//     [selectedModelCode, resolution, length, nativeAudio],
//   )

//   const priceColour =
//     !priceInfo                ? 'text-slate-400'   :
//     priceInfo.total < 50000   ? 'text-emerald-400' :
//     priceInfo.total < 75000   ? 'text-yellow-400'  :
//     priceInfo.total < 100000  ? 'text-orange-400'  :
//                                 'text-red-400'

//   const [prompt, setPrompt] = useState('')

//   const [multiShotEnabled, setMultiShotEnabled] = useState(false)
//   const [isCustomMode,     setIsCustomMode]     = useState(false)
//   const [shots,            setShots]            = useState(() => buildDefaultShots(5))

//   useEffect(() => {
//     if (!isCustomMode) {
//       setShots(buildDefaultShots(length))
//     }
//   }, [length]) // eslint-disable-line react-hooks/exhaustive-deps

//   const { submitCreateVideo, isSubmitting, status, error } = createVideoHook

//   const totalShotDuration = shots.reduce((sum, s) => sum + s.duration, 0)
//   const isShotOverLimit   = isCustomMode && totalShotDuration > length
//   const isShotUnderLimit  = isCustomMode && totalShotDuration < length

//   const handleImageUpload = useCallback(
//     (event, type) => {
//       const file = event.target.files?.[0]
//       if (!file) return
//       if (!file.type.startsWith('image/')) {
//         alert('Chỉ được upload file ảnh')
//         event.target.value = ''
//         return
//       }
//       const imageUrl = URL.createObjectURL(file)
//       if (type === 'start') {
//         if (startFrame) URL.revokeObjectURL(startFrame)
//         if (endFrame)   URL.revokeObjectURL(endFrame)
//         setStartFrame(imageUrl)
//         setStartFile(file)
//         setEndFrame(null)
//         setEndFile(null)
//       } else {
//         if (endFrame) URL.revokeObjectURL(endFrame)
//         setEndFrame(imageUrl)
//         setEndFile(file)
//       }
//       event.target.value = ''
//     },
//     [startFrame, endFrame],
//   )

//   const handleRemoveFrame = useCallback(
//     (event, type) => {
//       event.preventDefault()
//       event.stopPropagation()
//       if (type === 'start') {
//         if (startFrame) URL.revokeObjectURL(startFrame)
//         if (endFrame)   URL.revokeObjectURL(endFrame)
//         setStartFrame(null)
//         setStartFile(null)
//         setEndFrame(null)
//         setEndFile(null)
//       } else {
//         if (endFrame) URL.revokeObjectURL(endFrame)
//         setEndFrame(null)
//         setEndFile(null)
//       }
//     },
//     [startFrame, endFrame],
//   )

//   const handlePromptInput = () => {
//     const textarea = textareaRef.current
//     if (!textarea) return
//     textarea.style.height = 'auto'
//     textarea.style.height = `${textarea.scrollHeight}px`
//   }

//   const resetForm = useCallback(() => {
//     if (startFrame) URL.revokeObjectURL(startFrame)
//     if (endFrame)   URL.revokeObjectURL(endFrame)
//     setStartFrame(null)
//     setEndFrame(null)
//     setStartFile(null)
//     setEndFile(null)
//     setPrompt('')
//     setResolution('1080p')
//     setRatio('adaptive')
//     setLength(5)
//     // setNativeAudio(false)
//     setNativeAudio(isByteplus)
//     setMultiShotEnabled(false)
//     setIsCustomMode(false)
//     setShots(buildDefaultShots(5))
//     if (textareaRef.current) textareaRef.current.style.height = 'auto'
//     // if (models.length > 0) {
//     //   const def = models.find((m) => m.code === 'kling-v3') ?? models[models.length - 1]
//     //   setSelectedModel(String(def.id))
//     // }
//   // }, [startFrame, endFrame, models])
//   }, [startFrame, endFrame, isByteplus])

//   const hasAutoResetRef = useRef(false)
//   const resetFormRef    = useRef(null)
//   useEffect(() => { resetFormRef.current = resetForm }, [resetForm])
//   useEffect(() => {
//     if (status === 'succeeded' && !hasAutoResetRef.current) {
//       hasAutoResetRef.current = true
//       const t = setTimeout(() => resetFormRef.current?.(), 1500)
//       return () => clearTimeout(t)
//     }
//     if (status === null) {
//       hasAutoResetRef.current = false
//     }
//   }, [status])

//   const handleToggleMultiShot = () => {
//     if (isByteplus) return // Seedance chưa hỗ trợ multi-shot
//     const next = !multiShotEnabled
//     setMultiShotEnabled(next)
//     if (!next) setIsCustomMode(false)
//   }

//   const handleToggleCustomMode = () => {
//     if (isByteplus) return
//     if (!isCustomMode) setShots(buildDefaultShots(length))
//     setIsCustomMode((prev) => !prev)
//   }

//   // ── Submit ──────────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!startFile) {
//       alert('Vui lòng chọn Start Frame')
//       return
//     }
//     if (!selectedModel) {
//       alert('Vui lòng chọn model')
//       return
//     }

//     const mode = RESOLUTION_MODE_MAP[resolution.toLowerCase()] ?? 'pro'

//     // ── Case 0: BytePlus/Seedance — luôn Normal mode, kèm ratio ─────────
//     if (isByteplus) {
//       if (!prompt.trim()) {
//         alert('Vui lòng nhập prompt')
//         return
//       }

//       await submitCreateVideo({
//         modelId:        selectedModel,
//         resolution:     resolution.toLowerCase(),
//         ratio,
//         duration:       String(length),
//         mode,
//         sound:          nativeAudio ? 'on' : 'off',
//         prompt:         prompt.trim(),
//         multiShot:      false,
//         startImageFile: startFile,
//         endImageFile:   endFile,
//         cost:           Math.round(priceInfo?.total ?? 0),
//       })
//       return
//     }

//     // ── Case 1: Multi-Shot + Customize (Kling) ──────────────────────────
//     if (multiShotEnabled && isCustomMode) {
//       if (shots.some((s) => !s.prompt.trim())) {
//         alert('Vui lòng điền nội dung cho tất cả các shot')
//         return
//       }
//       if (isShotOverLimit) {
//         alert(`Tổng thời gian shot (${totalShotDuration}s) vượt quá thời lượng video (${length}s)`)
//         return
//       }
//       if (isShotUnderLimit) {
//         alert(`Tổng thời gian shot (${totalShotDuration}s) chưa đủ ${length}s. Vui lòng điều chỉnh duration.`)
//         return
//       }

//       const multiPrompt = shots.map((s, i) => ({
//         index:    i + 1,
//         prompt:   s.prompt.trim(),
//         duration: String(s.duration),
//       }))

//       await submitCreateVideo({
//         modelId:        selectedModel,
//         resolution:     resolution.toLowerCase(),
//         duration:       String(length),
//         mode,
//         sound:          nativeAudio ? 'on' : 'off',
//         prompt:         '',
//         multiShot:      true,
//         shotType:       'customize',
//         multiPrompt,
//         startImageFile: startFile,
//         endImageFile:   endFile,
//         cost:           Math.round(priceInfo?.total ?? 0),
//       })
//       return
//     }

//     // ── Case 2: Multi-Shot + Intelligence (Kling) ───────────────────────
//     if (multiShotEnabled && !isCustomMode) {
//       if (!prompt.trim()) {
//         alert('Vui lòng nhập prompt để Kling tự phân cảnh')
//         return
//       }

//       await submitCreateVideo({
//         modelId:        selectedModel,
//         resolution:     resolution.toLowerCase(),
//         duration:       String(length),
//         mode,
//         sound:          nativeAudio ? 'on' : 'off',
//         prompt:         prompt.trim(),
//         multiShot:      true,
//         shotType:       'intelligence',
//         startImageFile: startFile,
//         endImageFile:   endFile,
//         cost:           Math.round(priceInfo?.total ?? 0),
//       })
//       return
//     }

//     // ── Case 3: Normal (Kling, không multi-shot) ────────────────────────
//     if (!prompt.trim()) {
//       alert('Vui lòng nhập prompt')
//       return
//     }

//     await submitCreateVideo({
//       modelId:        selectedModel,
//       resolution:     resolution.toLowerCase(),
//       duration:       String(length),
//       mode,
//       sound:          nativeAudio ? 'on' : 'off',
//       prompt:         prompt.trim(),
//       multiShot:      false,
//       startImageFile: startFile,
//       endImageFile:   endFile,
//       cost:           Math.round(priceInfo?.total ?? 0),
//     })
//   }

//   const isProcessing = isSubmitting || status === 'queued' || status === 'processing'

//   const isSubmitDisabled = (() => {
//     if (isProcessing)  return true
//     if (!startFile)    return true
//     if (isShotOverLimit || isShotUnderLimit) return true

//     if (multiShotEnabled && isCustomMode) {
//       return shots.every((s) => !s.prompt.trim())
//     }
//     return !prompt.trim()
//   })()

//   return (
//     <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
//       <div className="flex h-full min-h-0 flex-col">
//         <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">

//           {/* ── Model selector ── */}
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

//           {/* ── Frame upload ── */}
//           <div className="grid shrink-0 grid-cols-2 items-start gap-3">
//             <label
//               className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${
//                 startFrame ? 'aspect-square' : 'h-[150px]'
//               }`}
//             >
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(e) => handleImageUpload(e, 'start')}
//               />
//               {startFrame ? (
//                 <>
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
//                     <img src={startFrame} alt="Start Frame" className="max-h-full max-w-full object-contain" />
//                   </div>
//                   <button
//                     type="button"
//                     onClick={(e) => handleRemoveFrame(e, 'start')}
//                     className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
//                   >
//                     <span className="material-symbols-outlined text-base">delete</span>
//                   </button>
//                   <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
//                     Start Frame
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
//                     add_photo_alternate
//                   </span>
//                   <span className="mt-1 text-[10px] text-slate-500">Start Frame</span>
//                 </>
//               )}
//             </label>

//             <label
//               className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${
//                 startFrame ? 'aspect-square' : 'h-[150px]'
//               } ${!startFrame ? 'pointer-events-none opacity-40' : ''}`}
//             >
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 disabled={!startFrame}
//                 onChange={(e) => handleImageUpload(e, 'end')}
//               />
//               {endFrame ? (
//                 <>
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
//                     <img src={endFrame} alt="End Frame" className="max-h-full max-w-full object-contain" />
//                   </div>
//                   <button
//                     type="button"
//                     onClick={(e) => handleRemoveFrame(e, 'end')}
//                     className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
//                   >
//                     <span className="material-symbols-outlined text-base">delete</span>
//                   </button>
//                   <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
//                     End Frame
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
//                     add_photo_alternate
//                   </span>
//                   <span className="mt-1 text-[10px] text-slate-500">
//                     {startFrame ? 'End Frame' : 'Upload Start First'}
//                   </span>
//                 </>
//               )}
//             </label>
//           </div>

//           {/* ── Prompt / MultiShotPanel ── */}
//           {multiShotEnabled && isCustomMode && !isByteplus ? (
//             <div className="shrink-0">
//               <MultiShotPanel
//                 shots={shots}
//                 onShotsChange={setShots}
//                 totalDuration={length}
//               />
//             </div>
//           ) : (
//             <textarea
//               ref={textareaRef}
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               onInput={handlePromptInput}
//               rows={1}
//               className="min-h-[240px] w-full shrink-0 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
//               placeholder={'Bạn nhập prompt để tạo video...'}
//             />
//           )}

//           {/* ── Status ── */}
//           {status && (
//             <div className="shrink-0 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
//               <div className="flex items-center gap-2">
//                 {(status === 'queued' || status === 'processing') && (
//                   <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-indigo-400" />
//                 )}
//                 <span className={`text-sm font-medium ${STATUS_COLOR[status]}`}>
//                   {STATUS_LABEL[status]}
//                 </span>
//               </div>
//               {status === 'failed' && error && (
//                 <p className="mt-2 text-xs text-red-400">{error}</p>
//               )}
//             </div>
//           )}

//           {error && !status && (
//             <p className="shrink-0 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
//               {error}
//             </p>
//           )}
//         </div>

//         {/* ── Bottom actions ── */}
//         <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">

//           <div className="flex items-center justify-between gap-2">
//             <CustomSettingVideo
//               modelCode={selectedModelCode}
//               isByteplus={isByteplus}
//               resolution={resolution}
//               setResolution={setResolution}
//               ratio={ratio}
//               setRatio={setRatio}
//               length={length}
//               setLength={setLength}
//               nativeAudio={nativeAudio}
//               setNativeAudio={setNativeAudio}
//             />

//             <button
//               type="button"
//               onClick={resetForm}
//               disabled={isProcessing}
//               title="Reset form"
//               className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 transition-all hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
//             >
//               <span className="material-symbols-outlined text-[18px]">restart_alt</span>
//             </button>

//             {/* Multi-Shot toggle — ẩn hoàn toàn khi model là BytePlus */}
//             {!isByteplus && (
//               <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/60 p-1">
//                 <button
//                   type="button"
//                   onClick={handleToggleMultiShot}
//                   className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
//                     multiShotEnabled
//                       ? 'bg-emerald-500/20 text-emerald-400'
//                       : 'text-slate-400 hover:text-slate-300'
//                   }`}
//                 >
//                   <span
//                     className={`relative inline-flex h-3.5 w-6 shrink-0 rounded-full transition-colors ${
//                       multiShotEnabled ? 'bg-emerald-500' : 'bg-slate-600'
//                     }`}
//                   >
//                     <span
//                       className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition-all ${
//                         multiShotEnabled ? 'left-3' : 'left-0.5'
//                       }`}
//                     />
//                   </span>
//                   Multi-Shot
//                 </button>

//                 <span className="h-4 w-px bg-slate-700" />

//                 <button
//                   type="button"
//                   onClick={handleToggleCustomMode}
//                   disabled={!multiShotEnabled}
//                   className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
//                     !multiShotEnabled
//                       ? 'cursor-not-allowed text-slate-600'
//                       : isCustomMode
//                       ? 'text-indigo-400 hover:text-indigo-300'
//                       : 'text-slate-400 hover:text-slate-300'
//                   }`}
//                 >
//                   Custom
//                   <span className="material-symbols-outlined text-[13px]">
//                     {isCustomMode ? 'keyboard_arrow_down' : 'chevron_right'}
//                   </span>
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,6fr)] items-center gap-3">

//             <div className="flex h-[52px] min-w-0 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/50 px-3">
//               {priceInfo ? (
//                 <span className={`whitespace-nowrap font-mono text-xl font-black leading-none tracking-tight ${priceColour}`}>
//                   {Math.round(priceInfo.total).toLocaleString('vi-VN')} VNĐ
//                 </span>
//               ) : (
//                 <span className="text-[11px] text-slate-500">
//                   {selectedModelCode ? 'No pricing data' : 'Chọn model để xem giá'}
//                 </span>
//               )}
//             </div>

//             <button
//               type="button"
//               disabled={isSubmitDisabled}
//               onClick={handleSubmit}
//               className="flex h-[52px] w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {isProcessing ? (
//                 <>
//                   <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//                   Đang tạo...
//                 </>
//               ) : (
//                 <>
//                   <span className="material-symbols-outlined text-[18px]">bolt</span>
//                   Tạo Video
//                 </>
//               )}
//             </button>
//           </div>

//         </div>
//       </div>
//     </section>
//   )
// }

import { useRef, useState, useCallback, useEffect, useMemo } from "react"
import CustomSettingVideo from "./CustomSettingVideo"
import MultiShotPanel from "./MultiShotPanel"
import AssetPickerModal from "./AssetPickerModal"
import { useAiModels } from '../../hooks/useAiModels'
import { calcVideoPrice } from '../../constants/videoPricing'
import { RESOLUTION_TO_MODE } from '../../constants/videoOptions'

const STATUS_LABEL = {
  queued:     'Đang chờ xử lý...',
  processing: 'Đang tạo video...',
  succeeded:  'Tạo video thành công!',
  failed:     'Tạo video thất bại',
}

const STATUS_COLOR = {
  queued:     'text-yellow-400',
  processing: 'text-blue-400',
  succeeded:  'text-green-400',
  failed:     'text-red-400',
}

const RESOLUTION_MODE_MAP = {
  '720p':  'std',
  '1080p': 'pro',
  '4k':    '4k',
}

function buildDefaultShots(totalDuration) {
  const half = Math.floor(totalDuration / 2)
  const rest = totalDuration - half
  return [
    { id: 1, prompt: '', duration: half },
    { id: 2, prompt: '', duration: rest },
  ]
}

export default function FromCreateVideo({ createVideoHook }) {
  const textareaRef = useRef(null)

  const [startFrame, setStartFrame] = useState(null)
  const [endFrame,   setEndFrame]   = useState(null)
  const [startFile,  setStartFile]  = useState(null)
  const [endFile,    setEndFile]    = useState(null)

  // ── Reuse ảnh có sẵn trong thư viện (không upload lại lên Cloudinary) ──
  const [startAssetId, setStartAssetId] = useState(null)
  const [endAssetId,   setEndAssetId]   = useState(null)
  const [pickerTarget, setPickerTarget] = useState(null) // 'start' | 'end' | null

  const { models, loading: modelsLoading } = useAiModels({ modelType: 'video_generation' })
  const [selectedModel, setSelectedModel]  = useState('')

  // ── derived: model code + provider ──────────────────────────────────────
  const selectedModelData = models.find((m) => String(m.id) === selectedModel)
  const selectedModelCode = selectedModelData?.code ?? ''
  const isByteplus        = selectedModelData?.provider?.code === 'byteplus'

  const prevModelRef = useRef(null)
  useEffect(() => {
    if (prevModelRef.current !== null && prevModelRef.current !== selectedModel) {
      setResolution('1080p')
      setRatio('adaptive')
      setLength(5)
      // setNativeAudio(false)
      setNativeAudio(isByteplus)
      // BytePlus chưa hỗ trợ multi-shot → auto tắt khi đổi sang model BytePlus
      if (isByteplus) {
        setMultiShotEnabled(false)
        setIsCustomMode(false)
      }
    }
    prevModelRef.current = selectedModel
  }, [selectedModel]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (models.length > 0) {
      const defaultModel =
        models.find((m) => m.code === 'kling-v3') ?? models[models.length - 1]
      setSelectedModel(String(defaultModel.id))
    }
  }, [models])

  // ── settings ──
  const [resolution,  setResolution]  = useState('1080p')
  const [ratio,       setRatio]       = useState('adaptive')   // ← NEW, chỉ dùng khi isByteplus
  const [length,      setLength]      = useState(5)
  const [nativeAudio, setNativeAudio] = useState(false)

  const priceInfo = useMemo(
    () => calcVideoPrice({ modelCode: selectedModelCode, resolution, duration: length, nativeAudio }),
    [selectedModelCode, resolution, length, nativeAudio],
  )

  const priceColour =
    !priceInfo                ? 'text-slate-400'   :
    priceInfo.total < 50000   ? 'text-emerald-400' :
    priceInfo.total < 75000   ? 'text-yellow-400'  :
    priceInfo.total < 100000  ? 'text-orange-400'  :
                                'text-red-400'

  const [prompt, setPrompt] = useState('')

  const [multiShotEnabled, setMultiShotEnabled] = useState(false)
  const [isCustomMode,     setIsCustomMode]     = useState(false)
  const [shots,            setShots]            = useState(() => buildDefaultShots(5))

  useEffect(() => {
    if (!isCustomMode) {
      setShots(buildDefaultShots(length))
    }
  }, [length]) // eslint-disable-line react-hooks/exhaustive-deps

  const { submitCreateVideo, isSubmitting, status, error } = createVideoHook

  const totalShotDuration = shots.reduce((sum, s) => sum + s.duration, 0)
  const isShotOverLimit   = isCustomMode && totalShotDuration > length
  const isShotUnderLimit  = isCustomMode && totalShotDuration < length

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
        if (endFrame)   URL.revokeObjectURL(endFrame)
        setStartFrame(imageUrl)
        setStartFile(file)
        setStartAssetId(null)
        setEndFrame(null)
        setEndFile(null)
        setEndAssetId(null)
      } else {
        if (endFrame) URL.revokeObjectURL(endFrame)
        setEndFrame(imageUrl)
        setEndFile(file)
        setEndAssetId(null)
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
        if (endFrame)   URL.revokeObjectURL(endFrame)
        setStartFrame(null)
        setStartFile(null)
        setStartAssetId(null)
        setEndFrame(null)
        setEndFile(null)
        setEndAssetId(null)
      } else {
        if (endFrame) URL.revokeObjectURL(endFrame)
        setEndFrame(null)
        setEndFile(null)
        setEndAssetId(null)
      }
    },
    [startFrame, endFrame],
  )

  const handleSelectFromLibrary = useCallback(
    (asset) => {
      if (pickerTarget === 'start') {
        if (startFrame) URL.revokeObjectURL(startFrame)
        if (endFrame)   URL.revokeObjectURL(endFrame)
        setStartFrame(asset.storedUrl)
        setStartFile(null)
        setStartAssetId(asset.id)
        setEndFrame(null)
        setEndFile(null)
        setEndAssetId(null)
      } else if (pickerTarget === 'end') {
        if (endFrame) URL.revokeObjectURL(endFrame)
        setEndFrame(asset.storedUrl)
        setEndFile(null)
        setEndAssetId(asset.id)
      }
      setPickerTarget(null)
    },
    [pickerTarget, startFrame, endFrame],
  )

  const handlePromptInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const resetForm = useCallback(() => {
    if (startFrame) URL.revokeObjectURL(startFrame)
    if (endFrame)   URL.revokeObjectURL(endFrame)
    setStartFrame(null)
    setEndFrame(null)
    setStartFile(null)
    setEndFile(null)
    setStartAssetId(null)
    setEndAssetId(null)
    setPrompt('')
    setResolution('1080p')
    setRatio('adaptive')
    setLength(5)
    // setNativeAudio(false)
    setNativeAudio(isByteplus)
    setMultiShotEnabled(false)
    setIsCustomMode(false)
    setShots(buildDefaultShots(5))
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    // if (models.length > 0) {
    //   const def = models.find((m) => m.code === 'kling-v3') ?? models[models.length - 1]
    //   setSelectedModel(String(def.id))
    // }
  // }, [startFrame, endFrame, models])
  }, [startFrame, endFrame, isByteplus])

  const hasAutoResetRef = useRef(false)
  const resetFormRef    = useRef(null)
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

  const handleToggleMultiShot = () => {
    if (isByteplus) return // Seedance chưa hỗ trợ multi-shot
    const next = !multiShotEnabled
    setMultiShotEnabled(next)
    if (!next) setIsCustomMode(false)
  }

  const handleToggleCustomMode = () => {
    if (isByteplus) return
    if (!isCustomMode) setShots(buildDefaultShots(length))
    setIsCustomMode((prev) => !prev)
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!startFile && !startAssetId) {
      alert('Vui lòng chọn Start Frame')
      return
    }
    if (!selectedModel) {
      alert('Vui lòng chọn model')
      return
    }

    const mode = RESOLUTION_MODE_MAP[resolution.toLowerCase()] ?? 'pro'

    // ── Case 0: BytePlus/Seedance — luôn Normal mode, kèm ratio ─────────
    if (isByteplus) {
      if (!prompt.trim()) {
        alert('Vui lòng nhập prompt')
        return
      }

      await submitCreateVideo({
        modelId:        selectedModel,
        resolution:     resolution.toLowerCase(),
        ratio,
        duration:       String(length),
        mode,
        sound:          nativeAudio ? 'on' : 'off',
        prompt:         prompt.trim(),
        multiShot:      false,
        startImageFile: startFile,
        endImageFile:   endFile,
        startImageAssetId: startAssetId,
        endImageAssetId:   endAssetId,
        cost:           Math.round(priceInfo?.total ?? 0),
      })
      return
    }

    // ── Case 1: Multi-Shot + Customize (Kling) ──────────────────────────
    if (multiShotEnabled && isCustomMode) {
      if (shots.some((s) => !s.prompt.trim())) {
        alert('Vui lòng điền nội dung cho tất cả các shot')
        return
      }
      if (isShotOverLimit) {
        alert(`Tổng thời gian shot (${totalShotDuration}s) vượt quá thời lượng video (${length}s)`)
        return
      }
      if (isShotUnderLimit) {
        alert(`Tổng thời gian shot (${totalShotDuration}s) chưa đủ ${length}s. Vui lòng điều chỉnh duration.`)
        return
      }

      const multiPrompt = shots.map((s, i) => ({
        index:    i + 1,
        prompt:   s.prompt.trim(),
        duration: String(s.duration),
      }))

      await submitCreateVideo({
        modelId:        selectedModel,
        resolution:     resolution.toLowerCase(),
        duration:       String(length),
        mode,
        sound:          nativeAudio ? 'on' : 'off',
        prompt:         '',
        multiShot:      true,
        shotType:       'customize',
        multiPrompt,
        startImageFile: startFile,
        endImageFile:   endFile,
        startImageAssetId: startAssetId,
        endImageAssetId:   endAssetId,
        cost:           Math.round(priceInfo?.total ?? 0),
      })
      return
    }

    // ── Case 2: Multi-Shot + Intelligence (Kling) ───────────────────────
    if (multiShotEnabled && !isCustomMode) {
      if (!prompt.trim()) {
        alert('Vui lòng nhập prompt để Kling tự phân cảnh')
        return
      }

      await submitCreateVideo({
        modelId:        selectedModel,
        resolution:     resolution.toLowerCase(),
        duration:       String(length),
        mode,
        sound:          nativeAudio ? 'on' : 'off',
        prompt:         prompt.trim(),
        multiShot:      true,
        shotType:       'intelligence',
        startImageFile: startFile,
        endImageFile:   endFile,
        startImageAssetId: startAssetId,
        endImageAssetId:   endAssetId,
        cost:           Math.round(priceInfo?.total ?? 0),
      })
      return
    }

    // ── Case 3: Normal (Kling, không multi-shot) ────────────────────────
    if (!prompt.trim()) {
      alert('Vui lòng nhập prompt')
      return
    }

    await submitCreateVideo({
      modelId:        selectedModel,
      resolution:     resolution.toLowerCase(),
      duration:       String(length),
      mode,
      sound:          nativeAudio ? 'on' : 'off',
      prompt:         prompt.trim(),
      multiShot:      false,
      startImageFile: startFile,
      endImageFile:   endFile,
      startImageAssetId: startAssetId,
      endImageAssetId:   endAssetId,
      cost:           Math.round(priceInfo?.total ?? 0),
    })
  }

  const isProcessing = isSubmitting || status === 'queued' || status === 'processing'

  const isSubmitDisabled = (() => {
    if (isProcessing)  return true
    if (!startFile && !startAssetId) return true
    if (isShotOverLimit || isShotUnderLimit) return true

    if (multiShotEnabled && isCustomMode) {
      return shots.every((s) => !s.prompt.trim())
    }
    return !prompt.trim()
  })()

  return (
    <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
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
                    <img src={startFrame} alt="Start Frame" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="absolute right-2 top-2 z-10 flex gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPickerTarget('start')
                      }}
                      title="Chọn từ thư viện"
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
                    >
                      <span className="material-symbols-outlined text-base">history</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFrame(e, 'start')}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setPickerTarget('start')
                    }}
                    className="relative z-10 mt-2 rounded-md border border-slate-600 px-2.5 py-1 text-[10px] font-medium text-slate-300 transition-colors hover:border-indigo-500 hover:text-indigo-400"
                  >
                    History
                  </button>
                </>
              )}
            </label>

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
                    <img src={endFrame} alt="End Frame" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="absolute right-2 top-2 z-10 flex gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPickerTarget('end')
                      }}
                      title="Chọn từ thư viện"
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
                    >
                      <span className="material-symbols-outlined text-base">history</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFrame(e, 'end')}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
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
                  {startFrame && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPickerTarget('end')
                      }}
                      className="relative z-10 mt-2 rounded-md border border-slate-600 px-2.5 py-1 text-[10px] font-medium text-slate-300 transition-colors hover:border-indigo-500 hover:text-indigo-400"
                    >
                      History
                    </button>
                  )}
                </>
              )}
            </label>
          </div>

          <AssetPickerModal
            open={!!pickerTarget}
            onClose={() => setPickerTarget(null)}
            onSelect={handleSelectFromLibrary}
          />

          {/* ── Prompt / MultiShotPanel ── */}
          {multiShotEnabled && isCustomMode && !isByteplus ? (
            <div className="shrink-0">
              <MultiShotPanel
                shots={shots}
                onShotsChange={setShots}
                totalDuration={length}
              />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onInput={handlePromptInput}
              rows={1}
              className="min-h-[240px] w-full shrink-0 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder={'Bạn nhập prompt để tạo video...'}
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

          {error && !status && (
            <p className="shrink-0 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* ── Bottom actions ── */}
        <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">

          <div className="flex items-center justify-between gap-2">
            <CustomSettingVideo
              modelCode={selectedModelCode}
              isByteplus={isByteplus}
              resolution={resolution}
              setResolution={setResolution}
              ratio={ratio}
              setRatio={setRatio}
              length={length}
              setLength={setLength}
              nativeAudio={nativeAudio}
              setNativeAudio={setNativeAudio}
            />

            <button
              type="button"
              onClick={resetForm}
              disabled={isProcessing}
              title="Reset form"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 transition-all hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>

            {/* Multi-Shot toggle — ẩn hoàn toàn khi model là BytePlus */}
            {!isByteplus && (
              <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/60 p-1">
                <button
                  type="button"
                  onClick={handleToggleMultiShot}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                    multiShotEnabled
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
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

                <span className="h-4 w-px bg-slate-700" />

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
            )}
          </div>

          <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,6fr)] items-center gap-3">

            <div className="flex h-[52px] min-w-0 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/50 px-3">
              {priceInfo ? (
                <span className={`whitespace-nowrap font-mono text-xl font-black leading-none tracking-tight ${priceColour}`}>
                  {Math.round(priceInfo.total).toLocaleString('vi-VN')} VNĐ
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  {selectedModelCode ? 'No pricing data' : 'Chọn model để xem giá'}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
              className="flex h-[52px] w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  Tạo Video
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
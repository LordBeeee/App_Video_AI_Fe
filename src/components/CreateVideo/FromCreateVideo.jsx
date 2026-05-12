// import { useRef, useState } from "react"
// import CustomSettingVideo from "./CustomSettingVideo"

// export default function FromCreateVideo() {
//   const textareaRef = useRef(null)
//   const [startFrame, setStartFrame] = useState(null)
//   const [endFrame, setEndFrame] = useState(null)

//   const handleImageUpload = (event, type) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     if (!file.type.startsWith("image/")) {
//       alert("Chỉ được upload file ảnh")
//       return
//     }

//     const imageUrl = URL.createObjectURL(file)

//     if (type === "start") {
//       setStartFrame(imageUrl)
//     } else {
//       setEndFrame(imageUrl)
//     }
//   }

//   const handleRemoveFrame = (event, type) => {
//     event.stopPropagation()

//     if (type === "start") {
//       setStartFrame(null)
//     } else {
//       setEndFrame(null)
//     }
//   }

//   const handlePromptInput = () => {
//     const textarea = textareaRef.current
//     if (!textarea) return

//     textarea.style.height = "auto"
//     textarea.style.height = `${textarea.scrollHeight}px`
//   }

//   return (
//     <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
//       <div className="flex h-full min-h-0 flex-col">
//         {/* PHẦN 1 + PHẦN 2: SCROLL CHUNG */}
//         <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">
//           {/* PHẦN 1: MODEL */}
//           <div className="shrink-0">
//             <div className="relative">
//               <select className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
//                 <option>Kling-v2-6 Cinematic</option>
//                 <option>Kling-v2-Pro Motion</option>
//                 <option>Stable-Video-Diffusion XL</option>
//               </select>

//               <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">
//                 expand_more
//               </span>
//             </div>
//           </div>

//           {/* PHẦN 2: FRAME */}
//           {/* <div className="grid shrink-0 grid-cols-2 gap-3">
//             <div className="group flex h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50">
//               <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
//                 add_photo_alternate
//               </span>

//               <span className="mt-1 text-[10px] text-slate-500">
//                 Start Frame
//               </span>
//             </div>

//             <div className="group flex h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50">
//               <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
//                 add_photo_alternate
//               </span>

//               <span className="mt-1 text-[10px] text-slate-500">
//                 End Frame
//               </span>
//             </div>
//           </div> */}
//           <div className="grid shrink-0 grid-cols-2 gap-3">
//             {/* Start Frame */}
//             <label className="group relative flex h-[150px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50">
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(event) => handleImageUpload(event, "start")}
//               />

//               {startFrame ? (
//                 <>
//                   <img
//                     src={startFrame}
//                     alt="Start Frame"
//                     className="h-full w-full object-cover"
//                   />

//                   <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/30" />

//                   <button
//                     type="button"
//                     onClick={(event) => handleRemoveFrame(event, "start")}
//                     className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-all hover:bg-black/80 group-hover:opacity-100"
//                   >
//                     <span className="material-symbols-outlined text-base">
//                       delete
//                     </span>
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

//                   <span className="mt-1 text-[10px] text-slate-500">
//                     Start Frame
//                   </span>
//                 </>
//               )}
//             </label>

//             {/* End Frame */}
//             <label className="group relative flex h-[150px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50">
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(event) => handleImageUpload(event, "end")}
//               />

//               {endFrame ? (
//                 <>
//                   <img
//                     src={endFrame}
//                     alt="End Frame"
//                     className="h-full w-full object-cover"
//                   />

//                   <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/30" />

//                   <button
//                     type="button"
//                     onClick={(event) => handleRemoveFrame(event, "end")}
//                     className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-all hover:bg-black/80 group-hover:opacity-100"
//                   >
//                     <span className="material-symbols-outlined text-base">
//                       delete
//                     </span>
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
//                     End Frame
//                   </span>
//                 </>
//               )}
//             </label>
//           </div>
//           {/* PHẦN 2: PROMPT */}
//           <textarea
//             ref={textareaRef}
//             onInput={handlePromptInput}
//             rows={1}
//             className="min-h-[240px] w-full shrink-0 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
//             placeholder="Bạn nhập prompt để tạo video..."
//           />
//         </div>

//         {/* PHẦN 3: CỐ ĐỊNH DƯỚI ĐÁY */}
//         <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">
//           <CustomSettingVideo />

//           <button
//             type="button"
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99]"
//           >
//             <span className="material-symbols-outlined text-lg">
//               bolt
//             </span>
//             Tạo Video
//           </button>
//         </div>
//       </div>
//     </section>
//   )
// }


// =========================================2===================================================

// import { useRef, useState } from "react"
// import CustomSettingVideo from "./CustomSettingVideo"

// export default function FromCreateVideo() {
//   const textareaRef = useRef(null)

//   const [startFrame, setStartFrame] = useState(null)
//   const [endFrame, setEndFrame] = useState(null)

//   // const handleImageUpload = (event, type) => {
//   //   const file = event.target.files?.[0]
//   //   if (!file) return

//   //   if (!file.type.startsWith("image/")) {
//   //     alert("Chỉ được upload file ảnh")
//   //     return
//   //   }

//   //   const imageUrl = URL.createObjectURL(file)

//   //   if (type === "start") {
//   //     setStartFrame(imageUrl)
//   //   } else {
//   //     setEndFrame(imageUrl)
//   //   }
//   // }
//   const handleImageUpload = (event, type) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     if (!file.type.startsWith("image/")) {
//       alert("Chỉ được upload file ảnh")
//       return
//     }

//     const imageUrl = URL.createObjectURL(file)

//     if (type === "start") {
//       setStartFrame(imageUrl)
//     } else {
//       setEndFrame(imageUrl)
//     }
//   }
//   const handleRemoveFrame = (event, type) => {
//     event.preventDefault()
//     event.stopPropagation()

//     if (type === "start") {
//       setStartFrame(null)
//     } else {
//       setEndFrame(null)
//     }
//   }

//   const handlePromptInput = () => {
//     const textarea = textareaRef.current
//     if (!textarea) return

//     textarea.style.height = "auto"
//     textarea.style.height = `${textarea.scrollHeight}px`
//   }

//   return (
//     <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
//       <div className="flex h-full min-h-0 flex-col">
//         {/* PHẦN 1 + PHẦN 2: SCROLL CHUNG */}
//         <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">
//           {/* PHẦN 1: MODEL */}
//           <div className="shrink-0">
//             <div className="relative">
//               <select className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
//                 <option>Kling-v2-6 Cinematic</option>
//                 <option>Kling-v2-Pro Motion</option>
//                 <option>Stable-Video-Diffusion XL</option>
//               </select>

//               <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">
//                 expand_more
//               </span>
//             </div>
//           </div>

//           {/* PHẦN 2: FRAME */}

//           <div className="grid shrink-0 grid-cols-2 gap-3">
//             <label
//               className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${
//                 startFrame ? "aspect-square" : "h-[150px]"
//               }`}
//             >
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(event) => handleImageUpload(event, "start")}
//               />

//               {startFrame ? (
//                 <>
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
//                     <img
//                       src={startFrame}
//                       alt="Start Frame"
//                       className="max-h-full max-w-full object-contain"
//                     />
//                   </div>

//                   <button
//                     type="button"
//                     onClick={(event) => handleRemoveFrame(event, "start")}
//                     className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white"
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
//                 endFrame ? "aspect-square" : "h-[150px]"
//               }`}
//             >
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(event) => handleImageUpload(event, "end")}
//               />

//               {endFrame ? (
//                 <>
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
//                     <img
//                       src={endFrame}
//                       alt="End Frame"
//                       className="max-h-full max-w-full object-contain"
//                     />
//                   </div>

//                   <button
//                     type="button"
//                     onClick={(event) => handleRemoveFrame(event, "end")}
//                     className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white"
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
//                   <span className="mt-1 text-[10px] text-slate-500">End Frame</span>
//                 </>
//               )}
//             </label>
//           </div>
//           {/* PHẦN 2: PROMPT */}
//           <textarea
//             ref={textareaRef}
//             onInput={handlePromptInput}
//             rows={1}
//             className="min-h-[240px] w-full shrink-0 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
//             placeholder="Bạn nhập prompt để tạo video..."
//           />
//         </div>

//         {/* PHẦN 3: CỐ ĐỊNH DƯỚI ĐÁY */}
//         <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">
//           <CustomSettingVideo />

//           <button
//             type="button"
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99]"
//           >
//             <span className="material-symbols-outlined text-lg">
//               bolt
//             </span>
//             Tạo Video
//           </button>
//         </div>
//       </div>
//     </section>
//   )
// }

import { useRef, useState } from "react"
import CustomSettingVideo from "./CustomSettingVideo"

export default function FromCreateVideo() {
  const textareaRef = useRef(null)

  const [startFrame, setStartFrame] = useState(null)
  const [endFrame, setEndFrame] = useState(null)

  // const handleImageUpload = (event, type) => {
  //   const file = event.target.files?.[0]
  //   if (!file) return

  //   if (!file.type.startsWith("image/")) {
  //     alert("Chỉ được upload file ảnh")
  //     return
  //   }

  //   const imageUrl = URL.createObjectURL(file)

  //   if (type === "start") {
  //     setStartFrame(imageUrl)
  //   } else {
  //     setEndFrame(imageUrl)
  //   }
  // }

  // const handleRemoveFrame = (event, type) => {
  //   event.preventDefault()
  //   event.stopPropagation()

  //   if (type === "start") {
  //     setStartFrame(null)
  //     setEndFrame(null)
  //   } else {
  //     setEndFrame(null)
  //   }
  // }
  const handleImageUpload = (event, type) => {
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
      setEndFrame(null)
    } else {
      if (endFrame) URL.revokeObjectURL(endFrame)

      setEndFrame(imageUrl)
    }

    event.target.value = ""
  }
  
  const handleRemoveFrame = (event, type) => {
    event.preventDefault()
    event.stopPropagation()

    if (type === "start") {
      if (startFrame) URL.revokeObjectURL(startFrame)
      if (endFrame) URL.revokeObjectURL(endFrame)

      setStartFrame(null)
      setEndFrame(null)
    } else {
      if (endFrame) URL.revokeObjectURL(endFrame)

      setEndFrame(null)
    }
  }
  
  const handlePromptInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  return (
    <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">
          <div className="shrink-0">
            <div className="relative">
              <select className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option>Kling-v2-6 Cinematic</option>
                <option>Kling-v2-Pro Motion</option>
                <option>Stable-Video-Diffusion XL</option>
              </select>

              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 items-start gap-3">
            <label
              className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${
                startFrame ? "aspect-square" : "h-[150px]"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImageUpload(event, "start")}
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
                    onClick={(event) => handleRemoveFrame(event, "start")}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
                  >
                    <span className="material-symbols-outlined text-base">
                      delete
                    </span>
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

                  <span className="mt-1 text-[10px] text-slate-500">
                    Start Frame
                  </span>
                </>
              )}
            </label>

            <label
              className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50 ${
                startFrame ? "aspect-square" : "h-[150px]"
              } ${!startFrame ? "pointer-events-none opacity-40" : ""}`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!startFrame}
                onChange={(event) => handleImageUpload(event, "end")}
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
                    onClick={(event) => handleRemoveFrame(event, "end")}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-all hover:bg-black/80"
                  >
                    <span className="material-symbols-outlined text-base">
                      delete
                    </span>
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
                    {startFrame ? "End Frame" : "Upload Start First"}
                  </span>
                </>
              )}
            </label>
          </div>

          <textarea
            ref={textareaRef}
            onInput={handlePromptInput}
            rows={1}
            className="min-h-[240px] w-full shrink-0 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Bạn nhập prompt để tạo video..."
          />
        </div>

        <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">
          <CustomSettingVideo />

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-indigo-500 active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-lg">bolt</span>
            Tạo Video
          </button>
        </div>
      </div>
    </section>
  )
}
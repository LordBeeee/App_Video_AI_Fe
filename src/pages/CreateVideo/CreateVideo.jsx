// import { useState } from "react"
// import FromCreateVideo from "../../components/CreateVideo/FromCreateVideo"

// export default function CreateVideo() {
  
//   return (
//     // <main className="flex h-full overflow-hidden bg-slate-950 text-white">
//     <main className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-white">
//       {/* Left Column */}
//       {/* <section className="flex w-[360px] flex-col gap-6 overflow-y-auto border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg"> */}
//       <FromCreateVideo />

//       {/* Center Column */}
//       {/* <section className="relative flex flex-1 flex-col items-center justify-center bg-slate-950 px-8"> */}
//       <section className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-slate-950 px-8 py-4">
//         <div className="mb-4 flex w-full max-w-5xl items-center justify-start gap-2">
//             <div className="flex items-center gap-2 text-white">
//                 <span className="material-symbols-outlined text-2xl">
//                 movie
//                 </span>
//                 <span className="text-lg font-bold">
//                 Video
//                 </span>
//             </div>
            
//             <div className="ml-4 flex items-center gap-2">
//                 <button
//                 type="button"
//                 className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700"
//                 >
//                 <div className="h-7 w-7 overflow-hidden rounded-md bg-slate-700">
//                     <img
//                     src="/avatar.png"
//                     alt="Start frame"
//                     className="h-full w-full object-cover"
//                     />
//                 </div>
//                 Start
//                 </button>

//                 <button
//                 type="button"
//                 className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700"
//                 >
//                 Video 3.0
//                 </button>

//                 <button
//                 type="button"
//                 className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700"
//                 >
//                 720p
//                 </button>
//             </div>
//         </div>
//         <div className="group relative mb-4 w-full max-w-5xl cursor-default">
//             {/* Text preview: chỉ hiện 3 dòng, không có ... */}
//             {/* <div className="max-h-[96px] overflow-hidden"> */}
//             <div className="max-h-[88px] overflow-hidden">
//                 <p className="text-sm leading-8 text-slate-100">
//                 A sanitary pad remains centered, clean, sharp and stable, with no deformation.
//                 A soft icy airflow gently flows toward the center absorption channel from the
//                 lower side, slowly converging and being absorbed into the pad. The motion is
//                 smooth, light and controlled. As the airflow is absorbed, a soft cool blue
//                 glow builds gradually at the center of the pad. The energy gently increases
//                 and begins to radiate outward from the center. The airflow then expands
//                 outward smoothly in all directions, becoming slightly wider and more dynamic.
//                 Mint leaves, lemon slices, bubbles and snowflakes gradually increase in
//                 number and spread outward in a balanced circular motion. The transition feels
//                 continuous and natural, evolving from a calm inward motion into a soft
//                 refreshing outward burst, without any sudden change. The sanitary pad remains
//                 stable and unchanged, glowing softly. Mint leaves, lemon slices and snowflakes
//                 float in a harmonious motion. Bright blue lighting, cinematic FMCG commercial
//                 style, ultra clean, smooth motion, no distortion, no morphing, gentle energy
//                 expansion, 4K, photorealistic.
//                 </p>
//             </div>

//             {/* Hover popup full text */}
//             <div className="absolute left-0 top-full z-30 mt-4 hidden w-full rounded-xl bg-slate-800 p-4 text-sm leading-8 text-slate-100 shadow-2xl group-hover:block">
//                 {/* mũi nhọn nhỏ hướng lên */}
//                 <div className="absolute -top-2 left-1/2 h-4 w-4 rotate-45 bg-slate-800" />

//                 <p>
//                 A sanitary pad remains centered, clean, sharp and stable, with no deformation.
//                 A soft icy airflow gently flows toward the center absorption channel from the
//                 lower side, slowly converging and being absorbed into the pad. The motion is
//                 smooth, light and controlled. As the airflow is absorbed, a soft cool blue
//                 glow builds gradually at the center of the pad. The energy gently increases
//                 and begins to radiate outward from the center. The airflow then expands
//                 outward smoothly in all directions, becoming slightly wider and more dynamic.
//                 Mint leaves, lemon slices, bubbles and snowflakes gradually increase in
//                 number and spread outward in a balanced circular motion. The transition feels
//                 continuous and natural, evolving from a calm inward motion into a soft
//                 refreshing outward burst, without any sudden change. The sanitary pad remains
//                 stable and unchanged, glowing softly. Mint leaves, lemon slices and snowflakes
//                 float in a harmonious motion. Bright blue lighting, cinematic FMCG commercial
//                 style, ultra clean, smooth motion, no distortion, no morphing, gentle energy
//                 expansion, 4K, photorealistic.
//                 </p>
//             </div>
//         </div>
//         {/* <div className="group relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl"> */}
//         <div className="group relative aspect-video w-full max-w-5xl flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl max-h-[calc(100vh-300px)]">
//         {/* <div className="group relative aspect-video w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl"> */}
//           <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
//             <div className="relative">
//               <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/20 blur-3xl" />
//               <span className="material-symbols-outlined relative z-10 text-6xl text-indigo-400">
//                 movie
//               </span>
//             </div>

//             <div className="space-y-2 text-center">
//               <p className="text-xl font-bold text-white">Ready to Create</p>
//               <p className="text-sm text-slate-400">
//                 Input your prompt to begin the generation process
//               </p>
//             </div>
//           </div>

//           {/* Player Overlay */}
//           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
//             <div className="flex items-center gap-4">
//               <span className="material-symbols-outlined cursor-pointer text-white">
//                 play_arrow
//               </span>

//               <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
//                 <div className="h-full w-1/3 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
//               </div>

//               <span className="font-mono text-[10px] text-white">
//                 03:20 / 10:00
//               </span>

//               <span className="material-symbols-outlined cursor-pointer text-sm text-white">
//                 fullscreen
//               </span>
//             </div>
//           </div>
//         </div>

//       </section>   
//         <section className="flex w-25 flex-col overflow-hidden border-l border-slate-800/80 bg-slate-900/40 backdrop-blur-lg">

//         </section>
//     </main>
//   )
// }


// import { useState } from "react"
// import FromCreateVideo from "../../components/CreateVideo/FromCreateVideo"
// import VideoHistoryPanel from "../../components/CreateVideo/VideoHistoryPanel"
// import { useCreateVideo } from "../../hooks/useCreateVideo"
// import { useVideoHistory } from "../../hooks/useVideoHistory"

// export default function CreateVideo() {
//   const createVideoHook = useCreateVideo()
//   const { status, videoUrl, result, error } = createVideoHook

//   const { history, loading: historyLoading, refetch } = useVideoHistory()

//   // Video đang hiển thị ở center (có thể từ hook tạo mới hoặc click history)
//   const [selectedVideo, setSelectedVideo] = useState(null)

//   // Khi tạo video xong → refetch history + hiển thị video mới
//   const displayStatus = selectedVideo ? 'succeeded' : status
//   const displayVideoUrl = selectedVideo?.videoUrl ?? videoUrl
//   const displayResult = selectedVideo
//     ? {
//         beginImageUrl: selectedVideo.beginImageUrl,
//         endImageUrl: selectedVideo.endImageUrl,
//         promptSent: selectedVideo.promptSent,
//       }
//     : result

//   // Khi status succeeded → refetch history tự động
//   if (status === 'succeeded' && videoUrl) {
//     // refetch 1 lần sau khi video mới xong
//   }

//   const handleSelectHistory = (item) => {
//     setSelectedVideo(item)
//   }

//   // Khi bắt đầu tạo video mới → bỏ selected history
//   const wrappedHook = {
//     ...createVideoHook,
//     submitCreateVideo: async (params) => {
//       setSelectedVideo(null)
//       await createVideoHook.submitCreateVideo(params)
//       // Refetch history sau khi submit
//       setTimeout(() => refetch(), 2000)
//     },
//   }

//   return (
//     <main className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-white">
//       {/* Left Column */}
//       <FromCreateVideo createVideoHook={createVideoHook} />

//       {/* Center Column */}
//       <section className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-slate-950 px-8 py-4">

//         {/* Top info bar - chỉ hiện khi có result */}
//         {result && (
//           <div className="mb-4 flex w-full max-w-5xl items-center justify-start gap-2">
//             <div className="flex items-center gap-2 text-white">
//               <span className="material-symbols-outlined text-2xl">movie</span>
//               <span className="text-lg font-bold">Video</span>
//             </div>

//             {/* <div className="ml-4 flex items-center gap-2">
//               <button type="button" className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white">
//                 <div className="h-7 w-7 overflow-hidden rounded-md bg-slate-700">
//                   <img src={result.beginImageUrl} alt="Start frame" className="h-full w-full object-cover" />
//                 </div>
//                 Start
//               </button>

//               <button type="button" className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
//                 Kling Pro
//               </button>
//             </div> */}
//             <div className="ml-4 flex items-center gap-2">
//               {/* Start frame button */}
//               <div className="group/frame relative">
//                 <button
//                   type="button"
//                   className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
//                 >
//                   <div className="h-7 w-7 overflow-hidden rounded-md bg-slate-700">
//                     <img
//                       src={result.beginImageUrl}
//                       alt="Start frame"
//                       className="h-full w-full object-cover"
//                     />
//                   </div>
//                   {result.endImageUrl ? 'Start / End' : 'Start'}
//                 </button>

//                 {/* Hover popup ảnh */}
//                 <div className="absolute left-0 top-full z-50 mt-2 hidden gap-2 group-hover/frame:flex">
//                   <img
//                     src={result.beginImageUrl}
//                     alt="Start"
//                     className="h-32 w-32 rounded-lg object-cover shadow-xl border border-slate-700"
//                   />
//                   {result.endImageUrl && (
//                     <img
//                       src={result.endImageUrl}
//                       alt="End"
//                       className="h-32 w-32 rounded-lg object-cover shadow-xl border border-slate-700"
//                     />
//                   )}
//                 </div>
//               </div>

//               <button type="button" className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
//                 Kling Pro
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Prompt preview - chỉ hiện khi có result */}
//         {result?.promptSent && (
//           <div className="group relative mb-4 w-full max-w-5xl cursor-default">
//             <div className="max-h-[88px] overflow-hidden">
//               <p className="text-sm leading-8 text-slate-100">{result.promptSent}</p>
//             </div>
//             <div className="absolute left-0 top-full z-30 mt-4 hidden w-full rounded-xl bg-slate-800 p-4 text-sm leading-8 text-slate-100 shadow-2xl group-hover:block">
//               <div className="absolute -top-2 left-1/2 h-4 w-4 rotate-45 bg-slate-800" />
//               <p>{result.promptSent}</p>
//             </div>
//           </div>
//         )}

//         {/* Video area */}
//         <div className="group relative aspect-video w-full max-w-5xl flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl max-h-[calc(100vh-300px)]">

//           {/* State 1: Chưa có gì */}
//           {!status && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
//               <div className="relative">
//                 <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/20 blur-3xl" />
//                 <span className="material-symbols-outlined relative z-10 text-6xl text-indigo-400">movie</span>
//               </div>
//               <div className="space-y-2 text-center">
//                 <p className="text-xl font-bold text-white">Ready to Create</p>
//                 <p className="text-sm text-slate-400">Input your prompt to begin the generation process</p>
//               </div>
//             </div>
//           )}

//           {/* State 2: Đang xử lý */}
//           {(status === 'queued' || status === 'processing') && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
//               <div className="relative h-16 w-16">
//                 <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
//                 <div className="absolute inset-2 animate-pulse rounded-full bg-indigo-500/20" />
//               </div>
//               <div className="space-y-2 text-center">
//                 <p className="text-lg font-bold text-white">
//                   {status === 'queued' ? 'Đang chờ xử lý...' : 'Đang tạo video...'}
//                 </p>
//                 <p className="text-sm text-slate-400">Thường mất 3 - 5 phút</p>
//               </div>
//             </div>
//           )}

//           {/* State 3: Thành công - hiển thị video */}
//           {status === 'succeeded' && videoUrl && (
//             <video
//               key={videoUrl}
//               src={videoUrl}
//               controls
//               autoPlay
//               loop
//               className="h-full w-full object-contain"
//             />
//           )}

//           {/* State 4: Thất bại */}
//           {status === 'failed' && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
//               <span className="material-symbols-outlined text-6xl text-red-400">error</span>
//               <div className="space-y-2 text-center">
//                 <p className="text-lg font-bold text-white">Tạo video thất bại</p>
//                 <p className="text-sm text-red-400">{error}</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* <section className="flex w-25 flex-col overflow-hidden border-l border-slate-800/80 bg-slate-900/40 backdrop-blur-lg" /> */}
//       <VideoHistoryPanel
//         history={history}
//         loading={historyLoading}
//         selectedId={selectedVideo?.id}
//         onSelect={handleSelectHistory}
//       />
//     </main>
//   )
// }

import { useState } from "react"
import FromCreateVideo from "../../components/CreateVideo/FromCreateVideo"
import VideoHistoryPanel from "../../components/CreateVideo/VideoHistoryPanel"
import { useCreateVideo } from "../../hooks/useCreateVideo"
import { useVideoHistory } from "../../hooks/useVideoHistory"

export default function CreateVideo() {
  const createVideoHook = useCreateVideo()
  const { status, videoUrl, result, error } = createVideoHook

  const { history, loading: historyLoading, refetch } = useVideoHistory()

  // Video đang hiển thị ở center (có thể từ hook tạo mới hoặc click history)
  const [selectedVideo, setSelectedVideo] = useState(null)

  // Khi tạo video xong → refetch history + hiển thị video mới
  const displayStatus = selectedVideo ? 'succeeded' : status
  const displayVideoUrl = selectedVideo?.videoUrl ?? videoUrl
  const displayResult = selectedVideo
    ? {
        beginImageUrl: selectedVideo.beginImageUrl,
        endImageUrl: selectedVideo.endImageUrl,
        promptSent: selectedVideo.promptSent,
      }
    : result

  // Khi status succeeded → refetch history tự động
  if (status === 'succeeded' && videoUrl) {
    // refetch 1 lần sau khi video mới xong
  }

  const handleSelectHistory = (item) => {
    setSelectedVideo(item)
  }

  // Khi bắt đầu tạo video mới → bỏ selected history
  const wrappedHook = {
    ...createVideoHook,
    submitCreateVideo: async (params) => {
      setSelectedVideo(null)
      await createVideoHook.submitCreateVideo(params)
      // Refetch history sau khi submit
      setTimeout(() => refetch(), 2000)
    },
  }

  return (
    // <main className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-white">
    <main className="flex h-screen overflow-hidden bg-slate-950 pt-16 text-white">
      {/* Left Column */}
      <FromCreateVideo createVideoHook={wrappedHook} />

      {/* Center Column */}
      <section className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-slate-950 px-8 py-4">

        {/* Top info bar */}
        {displayResult && (
          <div className="mb-4 flex w-full max-w-5xl items-center justify-start gap-2">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-2xl">movie</span>
              <span className="text-lg font-bold">Video</span>
            </div>

            <div className="ml-4 flex items-center gap-2">
              <div className="group/frame relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
                >
                  <div className="h-7 w-7 overflow-hidden rounded-md bg-slate-700">
                    <img src={displayResult.beginImageUrl} alt="Start frame" className="h-full w-full object-cover" />
                  </div>
                  {displayResult.endImageUrl ? 'Start / End' : 'Start'}
                </button>

                {/* Hover popup */}
                <div className="absolute left-0 top-full z-50 mt-2 hidden gap-2 group-hover/frame:flex">
                  <img src={displayResult.beginImageUrl} alt="Start" className="h-32 w-32 rounded-lg border border-slate-700 object-cover shadow-xl" />
                  {displayResult.endImageUrl && (
                    <img src={displayResult.endImageUrl} alt="End" className="h-32 w-32 rounded-lg border border-slate-700 object-cover shadow-xl" />
                  )}
                </div>
              </div>

              {/* <button type="button" className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
                Kling Pro
              </button> */}
              <button type="button" className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
                {displayResult?.modelName ?? 'Kling Pro'}
              </button>
            </div>
          </div>
        )}

        {/* Prompt preview */}
        {displayResult?.promptSent && (
          <div className="group relative mb-4 w-full max-w-5xl cursor-default">
            <div className="max-h-[88px] overflow-hidden">
              <p className="text-sm leading-8 text-slate-100">{displayResult.promptSent}</p>
            </div>
            <div className="absolute left-0 top-full z-30 mt-4 hidden w-full rounded-xl bg-slate-800 p-4 text-sm leading-8 text-slate-100 shadow-2xl group-hover:block">
              <div className="absolute -top-2 left-1/2 h-4 w-4 rotate-45 bg-slate-800" />
              <p>{displayResult.promptSent}</p>
            </div>
          </div>
        )}

        {/* Video area */}
        <div className="group relative aspect-video w-full max-w-5xl flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl max-h-[calc(100vh-300px)]">

          {/* State 1: Chưa có gì */}
          {!displayStatus && !selectedVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/20 blur-3xl" />
                <span className="material-symbols-outlined relative z-10 text-6xl text-indigo-400">movie</span>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-xl font-bold text-white">Ready to Create</p>
                <p className="text-sm text-slate-400">Input your prompt to begin the generation process</p>
              </div>
            </div>
          )}

          {/* State 2: Đang xử lý */}
          {!selectedVideo && (displayStatus === 'queued' || displayStatus === 'processing') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
                <div className="absolute inset-2 animate-pulse rounded-full bg-indigo-500/20" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-lg font-bold text-white">
                  {displayStatus === 'queued' ? 'Đang chờ xử lý...' : 'Đang tạo video...'}
                </p>
                <p className="text-sm text-slate-400">Thường mất 3 - 5 phút</p>
              </div>
            </div>
          )}

          {/* State 3: Hiển thị video */}
          {displayVideoUrl && (
            <video
              key={displayVideoUrl}
              src={displayVideoUrl}
              controls
              autoPlay
              loop
              className="h-full w-full object-contain"
            />
          )}

          {/* State 4: Thất bại */}
          {!selectedVideo && displayStatus === 'failed' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-6xl text-red-400">error</span>
              <div className="space-y-2 text-center">
                <p className="text-lg font-bold text-white">Tạo video thất bại</p>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Right Column - History */}
      <VideoHistoryPanel
        history={history}
        loading={historyLoading}
        selectedId={selectedVideo?.id}
        onSelect={handleSelectHistory}
      />
    </main>
  )
}
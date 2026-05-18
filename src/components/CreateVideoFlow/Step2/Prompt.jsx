// export default function Prompt({ onNext, onBack }) {
//   return (
//     <div className="flex flex-col gap-gutter">
//       {/* ── Title & Description ── */}
//       <div className="flex flex-col gap-1">
//         <h2 className="font-h1 text-h2 text-white">Generated Prompt</h2>
//         <p className="font-body-md text-on-surface-variant max-w-2xl">
//             Dựa trên brief bạn đã nhập, hệ thống đã tạo ra prompt chi tiết cho từng scene. 
//             Bạn có thể chỉnh sửa lại để phù hợp hơn với ý tưởng của mình trước khi tiến hành tạo hình ảnh và video.
//         </p>
//       </div>
//       {/* Scene 01 Card */}
//       <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
//         <div className="absolute top-0 right-0 p-4">
//           <span className="font-mono-ui text-white/20 text-4xl font-black">01</span>
//         </div>

//         <div className="flex items-center gap-2 mb-6">
//           <span className="material-symbols-outlined text-indigo-400">movie</span>
//           <h3 className="font-h3 text-h3 text-white uppercase tracking-wider">Neon Underworld</h3>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="flex flex-col gap-2">
//             <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
//               <span className="material-symbols-outlined text-[14px]">start</span>
//               Prompt Image Begin
//             </label>
//             <textarea
//               className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none"
//               placeholder="Describe the starting frame..."
//               defaultValue="Cinematic wide shot of a rainy neo-tokyo street at night, neon reflections in puddles, a mysterious figure in a chrome trenchcoat standing center frame, anamorphic lens flare, high contrast."
//             />
//           </div>

//           <div className="flex flex-col gap-2">
//             <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
//               <span className="material-symbols-outlined text-[14px]">last_page</span>
//               Prompt Image End
//             </label>
//             <textarea
//               className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none"
//               placeholder="Describe the ending frame..."
//               defaultValue="Extreme close up of the figure's cybernetic eye reflecting the neon city lights, micro-circuitry detail, digital glitch artifacts at the edges, cinematic bokeh."
//             />
//           </div>

//           <div className="flex flex-col gap-2">
//             <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
//               <span className="material-symbols-outlined text-[14px]">shutter_speed</span>
//               Prompt Motion
//             </label>
//             <textarea
//               className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none"
//               placeholder="Describe the movement..."
//               defaultValue="Slow cinematic dolly zoom into the eye, heavy rain particles moving diagonally, subtle head tilt, shutter speed 1/50, high motion blur."
//             />
//           </div>
//         </div>
//       </div>

//       {/* Scene 02 Card */}
//       <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
//         <div className="absolute top-0 right-0 p-4">
//           <span className="font-mono-ui text-white/20 text-4xl font-black">02</span>
//         </div>

//         <div className="flex items-center gap-2 mb-6">
//           <span className="material-symbols-outlined text-indigo-400">movie</span>
//           <h3 className="font-h3 text-h3 text-white uppercase tracking-wider">The Void Chamber</h3>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="flex flex-col gap-2">
//             <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
//               <span className="material-symbols-outlined text-[14px]">start</span>
//               Prompt Image Begin
//             </label>
//             <textarea
//               className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none"
//               placeholder="Describe the starting frame..."
//               defaultValue="Floating monolithic structure in a white infinite void, brutalist architecture, sharp shadows, minimalist aesthetic, 8k resolution."
//             />
//           </div>

//           <div className="flex flex-col gap-2">
//             <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
//               <span className="material-symbols-outlined text-[14px]">last_page</span>
//               Prompt Image End
//             </label>
//             <textarea
//               className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none"
//               placeholder="Describe the ending frame..."
//               defaultValue="The monolith crumbling into thousands of obsidian cubes, zero gravity, floating debris, cinematic lighting from below, surreal atmosphere."
//             />
//           </div>

//           <div className="flex flex-col gap-2">
//             <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
//               <span className="material-symbols-outlined text-[14px]">shutter_speed</span>
//               Prompt Motion
//             </label>
//             <textarea
//               className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none"
//               placeholder="Describe the movement..."
//               defaultValue="Dynamic orbital camera rotation around the monolith as it disintegrates, accelerated time-lapse motion, ethereal glow effects."
//             />
//           </div>
//         </div>
//       </div>

//       {/* ── Footer Navigation ── */}
//       <div className="mt-margin pt-8 border-t border-white/5 flex justify-between items-center">
//         <button
//           onClick={onBack}
//           className="flex items-center gap-2 font-label-caps text-on-surface-variant hover:text-white transition-colors"
//         >
//           <span className="material-symbols-outlined">arrow_back</span>
//           Back
//         </button>

//         <div className="flex items-center gap-6">
//           <div className="text-right hidden md:block">
//             <p className="font-label-caps text-[10px] text-on-surface-variant">Estimated Render Time</p>
//             <p className="font-mono-ui text-indigo-400">~12 minutes</p>
//           </div>

//           <button
//             onClick={onNext}
//             className="primary-gradient px-12 py-4 rounded-full font-label-caps text-white flex items-center gap-2 transition-all active:scale-95"
//           >
//             Next Step
//             <span className="material-symbols-outlined">arrow_forward</span>
//           </button>
//         </div>
//       </div>

//       {/* ── Visual Context Preview ── */}
//       <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="md:col-span-2 aspect-video glass-panel rounded-xl overflow-hidden relative">
//           <img
//             alt="Cinematic cyberpunk street scene"
//             className="w-full h-full object-cover opacity-60"
//             src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2rp37pSD6mEruRxqgxCrDlDSN9yRb5C98LnJOzGtvoXHNG5xLC4ihjsfPcOkg9eoQrJnRxWaMglxkwO9_KwBTSmgAhIvQLb19W_MMoIHnZ1kOqU5GrFObRrk7-tEPuKH-kpqEo6Al-wNDtET0JNdRbQ94ILYeX31n3y-Mw3nuJS4PK3MSJc-FyDgDy0gKQos7ssNsEUGzvO1akNPA_3ZCOaSWjW9_VddPKXdGnKpoWqorfjJ0MvH8fgf36Pyc-4ehO_SSrhDR7jo"
//           />
//           <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/80 to-transparent w-full">
//             <p className="font-mono-ui text-[10px] text-indigo-300">REFERENCE_CAM_01</p>
//           </div>
//         </div>

//         <div className="aspect-video glass-panel rounded-xl overflow-hidden relative">
//           <img
//             alt="Abstract light motion"
//             className="w-full h-full object-cover opacity-40"
//             src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuGDErnWGkCWmsnuYFgg7YTpfZIYGJi-3kvKPqeWXgH_SF9jDNEEp7Zg8KrTxluVVFf4zghgINmO6jb7VNzYIz517vu_B1BSjd08fCypacHcMpkn5S34HTBwVkjKcoJdRTdupwMVOc3KBRtFJFKjDRTdupwMVOc3K"
//           />
//           <div className="absolute bottom-0 left-0 p-3 bg-gradient-to-t from-black/80 to-transparent w-full">
//             <p className="font-mono-ui text-[10px] text-indigo-300">MOTION_VEC_B</p>
//           </div>
//         </div>

//         <div className="aspect-video glass-panel rounded-xl overflow-hidden relative">
//           <img
//             alt="Digital grid"
//             className="w-full h-full object-cover opacity-40"
//             src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHhrpsesN-hECdoQBtDbYZJcP4k8wGGWt5QXAyXWF1Iwq1gGE9FH5za4ewtVnWmBphG2Kl1mRv77QpacdDTq3U486LBPRzbR0-TW5-C_6QoFVgJpXmaoFD7ePrCKuptCuKA8R3STycyt2KK_nHt86rlAdPI4s4iln4lzjLyviXOQ1M8zL08Pm8FXsRJ_tfX9n7-kgCCCT-SpvmkEqiRv8WfxUjGN01S01vztwHVagVErHxDat9TfPgTabLJ9N7V_u78ohV6bfdo-M"
//           />
//           <div className="absolute bottom-0 left-0 p-3 bg-gradient-to-t from-black/80 to-transparent w-full">
//             <p className="font-mono-ui text-[10px] text-indigo-300">GRID_LATENT_09</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
export default function Prompt({
  onNext,
  onBack,
  sceneCount = 3,
  briefs = [],
}) {
  const scenes = Array.from({ length: sceneCount });

  const getBriefText = (index) => {
    return briefs[index] || "";
  };

  const getBeginPlaceholder = (index) => {
    const brief = getBriefText(index);

    if (brief) {
      return `Generated starting frame prompt for Scene ${index + 1} based on: ${brief}`;
    }

    return `Describe the starting frame for Scene ${index + 1}...`;
  };

  const getEndPlaceholder = (index) => {
    const brief = getBriefText(index);

    if (brief) {
      return `Generated ending frame prompt for Scene ${index + 1} based on: ${brief}`;
    }

    return `Describe the ending frame for Scene ${index + 1}...`;
  };

  const getMotionPlaceholder = (index) => {
    const brief = getBriefText(index);

    if (brief) {
      return `Generated motion prompt for Scene ${index + 1} based on: ${brief}`;
    }

    return `Describe the camera movement and character action for Scene ${index + 1}...`;
  };

  return (
    <div className="flex flex-col gap-gutter">
      {/* ── Title & Description ── */}
      <div className="flex flex-col gap-1">
        <h2 className="font-h1 text-h2 text-white">Generated Prompt</h2>

        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Dựa trên brief bạn đã nhập, hệ thống đã tạo ra prompt chi tiết cho từng scene.
          Bạn có thể chỉnh sửa lại để phù hợp hơn với ý tưởng của mình trước khi tiến hành tạo hình ảnh và video.
        </p>
      </div>

      {/* ── Dynamic Scene Cards ── */}
      {scenes.map((_, index) => (
        <div
          key={index}
          className="glass-panel p-6 rounded-xl relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-indigo-400">
              movie
            </span>

            <h3 className="font-h3 text-h3 text-white uppercase tracking-wider">
              Scene {index + 1}
            </h3>
          </div>

          {briefs[index] && (
            <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="font-label-caps text-[10px] text-on-surface-variant mb-2">
                Original Brief
              </p>

              <p className="font-body-sm text-on-surface-variant leading-relaxed">
                {briefs[index]}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  start
                </span>
                Prompt Image Begin
              </label>

              <textarea
                className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none overflow-y-auto scrollbar-hide"
                placeholder={getBeginPlaceholder(index)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  last_page
                </span>
                Prompt Image End
              </label>

              <textarea
                className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none overflow-y-auto scrollbar-hide"
                placeholder={getEndPlaceholder(index)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-on-surface-variant text-[10px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  shutter_speed
                </span>
                Prompt Motion
              </label>

              <textarea
                className="glass-input p-4 rounded-lg font-mono-ui text-body-sm text-indigo-100 h-32 resize-none overflow-y-auto scrollbar-hide"
                placeholder={getMotionPlaceholder(index)}
              />
            </div>
          </div>
        </div>
      ))}

      {/* ── Footer Navigation ── */}
      <div className="mt-margin pt-8 border-t border-white/5 flex justify-between items-center">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 font-label-caps text-on-surface-variant hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        <div className="flex items-center gap-6">
          <button
            onClick={onNext}
            type="button"
            className="primary-gradient px-12 py-4 rounded-full font-label-caps text-white flex items-center gap-2 transition-all active:scale-95"
          >
            Next Step
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
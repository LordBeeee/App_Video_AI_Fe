import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Home() {

  // const [beStatus, setBeStatus] = useState('');

  // return (
  //   <main className="flex h-screen overflow-hidden bg-slate-950 text-white">
  //     {/* Left Column */}
  //     <section className="flex w-[360px] flex-col gap-6 overflow-y-auto border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
  //       <div className="space-y-4">
  //         <h3 className="flex items-center gap-2 text-xl font-bold text-white">
  //           <span className="material-symbols-outlined text-indigo-500">
  //             tune
  //           </span>
  //           Parameters
  //         </h3>

  //         {/* Model Selection */}
  //         <div className="space-y-2">
  //           <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
  //             Core Model
  //           </label>

  //           <div className="relative">
  //             <select className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
  //               <option>Kling-v2-6 Cinematic</option>
  //               <option>Kling-v2-Pro Motion</option>
  //               <option>Stable-Video-Diffusion XL</option>
  //             </select>

  //             <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">
  //               expand_more
  //             </span>
  //           </div>
  //         </div>

  //         {/* Frame Uploaders */}
  //         <div className="grid grid-cols-2 gap-3">
  //           <div className="space-y-2">
  //             <label className="text-xs font-bold uppercase text-slate-400">
  //               Start Frame
  //             </label>

  //             <div className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50">
  //               <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
  //                 add_photo_alternate
  //               </span>
  //               <span className="mt-1 text-[10px] text-slate-500">
  //                 Upload
  //               </span>
  //             </div>
  //           </div>

  //           <div className="space-y-2">
  //             <label className="text-xs font-bold uppercase text-slate-400">
  //               End Frame
  //             </label>

  //             <div className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50">
  //               <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
  //                 add_photo_alternate
  //               </span>
  //               <span className="mt-1 text-[10px] text-slate-500">
  //                 Optional
  //               </span>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Mode Toggle */}
  //         <div className="flex rounded-full bg-slate-800 p-1">
  //           <button
  //             type="button"
  //             className="flex-1 rounded-full bg-indigo-500 py-2 text-[11px] font-bold text-white shadow-lg"
  //           >
  //             Frome chung
  //           </button>

  //           <button
  //             type="button"
  //             className="flex-1 rounded-full py-2 text-[11px] font-bold text-slate-400 transition-colors hover:text-white"
  //           >
  //             Multishot
  //           </button>
  //         </div>

  //         {/* Sliders & Selectors */}
  //         <div className="space-y-4 pt-2">
  //           <div className="space-y-3">
  //             <div className="flex items-center justify-between">
  //               <label className="text-xs font-bold uppercase text-slate-400">
  //                 Duration
  //               </label>
  //               <span className="font-mono text-sm text-indigo-400">10s</span>
  //             </div>

  //             <input
  //               className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
  //               type="range"
  //             />
  //           </div>

  //           <div className="flex gap-2">
  //             <button
  //               type="button"
  //               className="flex-1 rounded-lg border border-indigo-500/50 bg-indigo-500/5 py-2 text-[11px] font-bold text-indigo-400"
  //             >
  //               Standard
  //             </button>

  //             <button
  //               type="button"
  //               className="flex-1 rounded-lg border border-slate-700 py-2 text-[11px] font-bold text-slate-400 transition-all hover:border-slate-500 hover:text-white"
  //             >
  //               Pro Mode
  //             </button>
  //           </div>
  //         </div>

  //         {/* Prompt Areas */}
  //         <div className="space-y-4">
  //           <div className="space-y-2">
  //             <label className="text-xs font-bold uppercase text-slate-400">
  //               Visual Prompt
  //             </label>

  //             <textarea
  //               className="h-32 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
  //               placeholder="Describe the scene in detail..."
  //             />
  //           </div>

  //           <div className="space-y-2">
  //             <label className="text-xs font-bold uppercase text-slate-400">
  //               Negative Prompt
  //             </label>

  //             <textarea
  //               className="h-20 w-full resize-none rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 font-mono text-sm text-white opacity-60 outline-none placeholder:text-slate-500 transition-opacity hover:opacity-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
  //               placeholder="What to exclude..."
  //             />
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     {/* Center Column */}
  //     <section className="relative flex flex-1 flex-col items-center justify-center bg-slate-950 p-8">
  //       <div className="group relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl">
  //         <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
  //           <div className="relative">
  //             <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/20 blur-3xl" />
  //             <span className="material-symbols-outlined relative z-10 text-6xl text-indigo-400">
  //               movie
  //             </span>
  //           </div>

  //           <div className="space-y-2 text-center">
  //             <p className="text-xl font-bold text-white">Ready to Create</p>
  //             <p className="text-sm text-slate-400">
  //               Input your prompt to begin the generation process
  //             </p>
  //           </div>
  //         </div>

  //         {/* Player Overlay */}
  //         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
  //           <div className="flex items-center gap-4">
  //             <span className="material-symbols-outlined cursor-pointer text-white">
  //               play_arrow
  //             </span>

  //             <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
  //               <div className="h-full w-1/3 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
  //             </div>

  //             <span className="font-mono text-[10px] text-white">
  //               03:20 / 10:00
  //             </span>

  //             <span className="material-symbols-outlined cursor-pointer text-sm text-white">
  //               fullscreen
  //             </span>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Action Footer */}
  //       <div className="mt-12 flex w-full max-w-2xl flex-col items-center gap-6">
  //         <div className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
  //           <div className="flex items-center gap-4">
  //             <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />

  //             <div>
  //               <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
  //                 Current Status
  //               </p>
  //               <p className="text-sm font-medium text-white">
  //                 System Idle - Waiting for Input
  //               </p>
  //             </div>
  //           </div>

  //           <span className="rounded bg-indigo-500/10 px-2 py-1 font-mono text-[11px] text-indigo-400">
  //             Estimated: 45s
  //           </span>
  //         </div>

  //         <button
  //           type="button"
  //           className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 py-5 text-xl font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.01] hover:bg-indigo-500 active:scale-[0.99]"
  //         >
  //           <span className="material-symbols-outlined">bolt</span>
  //           Generate Cinematic Video
  //         </button>
  //       </div>
  //     </section>

  //     {/* Right Column */}
  //     <section className="flex w-80 flex-col overflow-hidden border-l border-slate-800/80 bg-slate-900/40 backdrop-blur-lg">
  //       <div className="border-b border-slate-800 p-6">
  //         <h3 className="flex items-center justify-between text-lg font-bold text-white">
  //           Recent History

  //           <span className="material-symbols-outlined cursor-pointer text-xl text-slate-400 hover:text-white">
  //             history
  //           </span>
  //         </h3>
  //       </div>

  //       <div className="flex-1 space-y-4 overflow-y-auto p-4">
  //         {/* History Item 1 */}
  //         <div className="group cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-800/40 transition-all hover:border-indigo-500/50">
  //           <div className="relative aspect-video w-full bg-black">
  //             <img
  //               alt="Generated thumbnail"
  //               className="h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-100"
  //               src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVzRNCGEcw0SKIyvrgpMrR0fr_unQ-Jo7GNafS7YxqLsk1Z766Ut4xpFNWSBdSdYHclukzE_NIKlNrcrX1Jp_tvu2awPLrDi82V_dUUECKvRs14PNn9h2_3A0p1t-PIIG7pCqjryeRKS_KPnpKY_VrDM3HYztAy5ZLdEeJ_3-CP4R2d6gayigKoxRAyCYwwB2876uXvG878kujLPcLovF5zXh89kcElekxJfNl4Rb3aKhSAcoI2H6rJ73e_VeZzkc6YhDH0qWIWHU"
  //             />

  //             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
  //               <span className="material-symbols-outlined text-3xl text-white">
  //                 play_circle
  //               </span>
  //             </div>

  //             <div className="absolute right-2 top-2 rounded bg-green-500/80 px-2 py-0.5 text-[8px] font-bold uppercase text-white backdrop-blur-sm">
  //               Success
  //             </div>
  //           </div>

  //           <div className="space-y-1 p-3">
  //             <p className="line-clamp-1 text-sm font-medium text-white">
  //               Neon Samurai Rain Sequence
  //             </p>

  //             <div className="flex items-center justify-between">
  //               <span className="font-mono text-[10px] text-slate-400">
  //                 12m ago
  //               </span>
  //               <span className="font-mono text-[10px] text-slate-400">
  //                 10s • 4K
  //               </span>
  //             </div>
  //           </div>
  //         </div>

  //         {/* History Item 2 */}
  //         <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-slate-800/20">
  //           <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-2 overflow-hidden bg-indigo-950/20">
  //             <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />

  //             <p className="font-mono text-[10px] text-indigo-400">
  //               Rendering 42%
  //             </p>

  //             <div
  //               className="absolute bottom-0 left-0 h-1 bg-indigo-500 shadow-[0_0_8px_#6366f1]"
  //               style={{ width: '42%' }}
  //             />
  //           </div>

  //           <div className="space-y-1 p-3">
  //             <p className="line-clamp-1 text-sm font-medium text-slate-500">
  //               Space Nebula Transition
  //             </p>

  //             <div className="flex items-center justify-between">
  //               <span className="font-mono text-[10px] text-slate-400">
  //                 Just now
  //               </span>
  //               <span className="font-mono text-[10px] italic text-indigo-400">
  //                 Processing...
  //               </span>
  //             </div>
  //           </div>
  //         </div>

  //         {/* History Item 3 */}
  //         <div className="group cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-800/40 transition-all hover:border-indigo-500/50">
  //           <div className="relative aspect-video w-full bg-black">
  //             <img
  //               alt="Generated thumbnail"
  //               className="h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-100"
  //               src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMLAJzn_WN5oIDF2VCrzqrl9JKk22ZxzYeRf73I7U1QLq1mRAT-FBtaCKFgk5cP2qZMX-5NvOaRAVU2Nay9WQsafLTN_uhgyge56ull8Na7H9gQF-M9KGmtaPEpKSC7zmbCupZbBPrFiqpVONYB4XfhAVWrn3sCzwBJlWIx53SmwGg75X2pHnVMdRANc1NDa_Uf1mKDqAcwX1AwpsK5jzJTeKDRlIJu2tYmfSXBQk6cGtBBkXpEYGLew5RlEsI7vsn_5rLMXEiIxM"
  //             />

  //             <div className="absolute right-2 top-2 rounded bg-green-500/80 px-2 py-0.5 text-[8px] font-bold uppercase text-white backdrop-blur-sm">
  //               Success
  //             </div>
  //           </div>

  //           <div className="space-y-1 p-3">
  //             <p className="line-clamp-1 text-sm font-medium text-white">
  //               Orbital Dawn Cinematic
  //             </p>

  //             <div className="flex items-center justify-between">
  //               <span className="font-mono text-[10px] text-slate-400">
  //                 1h ago
  //               </span>
  //               <span className="font-mono text-[10px] text-slate-400">
  //                 5s • 1080p
  //               </span>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* History Footer */}
  //       <div className="border-t border-slate-800 bg-slate-900/60 p-4">
  //         <button
  //           type="button"
  //           className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2 text-[12px] font-medium text-slate-400 transition-colors hover:text-white"
  //         >
  //           <span className="material-symbols-outlined text-sm">
  //             cloud_download
  //           </span>
  //           Download All Assets
  //         </button>
  //       </div>
  //     </section>
  //   </main>
  // )
  return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <img
        src="https://res.cloudinary.com/dli7km9jk/image/upload/v1778494230/3_mcdg3v.png"
        alt="Silver Spoon"
        className="w-80 rounded-xl"
      />
      {/* <video
        src="https://res.cloudinary.com/dli7km9jk/video/upload/v1778496494/jzu7avkwgqbpr5z88rm5.mp4"
        controls
        width="500"
      >
      </video> */}
    </div>
  );
  
}
import { useState } from "react"
import FromCreateVideo from "../../components/CreateVideo/FromCreateVideo"

export default function CreateVideo() {
  
  return (
    // <main className="flex h-full overflow-hidden bg-slate-950 text-white">
    <main className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-white">
      {/* Left Column */}
      {/* <section className="flex w-[360px] flex-col gap-6 overflow-y-auto border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg"> */}
      <FromCreateVideo />

      {/* Center Column */}
      {/* <section className="relative flex flex-1 flex-col items-center justify-center bg-slate-950 px-8"> */}
      <section className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-slate-950 px-8 py-4">
        <div className="mb-4 flex w-full max-w-5xl items-center justify-start gap-2">
            <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-2xl">
                movie
                </span>
                <span className="text-lg font-bold">
                Video
                </span>
            </div>
            
            <div className="ml-4 flex items-center gap-2">
                <button
                type="button"
                className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700"
                >
                <div className="h-7 w-7 overflow-hidden rounded-md bg-slate-700">
                    <img
                    src="/avatar.png"
                    alt="Start frame"
                    className="h-full w-full object-cover"
                    />
                </div>
                Start
                </button>

                <button
                type="button"
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700"
                >
                Video 3.0
                </button>

                <button
                type="button"
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700"
                >
                720p
                </button>
            </div>
        </div>

        {/* <p className="group relative w-full max-w-5xl cursor-default text-sm leading-7 text-slate-200">
            <span className="text-sm leading-8 text-slate-100 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] whitespace-pre-line">
                A sanitary pad remains centered, clean, sharp and stable, with no deformation.
                A soft icy airflow gently flows toward the center absorption channel from the
                lower side, slowly converging and being absorbed into the pad. The motion is
                smooth, light and controlled. As the airflow is absorbed, a soft cool blue
                glow builds gradually at the center of the pad. The energy gently increases
                and begins to radiate outward from the center. The airflow then expands
                outward smoothly in all directions, becoming slightly wider and more dynamic.
                Mint leaves, lemon slices, bubbles and snowflakes gradually increase in
                number and spread outward in a balanced circular motion. The transition feels
                continuous and natural, evolving from a calm inward motion into a soft
                refreshing outward burst, without any sudden change. The sanitary pad remains
                stable and unchanged, glowing softly. Mint leaves, lemon slices and snowflakes
                float in a harmonious motion. Bright blue lighting, cinematic FMCG commercial
                style, ultra clean, smooth motion, no distortion, no morphing, gentle energy
                expansion, 4K, photorealistic.
            </span>

            <span className="pointer-events-none absolute left-0 top-full z-30 mt-3 hidden w-full rounded-xl bg-slate-800 p-4 text-sm leading-7 text-slate-100 shadow-2xl group-hover:block">
                A sanitary pad remains centered, clean, sharp and stable, with no deformation.
                A soft icy airflow gently flows toward the center absorption channel from the
                lower side, slowly converging and being absorbed into the pad. The motion is
                smooth, light and controlled. As the airflow is absorbed, a soft cool blue
                glow builds gradually at the center of the pad. The energy gently increases
                and begins to radiate outward from the center. The airflow then expands
                outward smoothly in all directions, becoming slightly wider and more dynamic.
                Mint leaves, lemon slices, bubbles and snowflakes gradually increase in
                number and spread outward in a balanced circular motion. The transition feels
                continuous and natural, evolving from a calm inward motion into a soft
                refreshing outward burst, without any sudden change. The sanitary pad remains
                stable and unchanged, glowing softly. Mint leaves, lemon slices and snowflakes
                float in a harmonious motion. Bright blue lighting, cinematic FMCG commercial
                style, ultra clean, smooth motion, no distortion, no morphing, gentle energy
                expansion, 4K, photorealistic.
            </span>
        </p> */}
        <div className="group relative mb-4 w-full max-w-5xl cursor-default">
            {/* Text preview: chỉ hiện 3 dòng, không có ... */}
            {/* <div className="max-h-[96px] overflow-hidden"> */}
            <div className="max-h-[88px] overflow-hidden">
                <p className="text-sm leading-8 text-slate-100">
                A sanitary pad remains centered, clean, sharp and stable, with no deformation.
                A soft icy airflow gently flows toward the center absorption channel from the
                lower side, slowly converging and being absorbed into the pad. The motion is
                smooth, light and controlled. As the airflow is absorbed, a soft cool blue
                glow builds gradually at the center of the pad. The energy gently increases
                and begins to radiate outward from the center. The airflow then expands
                outward smoothly in all directions, becoming slightly wider and more dynamic.
                Mint leaves, lemon slices, bubbles and snowflakes gradually increase in
                number and spread outward in a balanced circular motion. The transition feels
                continuous and natural, evolving from a calm inward motion into a soft
                refreshing outward burst, without any sudden change. The sanitary pad remains
                stable and unchanged, glowing softly. Mint leaves, lemon slices and snowflakes
                float in a harmonious motion. Bright blue lighting, cinematic FMCG commercial
                style, ultra clean, smooth motion, no distortion, no morphing, gentle energy
                expansion, 4K, photorealistic.
                </p>
            </div>

            {/* Hover popup full text */}
            <div className="absolute left-0 top-full z-30 mt-4 hidden w-full rounded-xl bg-slate-800 p-4 text-sm leading-8 text-slate-100 shadow-2xl group-hover:block">
                {/* mũi nhọn nhỏ hướng lên */}
                <div className="absolute -top-2 left-1/2 h-4 w-4 rotate-45 bg-slate-800" />

                <p>
                A sanitary pad remains centered, clean, sharp and stable, with no deformation.
                A soft icy airflow gently flows toward the center absorption channel from the
                lower side, slowly converging and being absorbed into the pad. The motion is
                smooth, light and controlled. As the airflow is absorbed, a soft cool blue
                glow builds gradually at the center of the pad. The energy gently increases
                and begins to radiate outward from the center. The airflow then expands
                outward smoothly in all directions, becoming slightly wider and more dynamic.
                Mint leaves, lemon slices, bubbles and snowflakes gradually increase in
                number and spread outward in a balanced circular motion. The transition feels
                continuous and natural, evolving from a calm inward motion into a soft
                refreshing outward burst, without any sudden change. The sanitary pad remains
                stable and unchanged, glowing softly. Mint leaves, lemon slices and snowflakes
                float in a harmonious motion. Bright blue lighting, cinematic FMCG commercial
                style, ultra clean, smooth motion, no distortion, no morphing, gentle energy
                expansion, 4K, photorealistic.
                </p>
            </div>
        </div>
        {/* <div className="group relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl"> */}
        <div className="group relative aspect-video w-full max-w-5xl flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl max-h-[calc(100vh-300px)]">
        {/* <div className="group relative aspect-video w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl"> */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/20 blur-3xl" />
              <span className="material-symbols-outlined relative z-10 text-6xl text-indigo-400">
                movie
              </span>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-xl font-bold text-white">Ready to Create</p>
              <p className="text-sm text-slate-400">
                Input your prompt to begin the generation process
              </p>
            </div>
          </div>

          {/* Player Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined cursor-pointer text-white">
                play_arrow
              </span>

              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-1/3 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
              </div>

              <span className="font-mono text-[10px] text-white">
                03:20 / 10:00
              </span>

              <span className="material-symbols-outlined cursor-pointer text-sm text-white">
                fullscreen
              </span>
            </div>
          </div>
        </div>

      </section>   
        <section className="flex w-25 flex-col overflow-hidden border-l border-slate-800/80 bg-slate-900/40 backdrop-blur-lg">

        </section>
    </main>
  )
}

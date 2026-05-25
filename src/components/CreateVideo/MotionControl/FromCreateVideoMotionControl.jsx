import { useState } from "react"
import CustomSettingVideoMotion from "./CustomSettingVideoMotion"

export default function FromCreateVideoMotionControl() {
  const [resolution, setResolution] = useState("720p")
  const [nativeAudio, setNativeAudio] = useState(true)
  return (
    <section className="flex h-full w-[460px] flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg">
      <div className="flex h-full min-h-0 flex-col">
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-5">
          {/* Model selector */}
          <div className="shrink-0">
            <div className="relative">
              <select
                defaultValue="veo-3"
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="veo-3">Veo 3</option>
                <option value="veo-3-fast">Veo 3 Fast</option>
                <option value="seedance">Seedance</option>
              </select>

              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          {/* Frame upload */}
            <div className="grid shrink-0 grid-cols-2 items-start gap-3">
                <div>
                    <label
                        style={{ height: '180px',borderRadius: '12px 12px 0 0',}}
                        className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50"
                    >
                        <input type="file" accept="video/*" className="hidden" />

                        <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
                        video_library
                        </span>
                        <span className="mt-1 text-[10px] text-slate-500 text-center">Thêm video mô phỏng <br></br>hành động của nhân vật.</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 border-slate-700/70 px-1 py-2 text-xs text-slate-300 bg-slate-800 rounded-b-lg">
                        <input
                            type="radio"
                            name="orientation-match"
                            defaultChecked
                            className="h-4 w-4 accent-indigo-500"
                        />
                        <span className="truncate">Hướng nhân vật khớp với video</span>
                    </label>
                </div>
                
                <div>
                    <label
                        style={{ height: '180px',borderRadius: '12px 12px 0 0',}}
                        className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 transition-all hover:border-indigo-500/50"
                    >
                        <input type="file" accept="image/*" className="hidden" />

                        <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-indigo-400">
                        add_photo_alternate
                        </span>
                        <span className="mt-1 text-[10px] text-slate-500">Thêm hình ảnh nhân vật</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 border-slate-700/70 px-1 py-2 text-xs text-slate-300 bg-slate-800 rounded-b-lg">
                        <input
                            type="radio"
                            name="orientation-match"
                            className="h-4 w-4 accent-indigo-500"
                        />
                        <span className="truncate">Hướng nhân vật khớp với hình ảnh</span>
                    </label>
                </div>
                
            </div>

          {/* Prompt */}
            <div className="shrink-0">
            <textarea
                rows={1}
                className="min-h-[240px] w-full resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Khi hướng nhân vật khớp với video, các chuyển động phức tạp sẽ được thực hiện tốt hơn; khi hướng nhân vật khớp với hình ảnh, chuyển động máy quay sẽ được hỗ trợ tốt hơn."
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
                Để biết thêm kỹ năng, vui lòng tham khảo{' '}
                <a
                href="https://kling.ai/quickstart/motion-control-user-guide"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 underline underline-offset-2 transition-colors hover:text-indigo-300"
                >
                Hướng dẫn sử dụng
                </a>
                .
            </p>
            </div>
        </div>

        {/* Bottom actions */}
        <div className="shrink-0 space-y-3 border-t border-slate-800/80 pt-4">
          <CustomSettingVideoMotion
            resolution={resolution}
            setResolution={setResolution}
            nativeAudio={nativeAudio}
            setNativeAudio={setNativeAudio}
          />
          {/* Submit */}
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

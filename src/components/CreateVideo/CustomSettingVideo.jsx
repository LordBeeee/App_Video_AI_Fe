import { useEffect, useRef, useState } from "react"

export default function CustomSettingVideo({ resolution, setResolution, length, setLength, nativeAudio, setNativeAudio }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!settingRef.current) return
      if (!settingRef.current.contains(event.target)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex items-center gap-3">
      <div ref={settingRef} className="relative">
        <button
          type="button"
          onClick={() => setSettingsOpen((prev) => !prev)}
          className="flex h-11 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 text-[11px] font-semibold text-white transition-all hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[14px]">hexagon</span>
          <span>{resolution} · {length}s</span>
          <span className="material-symbols-outlined text-[14px]">
            {settingsOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
          </span>
        </button>

        {settingsOpen && (
          <div className="absolute bottom-full left-0 z-50 mb-3 w-[390px] rounded-xl border border-slate-700 bg-[#18191d] p-4 text-white shadow-2xl">
            {/* Resolution */}
            <div className="mb-5">
              <p className="mb-2 text-sm text-slate-300">Mode</p>
              <div className="grid grid-cols-3 overflow-hidden rounded-lg bg-[#222328] p-0">
                {["720p", "1080p", "4K"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setResolution(item)}
                    className={`relative py-3 text-sm font-semibold transition ${
                      resolution === item ? "bg-[#3a3b40] text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {item}
                    {item !== "720p" && (
                      <span className="absolute right-2 top-0 rounded-sm bg-[#9b927b] px-1 text-[9px] font-bold text-white">
                        VIP
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            {/* <div className="mb-5">
              <div className="mb-3 flex items-center gap-1 text-sm text-slate-300">
                <span>Length</span>
                <span>{length}s</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">3s</span>
                <input
                  type="range" min="3" max="15" value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700 accent-white"
                />
                <span className="text-sm text-slate-300">15s</span>
              </div>
            </div> */}
            {/* <div className="mb-5">
                <p className="mb-2 text-sm text-slate-300">Duration</p>
                <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-[#222328]">
                    {['5', '10'].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => setLength(Number(item))}
                        className={`py-3 text-sm font-semibold transition ${
                        length === Number(item)
                            ? 'bg-[#3a3b40] text-white'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        {item}s
                    </button>
                    ))}
                </div>
            </div> */}
            {/* Duration - slider 5s đến 10s */}
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                <span>Duration</span>
                <span className="font-semibold text-white">{length}s</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">5s</span>
                <input
                  type="range"
                  min="5"
                  max="10"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700 accent-white"
                />
                <span className="text-sm text-slate-400">10s</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* <button
        type="button"
        className="flex h-11 items-center gap-2 rounded-lg bg-slate-800 px-4 text-xs font-semibold text-white transition-all hover:bg-slate-700"
      >
        <span className="material-symbols-outlined text-base">check_circle</span>
        Native Audio
      </button> */}
      <button
        type="button"
        onClick={() => setNativeAudio(prev => !prev)}
        className={`flex h-11 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-all ${
            nativeAudio
            ? "bg-indigo-600 text-white hover:bg-indigo-500"
            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
        }`}
        >
        <span className="material-symbols-outlined text-base">
            {nativeAudio ? "check_circle" : "radio_button_unchecked"}
        </span>
        Native Audio
        </button>
    </div>
  )
}
import { useEffect, useRef, useState } from "react"

export default function CustomSettingVideo({
  resolution,
  setResolution,
  length,
  setLength,
  nativeAudio,
  setNativeAudio,
}) {
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
    <div ref={settingRef} className="relative">
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setSettingsOpen((prev) => !prev)}
        className="flex h-11 items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-900 px-1 text-[11px] font-semibold text-white transition-all hover:bg-slate-800"
      >
        <span className="material-symbols-outlined text-[14px]">hexagon</span>
        <span>{resolution} · {length}s · {nativeAudio ? "On" : "Off"}</span>
        <span className="material-symbols-outlined text-[14px]">
          {settingsOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
        </span>
      </button>

      {/* ── Settings popup ── */}
      {settingsOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-3 w-[390px] rounded-xl border border-slate-700 bg-[#18191d] p-4 text-white shadow-2xl">

          {/* Resolution */}
          <div className="mb-5">
            <p className="mb-2 text-sm text-slate-300">Mode</p>
            <div className="grid grid-cols-3 overflow-hidden rounded-lg bg-[#222328]">
              {["720p", "1080p", "4K"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setResolution(item)}
                  className={`relative py-3 text-sm font-semibold transition ${
                    resolution === item
                      ? "bg-[#3a3b40] text-white"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {item}

                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
              <span>Duration</span>
              <span className="font-semibold text-white">{length}s</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">3s</span>
              <input
                type="range"
                min="3"
                max="15"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700 accent-white"
              />
              <span className="text-sm text-slate-400">15s</span>
            </div>
          </div>

          {/* Sound */}
          <div>
            <p className="mb-2 text-sm text-slate-300">Sound</p>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-[#222328]">
              {[
                { label: "Off", value: false },
                { label: "On", value: true },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setNativeAudio(value)}
                  className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
                    nativeAudio === value
                      ? "bg-[#3a3b40] text-white"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {value ? "volume_up" : "volume_off"}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
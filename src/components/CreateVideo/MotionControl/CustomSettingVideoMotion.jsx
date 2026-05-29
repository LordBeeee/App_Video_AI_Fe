import { useEffect, useRef, useState } from "react"

export default function CustomSettingVideoMotion({
  resolution = "720p",
  setResolution = () => {},
  nativeAudio,
  setNativeAudio,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [localNativeAudio, setLocalNativeAudio] = useState(true)
  const settingRef = useRef(null)

  const currentNativeAudio = nativeAudio ?? localNativeAudio
  const updateNativeAudio = setNativeAudio ?? setLocalNativeAudio

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
      <button
        type="button"
        onClick={() => setSettingsOpen((prev) => !prev)}
        className="flex h-11 min-w-[130px] items-center justify-between gap-2 rounded-lg border border-slate-700 bg-[#111214] px-3 text-[11px] font-semibold text-white transition-all hover:bg-[#18191d]"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">hexagon</span>
          <span>{resolution} · {currentNativeAudio === "yes" ? "On" : "Off"}</span>
        </div>

        <span className="material-symbols-outlined text-[18px]">
          {settingsOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
        </span>
      </button>

      {settingsOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-3 w-[390px] rounded-xl border border-slate-700 bg-[#18191d] p-4 text-white shadow-2xl">
          <div>
            <p className="mb-2 text-sm text-slate-300">Mode</p>

            <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-[#24252a] p-1">
              <button
                type="button"
                onClick={() => setResolution("720p")}
                className={`h-10 rounded-md text-sm font-semibold transition-all ${
                  resolution === "720p"
                    ? "bg-[#3a3b40] text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                720p
              </button>

              <button
                type="button"
                onClick={() => setResolution("1080p")}
                className={`h-10 rounded-md text-sm font-semibold transition-all ${
                  resolution === "1080p"
                    ? "bg-[#3a3b40] text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                1080p
              </button>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-slate-300">Keep original sound</p>

            <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-[#24252a] p-1">
              <button
                type="button"
                onClick={() => updateNativeAudio("no")}
                className={`h-10 rounded-md text-sm font-semibold transition-all ${
                  currentNativeAudio === "no"
                    ? "bg-[#3a3b40] text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                Off
              </button>

              <button
                type="button"
                onClick={() => updateNativeAudio("yes")}
                className={`h-10 rounded-md text-sm font-semibold transition-all ${
                  currentNativeAudio === "yes"
                    ? "bg-[#3a3b40] text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                On
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
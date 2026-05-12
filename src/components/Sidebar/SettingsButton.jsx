import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../store/auth.store'

export default function SettingsButton() {
  const [open, setOpen] = useState(false)
  const clearSession = useAuthStore((s) => s.clearSession)
  const ref = useRef(null)

  // 👇 handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-slate-500 transition-colors hover:text-slate-300"
        title="Settings"
      >
        <span className="material-symbols-outlined">settings</span>
      </button>

      {/* DROPDOWN */}
      {open && (
          <div className="absolute bottom-2 left-9 min-w-44 translate-x-2 rounded-xl 
              border border-indigo-500/20 
              bg-slate-950/95 
              px-2 py-2 
              shadow-[0_0_20px_rgba(99,102,241,0.2)] 
              backdrop-blur-xl 
              transition-all duration-200 
              z-50"
          >
              {/* SETTINGS */}
              <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-indigo-500/10"
              onClick={() => {
                  console.log('Go to settings page')
                  setOpen(false)
              }}
              >
              <span className="material-symbols-outlined text-base">settings</span>
              Cài đặt
              </button>

              {/* LOGOUT */}
              <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              onClick={() => {
                  clearSession()
                  window.location.href = '/login'
              }}
              >
              <span className="material-symbols-outlined text-base">logout</span>
              Đăng xuất
              </button>
          </div>
      )}
    </div>
  )
}
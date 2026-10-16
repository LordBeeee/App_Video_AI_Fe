import { useEffect, useRef } from 'react'
import { getColor, getInitials } from '../../utils/userDetail.utils'

export function InfoRow({ icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-outline-variant/10 last:border-0">
      <span className="material-symbols-outlined text-outline text-[18px] mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
        <p className={`break-all text-sm text-on-surface ${mono ? 'font-mono' : ''}`}>
          {value || <span className="italic text-outline text-xs">Chưa cập nhật</span>}
        </p>
      </div>
    </div>
  )
}

export function SectionLabel({ children }) {
  return <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">{children}</p>
}

export function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="mt-1 text-[11px] text-[#f87171] flex items-center gap-1">
      <span className="material-symbols-outlined text-[12px]">error</span>
      {message}
    </p>
  )
}

export function AvatarUploader({ user, avatarPreview, onFileChange, fallbackInitials = 'NV' }) {
  const fileRef = useRef(null)
  const color = getColor(String(user?.id ?? ''))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-primary/30"
          />
        ) : (
          <div className={`w-24 h-24 rounded-full ${color.bg} flex items-center justify-center ${color.text} font-bold text-2xl border-2 border-primary/30`}>
            {getInitials(user?.fullName, fallbackInitials)}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-sm">upload</span>
        Thay ảnh đại diện
      </button>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
    </div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: 'bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]',
    error:   'bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]',
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl ${colors[type]}`}>
      <span className="material-symbols-outlined text-sm">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {message}
    </div>
  )
}


import { useAuthStore } from '../../store/auth.store'
import NavMenu from './NavMenu'
import SettingsButton from './SettingsButton'

export default function Sidebar({ isCollapsed, onToggle }) {
  const user = useAuthStore((state) => state.user)

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-full w-20 flex-col border-r border-white/10 bg-[#1c2026] py-5 text-white transition-[width] duration-300 ease-in-out ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-8 hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#252a32] text-slate-400 shadow-lg transition-colors hover:bg-[#303640] hover:text-white lg:flex"
        title={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
        aria-label={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
        aria-expanded={!isCollapsed}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      <div className="mb-5 flex items-center gap-3 px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-500 font-black text-slate-950">AI</div>
        {!isCollapsed && <div className="hidden lg:block"><p className="font-semibold">AI Studio</p><p className="text-[11px] text-slate-500">Create without limits</p></div>}
      </div>
      <NavMenu isCollapsed={isCollapsed} />
      <div className="mx-3 mt-4 border-t border-white/10 pt-4">
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName || 'Avatar'} className="h-full w-full object-cover" /> : <span className="text-sm font-bold">{user?.fullName?.[0] || user?.email?.[0] || 'U'}</span>}
          </div>
          {!isCollapsed && <div className="hidden min-w-0 flex-1 lg:block"><p className="truncate text-sm font-medium">{user?.fullName || 'Người dùng'}</p><p className="truncate text-[11px] text-slate-500">{user?.email}</p></div>}
          {!isCollapsed && <div className="hidden lg:block"><SettingsButton /></div>}
        </div>
      </div>
    </aside>
  )
}

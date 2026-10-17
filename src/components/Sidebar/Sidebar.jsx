import { useAuthStore } from '../../store/auth.store'
import { useSidebarStore } from '../../store/sidebar.store'
import NavMenu from './NavMenu'
import SettingsButton from './SettingsButton'
import './sidebar.css'

export default function Sidebar() {
  const user = useAuthStore((state) => state.user)
  const locked = useSidebarStore((s) => s.locked)
  const toggleLock = useSidebarStore((s) => s.toggleLock)
  const hover = useSidebarStore((s) => s.hover)
  const setHover = useSidebarStore((s) => s.setHover)
  const menu = useSidebarStore((s) => s.menu)
  const setMenu = useSidebarStore((s) => s.setMenu)
  const open = locked || hover || menu

  return (
    <aside className={`sb${open ? ' open' : ''}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="sb-head">
        <div className="sb-logo">AI</div>
        <div className="sb-brand sb-t"><b>AI Studio</b><span>Create without limits</span></div>
        <button
          type="button"
          className={`sb-lock${locked ? ' on' : ''}`}
          onClick={toggleLock}
          title={locked ? 'Bỏ khóa thanh bên' : 'Khóa thanh bên luôn mở'}
          aria-label={locked ? 'Bỏ khóa thanh bên' : 'Khóa thanh bên luôn mở'}
          aria-pressed={locked}
        >
          <span className="material-symbols-outlined">{locked ? 'lock' : 'lock_open'}</span>
        </button>
      </div>
      <NavMenu />
      <div className="sb-foot">
        <div className="sb-user">
          <div className="sb-av">
            <span>{user?.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName || 'Avatar'} /> : (user?.fullName?.[0] || user?.email?.[0] || 'U')}</span>
          </div>
          <div className="sb-who sb-t"><b>{user?.fullName || 'Người dùng'}</b><span>{user?.email}</span></div>
          {open && <SettingsButton onOpenChange={setMenu} />}
        </div>
      </div>
    </aside>
  )
}

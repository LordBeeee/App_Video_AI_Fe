import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

const primary = [
  { to: '/', label: 'Trang chủ', icon: 'home' },
  { to: '/create/image', label: 'Tạo ảnh', icon: 'image' },
  { to: '/create/video', label: 'Tạo video', icon: 'smart_display' },
  { to: '/create/audio', label: 'Tạo giọng nói', icon: 'graphic_eq', badge: 'NEW' },
  { to: '/chat', label: 'Chat AI', icon: 'chat_bubble', badge: 'NEW' },
  { to: '/library', label: 'Thư viện', icon: 'video_library' },
  { to: '/wallet', label: 'Ví & thanh toán', icon: 'account_balance_wallet' },
  { to: '/projects', label: 'Dự án', icon: 'deployed_code' },
]

export default function NavMenu({ isCollapsed, onNavigate }) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const items = user?.roleName === 'admin'
    ? [...primary, { to: '/employees', label: 'Quản trị người dùng', icon: 'groups' }]
    : primary

  return (
    <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-3">
      {items.map((item) => {
        const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
        return (
          <Link key={item.to} to={item.to} title={item.label} onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isCollapsed ? 'lg:justify-center lg:gap-0 lg:px-0' : ''} ${active ? 'active-nav-border bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined shrink-0 text-[21px]">{item.icon}</span>
            {!isCollapsed && <span className="hidden truncate font-medium lg:block">{item.label}</span>}
            {!isCollapsed && item.badge && <span className="ml-auto hidden rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-on-primary lg:block">{item.badge}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

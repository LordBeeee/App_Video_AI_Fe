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

export default function NavMenu() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const items = user?.roleName === 'admin'
    ? [...primary,
        { to: '/employees/expenses', label: 'Chi phí AI', icon: 'monitoring' },
        { to: '/employees', label: 'Quản trị người dùng', icon: 'groups' }]
    : primary

  return (
    <nav className="sb-nav">
      {items.map((item) => {
        const active = item.to === '/' ? location.pathname === '/' : (item.to === '/employees' ? location.pathname === '/employees' || /^\/employees\/\d+/.test(location.pathname) : location.pathname.startsWith(item.to))
        return (
          <Link key={item.to} to={item.to} title={item.label} className={`sb-it${active ? ' on' : ''}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="sb-t">{item.label}</span>
            {item.badge && <span className="sb-bd sb-t">{item.badge}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

export default function NavMenu() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.roleName === 'admin'

  const isActive = (path) => location.pathname === path

  const linkClass = (path) =>
    isActive(path)
      ? 'flex w-full scale-95 items-center justify-center border-r-2 border-indigo-500 py-2 text-indigo-400 transition-transform active:scale-90'
      : 'flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90'

  return (
    <nav className="flex flex-1 flex-col gap-8">
      <Link to="/" title="Home" className={linkClass('/')}>
        <span className="material-symbols-outlined">home</span>
      </Link>

      <Link to="/create-video" title="Tạo Video" className={linkClass('/create-video')}>
        <span className="material-symbols-outlined">movie_creation</span>
      </Link>

      <Link to="/library" title="Thư Viện" className={linkClass('/library')}>
        <span className="material-symbols-outlined">video_library</span>
      </Link>

      {/* <Link to="/create-video-flow" title="Tự động tạo video" className={linkClass('/create-video-flow')}>
        <span className="material-symbols-outlined">memory</span>
      </Link> */}

      <Link to="/projects" title="Dự án" className={linkClass('/projects')}>
        <span className="material-symbols-outlined">deployed_code</span>
      </Link>

      {/* Chỉ hiện với admin */}
      {isAdmin && (
        <Link to="/employees" title="Nhân Viên" className={linkClass('/employees')}>
          <span className="material-symbols-outlined">groups</span>
        </Link>
      )}
    </nav>
  )
}
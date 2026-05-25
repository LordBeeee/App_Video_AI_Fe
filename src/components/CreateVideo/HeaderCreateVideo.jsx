import { NavLink } from 'react-router-dom'

export default function HeaderCreateVideo({ activeTab }) {
  return (
    <header className="fixed top-0 right-0 z-40 flex h-16 w-[calc(100%-64px)] items-center justify-between border-b border-white/5 bg-slate-950/60 px-6 font-space-grotesk font-medium backdrop-blur-md transition-all duration-200 ease-in-out">
      <div className="flex items-center gap-8">
        <span className="text-lg font-black italic tracking-wider text-white">
          VIDEO GENERATION
        </span>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink
            to="/create-video"
            className={({ isActive }) =>
              isActive || activeTab === 'video'
                ? 'font-bold text-indigo-400 transition-all hover:text-indigo-300'
                : 'text-slate-400 transition-all hover:text-indigo-300'
            }
          >
            Video
          </NavLink>

          <NavLink
            to="/create-video-motion-control"
            className={({ isActive }) =>
              isActive || activeTab === 'motion-control'
                ? 'font-bold text-indigo-400 transition-all hover:text-indigo-300'
                : 'text-slate-400 transition-all hover:text-indigo-300'
            }
          >
            Motion Control
          </NavLink>

          <a
            href="#"
            className="text-slate-400 transition-all hover:text-indigo-300"
          >
            Avatar
          </a>
        </nav>
      </div>
    </header>
  )
}
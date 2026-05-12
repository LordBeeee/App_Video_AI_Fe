// export default function NavMenu() {
//   return (
//     <nav className="flex flex-1 flex-col gap-8">
//         <button
//           type="button"
//           className="flex w-full scale-95 items-center justify-center border-r-2 border-indigo-500 py-2 text-indigo-400 transition-transform active:scale-90"
//           title="Home"
//         >
//           <span className="material-symbols-outlined">home</span>
//         </button>

//         <button
//           type="button"
//           className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
//           title="Tạo Video"
//         >
//           <span className="material-symbols-outlined">movie_creation</span>
//         </button>

//         <button
//           type="button"
//           className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
//           title="Thư Viện"
//         >
//           <span className="material-symbols-outlined">video_library</span>
//         </button>

//         <button
//           type="button"
//           className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
//           title="Tự động tạo video"
//         >
//           <span className="material-symbols-outlined">memory</span>
//         </button>

//         <button
//           type="button"
//           className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
//           title="Nhân Viên"
//         >
//           <span className="material-symbols-outlined">groups</span>
//         </button>
//       </nav>
//     )
// }
import { Link, useLocation } from 'react-router-dom'

export default function NavMenu() {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="flex flex-1 flex-col gap-8">
      <Link
        to="/"
        title="Home"
        className={
          isActive('/')
            ? 'flex w-full scale-95 items-center justify-center border-r-2 border-indigo-500 py-2 text-indigo-400 transition-transform active:scale-90'
            : 'flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90'
        }
      >
        <span className="material-symbols-outlined">home</span>
      </Link>

      <Link
        to="/create-video"
        title="Tạo Video"
        className={
          isActive('/create-video')
            ? 'flex w-full scale-95 items-center justify-center border-r-2 border-indigo-500 py-2 text-indigo-400 transition-transform active:scale-90'
            : 'flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90'
        }
      >
        <span className="material-symbols-outlined">movie_creation</span>
      </Link>

      <Link
        to="/library"
        title="Thư Viện"
        className={
          isActive('/library')
            ? 'flex w-full scale-95 items-center justify-center border-r-2 border-indigo-500 py-2 text-indigo-400 transition-transform active:scale-90'
            : 'flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90'
        }
      >
        <span className="material-symbols-outlined">video_library</span>
      </Link>

      <Link
        to="/auto-video"
        title="Tự động tạo video"
        className={
          isActive('/auto-video')
            ? 'flex w-full scale-95 items-center justify-center border-r-2 border-indigo-500 py-2 text-indigo-400 transition-transform active:scale-90'
            : 'flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90'
        }
      >
        <span className="material-symbols-outlined">memory</span>
      </Link>

      <Link
        to="/employees"
        title="Nhân Viên"
        className={
          isActive('/employees')
            ? 'flex w-full scale-95 items-center justify-center border-r-2 border-indigo-500 py-2 text-indigo-400 transition-transform active:scale-90'
            : 'flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90'
        }
      >
        <span className="material-symbols-outlined">groups</span>
      </Link>
    </nav>
  )
}
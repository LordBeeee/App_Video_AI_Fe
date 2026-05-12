// import { useEffect } from 'react'
// import { useAuthStore } from '../../store/auth.store'
// import SettingsButton from './SettingsButton'
// export default function Sidebar() {
//   const user = useAuthStore((state) => state.user)
//   const fetchMe = useAuthStore((state) => state.fetchMe)
//   const accessToken = useAuthStore((state) => state.accessToken)
//   useEffect(() => {
//     if (accessToken && !user) {
//       fetchMe()
//     }
//   }, [accessToken, user, fetchMe])

//   return (
//     <aside className="fixed left-0 top-0 z-50 flex h-full w-16 flex-col items-center border-r border-indigo-500/10 bg-slate-950/40 py-8 font-space-grotesk tracking-tight shadow-[0_0_20px_rgba(99,102,241,0.1)] backdrop-blur-xl">
//       <div className="mb-10">
//         <span className="text-xl font-bold tracking-tighter text-indigo-500">
//           C
//         </span>
//       </div>

//       <nav className="flex flex-1 flex-col gap-8">
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
//           title="Create"
//         >
//           <span className="material-symbols-outlined">movie_creation</span>
//         </button>

//         <button
//           type="button"
//           className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
//           title="Library"
//         >
//           <span className="material-symbols-outlined">video_library</span>
//         </button>

//         <button
//           type="button"
//           className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
//           title="Models"
//         >
//           <span className="material-symbols-outlined">memory</span>
//         </button>

//         <button
//           type="button"
//           className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
//           title="Community"
//         >
//           <span className="material-symbols-outlined">groups</span>
//         </button>
//       </nav>

//       <div className="mt-auto flex flex-col items-center gap-6">
//         {/* <button
//           type="button"
//           className="text-slate-500 transition-colors hover:text-slate-300"
//           title="Settings"
//         >
//           <span className="material-symbols-outlined">settings</span>
//         </button> */}
//         <SettingsButton />
        
//         <div className="group relative">
//           <div className="h-8 w-8 overflow-hidden rounded-full border border-indigo-500/30 bg-slate-800">
//             {user?.avatarUrl ? (
//               <img
//                 alt={user.fullName || 'User profile'}
//                 className="h-full w-full object-cover"
//                 src={user.avatarUrl}
//               />
//             ) : (
//               <div className="flex h-full w-full items-center justify-center text-xs font-bold text-indigo-300">
//                 {user?.fullName?.charAt(0) || 'U'}
//               </div>
//             )}
//           </div>

//           <div className="pointer-events-none absolute bottom-0 left-12 min-w-44 translate-x-2 rounded-xl border border-indigo-500/20 bg-slate-950/95 px-4 py-3 opacity-0 shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
//             <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
//               {user?.roleName}
//             </p>

//             <p className="mt-1 truncate text-sm font-semibold text-slate-100">
//               {user?.fullName}
//             </p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   )
// }
import { useAuthStore } from '../../store/auth.store'
import NavMenu from './NavMenu'
import SettingsButton from './SettingsButton'

export default function Sidebar() {
  const user = useAuthStore((state) => state.user)

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-16 flex-col items-center border-r border-indigo-500/10 bg-slate-950/40 py-8 font-space-grotesk tracking-tight shadow-[0_0_20px_rgba(99,102,241,0.1)] backdrop-blur-xl">
      <div className="mb-10">
        <span className="text-xl font-bold tracking-tighter text-indigo-500">
          C
        </span>
      </div>

      {/* <nav className="flex flex-1 flex-col gap-8">
        <button
          type="button"
          className="flex w-full scale-95 items-center justify-center border-r-2 border-indigo-500 py-2 text-indigo-400 transition-transform active:scale-90"
          title="Home"
        >
          <span className="material-symbols-outlined">home</span>
        </button>

        <button
          type="button"
          className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
          title="Create"
        >
          <span className="material-symbols-outlined">movie_creation</span>
        </button>

        <button
          type="button"
          className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
          title="Library"
        >
          <span className="material-symbols-outlined">video_library</span>
        </button>

        <button
          type="button"
          className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
          title="Models"
        >
          <span className="material-symbols-outlined">memory</span>
        </button>

        <button
          type="button"
          className="flex w-full scale-95 items-center justify-center py-2 text-slate-500 transition-all hover:bg-indigo-500/5 hover:text-slate-300 active:scale-90"
          title="Community"
        >
          <span className="material-symbols-outlined">groups</span>
        </button>
      </nav> */}
      <NavMenu />

      <div className="mt-auto flex flex-col items-center gap-6">
        <SettingsButton />

        <div className="group relative">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-indigo-500/30 bg-slate-800">
            {user?.avatarUrl ? (
              <img
                alt={user.fullName || 'User profile'}
                className="h-full w-full object-cover"
                src={user.avatarUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-indigo-300">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute bottom-0 left-12 min-w-44 translate-x-2 rounded-xl border border-indigo-500/20 bg-slate-950/95 px-4 py-3 opacity-0 shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              {(user?.roleName || 'USER').toUpperCase()}
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-slate-100">
              {user?.fullName || 'Chưa có tên'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
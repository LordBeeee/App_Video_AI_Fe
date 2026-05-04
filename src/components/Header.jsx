// function Header() {
//   return (
//     <header className="fixed top-0 right-0 w-[calc(100%-64px)] bg-slate-950/60 backdrop-blur-md border-b border-white/5 flex justify-between items-center h-16 px-6 z-40 font-space-grotesk font-medium duration-200 ease-in-out">
//       <div className="flex items-center gap-8">
//         <span className="text-lg font-black italic text-white tracking-wider">
//           KLING PRO
//         </span>

//         <nav className="hidden md:flex items-center gap-6">
//           <a
//             className="text-indigo-400 font-bold transition-all hover:text-indigo-300"
//             href="#"
//           >
//             Models
//           </a>

//           <a
//             className="text-slate-400 transition-all hover:text-indigo-300"
//             href="#"
//           >
//             Workflow
//           </a>

//           <a
//             className="text-slate-400 transition-all hover:text-indigo-300"
//             href="#"
//           >
//             Gallery
//           </a>
//         </nav>
//       </div>

//       <div className="flex items-center gap-4">
//         <div className="flex items-center bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
//           <span className="material-symbols-outlined text-slate-400 text-sm mr-2">
//             search
//           </span>

//           <input
//             className="bg-transparent border-none outline-none focus:ring-0 text-sm w-48 text-white placeholder:text-slate-500"
//             placeholder="Search assets..."
//             type="text"
//           />
//         </div>

//         <button className="px-4 py-1.5 text-sm border border-indigo-500/50 text-indigo-400 rounded hover:bg-indigo-500/10 transition-colors">
//           Upgrade
//         </button>

//         <button className="px-5 py-1.5 text-sm bg-indigo-600 text-white rounded font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-indigo-500 transition-all">
//           Generate
//         </button>

//         <div className="h-6 w-px bg-slate-700/50 mx-2"></div>

//         <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-white">
//           notifications
//         </span>

//         <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-white">
//           account_circle
//         </span>
//       </div>
//     </header>
//   )
// }

// export default Header
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-950/60 px-6 font-medium backdrop-blur-md duration-200 ease-in-out">
      <div className="flex items-center gap-8">
        <span className="text-lg font-black italic tracking-wider text-white">
          KLING PRO
        </span>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            className="font-bold text-indigo-400 transition-all hover:text-indigo-300"
            href="#"
          >
            Models
          </a>

          <a
            className="text-slate-400 transition-all hover:text-indigo-300"
            href="#"
          >
            Workflow
          </a>

          <a
            className="text-slate-400 transition-all hover:text-indigo-300"
            href="#"
          >
            Gallery
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5">
          <span className="material-symbols-outlined mr-2 text-sm text-slate-400">
            search
          </span>

          <input
            className="w-48 border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500 focus:ring-0"
            placeholder="Search assets..."
            type="text"
          />
        </div>

        <button
          type="button"
          className="rounded border border-indigo-500/50 px-4 py-1.5 text-sm text-indigo-400 transition-colors hover:bg-indigo-500/10"
        >
          Upgrade
        </button>

        <button
          type="button"
          className="rounded bg-indigo-600 px-5 py-1.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all hover:bg-indigo-500"
        >
          Generate
        </button>

        <div className="mx-2 h-6 w-px bg-slate-700/50" />

        <span className="material-symbols-outlined cursor-pointer text-slate-400 hover:text-white">
          notifications
        </span>

        <span className="material-symbols-outlined cursor-pointer text-slate-400 hover:text-white">
          account_circle
        </span>
      </div>
    </header>
  )
}

export default Header
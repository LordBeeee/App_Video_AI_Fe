export default function GenerationChart({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  months,
  years,
}) {
  const days = ['D1', 'D4', 'D7', 'D10', 'D13', 'D15', 'D18', 'D21', 'D24', 'D27', 'D31'];

  return (
    <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-sm rounded-2xl p-8 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-10">
        <div>
          <h3 className="text-lg font-bold text-white">
            Thống kê Generations
          </h3>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="h-10 min-w-[145px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 border-slate-700 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                    {months.map((month) => (
                        <option
                        key={month}
                        value={month}
                        className="bg-slate-800 text-white"
                        >
                        Tháng {month}
                        </option>
                    ))}
                    </select>

                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">
                    expand_more
                    </span>
                </div>

                <div className="relative">
                    <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-10 min-w-[130px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 border-slate-700 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                    {years.map((year) => (
                        <option
                        key={year}
                        value={year}
                        className="bg-slate-800 text-white"
                        >
                        Năm {year}
                        </option>
                    ))}
                    </select>

                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">
                    expand_more
                    </span>
                </div>
            </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span className="text-xs font-mono text-slate-300">
                Briefs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(76,215,246,0.6)]" />
              <span className="text-xs font-mono text-slate-300">
                Ảnh
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              <span className="text-xs font-mono text-slate-300">
                Video
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-[400px] relative mt-4">
        <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none">
          {['200', '160', '120', '80', '40', '0'].map((v) => (
            <div key={v} className="border-t border-slate-800/50 w-full flex">
              <span className="text-[10px] text-slate-600 -mt-2 pr-2">
                {v}
              </span>
            </div>
          ))}
        </div>

        <svg
          className="absolute inset-0 w-full"
          style={{ height: '360px' }}
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="indigoGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d="M0,150 Q50,220 100,180 T200,120 T300,200 T400,140 T500,160 T600,60 T700,280 T800,280 T1000,280"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M0,150 Q50,220 100,180 T200,120 T300,200 T400,140 T500,160 T600,60 T700,280 T800,280 T1000,280 L1000,300 L0,300 Z"
            fill="url(#indigoGradient)"
            fillOpacity="0.1"
          />

          <path
            d="M0,200 Q50,180 100,220 T200,160 T300,140 T400,220 T500,100 T600,180 T700,280 T800,280 T1000,280"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M0,250 Q50,260 100,240 T200,230 T300,250 T400,210 T500,220 T600,240 T700,280 T800,280 T1000,280"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3"
            strokeDasharray="8 4"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute bottom-0 w-full flex justify-between px-2 pt-4 border-t border-slate-800">
          {days.map((d) => (
            <span
              key={d}
              className={`text-[10px] ${
                d === 'D15'
                  ? 'font-bold text-indigo-400'
                  : 'text-slate-500'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      
    </div>
  );
}
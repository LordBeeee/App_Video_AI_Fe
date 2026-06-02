export default function SpendingChart({
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
            Thống kê Tiền đã dùng
          </h3>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-3">
            {/* Month select */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-10 min-w-[145px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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

            {/* Year select */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-10 min-w-[130px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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

          {/* Legend */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-xs font-mono text-slate-300">
              Tiền
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-[400px] relative mt-4">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none">
          {['200.000', '160.000', '120.000', '80.000', '40.000', '0'].map((v) => (
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
            <linearGradient id="amberGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Main money line */}
          <path
            d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Area fill */}
          <path
            d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95 L1000,300 L0,300 Z"
            fill="url(#amberGradient)"
            fillOpacity="0.22"
          />

          {/* Glow line */}
          <path
            d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>

        {/* X axis */}
        <div className="absolute bottom-0 w-full flex justify-between px-2 pt-4 border-t border-slate-800">
          {days.map((d) => (
            <span
              key={d}
              className={`text-[10px] ${
                d === 'D15'
                  ? 'font-bold text-amber-400'
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
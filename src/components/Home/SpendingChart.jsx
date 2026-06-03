// export default function SpendingChart({
//   selectedMonth,
//   setSelectedMonth,
//   selectedYear,
//   setSelectedYear,
//   months,
//   years,
// }) {
//   const days = Array.from({ length: 31 }, (_, i) => `D${i + 1}`);
//   const yLabels = ['200.000', '160.000', '120.000', '80.000', '40.000', '0'];

//   return (
//     <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-sm rounded-2xl p-8 relative">
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-10">
//         <div>
//           <h3 className="text-lg font-bold text-white">
//             Thống kê Tiền đã dùng
//           </h3>
//         </div>

//         <div className="flex flex-col md:flex-row md:items-center gap-5">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
//                 className="h-10 min-w-[145px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
//               >
//                 {months.map((month) => (
//                   <option key={month} value={month} className="bg-slate-800 text-white">
//                     Tháng {month}
//                   </option>
//                 ))}
//               </select>
//               <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">
//                 expand_more
//               </span>
//             </div>

//             <div className="relative">
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(Number(e.target.value))}
//                 className="h-10 min-w-[130px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
//               >
//                 {years.map((year) => (
//                   <option key={year} value={year} className="bg-slate-800 text-white">
//                     Năm {year}
//                   </option>
//                 ))}
//               </select>
//               <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">
//                 expand_more
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
//             <span className="text-xs font-mono text-slate-300">Tiền</span>
//           </div>
//         </div>
//       </div>

//       {/* Grid layout: cột Y-axis cố định 64px, phần còn lại là chart */}
//       <div className="w-full mt-4" style={{ display: 'grid', gridTemplateColumns: '50px 1fr' }}>
//         {/* Y-axis labels — cố định, không bị ảnh hưởng bởi độ dài text */}
//         <div className="flex flex-col justify-between pb-6 pr-2" style={{ overflow: 'hidden' }}>
//           {yLabels.map((v) => (
//             <span key={v} className="text-[10px] text-slate-500 text-right leading-none block truncate">
//               {v}
//             </span>
//           ))}
//         </div>

//         {/* Chart area — luôn chiếm toàn bộ phần còn lại */}
//         <div className="flex flex-col min-w-0">
//           {/* SVG + grid */}
//           <div className="relative" style={{ height: 360 }}>
//             {/* Horizontal grid lines */}
//             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
//               {yLabels.map((v) => (
//                 <div key={v} className="border-t border-slate-800/50 w-full" />
//               ))}
//             </div>

//             {/* Line chart SVG */}
//             <svg
//               className="absolute inset-0 w-full h-full"
//               viewBox="0 0 1000 300"
//               preserveAspectRatio="none"
//             >
//               <defs>
//                 <linearGradient id="amberGradient" x1="0" x2="0" y1="0" y2="1">
//                   <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
//                   <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
//                 </linearGradient>
//               </defs>

//               {/* Area fill */}
//               <path
//                 d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95 L1000,300 L0,300 Z"
//                 fill="url(#amberGradient)"
//                 fillOpacity="0.22"
//               />

//               {/* Glow line */}
//               <path
//                 d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95"
//                 fill="none"
//                 stroke="#fbbf24"
//                 strokeWidth="6"
//                 strokeLinecap="round"
//                 opacity="0.2"
//               />

//               {/* Main money line */}
//               <path
//                 d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95"
//                 fill="none"
//                 stroke="#f59e0b"
//                 strokeWidth="3"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </div>

//           {/* X-axis: all 31 days with tick marks */}
//           <div className="border-t border-slate-800 w-full flex justify-between">
//             {days.map((d) => (
//               <div key={d} className="flex flex-col items-center">
//                 <div className="w-px h-1.5 bg-slate-700 mb-1" />
//                 <span
//                   className={`text-[9px] leading-none ${
//                     d === 'D15' ? 'font-bold text-amber-400' : 'text-slate-500'
//                   }`}
//                 >
//                   {d}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useRef, useCallback } from "react";

const chartData = [
  { day: 'D1',  tien: 46000  },
  { day: 'D2',  tien: 58000  },
  { day: 'D3',  tien: 62000  },
  { day: 'D4',  tien: 68000  },
  { day: 'D5',  tien: 64000  },
  { day: 'D6',  tien: 58000  },
  { day: 'D7',  tien: 72000  },
  { day: 'D8',  tien: 95000  },
  { day: 'D9',  tien: 110000 },
  { day: 'D10', tien: 120000 },
  { day: 'D11', tien: 115000 },
  { day: 'D12', tien: 95000  },
  { day: 'D13', tien: 70000  },
  { day: 'D14', tien: 48000  },
  { day: 'D15', tien: 44000  },
  { day: 'D16', tien: 80000  },
  { day: 'D17', tien: 140000 },
  { day: 'D18', tien: 190000 },
  { day: 'D19', tien: 200000 },
  { day: 'D20', tien: 195000 },
  { day: 'D21', tien: 160000 },
  { day: 'D22', tien: 30000  },
  { day: 'D23', tien: 105000 },
  { day: 'D24', tien: 190000 },
  { day: 'D25', tien: 200000 },
  { day: 'D26', tien: 195000 },
  { day: 'D27', tien: 5000   },
  { day: 'D28', tien: 0      },
  { day: 'D29', tien: 80000  },
  { day: 'D30', tien: 130000 },
  { day: 'D31', tien: 0      },
];

function formatTien(val) {
  return val.toLocaleString('vi-VN');
}

export default function SpendingChart({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  months,
  years,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const chartRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const index = Math.round((x / rect.width) * 30);
    setHoveredIndex(Math.max(0, Math.min(30, index)));
  }, []);

  const handleMouseLeave = useCallback(() => setHoveredIndex(null), []);

  const hoveredData = hoveredIndex !== null ? chartData[hoveredIndex] : null;
  const hoveredPct  = hoveredIndex !== null ? (hoveredIndex / 30) * 100 : null;

  const yLabels = ['200.000', '160.000', '120.000', '80.000', '40.000', '0'];

  return (
    <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-sm rounded-2xl p-8 relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-10">
        <h3 className="text-lg font-bold text-white">Thống kê Tiền đã dùng</h3>

        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-10 min-w-[145px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                {months.map((m) => <option key={m} value={m} className="bg-slate-800 text-white">Tháng {m}</option>)}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">expand_more</span>
            </div>
            <div className="relative">
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-10 min-w-[130px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                {years.map((y) => <option key={y} value={y} className="bg-slate-800 text-white">Năm {y}</option>)}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">expand_more</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-xs font-mono text-slate-300">Tiền</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full mt-4" style={{ display: 'grid', gridTemplateColumns: '50px 1fr' }}>
        {/* Y-axis */}
        <div className="flex flex-col justify-between pb-6 pr-2" style={{ overflow: 'hidden' }}>
          {yLabels.map((v) => (
            <span key={v} className="text-[10px] text-slate-500 text-right leading-none block truncate">{v}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex flex-col min-w-0">
          {/* SVG area */}
          <div
            className="relative cursor-crosshair"
            style={{ height: 360 }}
            ref={chartRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {yLabels.map((v) => (
                <div key={v} className="border-t border-slate-800/50 w-full" />
              ))}
            </div>

            {/* SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="amberGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Hover vertical line */}
              {hoveredPct !== null && (
                <line
                  x1={hoveredPct * 10} y1={0}
                  x2={hoveredPct * 10} y2={300}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              )}

              {/* Area fill */}
              <path
                d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95 L1000,300 L0,300 Z"
                fill="url(#amberGradient)" fillOpacity="0.22"
              />
              {/* Glow */}
              <path
                d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95"
                fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" opacity="0.2"
              />
              {/* Main line */}
              <path
                d="M0,220 Q60,180 120,205 T240,150 T360,190 T480,80 T600,130 T720,55 T840,170 T1000,95"
                fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
              />
            </svg>

            {/* Tooltip */}
            {hoveredData && hoveredPct !== null && (
              <div
                className="absolute z-10 pointer-events-none top-3"
                style={{
                  left: hoveredPct > 72
                    ? `calc(${hoveredPct}% - 152px)`
                    : `calc(${hoveredPct}% + 14px)`,
                }}
              >
                <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-xl" style={{ minWidth: 140 }}>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      <span className="text-[11px] text-slate-400">Tiền</span>
                    </div>
                    <span className="text-[11px] font-bold text-white">{formatTien(hoveredData.tien)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* X-axis — absolute so labels align exactly with SVG */}
          <div className="relative border-t border-slate-800" style={{ height: 24 }}>
            {chartData.map((d, i) => {
              const pct = (i / 30) * 100;
              const isHovered = hoveredIndex === i;
              return (
                <div
                  key={d.day}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={`w-px h-1.5 ${isHovered ? 'bg-slate-300' : 'bg-slate-700'}`} />
                  <span className={`text-[9px] leading-none mt-0.5 transition-colors ${
                    isHovered ? 'font-bold text-white' : 'text-slate-500'
                  }`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
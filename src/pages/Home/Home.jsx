// import { useEffect, useState } from 'react';
// import { getUserStatsApi } from '../../services/user.service';

// export default function Home() {
//   const [stats, setStats] = useState({
//     totalPrompts: 0,
//     totalImages:  0,
//     totalVideos:  0,
//     totalCost:    0,
//   });

//   const [loading, setLoading] = useState(true);

//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(2026);

//   const years = [2026, 2027];
//   const months = Array.from({ length: 12 }, (_, i) => i + 1);

//   useEffect(() => {
//     setLoading(true);

//     getUserStatsApi({
//       month: selectedMonth,
//       year: selectedYear,
//     })
//       .then((data) => setStats(data))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [selectedMonth, selectedYear]);

//   const formatCost = (cost) =>
//     new Intl.NumberFormat('vi-VN').format(Math.round(cost)) + ' VND';

//   const statCards = [
//     {
//       label:  'TỔNG PROMPT',
//       value:  loading ? '...' : stats.totalPrompts.toLocaleString('vi-VN'),
//       icon:   'description',
//       bg:     'bg-indigo-500/10',
//       text:   'text-indigo-400',
//       shadow: 'text-indigo-500',
//     },
//     {
//       label:  'ẢNH ĐÃ TẠO',
//       value:  loading ? '...' : stats.totalImages.toLocaleString('vi-VN'),
//       icon:   'image',
//       bg:     'bg-cyan-500/10',
//       text:   'text-cyan-400',
//       shadow: 'text-cyan-500',
//     },
//     {
//       label:  'VIDEO ĐÃ TẠO',
//       value:  loading ? '...' : stats.totalVideos.toLocaleString('vi-VN'),
//       icon:   'videocam',
//       bg:     'bg-purple-500/10',
//       text:   'text-purple-400',
//       shadow: 'text-purple-500',
//     },
//     {
//       label:  'TỔNG CHI TIÊU',
//       value:  loading ? '...' : formatCost(stats.totalCost),
//       icon:   'payments',
//       bg:     'bg-amber-500/10',
//       text:   'text-amber-400',
//       shadow: 'text-amber-500',
//     },
//   ];

//   const days = ['D1', 'D4', 'D7', 'D10', 'D13', 'D15', 'D18', 'D21', 'D24', 'D27', 'D31'];

//   return (
//     <div className="max-w-7xl mx-auto space-y-8 pt-8">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-white">
//             Phân tích Dữ liệu và Thống kê
//           </h2>
//           <p className="text-slate-400 text-sm mt-1">
//             Dữ liệu tổng quan của bạn đã làm các dự án.
//           </p>
//         </div>
//       </div>

//       {/* Stat Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statCards.map((card) => (
//           <div
//             key={card.label}
//             className="bg-slate-900/60 border border-slate-800 backdrop-blur-sm p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group"
//           >
//             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
//               <span className={`material-symbols-outlined text-4xl ${card.shadow}`}>
//                 {card.icon}
//               </span>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
//                 <span className={`material-symbols-outlined ${card.text}`}>
//                   {card.icon}
//                 </span>
//               </div>

//               <span className="text-xs font-semibold tracking-widest text-slate-400">
//                 {card.label}
//               </span>
//             </div>

//             <div className="flex flex-col">
//               <span className="text-3xl font-bold text-white">
//                 {card.value}
//               </span>
//               <div className="min-h-[18px] mt-1" />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Chart Section */}
//       <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-sm rounded-2xl p-8 relative">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-10">
//           <div>
//             <h3 className="text-lg font-bold text-white">
//               Thống kê Generations
//             </h3>
//           </div>

//           <div className="flex flex-col md:flex-row md:items-center gap-5">
//             {/* Filter Month + Year */}
//             <div className="flex items-center gap-3">
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
//                 className="h-10 px-4 rounded-lg bg-slate-950/70 border border-slate-700 text-sm text-slate-200 outline-none cursor-pointer focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
//               >
//                 {months.map((month) => (
//                   <option key={month} value={month}>
//                     Tháng {month}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(Number(e.target.value))}
//                 className="h-10 px-4 rounded-lg bg-slate-950/70 border border-slate-700 text-sm text-slate-200 outline-none cursor-pointer focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
//               >
//                 {years.map((year) => (
//                   <option key={year} value={year}>
//                     Năm {year}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Legend */}
//             <div className="flex items-center gap-6">
//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
//                 <span className="text-xs font-mono text-slate-300">
//                   Briefs
//                 </span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(76,215,246,0.6)]" />
//                 <span className="text-xs font-mono text-slate-300">
//                   Ảnh
//                 </span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
//                 <span className="text-xs font-mono text-slate-300">
//                   Video
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="w-full h-[400px] relative mt-4">
//           <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none">
//             {['200', '160', '120', '80', '40', '0'].map((v) => (
//               <div key={v} className="border-t border-slate-800/50 w-full flex">
//                 <span className="text-[10px] text-slate-600 -mt-2 pr-2">
//                   {v}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <svg
//             className="absolute inset-0 w-full"
//             style={{ height: '360px' }}
//             viewBox="0 0 1000 300"
//             preserveAspectRatio="none"
//           >
//             <defs>
//               <linearGradient id="indigoGradient" x1="0" x2="0" y1="0" y2="1">
//                 <stop offset="0%" stopColor="#6366f1" />
//                 <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
//               </linearGradient>
//             </defs>

//             <path
//               d="M0,150 Q50,220 100,180 T200,120 T300,200 T400,140 T500,160 T600,60 T700,280 T800,280 T1000,280"
//               fill="none"
//               stroke="#6366f1"
//               strokeWidth="3"
//               strokeLinecap="round"
//             />

//             <path
//               d="M0,150 Q50,220 100,180 T200,120 T300,200 T400,140 T500,160 T600,60 T700,280 T800,280 T1000,280 L1000,300 L0,300 Z"
//               fill="url(#indigoGradient)"
//               fillOpacity="0.1"
//             />

//             <path
//               d="M0,200 Q50,180 100,220 T200,160 T300,140 T400,220 T500,100 T600,180 T700,280 T800,280 T1000,280"
//               fill="none"
//               stroke="#22d3ee"
//               strokeWidth="3"
//               strokeLinecap="round"
//             />

//             <path
//               d="M0,250 Q50,260 100,240 T200,230 T300,250 T400,210 T500,220 T600,240 T700,280 T800,280 T1000,280"
//               fill="none"
//               stroke="#a855f7"
//               strokeWidth="3"
//               strokeDasharray="8 4"
//               strokeLinecap="round"
//             />
//           </svg>

//           <div className="absolute bottom-0 w-full flex justify-between px-2 pt-4 border-t border-slate-800">
//             {days.map((d) => (
//               <span
//                 key={d}
//                 className={`text-[10px] ${
//                   d === 'D15'
//                     ? 'font-bold text-indigo-400'
//                     : 'text-slate-500'
//                 }`}
//               >
//                 {d}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/components/Home/Home.jsx

import { useEffect, useState } from 'react';
import { getUserStatsApi } from '../../services/user.service';
import StatsCards from '../../components/Home/StatsCards';
import GenerationChart from '../../components/Home/GenerationChart';
import SpendingChart from '../../components/Home/SpendingChart';

export default function Home() {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalImages: 0,
    totalVideos: 0,
    totalCost: 0,
  });

  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(2026);

  const years = [2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    setLoading(true);

    getUserStatsApi({
      month: selectedMonth,
      year: selectedYear,
    })
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  const formatCost = (cost) =>
    new Intl.NumberFormat('vi-VN').format(Math.round(cost)) + ' VND';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Phân tích Dữ liệu và Thống kê
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Dữ liệu tổng quan của bạn đã làm các dự án.
          </p>
        </div>
      </div>

      <StatsCards
        stats={stats}
        loading={loading}
        formatCost={formatCost}
      />

      <GenerationChart
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        months={months}
        years={years}
      />

      <SpendingChart
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        months={months}
        years={years}
      />
    </div>
  );
}
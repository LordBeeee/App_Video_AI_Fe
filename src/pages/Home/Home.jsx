// import { useEffect, useState } from 'react';
// import { getUserStatsApi } from '../../services/user.service';
// import StatsCards from '../../components/Home/StatsCards';
// import GenerationChart from '../../components/Home/GenerationChart';
// import SpendingChart from '../../components/Home/SpendingChart';

// export default function Home() {
//   const [stats, setStats] = useState({
//     totalPrompts: 0,
//     totalImages: 0,
//     totalVideos: 0,
//     totalCost: 0,
//   });

//   const [loading, setLoading] = useState(true);

//   const [selectedMonth, setSelectedMonth] = useState(
//     new Date().getMonth() + 1
//   );
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

//   return (
//     <div className="max-w-7xl mx-auto space-y-8 pt-8">
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

//       <StatsCards
//         stats={stats}
//         loading={loading}
//         formatCost={formatCost}
//       />

//       <GenerationChart
//         selectedMonth={selectedMonth}
//         setSelectedMonth={setSelectedMonth}
//         selectedYear={selectedYear}
//         setSelectedYear={setSelectedYear}
//         months={months}
//         years={years}
//       />

//       <SpendingChart
//         selectedMonth={selectedMonth}
//         setSelectedMonth={setSelectedMonth}
//         selectedYear={selectedYear}
//         setSelectedYear={setSelectedYear}
//         months={months}
//         years={years}
//       />
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { getUserStatsApi, getUserDailyStatsApi } from '../../services/user.service';
import StatsCards   from '../../components/Home/StatsCards';
import GenerationChart from '../../components/Home/GenerationChart';
import SpendingChart   from '../../components/Home/SpendingChart';

export default function Home() {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalImages:  0,
    totalVideos:  0,
    totalCost:    0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());

  const [dailyGenerations, setDailyGenerations] = useState([]);
  const [dailySpending,    setDailySpending]    = useState([]);
  const [dailyLoading, setDailyLoading] = useState(true);

  const years  = [2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Tổng hợp all-time (không phụ thuộc tháng/năm)
  useEffect(() => {
    setStatsLoading(true);
    getUserStatsApi()
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  // Thống kê theo ngày – load lại khi đổi tháng/năm
  useEffect(() => {
    setDailyLoading(true);
    getUserDailyStatsApi({ month: selectedMonth, year: selectedYear })
      .then(({ generations, spending }) => {
        setDailyGenerations(generations);
        setDailySpending(spending);
      })
      .catch(console.error)
      .finally(() => setDailyLoading(false));
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
        loading={statsLoading}
        formatCost={formatCost}
      />

      <GenerationChart
        data={dailyGenerations}
        loading={dailyLoading}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        months={months}
        years={years}
      />

      <SpendingChart
        data={dailySpending}
        loading={dailyLoading}
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
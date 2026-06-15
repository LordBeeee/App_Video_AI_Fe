import { useEffect, useState } from 'react';
import {
  getUserStatsApi, getUserDailyStatsApi,
  getSystemStatsApi, getSystemDailyStatsApi,
} from '../../services/user.service';
import { useAuthStore } from '../../store/auth.store';
import StatsCards   from '../../components/Home/StatsCards';
import GenerationChart from '../../components/Home/GenerationChart';
import SpendingChart   from '../../components/Home/SpendingChart';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roleName === 'admin';

  const [viewMode, setViewMode] = useState('self'); // 'self' | 'system'

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

  const isSystemView = isAdmin && viewMode === 'system';

  // Tổng hợp all-time
  useEffect(() => {
    setStatsLoading(true);
    const fetcher = isSystemView ? getSystemStatsApi : getUserStatsApi;
    fetcher()
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, [isSystemView]);

  // Thống kê theo ngày – load lại khi đổi tháng/năm/viewMode
  useEffect(() => {
    setDailyLoading(true);
    const fetcher = isSystemView ? getSystemDailyStatsApi : getUserDailyStatsApi;
    fetcher({ month: selectedMonth, year: selectedYear })
      .then(({ generations, spending }) => {
        setDailyGenerations(generations);
        setDailySpending(spending);
      })
      .catch(console.error)
      .finally(() => setDailyLoading(false));
  }, [isSystemView, selectedMonth, selectedYear]);

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
            {isSystemView
              ? 'Dữ liệu tổng quan của toàn hệ thống.'
              : 'Dữ liệu tổng quan của bạn đã làm các dự án.'}
          </p>
        </div>

        {/* Chỉ admin mới thấy combobox này */}
        {isAdmin && (
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="h-10 min-w-[150px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="self" className="bg-slate-800 text-white">Bản thân</option>
              <option value="system" className="bg-slate-800 text-white">Hệ thống</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">
              expand_more
            </span>
          </div>
        )}
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
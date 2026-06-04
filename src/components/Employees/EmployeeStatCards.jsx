import { StatCard, Dot, Skeleton } from './EmployeeUI'
import { formatVND } from '../../utils/employee.utils'

export default function EmployeeStatCards({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard label="Tổng nhân sự" loading={loading}>
        <span className="text-3xl font-bold text-white">{stats.total}</span>
      </StatCard>

      <StatCard label="Đang hoạt động" loading={loading}>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-white">{stats.active}</span>
          <Dot color="green" />
        </div>
      </StatCard>

      <StatCard label="Bị khóa" loading={loading}>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-white">{stats.banned}</span>
          <Dot color="red" />
        </div>
      </StatCard>

      <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[140px] border-primary/20 bg-primary/5">
        <span className="text-label-caps text-primary uppercase tracking-widest">
          Tiền nhân viên tiêu tháng này
        </span>
        <div className="mt-5">
          {loading
            ? <Skeleton className="h-9 w-36" />
            : <span className="text-3xl font-bold text-white">{formatVND(stats.monthlySpending)}</span>
          }
        </div>
      </div>
    </div>
  )
}
import { Dot, SkeletonRow, ActionBtn } from './EmployeeUI'
import { getInitials, getColor, formatLastLogin } from '../../utils/employee.utils'
import { EMPLOYEE_PAGE_LIMIT } from '../../constants/employee'

const HEADERS = ['Họ và Tên', 'Email', 'Số điện thoại', 'Trạng thái', 'Truy cập lần cuối', 'Thao tác']

export default function EmployeeTable({ users, loading, query, togglingId, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container/30">
            {HEADERS.map(h => (
              <th key={h} className="px-6 py-4 text-outline text-[11px] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-outline-variant/5">
          {loading ? (
            Array.from({ length: EMPLOYEE_PAGE_LIMIT }).map((_, i) => <SkeletonRow key={i} />)
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                {query ? 'Không tìm thấy nhân viên phù hợp' : 'Chưa có nhân viên nào'}
              </td>
            </tr>
          ) : (
            users.map(user => {
              const locked   = user.status === 'banned'
              const color    = getColor(user.id)
              const toggling = togglingId === user.id

              return (
                <tr key={user.id} className="hover:bg-surface-container-highest/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center ${color.text} font-bold text-xs flex-shrink-0`}>
                        {getInitials(user.fullName)}
                      </div>
                      <span className="font-medium text-white">{user.fullName || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-300 font-mono-ui">{user.email}</td>
                  <td className="px-6 py-5 text-slate-300">
                    {user.phone || <span className="text-outline italic text-xs">Chưa cập nhật</span>}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Dot color={locked ? 'red' : 'green'} />
                      <span className="text-sm text-slate-300">{locked ? 'Đã khóa' : 'Hoạt động'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-300 text-sm">
                    {formatLastLogin(user.lastLoginAt)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      <ActionBtn icon="visibility" title="Xem chi tiết" hoverClass="hover:text-primary hover:bg-primary/10" />
                      <ActionBtn
                        icon={locked ? 'lock' : 'lock_open'}
                        title={locked ? 'Mở tài khoản' : 'Khóa tài khoản'}
                        hoverClass={locked
                          ? '!text-[#f87171] bg-[#f87171]/10 hover:!text-[#ff8a8a] hover:bg-[#f87171]/20'
                          : 'hover:text-[#f87171] hover:bg-[#f87171]/10'}
                        disabled={toggling}
                        onClick={() => onToggle(user)}
                      />
                      <ActionBtn icon="payments" title="Chi tiết chi tiêu" hoverClass="hover:text-secondary hover:bg-secondary/10" />
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
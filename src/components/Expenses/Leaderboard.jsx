import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatVND, formatNum, formatPct, TASK_META } from '../../utils/expense.utils'
import { getInitials, getColor, formatLastLogin } from '../../utils/employee.utils'
import { EmptyState } from './ExpenseUI'

const SORTS = [
  { key: 'cost', label: 'Chi phí' },
  { key: 'requests', label: 'Số yêu cầu' },
  { key: 'failed', label: 'Lỗi' },
  { key: 'lastUsedAt', label: 'Dùng gần nhất' },
]

const field = 'h-10 rounded-lg border border-outline-variant bg-white px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary'

function Th({ k, children, right, sortKey, dir, onSort }) {
  return (
    <th className={`px-4 py-3 text-[11px] uppercase tracking-wider text-outline ${right ? 'text-right' : ''}`}>
      <button onClick={() => onSort(k)} className={`inline-flex items-center gap-1 uppercase hover:text-primary ${sortKey === k ? 'text-primary' : ''}`}>
        {children}
        {sortKey === k && <span className="material-symbols-outlined text-[14px]">{dir === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>}
      </button>
    </th>
  )
}

export default function Leaderboard({ employees = [], totalCost = 0 }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [task, setTask] = useState('all')
  const [sortKey, setSortKey] = useState('cost')
  const [dir, setDir] = useState('desc')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = employees
      .filter((e) => status === 'all' || e.status === status)
      .filter((e) => !q || `${e.fullName || ''} ${e.email}`.toLowerCase().includes(q))
      .map((e) => ({ ...e, shownCost: task === 'all' ? e.cost : e.costByTask[task] || 0 }))
      .filter((e) => task === 'all' || e.shownCost > 0)
    const val = (e) => (sortKey === 'cost' ? e.shownCost : sortKey === 'lastUsedAt' ? (e.lastUsedAt ? new Date(e.lastUsedAt).getTime() : 0) : e[sortKey])
    list.sort((a, b) => (dir === 'desc' ? val(b) - val(a) : val(a) - val(b)))
    return list
  }, [employees, search, status, task, sortKey, dir])

  const toggleSort = (key) => {
    if (key === sortKey) setDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setDir('desc') }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-3">
          <span className="material-symbols-outlined text-lg text-outline">search</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên hoặc email..." className="h-10 w-48 bg-transparent text-sm outline-none placeholder:text-outline" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
          <option value="all">Mọi trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="banned">Bị khóa</option>
        </select>
        <select value={task} onChange={(e) => setTask(e.target.value)} className={field}>
          <option value="all">Mọi loại tác vụ</option>
          {Object.entries(TASK_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
        <select value={sortKey} onChange={(e) => { setSortKey(e.target.value); setDir('desc') }} className={`${field} sm:hidden`}>
          {SORTS.map((s) => <option key={s.key} value={s.key}>Sắp xếp: {s.label}</option>)}
        </select>
        <span className="ml-auto text-xs text-on-surface-variant">{rows.length} / {employees.length} nhân viên</span>
      </div>

      {rows.length === 0 ? <EmptyState text="Không có nhân viên phù hợp bộ lọc" /> : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="w-12 px-4 py-3 text-[11px] uppercase tracking-wider text-outline">#</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-outline">Nhân viên</th>
                <Th sortKey={sortKey} dir={dir} onSort={toggleSort} k="cost" right>Chi phí{task !== 'all' ? ` · ${TASK_META[task].label}` : ''}</Th>
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-outline">Tỷ trọng</th>
                <Th sortKey={sortKey} dir={dir} onSort={toggleSort} k="requests" right>Yêu cầu</Th>
                <Th sortKey={sortKey} dir={dir} onSort={toggleSort} k="failed" right>Lỗi</Th>
                <Th sortKey={sortKey} dir={dir} onSort={toggleSort} k="lastUsedAt">Dùng gần nhất</Th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {rows.map((e, i) => {
                const c = getColor(e.id)
                return (
                  <tr key={e.id} onClick={() => navigate(`/employees/${e.id}/ai-usage`)} className="cursor-pointer transition-colors hover:bg-primary-container/40">
                    <td className="px-4 py-3 text-on-surface-variant">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {e.avatarUrl
                          ? <img src={e.avatarUrl} alt="" className="h-9 w-9 rounded-full border border-outline-variant object-cover" />
                          : <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${c.bg} ${c.text}`}>{getInitials(e.fullName)}</div>}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-on-surface">{e.fullName || '—'}</p>
                          <p className="truncate text-xs text-on-surface-variant">{e.email}{e.status === 'banned' ? ' · Đã khóa' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-on-surface">{formatVND(e.shownCost)}</td>
                    <td className="px-4 py-3 text-right text-on-surface-variant">{formatPct(e.shownCost, totalCost)}</td>
                    <td className="px-4 py-3 text-right text-on-surface-variant">{formatNum(e.requests)}</td>
                    <td className={`px-4 py-3 text-right ${e.failed ? 'font-medium text-red-600' : 'text-on-surface-variant'}`}>{formatNum(e.failed)}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{e.lastUsedAt ? formatLastLogin(e.lastUsedAt) : 'Chưa sử dụng'}</td>
                    <td className="px-4 py-3 text-right"><span className="material-symbols-outlined text-outline">chevron_right</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

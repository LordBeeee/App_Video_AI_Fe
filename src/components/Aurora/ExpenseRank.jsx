import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Empty } from './AuroraUI'
import { formatVND, formatNum } from '../../utils/expense.utils'
import { timeAgo } from '../../utils/operations.utils'
import { AU_TASK, moneyShort, pctOf } from '../../utils/aurora.utils'

const SORTS = [
  { k: 'cost', l: 'Chi phí' },
  { k: 'requests', l: 'Số yêu cầu' },
  { k: 'failed', l: 'Số lỗi' },
  { k: 'lastUsedAt', l: 'Dùng gần nhất' },
]
const TASKS = [['all', 'Tất cả'], ...Object.entries(AU_TASK).map(([k, m]) => [k, m.label])]

export default function ExpenseRank({ employees = [], totalCost = 0 }) {
  const [search, setSearch] = useState('')
  const [task, setTask] = useState('all')
  const [sortKey, setSortKey] = useState('cost')
  const [dir, setDir] = useState('desc')
  const [hideBanned, setHideBanned] = useState(false)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const val = (e) => (sortKey === 'cost' ? e.shown : sortKey === 'lastUsedAt' ? (e.lastUsedAt ? new Date(e.lastUsedAt).getTime() : 0) : e[sortKey])
    return employees
      .filter((e) => !hideBanned || e.status !== 'banned')
      .filter((e) => !q || `${e.fullName || ''} ${e.email}`.toLowerCase().includes(q))
      .map((e) => ({ ...e, shown: task === 'all' ? e.cost : e.costByTask[task] || 0 }))
      .filter((e) => task === 'all' || e.shown > 0)
      .sort((a, b) => (dir === 'desc' ? val(b) - val(a) : val(a) - val(b)))
  }, [employees, search, task, sortKey, dir, hideBanned])

  const max = rows.reduce((m, e) => Math.max(m, e.shown), 0) || 1

  return (
    <>
      <div className="au-rk-ctl">
        <div className="au-rk-top">
          <label className="au-search">
            <span className="material-symbols-outlined">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nhân viên…" aria-label="Tìm nhân viên" />
          </label>
          <select className="au-sel" value={sortKey} onChange={(e) => { setSortKey(e.target.value); setDir('desc') }} aria-label="Sắp xếp theo">
            {SORTS.map((s) => <option key={s.k} value={s.k}>{s.l}</option>)}
          </select>
          <button type="button" className="au-ico" onClick={() => setDir((d) => (d === 'desc' ? 'asc' : 'desc'))} title={dir === 'desc' ? 'Giảm dần' : 'Tăng dần'} aria-label="Đổi chiều sắp xếp">
            <span className="material-symbols-outlined">{dir === 'desc' ? 'south' : 'north'}</span>
          </button>
        </div>
        <div className="au-fls">
          {TASKS.map(([k, l]) => (
            <button key={k} type="button" className={`au-fl${task === k ? ' on' : ''}`} onClick={() => setTask(k)}>{l}</button>
          ))}
          <button type="button" className={`au-fl${hideBanned ? ' on' : ''}`} onClick={() => setHideBanned((v) => !v)} title="Ẩn tài khoản khóa" aria-label="Ẩn tài khoản khóa">
            <span className="material-symbols-outlined">block</span>
          </button>
          <span className="au-cnt">{rows.length}/{employees.length}</span>
        </div>
      </div>

      {rows.length === 0 ? <Empty text="Không có nhân viên phù hợp" icon="search_off" hint="Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm." /> : (
        <div className="au-scroll">
          <ul className="au-list">
            {rows.map((e, i) => {
              const segs = task === 'all'
                ? Object.keys(AU_TASK).filter((k) => e.costByTask[k] > 0).map((k) => [k, e.costByTask[k]])
                : [[task, e.shown]]
              return (
                <li key={e.id}>
                  <Link to={`/employees/${e.id}/ai-usage`} className="au-rk">
                    <b className={`au-rk-n au-fd${i < 3 ? ' top' : ''}`}>{i + 1}</b>
                    <Avatar name={e.fullName} src={e.avatarUrl} size={38} />
                    <div className="au-rk-main">
                      <div className="au-rk-nm">
                        <span title={e.email}>{e.fullName || e.email}</span>
                        {e.status === 'banned' && <em className="au-tag" title="Đã khóa"><span className="material-symbols-outlined">lock</span></em>}
                      </div>
                      <div className="au-rk-mt">
                        <span title="Yêu cầu"><span className="material-symbols-outlined">bolt</span>{formatNum(e.requests)}</span>
                        <span title="Lỗi"><span className="material-symbols-outlined">error</span>{formatNum(e.failed)}</span>
                        <span title="Dùng gần nhất"><span className="material-symbols-outlined">schedule</span>{e.lastUsedAt ? timeAgo(e.lastUsedAt) : '—'}</span>
                      </div>
                      <div className="au-stk">
                        <div style={{ width: `${(e.shown / max) * 100}%` }}>
                          {segs.map(([k, v]) => <i key={k} style={{ flexGrow: v, background: AU_TASK[k].color }} />)}
                        </div>
                      </div>
                    </div>
                    <div className="au-rk-v" title={formatVND(e.shown)}>
                      <b className="au-fd">{moneyShort(e.shown)}</b>
                      <span>{pctOf(e.shown, totalCost)}%</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsersApi, getEmployeeStatsApi, toggleUserStatusApi, createEmployeeApi, deleteEmployeeApi } from '../../services/user.service'
import { EMPLOYEE_PAGE_LIMIT } from '../../constants/employee'
import { Page, Tile } from '../../components/Aurora/AuroraUI'
import EmployeeCards       from '../../components/Employees/EmployeeCards'
import EmployeeModal       from '../../components/Employees/EmployeeModal'
import { formatVND }       from '../../utils/employee.utils'
import { moneyShort }      from '../../utils/aurora.utils'

const INITIAL_STATS = { total: 0, active: 0, banned: 0, monthlySpending: 0 }

export default function Employees() {
  const [users,        setUsers]        = useState([])
  const [stats,        setStats]        = useState(INITIAL_STATS)
  const [loading,      setLoading]      = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [search,       setSearch]       = useState('')
  const [query,        setQuery]        = useState('')
  const [page,         setPage]         = useState(1)
  const [total,        setTotal]        = useState(0)
  const [togglingId,   setTogglingId]   = useState(null)
  const [showModal,    setShowModal]    = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [formError,    setFormError]    = useState('')

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setStatsLoading(true)
    getEmployeeStatsApi().then(setStats).catch(console.error).finally(() => setStatsLoading(false))
  }, [])

  useEffect(() => {
    setLoading(true)
    getAllUsersApi({ page, limit: EMPLOYEE_PAGE_LIMIT, search: query })
      .then(({ users, total }) => { setUsers(users); setTotal(total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, query])

  const handleToggle = async (user) => {
    if (togglingId) return
    setTogglingId(user.id)
    try {
      const { status } = await toggleUserStatusApi(user.id)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status } : u))
      const wasActive = status === 'banned'
      setStats(prev => ({
        ...prev,
        active: wasActive ? prev.active - 1 : prev.active + 1,
        banned: wasActive ? prev.banned + 1 : prev.banned - 1,
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingId(null)
    }
  }

  const handleCreate = async (form, resetForm) => {
    setFormError('')
    setSubmitting(true)
    try {
      await createEmployeeApi(form)
      setShowModal(false)
      resetForm()
      const [usersData, statsData] = await Promise.all([
        getAllUsersApi({ page, limit: EMPLOYEE_PAGE_LIMIT, search: query }),
        getEmployeeStatsApi(),
      ])
      setUsers(usersData.users)
      setTotal(usersData.total)
      setStats(statsData)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Xóa nhân viên ──────────────────────────────────────────────────────────
  const handleDelete = async (userId) => {
    await deleteEmployeeApi(userId)

    // Nếu trang hiện tại chỉ còn 1 user và không phải trang đầu → lùi 1 trang
    const nextPage = users.length === 1 && page > 1 ? page - 1 : page

    const [usersData, statsData] = await Promise.all([
      getAllUsersApi({ page: nextPage, limit: EMPLOYEE_PAGE_LIMIT, search: query }),
      getEmployeeStatsApi(),
    ])

    setPage(nextPage)
    setUsers(usersData.users)
    setTotal(usersData.total)
    setStats(statsData)
  }

  const totalPages = Math.max(1, Math.ceil(total / EMPLOYEE_PAGE_LIMIT))

  const pageNums = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const start = Math.min(Math.max(page - 2, 1), Math.max(totalPages - 4, 1))
    return start + i
  })

  return (
    <Page>
      <header className="au-head">
        <h1 className="au-title au-fd">Nhân sự</h1>
        <div className="au-tools">
          <label className="au-search" style={{ background: '#fff', border: 'var(--wbd)', width: 260 }}>
            <span className="material-symbols-outlined">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên…" aria-label="Tìm nhân viên" />
          </label>
          <Link to="/employees/expenses" className="au-btn icon" title="Chi phí AI" aria-label="Chi phí AI">
            <span className="material-symbols-outlined">monitoring</span>
          </Link>
          <button type="button" className="au-btn solid" onClick={() => { setShowModal(true); setFormError('') }}>
            <span className="material-symbols-outlined">person_add</span>Tạo
          </button>
        </div>
      </header>

      <div className="au-tiles">
        <Tile loading={statsLoading} icon="groups" label="Tổng nhân sự" value={stats.total} />
        <Tile loading={statsLoading} icon="check_circle" label="Hoạt động" value={stats.active} />
        <Tile loading={statsLoading} icon="lock" tone="dark" label="Bị khóa" value={stats.banned} note={!stats.banned ? 'Chưa khóa tài khoản nào' : undefined} />
        <Tile loading={statsLoading} icon="payments" tone="orange" label="Chi tháng này" value={moneyShort(stats.monthlySpending)} title={formatVND(stats.monthlySpending)} hint="Tiền nhân viên tiêu tháng này" note={!stats.monthlySpending ? 'Chưa phát sinh chi phí tháng này' : undefined} />
      </div>

      <EmployeeCards
        users={users} loading={loading} query={query}
        togglingId={togglingId} onToggle={handleToggle}
        onDelete={handleDelete}
      />

      <div className="au-pgn">
        <span>{users.length}/{total}</span>
        <div>
          <button type="button" className="au-ico" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Trang trước">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {pageNums.map(p => (
            <button key={p} type="button" className={`au-ico${p === page ? ' on' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button type="button" className="au-ico" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} aria-label="Trang sau">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <EmployeeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        submitting={submitting}
        error={formError}
      />
    </Page>
  )
}

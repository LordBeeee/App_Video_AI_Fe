import { useState, useEffect } from 'react'
import { getAllUsersApi, getEmployeeStatsApi, toggleUserStatusApi, createEmployeeApi, deleteEmployeeApi } from '../../services/user.service'
import { EMPLOYEE_PAGE_LIMIT } from '../../constants/employee'
import EmployeeStatCards   from '../../components/Employees/EmployeeStatCards'
import EmployeeTable       from '../../components/Employees/EmployeeTable'
import EmployeeModal       from '../../components/Employees/EmployeeModal'
import EmployeePagination  from '../../components/Employees/EmployeePagination'

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

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      <div>
        <h2 className="text-2xl font-bold text-on-background">Nhân Viên</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Danh sách nhân viên sẽ được hiển thị ở đây.</p>
      </div>

      <EmployeeStatCards stats={stats} loading={statsLoading} />

      <div className="glass-panel overflow-hidden rounded-2xl">

        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-5">
          <h3 className="text-lg font-semibold text-on-surface">Danh sách nhân viên</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-container/50 border border-outline-variant/20 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-lg text-outline">search</span>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo họ và tên..."
                className="w-48 bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
              />
            </div>
            <button
              onClick={() => { setShowModal(true); setFormError('') }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              Tạo nhân viên
            </button>
          </div>
        </div>

        <EmployeeTable
          users={users} loading={loading} query={query}
          togglingId={togglingId} onToggle={handleToggle}
          onDelete={handleDelete}
        />

        <EmployeePagination
          page={page} totalPages={totalPages}
          total={total} showing={users.length}
          onPageChange={setPage}
        />
      </div>

      <EmployeeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        submitting={submitting}
        error={formError}
      />
    </div>
  )
}

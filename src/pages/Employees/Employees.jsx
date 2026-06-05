import { useState, useEffect } from 'react'
import { getAllUsersApi, getEmployeeStatsApi, toggleUserStatusApi, createEmployeeApi } from '../../services/user.service'
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

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  // fetch stats
  useEffect(() => {
    setStatsLoading(true)
    getEmployeeStatsApi().then(setStats).catch(console.error).finally(() => setStatsLoading(false))
  }, [])

  // fetch users
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

  const totalPages = Math.max(1, Math.ceil(total / EMPLOYEE_PAGE_LIMIT))

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-8 pb-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Nhân Viên</h2>
        <p className="text-slate-400 text-sm mt-1">Danh sách nhân viên sẽ được hiển thị ở đây.</p>
      </div>

      <EmployeeStatCards stats={stats} loading={statsLoading} />

      {/* Table panel */}
      <div className="glass-panel rounded-xl overflow-hidden border border-outline-variant/10">

        {/* Toolbar */}
        <div className="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
          <h3 className="text-lg font-semibold text-white">Danh sách nhân viên</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-container/50 border border-outline-variant/20 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-lg text-outline">search</span>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo họ và tên..."
                className="bg-transparent text-sm text-white placeholder-outline outline-none w-48"
              />
            </div>
            <button
              onClick={() => { setShowModal(true); setFormError('') }}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              Tạo nhân viên
            </button>
          </div>
        </div>

        <EmployeeTable
          users={users} loading={loading} query={query}
          togglingId={togglingId} onToggle={handleToggle}
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
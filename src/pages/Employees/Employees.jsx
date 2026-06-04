// import { useState, useEffect } from 'react'
// import {
//   getAllUsersApi,
//   getEmployeeStatsApi,
//   toggleUserStatusApi,
// } from '../../services/user.service'
// import { createEmployeeApi } from '../../services/user.service'

// // ─── helpers ──────────────────────────────────────────────────────────────────

// const COLOR_CLASSES = [
//   { bg: 'bg-primary/20',         text: 'text-primary' },
//   { bg: 'bg-secondary/20',       text: 'text-secondary' },
//   { bg: 'bg-tertiary/20',        text: 'text-tertiary' },
//   { bg: 'bg-outline-variant',    text: 'text-on-surface' },
// ]

// function getInitials(fullName) {
//   if (!fullName) return '?'
//   const parts = fullName.trim().split(' ').filter(Boolean)
//   if (parts.length === 1) return parts[0][0].toUpperCase()
//   return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
// }

// function getColor(id) {
//   return COLOR_CLASSES[id % COLOR_CLASSES.length]
// }

// function formatLastLogin(date) {
//   if (!date) return 'Chưa đăng nhập'
//   const d   = new Date(date)
//   const now = new Date()
//   const diffMs  = now - d
//   const diffMin = Math.floor(diffMs / 60_000)
//   const diffH   = Math.floor(diffMs / 3_600_000)

//   // Format giờ:phút
//   const hh = String(d.getHours()).padStart(2, '0')
//   const mm = String(d.getMinutes()).padStart(2, '0')
//   const ap = d.getHours() < 12 ? 'AM' : 'PM'
//   const time = `${hh}:${mm} ${ap}`

//   if (diffMin < 5)  return 'Hiện tại'
//   if (diffH  < 24)  return `${time}, ${d.toLocaleDateString('vi-VN')}`
//   if (diffH  < 48)  return `Hôm qua, ${time}`
//   return `${time}, ${d.toLocaleDateString('vi-VN')}`
// }

// function formatVND(amount) {
//   return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
// }

// const LIMIT = 6

// // ─── component ────────────────────────────────────────────────────────────────

// export default function Employees() {
//   const [users,        setUsers]        = useState([])
//   const [stats,        setStats]        = useState({ total: 0, active: 0, banned: 0, monthlySpending: 0 })
//   const [loading,      setLoading]      = useState(true)
//   const [statsLoading, setStatsLoading] = useState(true)
//   const [search,       setSearch]       = useState('')
//   const [query,        setQuery]        = useState('')   // debounced
//   const [page,         setPage]         = useState(1)
//   const [total,        setTotal]        = useState(0)
//   const [togglingId,   setTogglingId]   = useState(null)
//   const [showModal,   setShowModal]   = useState(false)
//   const [submitting,  setSubmitting]  = useState(false)
//   const [formError,   setFormError]   = useState('')
//   const [form,        setForm]        = useState({ fullName: '', email: '', phone: '', password: '' })
//   // debounce search → query
//   useEffect(() => {
//     const t = setTimeout(() => { setQuery(search); setPage(1) }, 400)
//     return () => clearTimeout(t)
//   }, [search])

//   // fetch stats (một lần)
//   useEffect(() => {
//     setStatsLoading(true)
//     getEmployeeStatsApi()
//       .then(setStats)
//       .catch(console.error)
//       .finally(() => setStatsLoading(false))
//   }, [])

//   // fetch users
//   useEffect(() => {
//     setLoading(true)
//     getAllUsersApi({ page, limit: LIMIT, search: query })
//       .then(({ users, total }) => { setUsers(users); setTotal(total) })
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [page, query])

//   // toggle lock / unlock
//   const handleToggle = async (user) => {
//     if (togglingId) return
//     setTogglingId(user.id)
//     try {
//       const { status } = await toggleUserStatusApi(user.id)
//       setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status } : u))
//       const wasActive = status === 'banned'
//       setStats(prev => ({
//         ...prev,
//         active: wasActive ? prev.active - 1 : prev.active + 1,
//         banned: wasActive ? prev.banned + 1 : prev.banned - 1,
//       }))
//     } catch (err) {
//       console.error(err)
//     } finally {
//       setTogglingId(null)
//     }
//   }

//   const totalPages = Math.max(1, Math.ceil(total / LIMIT))

//   // trang hiển thị: tối đa 5 nút quanh page hiện tại
//   const pageNums = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//     const start = Math.min(
//       Math.max(page - 2, 1),
//       Math.max(totalPages - 4, 1),
//     )
//     return start + i
//   })
  
//   const handleCreate = async (e) => {
//     e.preventDefault()
//     setFormError('')
//     setSubmitting(true)
//     try {
//       await createEmployeeApi(form)
//       setShowModal(false)
//       setForm({ fullName: '', email: '', phone: '', password: '' })
//       // refresh list + stats
//       const [usersData, statsData] = await Promise.all([
//         getAllUsersApi({ page, limit: LIMIT, search: query }),
//         getEmployeeStatsApi(),
//       ])
//       setUsers(usersData.users)
//       setTotal(usersData.total)
//       setStats(statsData)
//     } catch (err) {
//       setFormError(err.message)
//     } finally {
//       setSubmitting(false)
//     }
//   }
//   // ── render ───────────────────────────────────────────────────────────────────
//   return (
//     <div className="max-w-7xl mx-auto space-y-8 pt-8 pb-8">

//       {/* Header */}
//       <div>
//         <h2 className="text-2xl font-bold text-white">Nhân Viên</h2>
//         <p className="text-slate-400 text-sm mt-1">
//           Danh sách nhân viên sẽ được hiển thị ở đây.
//         </p>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <StatCard label="Tổng nhân sự" loading={statsLoading}>
//           <span className="text-3xl font-bold text-white">{stats.total}</span>
//         </StatCard>

//         <StatCard label="Đang hoạt động" loading={statsLoading}>
//           <div className="flex items-center gap-2">
//             <span className="text-3xl font-bold text-white">{stats.active}</span>
//             <Dot color="green" />
//           </div>
//         </StatCard>

//         <StatCard label="Bị khóa" loading={statsLoading}>
//           <div className="flex items-center gap-2">
//             <span className="text-3xl font-bold text-white">{stats.banned}</span>
//             <Dot color="red" />
//           </div>
//         </StatCard>

//         <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[140px] border-primary/20 bg-primary/5">
//           <span className="text-label-caps text-primary uppercase tracking-widest">
//             Tiền nhân viên tiêu tháng này
//           </span>
//           <div className="mt-5">
//             {statsLoading
//               ? <Skeleton className="h-9 w-36" />
//               : <span className="text-3xl font-bold text-white">{formatVND(stats.monthlySpending)}</span>
//             }
//           </div>
//         </div>
//       </div>

//       {/* Table panel */}
//       <div className="glass-panel rounded-xl overflow-hidden border border-outline-variant/10">
//         {/* Toolbar */}
//         <div className="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
//           <h3 className="text-lg font-semibold text-white">Danh sách nhân viên</h3>

//           <div className="flex items-center gap-3">
//             {/* Search */}
//             <div className="flex items-center gap-2 bg-surface-container/50 border border-outline-variant/20 rounded-lg px-3 py-2">
//               <span className="material-symbols-outlined text-lg text-outline">search</span>
//               <input
//                 type="text"
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 placeholder="Tìm theo họ và tên..."
//                 className="bg-transparent text-sm text-white placeholder-outline outline-none w-48"
//               />
//             </div>

//             {/* Nút tạo nhân viên */}
//             <button
//               onClick={() => { setShowModal(true); setFormError('') }}
//               className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors"
//             >
//               <span className="material-symbols-outlined text-lg">person_add</span>
//               Tạo nhân viên
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-surface-container/30">
//                 {['Họ và Tên', 'Email', 'Số điện thoại', 'Trạng thái', 'Truy cập lần cuối'].map(h => (
//                   <th key={h} className="px-6 py-4 text-outline text-[11px] uppercase tracking-wider">{h}</th>
//                 ))}
//                 <th className="px-6 py-4 text-outline text-[11px] uppercase tracking-wider">Thao tác</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-outline-variant/5">
//               {loading ? (
//                 Array.from({ length: LIMIT }).map((_, i) => <SkeletonRow key={i} />)
//               ) : users.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
//                     {query ? 'Không tìm thấy nhân viên phù hợp' : 'Chưa có nhân viên nào'}
//                   </td>
//                 </tr>
//               ) : (
//                 users.map(user => {
//                   const locked  = user.status === 'banned'
//                   const color   = getColor(user.id)
//                   const toggling = togglingId === user.id

//                   return (
//                     <tr key={user.id} className="hover:bg-surface-container-highest/20 transition-colors">

//                       {/* Name */}
//                       <td className="px-6 py-5">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center ${color.text} font-bold text-xs flex-shrink-0`}>
//                             {getInitials(user.fullName)}
//                           </div>
//                           <span className="font-medium text-white">{user.fullName || '—'}</span>
//                         </div>
//                       </td>

//                       {/* Email */}
//                       <td className="px-6 py-5 text-slate-300 font-mono-ui">{user.email}</td>

//                       {/* Phone */}
//                       <td className="px-6 py-5 text-slate-300">
//                         {user.phone || <span className="text-outline italic text-xs">Chưa cập nhật</span>}
//                       </td>
                      
//                       {/* Status */}
//                       <td className="px-6 py-5">
//                         <div className="flex items-center gap-2">
//                           <Dot color={locked ? 'red' : 'green'} />
//                           <span className="text-sm text-slate-300">{locked ? 'Đã khóa' : 'Hoạt động'}</span>
//                         </div>
//                       </td>

//                       {/* Last login */}
//                       <td className="px-6 py-5 text-slate-300 text-sm">
//                         {formatLastLogin(user.lastLoginAt)}
//                       </td>

//                       {/* Actions */}
//                       <td className="px-6 py-5">
//                         <div className="flex gap-2">
//                           <ActionBtn icon="visibility" title="Xem chi tiết" hoverClass="hover:text-primary hover:bg-primary/10" />

//                           <ActionBtn
//                             icon={locked ? 'lock' : 'lock_open'}
//                             title={locked ? 'Mở tài khoản' : 'Khóa tài khoản'}
//                             hoverClass={locked
//                               ? '!text-[#f87171] bg-[#f87171]/10 hover:!text-[#ff8a8a] hover:bg-[#f87171]/20'
//                               : 'hover:text-[#f87171] hover:bg-[#f87171]/10'}
//                             disabled={toggling}
//                             onClick={() => handleToggle(user)}
//                           />

//                           <ActionBtn icon="payments" title="Chi tiết chi tiêu" hoverClass="hover:text-secondary hover:bg-secondary/10" />
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="px-6 py-4 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/30">
//           <span className="text-sm text-slate-400">
//             Hiển thị {users.length} trong tổng số {total} nhân viên
//           </span>

//           <div className="flex gap-2">
//             <PageBtn
//               icon="chevron_left"
//               disabled={page === 1}
//               onClick={() => setPage(p => p - 1)}
//             />

//             {pageNums.map(p => (
//               <button
//                 key={p}
//                 onClick={() => setPage(p)}
//                 className={`w-10 h-10 rounded-lg border font-medium transition-colors ${
//                   p === page
//                     ? 'border-primary bg-primary/10 text-primary'
//                     : 'border-outline-variant/20 hover:bg-surface-container-highest text-on-surface'
//                 }`}
//               >
//                 {p}
//               </button>
//             ))}

//             <PageBtn
//               icon="chevron_right"
//               disabled={page >= totalPages}
//               onClick={() => setPage(p => p + 1)}
//             />
//           </div>
//         </div>

//         {/* Modal tạo nhân viên */}
// {showModal && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//     {/* Backdrop */}
//     <div
//       className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//       onClick={() => !submitting && setShowModal(false)}
//     />

//     {/* Dialog */}
//     <div className="relative w-full max-w-md glass-panel rounded-2xl border border-outline-variant/20 p-6 shadow-2xl">

//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
//             <span className="material-symbols-outlined text-primary">person_add</span>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-white">Tạo nhân viên</h3>
//             <p className="text-xs text-slate-400">Điền thông tin để thêm nhân viên mới</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowModal(false)}
//           disabled={submitting}
//           className="p-1.5 rounded-lg hover:bg-surface-container-highest text-outline hover:text-white transition-colors"
//         >
//           <span className="material-symbols-outlined text-xl">close</span>
//         </button>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleCreate} className="space-y-4">

//         {/* Họ và tên */}
//         <div>
//           <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
//             Họ và tên <span className="text-[#f87171]">*</span>
//           </label>
//           <input
//             type="text"
//             value={form.fullName}
//             onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
//             placeholder="Nguyễn Văn A"
//             required
//             className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-primary/50 transition-colors"
//           />
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
//             Email <span className="text-[#f87171]">*</span>
//           </label>
//           <input
//             type="email"
//             value={form.email}
//             onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
//             placeholder="nhanvien@company.com"
//             required
//             className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-primary/50 transition-colors"
//           />
//         </div>

//         {/* Số điện thoại */}
//         <div>
//           <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
//             Số điện thoại
//           </label>
//           <input
//             type="tel"
//             value={form.phone}
//             onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
//             placeholder="0901 234 567"
//             className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-primary/50 transition-colors"
//           />
//         </div>

//         {/* Mật khẩu */}
//         <div>
//           <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
//             Mật khẩu <span className="text-[#f87171]">*</span>
//           </label>
//           <input
//             type="password"
//             value={form.password}
//             onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
//             placeholder="Tối thiểu 6 ký tự"
//             required
//             minLength={6}
//             className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-primary/50 transition-colors"
//           />
//         </div>

//         {/* Error */}
//         {formError && (
//           <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg">
//             <span className="material-symbols-outlined text-[#f87171] text-sm">error</span>
//             <span className="text-[#f87171] text-sm">{formError}</span>
//           </div>
//         )}

//         {/* Actions */}
//         <div className="flex gap-3 pt-2">
//           <button
//             type="button"
//             onClick={() => setShowModal(false)}
//             disabled={submitting}
//             className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm text-slate-300 hover:bg-surface-container-highest transition-colors disabled:opacity-50"
//           >
//             Hủy
//           </button>
//           <button
//             type="submit"
//             disabled={submitting}
//             className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//           >
//             {submitting
//               ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Đang tạo...</>
//               : <><span className="material-symbols-outlined text-sm">check</span> Tạo nhân viên</>
//             }
//           </button>
//         </div>
//       </form>
//     </div>
//   </div>
// )}
//       </div>
//     </div>
//   )
// }

// // ─── small reusable pieces ────────────────────────────────────────────────────

// function StatCard({ label, loading, children }) {
//   return (
//     <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
//       <span className="text-label-caps text-outline uppercase tracking-widest">{label}</span>
//       <div className="mt-5">
//         {loading ? <Skeleton className="h-9 w-16" /> : children}
//       </div>
//     </div>
//   )
// }

// function Dot({ color }) {
//   return color === 'green'
//     ? <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
//     : <span className="w-2 h-2 rounded-full bg-[#f87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
// }

// function Skeleton({ className }) {
//   return <div className={`animate-pulse rounded bg-surface-container-highest/50 ${className}`} />
// }

// function SkeletonRow() {
//   return (
//     <tr className="animate-pulse">
//       <td className="px-6 py-5">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-full bg-surface-container-highest/50" />
//           <div className="h-4 w-32 rounded bg-surface-container-highest/50" />
//         </div>
//       </td>
//       {[40, 28, 20, 32].map((w, i) => (
//         <td key={i} className="px-6 py-5">
//           <div className={`h-4 w-${w} rounded bg-surface-container-highest/50`} />
//         </td>
//       ))}
//       <td className="px-6 py-5 flex justify-end gap-2">
//         <div className="h-8 w-24 rounded bg-surface-container-highest/50" />
//       </td>
//     </tr>
//   )
// }

// function ActionBtn({ icon, title, hoverClass, disabled, onClick }) {
//   return (
//     <button
//       title={title}
//       disabled={disabled}
//       onClick={onClick}
//       className={`p-2 transition-colors rounded-lg text-on-surface-variant ${hoverClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
//     >
//       <span className="material-symbols-outlined text-lg">{icon}</span>
//     </button>
//   )
// }

// function PageBtn({ icon, disabled, onClick }) {
//   return (
//     <button
//       disabled={disabled}
//       onClick={onClick}
//       className="w-10 h-10 rounded-lg border border-outline-variant/20 hover:bg-surface-container-highest text-on-surface disabled:opacity-30 flex items-center justify-center transition-colors"
//     >
//       <span className="material-symbols-outlined">{icon}</span>
//     </button>
//   )
// }
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
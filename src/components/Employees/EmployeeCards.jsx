import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Empty } from '../Aurora/AuroraUI'
import { formatLastLogin } from '../../utils/employee.utils'
import { EMPLOYEE_PAGE_LIMIT } from '../../constants/employee'

function DeleteConfirm({ user, deleting, onConfirm, onCancel }) {
  if (!user) return null
  return (
    <div className="au-mo" onClick={() => !deleting && onCancel()}>
      <div className="au-mo-box" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="au-hic" style={{ background: 'transparent', boxShadow: 'inset 0 0 0 1.5px #f87171', color: '#f87171' }}>
            <span className="material-symbols-outlined">delete_forever</span>
          </span>
          <div className="min-w-0">
            <h3 className="au-fd text-base">Xóa nhân viên</h3>
            <div className="au-ell text-sm" style={{ color: 'var(--t-soft, #f4ae52)' }}>{user.fullName || user.email}</div>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed" style={{ color: '#f87171' }}>
          Toàn bộ dự án, video, ảnh và dữ liệu liên quan sẽ bị xóa vĩnh viễn, không thể khôi phục.
        </p>
        <div className="mt-5 flex gap-2">
          <button type="button" className="au-btn flex-1" onClick={onCancel} disabled={deleting}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <button
            type="button"
            className="au-btn flex-1"
            style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
            onClick={onConfirm}
            disabled={deleting}
          >
            <span className={`material-symbols-outlined${deleting ? ' animate-spin' : ''}`}>{deleting ? 'progress_activity' : 'delete'}</span>
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeCards({ users, loading, query, togglingId, onToggle, onDelete }) {
  const navigate = useNavigate()
  const [pending, setPending] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function confirmDelete() {
    if (!pending) return
    setDeleting(true)
    try {
      await onDelete(pending.id)
      setPending(null)
    } finally {
      setDeleting(false)
    }
  }

  const stop = (fn) => (e) => { e.stopPropagation(); fn() }

  return (
    <>
      <DeleteConfirm user={pending} deleting={deleting} onConfirm={confirmDelete} onCancel={() => setPending(null)} />

      <div className="au-ecw au-scroll">
        {loading ? (
          <div className="au-ecg">
            {Array.from({ length: EMPLOYEE_PAGE_LIMIT }).map((_, i) => <div key={i} className="au-sk au-ec-sk" />)}
          </div>
        ) : users.length === 0 ? (
          <Empty icon={query ? 'person_search' : 'group_add'} text={query ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên nào'} hint={query ? 'Thử tìm bằng tên hoặc email khác.' : 'Tạo tài khoản đầu tiên để bắt đầu theo dõi chi tiêu AI.'} />
        ) : (
          <div className="au-ecg">
            {users.map((u) => {
              const locked = u.status === 'banned'
              return (
                <article key={u.id} className={`au-ec${locked ? ' lock' : ''}`} onClick={() => navigate(`/employees/${u.id}`)}>
                  <div className="au-ec-top">
                    <Avatar name={u.fullName || u.email} src={u.avatarUrl} size={52} onInk={locked} />
                    <span className={`au-st ${locked ? 'bad' : 'ok'}`} title={locked ? 'Đã khóa' : 'Hoạt động'}>
                      <span className="material-symbols-outlined">{locked ? 'lock' : 'check_circle'}</span>
                    </span>
                  </div>
                  <div className="au-ec-nm au-ell au-fd" title={u.fullName}>{u.fullName || '—'}</div>
                  <div className="au-ec-em au-ell" title={u.email}>{u.email}</div>
                  <div className="au-ec-meta">
                    <span title="Số điện thoại"><span className="material-symbols-outlined">call</span>{u.phone || '—'}</span>
                    <span title="Truy cập lần cuối"><span className="material-symbols-outlined">schedule</span>{formatLastLogin(u.lastLoginAt)}</span>
                  </div>
                  <div className="au-ec-act">
                    <button type="button" className="au-ico" title="Chi tiết chi tiêu" aria-label="Chi tiết chi tiêu" onClick={stop(() => navigate(`/employees/${u.id}/ai-usage`))}>
                      <span className="material-symbols-outlined">payments</span>
                    </button>
                    <button type="button" className="au-ico" title={locked ? 'Mở tài khoản' : 'Khóa tài khoản'} aria-label="Khóa hoặc mở tài khoản" disabled={togglingId === u.id} onClick={stop(() => onToggle(u))}>
                      <span className="material-symbols-outlined">{locked ? 'lock_open' : 'lock'}</span>
                    </button>
                    <span className="gap" />
                    <button type="button" className="au-ico bad" title="Xóa nhân viên" aria-label="Xóa nhân viên" onClick={stop(() => setPending(u))}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

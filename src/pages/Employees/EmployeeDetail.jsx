import { useState, useEffect } from 'react'
import { validateFullName, validatePhone, formatDate } from '../../utils/userDetail.utils'
import { InfoRow, SectionLabel, FieldError, AvatarUploader, Toast } from '../../components/UserDetail/UserDetailUI'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getEmployeeByIdApi,
  updateEmployeeApi,
  toggleUserStatusApi,
  resetEmployeePasswordApi,
} from '../../services/user.service'

// ─── Style classes ────────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder-outline outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors'

const inputErrCls =
  'w-full bg-white border border-[#f87171]/50 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder-outline outline-none focus:border-[#f87171]/70 transition-colors'

// ─── Sub-components ───────────────────────────────────────────────────────────
function DangerBtn({ icon, label, onClick, loading, variant = 'warning' }) {
  const colors = {
    warning: 'border-[#f87171]/30 text-[#f87171] hover:bg-[#f87171]/10',
    info:    'border-primary/30 text-primary hover:bg-primary/10',
    success: 'border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10',
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${colors[variant]}`}
    >
      {loading
        ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        : <span className="material-symbols-outlined text-sm">{icon}</span>
      }
      {label}
    </button>
  )
}

function SkeletonDetail() {
  return (
    <div className="glass-panel max-w-5xl mx-auto rounded-2xl border border-outline-variant/20 overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-surface-container-highest/50" />
          <div className="h-6 w-24 rounded bg-surface-container-highest/50" />
          <div className="w-full space-y-3 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded bg-surface-container-highest/50" />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-surface-container-highest/50" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl border border-outline-variant/20 p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#f87171] text-2xl flex-shrink-0">warning</span>
          <p className="text-sm leading-relaxed text-on-surface-variant">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-outline-variant py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-variant"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-[#f87171]/20 border border-[#f87171]/30 text-sm text-[#f87171] hover:bg-[#f87171]/30 transition-colors font-medium"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [form, setForm]               = useState({ fullName: '', username: '', phone: '' })
  const [errs, setErrs]               = useState({ fullName: '', phone: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile]   = useState(null)
  const [saving, setSaving]           = useState(false)
  const [locking, setLocking]         = useState(false)
  const [resetting, setResetting]     = useState(false)
  const [saved, setSaved]             = useState(false)
  const [toast, setToast]             = useState(null)
  const [confirm, setConfirm]         = useState(null)
  const [temporaryPassword, setTemporaryPassword] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    getEmployeeByIdApi(id)
      .then((data) => {
        if (!active) return
        setUser(data)
        setForm({ fullName: data.fullName || '', username: data.username || '', phone: data.phone || '' })
        setErrs({ fullName: '', phone: '' })
        setAvatarPreview(data.avatarUrl || null)
        setAvatarFile(null)
      })
      .catch((err) => {
        if (active) setToast({ message: err.message, type: 'error' })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [id])

  function applyUser(data) {
    setUser(data)
    setForm({
      fullName: data.fullName || '',
      username: data.username || '',
      phone:    data.phone    || '',
    })
    setErrs({ fullName: '', phone: '' })
    setAvatarPreview(data.avatarUrl || null)
    setAvatarFile(null)
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  const locked = user?.status === 'banned'

  // Validate realtime
  function handleChange(name, value) {
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'fullName') setErrs(e => ({ ...e, fullName: validateFullName(value) }))
    if (name === 'phone')    setErrs(e => ({ ...e, phone:    validatePhone(value) }))
  }

  const hasErr = !!(errs.fullName || errs.phone)

  const dirty = user != null && !hasErr && (
    form.fullName !== (user.fullName || '') ||
    form.username !== (user.username || '') ||
    form.phone    !== (user.phone    || '') ||
    avatarFile !== null
  )

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    // Validate toàn bộ trước khi gửi
    const newErrs = {
      fullName: validateFullName(form.fullName),
      phone:    validatePhone(form.phone),
    }
    setErrs(newErrs)
    if (Object.values(newErrs).some(e => e)) return

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('fullName', form.fullName)
      fd.append('username', form.username)
      fd.append('phone',    form.phone)
      if (avatarFile) fd.append('avatar', avatarFile)

      const updated = await updateEmployeeApi(id, fd)
      applyUser(updated)
      setSaved(true)
      showToast('Đã lưu thông tin thành công')
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleLock() {
    const action = locked ? 'mở khóa' : 'khóa'
    setConfirm({
      message: `Bạn có chắc muốn ${action} tài khoản "${user?.fullName || user?.email}"?`,
      onConfirm: async () => {
        setConfirm(null)
        setLocking(true)
        try {
          const result = await toggleUserStatusApi(id)
          setUser(prev => ({ ...prev, status: result.status }))
          showToast(`Đã ${action} tài khoản thành công`)
        } catch (err) {
          showToast(err.message, 'error')
        } finally {
          setLocking(false)
        }
      },
    })
  }

  async function handleReset() {
    setConfirm({
      message: 'Tạo mật khẩu tạm mới cho nhân viên? Mật khẩu hiện tại sẽ không còn dùng được.',
      onConfirm: async () => {
        setConfirm(null)
        setResetting(true)
        try {
          const result = await resetEmployeePasswordApi(id)
          setTemporaryPassword(result.temporaryPassword)
          showToast('Đã tạo mật khẩu tạm. Hãy sao chép và gửi cho nhân viên qua kênh an toàn.')
        } catch (err) {
          showToast(err.message, 'error')
        } finally {
          setResetting(false)
        }
      },
    })
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-background">Chi tiết nhân viên</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{user?.email || '...'}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => navigate(`/employees/${id}/ai-usage`)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover"
        >
          <span className="material-symbols-outlined text-lg">monitoring</span>
          Chi tiết sử dụng AI
        </button>
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary hover:bg-primary-container hover:text-primary"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Quản lý nhân viên
        </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && <SkeletonDetail />}

      {/* Card */}
      {!loading && user && (
        <div className="glass-panel max-w-5xl mx-auto rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">

            {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
            <div className="p-6 flex flex-col gap-6">
              <AvatarUploader
                user={user}
                avatarPreview={avatarPreview}
                onFileChange={handleFileChange}
              />

              {/* Badge trạng thái */}
              <div className="flex flex-col items-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  locked
                    ? 'bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20'
                    : 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${locked ? 'bg-[#f87171]' : 'bg-[#4ade80]'}`} />
                  {locked ? 'Đã khóa' : 'Hoạt động'}
                </span>
              </div>

              {/* Thông tin tài khoản */}
              <div>
                <SectionLabel>Thông tin tài khoản</SectionLabel>
                <InfoRow icon="mail"            label="Email"             value={user.email}                  mono />
                <InfoRow icon="login"           label="Truy cập lần cuối" value={formatDate(user.lastLoginAt)}     />
                <InfoRow icon="calendar_add_on" label="Ngày tạo"          value={formatDate(user.createdAt)}       />
                <InfoRow icon="update"          label="Cập nhật lần cuối" value={formatDate(user.updatedAt)}       />
              </div>
            </div>

            {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
            <div className="p-6 flex flex-col gap-6">

              {/* Form chỉnh sửa */}
              <div>
                <SectionLabel>Chỉnh sửa thông tin</SectionLabel>

                <div className="space-y-4">

                  {/* Họ và tên */}
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-on-surface-variant">
                      Họ và tên <span className="text-[#f87171]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className={errs.fullName ? inputErrCls : inputCls}
                    />
                    <FieldError message={errs.fullName} />
                  </div>

                  {/* Biệt danh */}
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-on-surface-variant">
                      Biệt danh (username)
                    </label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => handleChange('username', e.target.value)}
                      placeholder="vd: tuanngo"
                      className={inputCls}
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-on-surface-variant">
                      Số điện thoại <span className="text-[#f87171]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="0901234567"
                      maxLength={11}
                      className={errs.phone ? inputErrCls : inputCls}
                    />
                    <FieldError message={errs.phone} />
                  </div>
                </div>

                {/* Nút lưu */}
                <div className="mt-4">
                  <button
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                      saved
                        ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30'
                        : dirty
                        ? 'bg-primary hover:bg-primary-hover text-on-primary'
                        : 'bg-surface-container/50 text-outline border border-outline-variant/20 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Đang lưu...</>
                    ) : saved ? (
                      <><span className="material-symbols-outlined text-sm">check_circle</span>Đã lưu</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">save</span>Lưu thay đổi</>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t border-outline-variant/10" />

              {/* Quản lý tài khoản */}
              <div>
                <SectionLabel>Quản lý tài khoản</SectionLabel>

                <div className="space-y-3">
                  <DangerBtn
                    icon={locked ? 'lock_open' : 'lock'}
                    label={locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                    onClick={handleToggleLock}
                    loading={locking}
                    variant={locked ? 'success' : 'warning'}
                  />

                  <DangerBtn
                    icon="key"
                    label="Reset mật khẩu"
                    onClick={handleReset}
                    loading={resetting}
                    variant="info"
                  />
                </div>

                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Khóa tài khoản sẽ ngăn nhân viên đăng nhập. Reset mật khẩu sẽ tạo mật khẩu tạm mới.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {temporaryPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-label="Mật khẩu tạm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Mật khẩu tạm của nhân viên</h3>
            <p className="mt-2 text-sm text-slate-600">Sao chép mật khẩu này ngay. Sau khi đóng, hệ thống sẽ không hiển thị lại.</p>
            <code className="mt-4 block break-all rounded-lg bg-slate-100 p-3 text-sm">{temporaryPassword}</code>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => navigator.clipboard.writeText(temporaryPassword)} className="rounded-lg border px-4 py-2 text-sm">Sao chép</button>
              <button type="button" onClick={() => setTemporaryPassword('')} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getEmployeeByIdApi,
  updateEmployeeApi,
  toggleUserStatusApi,
  resetEmployeePasswordApi,
} from '../../services/user.service'

// ─── Validators ───────────────────────────────────────────────────────────────
const VN_PHONE_RE = /^(0[35789]\d{8}|02\d{9})$/
const FULLNAME_RE = /^[a-zA-ZÀ-ỹ]+(\s+[a-zA-ZÀ-ỹ]+)+$/u

function validateFullName(v) {
  if (!v.trim()) return 'Họ và tên không được để trống'
  if (!FULLNAME_RE.test(v.trim())) return 'Phải có ít nhất 2 từ, chỉ chứa chữ cái'
  return ''
}

function validatePhone(v) {
  if (!v.trim()) return 'Số điện thoại không được để trống'
  if (!VN_PHONE_RE.test(v.trim())) return 'Sai định dạng số Việt Nam (vd: 0901234567)'
  return ''
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = '') {
  return (
    name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'NV'
  )
}

const COLOR_POOL = [
  { bg: 'bg-[#6366f1]/20', text: 'text-[#818cf8]' },
  { bg: 'bg-[#0ea5e9]/20', text: 'text-[#38bdf8]' },
  { bg: 'bg-[#10b981]/20', text: 'text-[#34d399]' },
  { bg: 'bg-[#f59e0b]/20', text: 'text-[#fbbf24]' },
  { bg: 'bg-[#ec4899]/20', text: 'text-[#f472b6]' },
]

function getColor(id = '') {
  const idx = [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % COLOR_POOL.length
  return COLOR_POOL[idx]
}

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// ─── Style classes ────────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-primary/50 transition-colors'

const inputErrCls =
  'w-full bg-surface-container/50 border border-[#f87171]/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-[#f87171]/70 transition-colors'

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-outline-variant/10 last:border-0">
      <span className="material-symbols-outlined text-outline text-[18px] mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
        <p className={`text-sm text-slate-200 break-all ${mono ? 'font-mono' : ''}`}>
          {value || <span className="italic text-outline text-xs">Chưa cập nhật</span>}
        </p>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">{children}</p>
}

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="mt-1 text-[11px] text-[#f87171] flex items-center gap-1">
      <span className="material-symbols-outlined text-[12px]">error</span>
      {message}
    </p>
  )
}

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

function AvatarUploader({ user, avatarPreview, onFileChange }) {
  const fileRef = useRef(null)
  const color = getColor(String(user?.id ?? ''))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-primary/30"
          />
        ) : (
          <div className={`w-24 h-24 rounded-full ${color.bg} flex items-center justify-center ${color.text} font-bold text-2xl border-2 border-primary/30`}>
            {getInitials(user?.fullName)}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-sm">upload</span>
        Thay ảnh đại diện
      </button>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
    </div>
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

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: 'bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]',
    error:   'bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]',
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl ${colors[type]}`}>
      <span className="material-symbols-outlined text-sm">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {message}
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl border border-outline-variant/20 p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#f87171] text-2xl flex-shrink-0">warning</span>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-outline-variant/20 text-sm text-slate-400 hover:bg-surface-container-highest/30 transition-colors"
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

  useEffect(() => { loadUser() }, [id])

  async function loadUser() {
    try {
      setLoading(true)
      const data = await getEmployeeByIdApi(id)
      applyUser(data)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

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
      message: 'Reset mật khẩu về "Bideptrai123@@"? Nhân viên cần đổi mật khẩu sau khi đăng nhập.',
      onConfirm: async () => {
        setConfirm(null)
        setResetting(true)
        try {
          await resetEmployeePasswordApi(id)
          showToast('Đã reset mật khẩu thành công')
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
    <div className="max-w-7xl mx-auto space-y-8 pt-8 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Chi tiết nhân viên</h2>
          <p className="text-slate-400 text-sm mt-1">{user?.email || '...'}</p>
        </div>
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container/50 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Quản lý nhân viên
        </button>
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
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
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
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
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
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
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
                        ? 'bg-primary hover:bg-primary/80 text-white'
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
                  Khóa tài khoản sẽ ngăn nhân viên đăng nhập. Reset mật khẩu sẽ đặt lại mật khẩu mặc định.
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
import { useState, useRef, useEffect, useMemo } from 'react'
import { profileService } from '../../services/profile.service'
import { updateProfileApi, changePasswordApi } from '../../services/user.service'
import { useAuthStore } from '../../store/auth.store'

// ─── Validators ───────────────────────────────────────────────────────────────
const VN_PHONE_RE = /^(0[35789]\d{8}|02\d{9})$/
const FULLNAME_RE = /^[\p{L}]+([\s]+[\p{L}]+)+$/u

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

// ─── Password strength (giống EmployeeModal) ──────────────────────────────────
const PWD_RULES = [
  { id: 'len',     label: 'Ít nhất 8 ký tự',         test: p => p.length >= 8 },
  { id: 'upper',   label: '1 chữ hoa (A–Z)',          test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: '1 chữ thường (a–z)',       test: p => /[a-z]/.test(p) },
  { id: 'number',  label: '1 chữ số (0–9)',           test: p => /\d/.test(p) },
  { id: 'special', label: '1 ký tự đặc biệt (!@#…)', test: p => /[^A-Za-z\d]/.test(p) },
]
const STRENGTH_COLORS = ['', 'bg-[#f87171]', 'bg-[#fb923c]', 'bg-[#fbbf24]', 'bg-[#a3e635]', 'bg-[#4ade80]']

function isPasswordValid(p) { return PWD_RULES.every(r => r.test(p)) }

function PasswordStrength({ password }) {
  const results = useMemo(() => PWD_RULES.map(r => ({ ...r, ok: r.test(password) })), [password])
  const passed  = results.filter(r => r.ok).length
  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${passed >= i ? STRENGTH_COLORS[passed] : 'bg-surface-container-highest/50'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {results.map(r => (
          <div key={r.id} className="flex items-center gap-1.5">
            <span className={`material-symbols-outlined text-[14px] ${r.ok ? 'text-[#4ade80]' : 'text-slate-600'}`}>
              {r.ok ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span className={`text-[11px] ${r.ok ? 'text-slate-400' : 'text-slate-600'}`}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ME'
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
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// ─── Style ────────────────────────────────────────────────────────────────────
const inputCls    = 'w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-primary/50 transition-colors'
const inputErrCls = 'w-full bg-surface-container/50 border border-[#f87171]/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-[#f87171]/70 transition-colors'

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

function PasswordInput({ value, onChange, onBlur, placeholder, error, showToggle }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`${error ? inputErrCls : inputCls} pr-10`}
      />
      {showToggle && (
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-slate-300 transition-colors" tabIndex={-1}>
          <span className="material-symbols-outlined text-[18px]">{show ? 'visibility_off' : 'visibility'}</span>
        </button>
      )}
    </div>
  )
}

function AvatarUploader({ user, avatarPreview, onFileChange }) {
  const fileRef = useRef(null)
  const color   = getColor(String(user?.id ?? ''))
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
        {avatarPreview
          ? <img src={avatarPreview} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-primary/30" />
          : <div className={`w-24 h-24 rounded-full ${color.bg} flex items-center justify-center ${color.text} font-bold text-2xl border-2 border-primary/30`}>{getInitials(user?.fullName)}</div>
        }
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
        </div>
      </div>
      <button type="button" onClick={() => fileRef.current?.click()}
        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">upload</span>
        Thay ảnh đại diện
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  const colors = { success: 'bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]', error: 'bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]' }
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl ${colors[type]}`}>
      <span className="material-symbols-outlined text-sm">{type === 'success' ? 'check_circle' : 'error'}</span>
      {message}
    </div>
  )
}

function SkeletonDetail() {
  return (
    <div className="glass-panel max-w-5xl mx-auto rounded-2xl border border-outline-variant/20 overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-surface-container-highest/50" />
          <div className="w-full space-y-3 mt-4">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded bg-surface-container-highest/50" />)}</div>
        </div>
        <div className="p-6 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-12 rounded bg-surface-container-highest/50" />)}</div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const INIT_PWD  = { current: '', newPwd: '', confirm: '' }
const INIT_PERR = { current: '', newPwd: '', confirm: '' }

export default function Profile () {
  const [user, setUser]                 = useState(null)
  const [loading, setLoading]           = useState(true)
  const [form, setForm]                 = useState({ fullName: '', username: '', phone: '' })
  const [errs, setErrs]                 = useState({ fullName: '', phone: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile]     = useState(null)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [pwd, setPwd]                   = useState(INIT_PWD)
  const [pwdErrs, setPwdErrs]           = useState(INIT_PERR)
  const [pwdTouched, setPwdTouched]     = useState({})
  const [changingPwd, setChangingPwd]   = useState(false)
  const [pwdSaved, setPwdSaved]         = useState(false)
  const [toast, setToast]               = useState(null)
  const setStoreUser = useAuthStore((state) => state.setUser)
  
  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const data = await profileService.getMe()
      applyUser(data)
    } catch (err) {
      showToast(err.message || 'Không thể tải thông tin', 'error')
    } finally {
      setLoading(false)
    }
  }

  function applyUser(data) {
    setUser(data)
    setForm({ fullName: data.fullName || '', username: data.username || '', phone: data.phone || '' })
    setErrs({ fullName: '', phone: '' })
    setAvatarPreview(data.avatarUrl || null)
    setAvatarFile(null)
  }

  function showToast(message, type = 'success') { setToast({ message, type }) }

  // ── Info form ────────────────────────────────────────────────────────────────
  function handleChange(name, value) {
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'fullName') setErrs(e => ({ ...e, fullName: validateFullName(value) }))
    if (name === 'phone')    setErrs(e => ({ ...e, phone:    validatePhone(value) }))
  }

  const hasErr = !!(errs.fullName || errs.phone)
  const dirty  = user != null && !hasErr && (
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
    const newErrs = { fullName: validateFullName(form.fullName), phone: validatePhone(form.phone) }
    setErrs(newErrs)
    if (Object.values(newErrs).some(e => e)) return

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('fullName', form.fullName)
      fd.append('username', form.username)
      fd.append('phone',    form.phone)
      if (avatarFile) fd.append('avatar', avatarFile)
      const updated = await updateProfileApi(fd)
      applyUser(updated)
      setStoreUser(updated)

      setSaved(true)
      showToast('Đã lưu thông tin thành công')
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Password form ────────────────────────────────────────────────────────────
  function validatePwdField(name, value) {
    if (name === 'current') return value.trim() ? '' : 'Mật khẩu hiện tại không được để trống'
    if (name === 'newPwd')  return isPasswordValid(value) ? '' : 'Mật khẩu chưa đủ điều kiện'
    if (name === 'confirm') return value === pwd.newPwd ? '' : 'Mật khẩu xác nhận không khớp'
    return ''
  }

  function handlePwdChange(name, value) {
    setPwd(p => ({ ...p, [name]: value }))
    if (pwdTouched[name]) {
      setPwdErrs(e => ({ ...e, [name]: validatePwdField(name, value) }))
    }
    // Revalidate confirm when newPwd changes
    if (name === 'newPwd' && pwdTouched.confirm) {
      setPwdErrs(e => ({ ...e, confirm: value === pwd.confirm ? '' : 'Mật khẩu xác nhận không khớp' }))
    }
  }

  function handlePwdBlur(name) {
    setPwdTouched(t => ({ ...t, [name]: true }))
    setPwdErrs(e => ({ ...e, [name]: validatePwdField(name, pwd[name]) }))
  }

  const pwdCanSubmit =
    pwd.current.trim() &&
    isPasswordValid(pwd.newPwd) &&
    pwd.confirm === pwd.newPwd &&
    !Object.values(pwdErrs).some(e => e)

  async function handleChangePassword() {
    // Validate all fields first
    const allErrs = {
      current: validatePwdField('current', pwd.current),
      newPwd:  validatePwdField('newPwd',  pwd.newPwd),
      confirm: validatePwdField('confirm', pwd.confirm),
    }
    setPwdErrs(allErrs)
    setPwdTouched({ current: true, newPwd: true, confirm: true })
    if (Object.values(allErrs).some(e => e)) return

    setChangingPwd(true)
    try {
      await changePasswordApi({ currentPassword: pwd.current, newPassword: pwd.newPwd })
      setPwd(INIT_PWD)
      setPwdErrs(INIT_PERR)
      setPwdTouched({})
      setPwdSaved(true)
      showToast('Đổi mật khẩu thành công')
      setTimeout(() => setPwdSaved(false), 2000)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setChangingPwd(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-8 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Cài đặt tài khoản</h2>
        <p className="text-slate-400 text-sm mt-1">{user?.email || '...'}</p>
      </div>

      {loading && <SkeletonDetail />}

      {!loading && user && (
        <div className="glass-panel max-w-5xl mx-auto rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">

            {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
            <div className="p-6 flex flex-col gap-6">
              <AvatarUploader user={user} avatarPreview={avatarPreview} onFileChange={handleFileChange} />

              {/* Badge vai trò */}
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  <span className="material-symbols-outlined text-[12px]">person</span>
                  {user.roleName === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                </span>
              </div>

              {/* Thông tin tài khoản */}
              <div>
                <SectionLabel>Thông tin tài khoản</SectionLabel>
                <InfoRow icon="mail"            label="Email"             value={user.email}                   mono />
                <InfoRow icon="login"           label="Truy cập lần cuối" value={formatDate(user.lastLoginAt)}      />
                <InfoRow icon="calendar_add_on" label="Ngày tạo"          value={formatDate(user.createdAt)}        />
                <InfoRow icon="update"          label="Cập nhật lần cuối" value={formatDate(user.updatedAt)}        />
              </div>
            </div>

            {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
            <div className="p-6 flex flex-col gap-6">

              {/* ── Chỉnh sửa thông tin ─────────────────────────────────────── */}
              <div>
                <SectionLabel>Chỉnh sửa thông tin</SectionLabel>
                <div className="space-y-4">

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

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Biệt danh (username)</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => handleChange('username', e.target.value)}
                      placeholder="vd: nguyenvana"
                      className={inputCls}
                    />
                  </div>

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

                <div className="mt-4">
                  <button
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                      saved  ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30'
                      : dirty ? 'bg-primary hover:bg-primary/80 text-white'
                              : 'bg-surface-container/50 text-outline border border-outline-variant/20 cursor-not-allowed'
                    }`}
                  >
                    {saving ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Đang lưu...</>
                    : saved  ? <><span className="material-symbols-outlined text-sm">check_circle</span>Đã lưu</>
                             : <><span className="material-symbols-outlined text-sm">save</span>Lưu thay đổi</>}
                  </button>
                </div>
              </div>

              <div className="border-t border-outline-variant/10" />

              {/* ── Đổi mật khẩu ────────────────────────────────────────────── */}
              <div>
                <SectionLabel>Đổi mật khẩu</SectionLabel>
                <div className="space-y-4">

                  {/* Mật khẩu hiện tại */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
                      Mật khẩu hiện tại <span className="text-[#f87171]">*</span>
                    </label>
                    <PasswordInput
                      value={pwd.current}
                      onChange={e => handlePwdChange('current', e.target.value)}
                      onBlur={() => handlePwdBlur('current')}
                      placeholder="Nhập mật khẩu hiện tại"
                      error={pwdTouched.current && pwdErrs.current}
                      showToggle
                    />
                    <FieldError message={pwdTouched.current ? pwdErrs.current : ''} />
                  </div>

                  {/* Mật khẩu mới */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
                      Mật khẩu mới <span className="text-[#f87171]">*</span>
                    </label>
                    <PasswordInput
                      value={pwd.newPwd}
                      onChange={e => { setPwdTouched(t => ({ ...t, newPwd: true })); handlePwdChange('newPwd', e.target.value) }}
                      onBlur={() => handlePwdBlur('newPwd')}
                      placeholder="Tối thiểu 8 ký tự"
                      error={pwdTouched.newPwd && !isPasswordValid(pwd.newPwd) && pwd.newPwd}
                      showToggle
                    />
                    <PasswordStrength password={pwd.newPwd} />
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
                      Xác nhận mật khẩu mới <span className="text-[#f87171]">*</span>
                    </label>
                    <PasswordInput
                      value={pwd.confirm}
                      onChange={e => handlePwdChange('confirm', e.target.value)}
                      onBlur={() => handlePwdBlur('confirm')}
                      placeholder="Nhập lại mật khẩu mới"
                      error={pwdTouched.confirm && pwdErrs.confirm}
                      showToggle
                    />
                    <FieldError message={pwdTouched.confirm ? pwdErrs.confirm : ''} />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={!pwdCanSubmit || changingPwd}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                      pwdSaved     ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30'
                      : pwdCanSubmit ? 'bg-primary hover:bg-primary/80 text-white'
                                    : 'bg-surface-container/50 text-outline border border-outline-variant/20 cursor-not-allowed'
                    }`}
                  >
                    {changingPwd ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Đang đổi...</>
                    : pwdSaved   ? <><span className="material-symbols-outlined text-sm">check_circle</span>Đổi thành công</>
                                 : <><span className="material-symbols-outlined text-sm">lock_reset</span>Đổi mật khẩu</>}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
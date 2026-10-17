import { useState, useEffect, useMemo } from 'react'
import { validateFullName, validatePhone, formatDate } from '../../utils/userDetail.utils'
import { InfoRow, SectionLabel, FieldError, AvatarUploader, Toast } from '../../components/UserDetail/UserDetailUI'
import { profileService } from '../../services/profile.service'
import { updateProfileApi, changePasswordApi } from '../../services/user.service'
import { useAuthStore } from '../../store/auth.store'

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

// ─── Style ────────────────────────────────────────────────────────────────────
const inputCls    = 'w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder-outline outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors'
const inputErrCls = 'w-full bg-white border border-[#f87171]/50 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder-outline outline-none focus:border-[#f87171]/70 transition-colors'

// ─── Sub-components ───────────────────────────────────────────────────────────
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
  
  useEffect(() => {
    let active = true
    profileService.getMe()
      .then((data) => {
        if (!active) return
        setUser(data)
        setForm({ fullName: data.fullName || '', username: data.username || '', phone: data.phone || '' })
        setAvatarPreview(data.avatarUrl || null)
      })
      .catch((err) => {
        if (active) setToast({ message: err.message || 'Không thể tải thông tin', type: 'error' })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-on-background">Cài đặt tài khoản</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{user?.email || '...'}</p>
      </div>

      {loading && <SkeletonDetail />}

      {!loading && user && (
        <div className="glass-panel max-w-5xl mx-auto rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">

            {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
            <div className="p-6 flex flex-col gap-6">
              <AvatarUploader user={user} avatarPreview={avatarPreview} onFileChange={handleFileChange} fallbackInitials="ME" />

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

                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-on-surface-variant">Biệt danh (username)</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => handleChange('username', e.target.value)}
                      placeholder="vd: nguyenvana"
                      className={inputCls}
                    />
                  </div>

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

                <div className="mt-4">
                  <button
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                      saved  ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30'
                      : dirty ? 'bg-primary hover:bg-primary-hover text-on-primary'
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
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-on-surface-variant">
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
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-on-surface-variant">
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
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-on-surface-variant">
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
                      : pwdCanSubmit ? 'bg-primary hover:bg-primary-hover text-on-primary'
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

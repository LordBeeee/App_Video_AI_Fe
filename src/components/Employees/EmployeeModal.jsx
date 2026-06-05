import { useState, useMemo } from 'react'

// ─── helpers ──────────────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-primary/50 transition-colors'

const inputErrCls =
  'w-full bg-surface-container/50 border border-[#f87171]/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-[#f87171]/70 transition-colors'

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-[#f87171]">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-[#f87171] flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Validators ───────────────────────────────────────────────────────────────
const VN_PHONE_RE = /^(0[35789]\d{8}|02\d{9})$/
// Họ và tên: ít nhất 2 từ, mỗi từ chỉ có chữ cái (gồm tiếng Việt)
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

function validateEmail(v) {
  if (!v.trim()) return 'Email không được để trống'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email không hợp lệ'
  return ''
}

// ─── Password strength ────────────────────────────────────────────────────────
const PWD_RULES = [
  { id: 'len',     label: 'Ít nhất 8 ký tự',          test: p => p.length >= 8 },
  { id: 'upper',   label: '1 chữ hoa (A–Z)',           test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: '1 chữ thường (a–z)',        test: p => /[a-z]/.test(p) },
  { id: 'number',  label: '1 chữ số (0–9)',            test: p => /\d/.test(p) },
  { id: 'special', label: '1 ký tự đặc biệt (!@#…)',  test: p => /[^A-Za-z\d]/.test(p) },
]

const STRENGTH_COLORS = ['bg-transparent', 'bg-[#f87171]', 'bg-[#fb923c]', 'bg-[#fbbf24]', 'bg-[#a3e635]', 'bg-[#4ade80]']

function PasswordStrength({ password }) {
  const results = useMemo(() => PWD_RULES.map(r => ({ ...r, ok: r.test(password) })), [password])
  const passed  = results.filter(r => r.ok).length
  const color   = STRENGTH_COLORS[passed]

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${passed >= i ? color : 'bg-surface-container-highest/50'}`} />
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

function isPasswordValid(p) { return PWD_RULES.every(r => r.test(p)) }

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const INITIAL_FORM  = { fullName: '', email: '', phone: '', password: '' }
const INITIAL_ERRS  = { fullName: '', email: '', phone: '', password: '' }

export default function EmployeeModal({ show, onClose, onSubmit, submitting, error }) {
  const [form, setForm]         = useState(INITIAL_FORM)
  const [errs, setErrs]         = useState(INITIAL_ERRS)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched]   = useState({})

  // Validate một field khi blur hoặc khi submit
  function validate(name, value) {
    switch (name) {
      case 'fullName': return validateFullName(value)
      case 'email':    return validateEmail(value)
      case 'phone':    return validatePhone(value)
      case 'password': return isPasswordValid(value) ? '' : 'Mật khẩu chưa đủ điều kiện'
      default: return ''
    }
  }

  function handleChange(name, value) {
    setForm(f => ({ ...f, [name]: value }))
    if (touched[name]) {
      setErrs(e => ({ ...e, [name]: validate(name, value) }))
    }
  }

  function handleBlur(name) {
    setTouched(t => ({ ...t, [name]: true }))
    setErrs(e => ({ ...e, [name]: validate(name, form[name]) }))
  }

  function validateAll() {
    const newErrs = {
      fullName: validate('fullName', form.fullName),
      email:    validate('email',    form.email),
      phone:    validate('phone',    form.phone),
      password: validate('password', form.password),
    }
    setErrs(newErrs)
    setTouched({ fullName: true, email: true, phone: true, password: true })
    return Object.values(newErrs).every(e => !e)
  }

  const canSubmit = !Object.values(errs).some(e => e) &&
    form.fullName && form.email && form.phone && form.password && isPasswordValid(form.password)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateAll()) return
    onSubmit(form, () => { setForm(INITIAL_FORM); setErrs(INITIAL_ERRS); setTouched({}) })
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && onClose()} />

      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-outline-variant/20 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person_add</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Tạo nhân viên</h3>
              <p className="text-xs text-slate-400">Điền thông tin để thêm nhân viên mới</p>
            </div>
          </div>
          <button onClick={onClose} disabled={submitting} className="p-1.5 rounded-lg hover:bg-surface-container-highest text-outline hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Họ và tên */}
          <Field label="Họ và tên" required error={errs.fullName}>
            <input
              type="text"
              value={form.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="Nguyễn Văn A"
              className={errs.fullName ? inputErrCls : inputCls}
            />
          </Field>

          {/* Email */}
          <Field label="Email" required error={errs.email}>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="nhanvien@company.com"
              className={errs.email ? inputErrCls : inputCls}
            />
          </Field>

          {/* Số điện thoại — bắt buộc */}
          <Field label="Số điện thoại" required error={errs.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
              onBlur={() => handleBlur('phone')}
              placeholder="0901234567"
              maxLength={11}
              className={errs.phone ? inputErrCls : inputCls}
            />
          </Field>

          {/* Mật khẩu */}
          <Field label="Mật khẩu" required error={errs.password && touched.password && isPasswordValid(form.password) ? errs.password : ''}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => { setTouched(t => ({ ...t, password: true })); handleChange('password', e.target.value) }}
                onBlur={() => handleBlur('password')}
                placeholder="Tối thiểu 8 ký tự"
                className={`${touched.password && !isPasswordValid(form.password) && form.password ? inputErrCls : inputCls} pr-10`}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-slate-300 transition-colors" tabIndex={-1}>
                <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </Field>

          {/* Server error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg">
              <span className="material-symbols-outlined text-[#f87171] text-sm">error</span>
              <span className="text-[#f87171] text-sm">{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm text-slate-300 hover:bg-surface-container-highest transition-colors disabled:opacity-50">
              Hủy
            </button>
            <button type="submit" disabled={submitting || !canSubmit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting
                ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Đang tạo...</>
                : <><span className="material-symbols-outlined text-sm">check</span> Tạo nhân viên</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
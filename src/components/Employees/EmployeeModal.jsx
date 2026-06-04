const INITIAL_FORM = { fullName: '', email: '', phone: '', password: '' }

export default function EmployeeModal({ show, onClose, onSubmit, submitting, error }) {
  const [form, setForm] = useState(INITIAL_FORM)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form, () => setForm(INITIAL_FORM))
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-outline-variant/20 p-6 shadow-2xl">

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
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-surface-container-highest text-outline hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Họ và tên" required>
            <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Nguyễn Văn A" required className={inputCls} />
          </Field>

          <Field label="Email" required>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="nhanvien@company.com" required className={inputCls} />
          </Field>

          <Field label="Số điện thoại">
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="0901 234 567" className={inputCls} />
          </Field>

          <Field label="Mật khẩu" required>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Tối thiểu 6 ký tự" required minLength={6} className={inputCls} />
          </Field>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg">
              <span className="material-symbols-outlined text-[#f87171] text-sm">error</span>
              <span className="text-[#f87171] text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant/20 text-sm text-slate-300 hover:bg-surface-container-highest transition-colors disabled:opacity-50">
              Hủy
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting
                ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Đang tạo...</>
                : <><span className="material-symbols-outlined text-sm">check</span> Tạo nhân viên</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// helpers nội bộ
import { useState } from 'react'

const inputCls = 'w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-outline outline-none focus:border-primary/50 transition-colors'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-[#f87171]">*</span>}
      </label>
      {children}
    </div>
  )
}
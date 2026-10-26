import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { validateFullName, validatePhone, formatDate } from '../../utils/userDetail.utils'
import {
  getEmployeeByIdApi,
  updateEmployeeApi,
  toggleUserStatusApi,
  resetEmployeePasswordApi,
} from '../../services/user.service'
import { Card, Avatar, Skeleton, ErrorBox } from '../../components/Aurora/AuroraUI'
import useUploadLimits from '../../hooks/useUploadLimits'
import { formatUploadLimit } from '../../services/asset.service'

function Field({ id, label, required, error, className = '', children }) {
  return (
    <div className={className}>
      <label className="au-lbl" htmlFor={id}>{label}{required && <b> *</b>}</label>
      {children}
      {error && <p className="au-fe"><span className="material-symbols-outlined">error</span>{error}</p>}
    </div>
  )
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <div className="au-ir">
      <span className="au-ir-i"><span className="material-symbols-outlined">{icon}</span></span>
      <div className="au-min0">
        <small>{label}</small>
        <p className={mono ? 'mono' : ''}>{value || 'Chưa cập nhật'}</p>
      </div>
    </div>
  )
}

function AvatarPick({ user, preview, onChange }) {
  const ref = useRef(null)
  const name = user?.fullName || user?.email || ''
  return (
    <>
      <button type="button" className="au-avp" onClick={() => ref.current?.click()} aria-label="Thay ảnh đại diện">
        <Avatar name={name} src={preview} size={96} onInk />
        <i><span className="material-symbols-outlined">photo_camera</span></i>
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onChange} />
      <button type="button" className="au-btn sm" onClick={() => ref.current?.click()}>
        <span className="material-symbols-outlined">upload</span>Thay ảnh đại diện
      </button>
    </>
  )
}

function AuToast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`au-toast${type === 'error' ? ' bad' : ''}`} role="status">
      <span className="material-symbols-outlined">{type === 'error' ? 'error' : 'check_circle'}</span>
      <span>{message}</span>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="au-mo" role="dialog" aria-modal="true" aria-label="Xác nhận" onClick={onCancel}>
      <div className="au-mo-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="au-mo-h">
          <span className="au-mo-ic"><span className="material-symbols-outlined">warning</span></span>
          <h3 className="au-mo-t au-fd">Xác nhận thao tác</h3>
        </div>
        <p className="au-mo-p">{message}</p>
        <div className="au-mo-a">
          <button type="button" className="au-btn" onClick={onCancel}>Hủy</button>
          <button type="button" className="au-btn solid" onClick={onConfirm}>Xác nhận</button>
        </div>
      </div>
    </div>
  )
}

function PasswordModal({ password, onClose }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="au-mo" role="dialog" aria-modal="true" aria-label="Mật khẩu tạm">
      <div className="au-mo-box" style={{ maxWidth: 440 }}>
        <div className="au-mo-h">
          <span className="au-mo-ic"><span className="material-symbols-outlined">key</span></span>
          <h3 className="au-mo-t au-fd">Mật khẩu tạm của nhân viên</h3>
        </div>
        <p className="au-mo-p">Sao chép mật khẩu này ngay. Sau khi đóng, hệ thống sẽ không hiển thị lại.</p>
        <code className="au-code">{password}</code>
        <div className="au-mo-a">
          <button type="button" className="au-btn" onClick={copy}>
            <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>{copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
          <button type="button" className="au-btn solid" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="au-dt">
      <Skeleton h={460} className="au-dt-sk" />
      <div className="au-col">
        <Skeleton h={300} className="au-dt-sk" />
        <Skeleton h={170} className="au-dt-sk" />
      </div>
    </div>
  )
}

export default function EmployeeDetail() {
  const uploadLimits = useUploadLimits()
  const { id } = useParams()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({ fullName: '', username: '', phone: '' })
  const [errs, setErrs] = useState({ fullName: '', phone: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [locking, setLocking] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [temporaryPassword, setTemporaryPassword] = useState('')

  const applyUser = useCallback((data) => {
    setUser(data)
    setForm({ fullName: data.fullName || '', username: data.username || '', phone: data.phone || '' })
    setErrs({ fullName: '', phone: '' })
    setAvatarPreview(data.avatarUrl || null)
    setAvatarFile(null)
  }, [])

  const load = useCallback(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    getEmployeeByIdApi(id)
      .then((data) => { if (active) applyUser(data) })
      .catch((err) => { if (active) setLoadError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, applyUser])

  useEffect(() => load(), [load])

  const closeToast = useCallback(() => setToast(null), [])
  const showToast = (message, type = 'success') => setToast({ message, type })

  const locked = user?.status === 'banned'

  function handleChange(name, value) {
    setForm((f) => ({ ...f, [name]: value }))
    if (name === 'fullName') setErrs((e) => ({ ...e, fullName: validateFullName(value) }))
    if (name === 'phone') setErrs((e) => ({ ...e, phone: validatePhone(value) }))
  }

  const hasErr = !!(errs.fullName || errs.phone)

  const dirty = user != null && !hasErr && (
    form.fullName !== (user.fullName || '') ||
    form.username !== (user.username || '') ||
    form.phone !== (user.phone || '') ||
    avatarFile !== null
  )

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > uploadLimits.image) {
      showToast(`Ảnh đại diện không được vượt quá ${formatUploadLimit(uploadLimits.image)}`, 'error')
      e.target.value = ''
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    const newErrs = { fullName: validateFullName(form.fullName), phone: validatePhone(form.phone) }
    setErrs(newErrs)
    if (Object.values(newErrs).some((e) => e)) return

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('fullName', form.fullName)
      fd.append('username', form.username)
      fd.append('phone', form.phone)
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

  function handleToggleLock() {
    const action = locked ? 'mở khóa' : 'khóa'
    setConfirm({
      message: `Bạn có chắc muốn ${action} tài khoản "${user?.fullName || user?.email}"?`,
      onConfirm: async () => {
        setConfirm(null)
        setLocking(true)
        try {
          const result = await toggleUserStatusApi(id)
          setUser((prev) => ({ ...prev, status: result.status }))
          showToast(`Đã ${action} tài khoản thành công`)
        } catch (err) {
          showToast(err.message, 'error')
        } finally {
          setLocking(false)
        }
      },
    })
  }

  function handleReset() {
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

  const spin = <span className="material-symbols-outlined au-spin">progress_activity</span>

  return (
    <div className="au scroll">
      <header className="au-head2">
        <div className="au-tools">
          <Link to="/employees" className="au-back" title="Quản lý nhân sự" aria-label="Quay lại">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="au-min0">
            <h1 className="au-title au-fd">Chi tiết nhân sự</h1>
          </div>
        </div>
        <div className="au-tools">
          <Link to={`/employees/${id}/ai-usage`} className="au-btn solid">
            <span className="material-symbols-outlined">monitoring</span>Chi tiết chi tiêu
          </Link>
        </div>
      </header>

      {loading && <DetailSkeleton />}

      {!loading && loadError && <ErrorBox message={loadError} onRetry={load} />}

      {!loading && user && (
        <div className="au-dt">
          <Card tone="dark" className="au-dt-prof">
            <AvatarPick user={user} preview={avatarPreview} onChange={handleFileChange} />
            <div className="au-dt-nm">
              <h2 className="au-fd">{user.fullName || user.email}</h2>
              <p>{user.email}</p>
            </div>
            <span className={`au-tg ${locked ? 'red' : 'ink'}`}>
              <span className="material-symbols-outlined">{locked ? 'lock' : 'check_circle'}</span>
              {locked ? 'Đã khóa' : 'Hoạt động'}
            </span>
            <div className="au-ir-l">
              <InfoRow icon="mail" label="Email" value={user.email} mono />
              <InfoRow icon="login" label="Truy cập lần cuối" value={formatDate(user.lastLoginAt)} />
              <InfoRow icon="calendar_add_on" label="Ngày tạo" value={formatDate(user.createdAt)} />
              <InfoRow icon="update" label="Cập nhật lần cuối" value={formatDate(user.updatedAt)} />
            </div>
          </Card>

          <div className="au-col">
            <Card icon="badge" title="Chỉnh sửa thông tin">
              <div className="au-fgrid">
                <Field id="emp-fullname" label="Họ và tên" required error={errs.fullName} className="full">
                  <input
                    id="emp-fullname"
                    type="text"
                    className={`au-in${errs.fullName ? ' bad' : ''}`}
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </Field>
                <Field id="emp-username" label="Biệt danh (username)">
                  <input
                    id="emp-username"
                    type="text"
                    className="au-in"
                    value={form.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="vd: tuanngo"
                  />
                </Field>
                <Field id="emp-phone" label="Số điện thoại" required error={errs.phone}>
                  <input
                    id="emp-phone"
                    type="tel"
                    className={`au-in${errs.phone ? ' bad' : ''}`}
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="0901234567"
                    maxLength={11}
                  />
                </Field>
              </div>
              <button type="button" className={`au-btn wide au-save${saved ? ' ok' : ' solid'}`} onClick={handleSave} disabled={!dirty || saving}>
                {saving ? <>{spin}Đang lưu...</> : saved ? <><span className="material-symbols-outlined">check_circle</span>Đã lưu</> : <><span className="material-symbols-outlined">save</span>Lưu thay đổi</>}
              </button>
            </Card>

            <Card icon="manage_accounts" title="Quản lý tài khoản">
              <div className="au-acts">
                <button type="button" className={`au-btn wide ${locked ? 'ok' : 'danger'}`} onClick={handleToggleLock} disabled={locking}>
                  {locking ? spin : <span className="material-symbols-outlined">{locked ? 'lock_open' : 'lock'}</span>}
                  {locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                </button>
                <button type="button" className="au-btn wide" onClick={handleReset} disabled={resetting}>
                  {resetting ? spin : <span className="material-symbols-outlined">key</span>}
                  Reset mật khẩu
                </button>
              </div>
              <p className="au-hint">Khóa tài khoản sẽ ngăn nhân viên đăng nhập. Reset mật khẩu sẽ tạo mật khẩu tạm mới.</p>
            </Card>
          </div>
        </div>
      )}

      {toast && <AuToast message={toast.message} type={toast.type} onClose={closeToast} />}
      {temporaryPassword && <PasswordModal password={temporaryPassword} onClose={() => setTemporaryPassword('')} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  )
}

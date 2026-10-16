const VN_PHONE_RE = /^(0[35789]\d{8}|02\d{9})$/
const FULLNAME_RE = /^[a-zA-ZÀ-ỹ]+(\s+[a-zA-ZÀ-ỹ]+)+$/u

export function validateFullName(v) {
  if (!v.trim()) return 'Họ và tên không được để trống'
  if (!FULLNAME_RE.test(v.trim())) return 'Phải có ít nhất 2 từ, chỉ chứa chữ cái'
  return ''
}

export function validatePhone(v) {
  if (!v.trim()) return 'Số điện thoại không được để trống'
  if (!VN_PHONE_RE.test(v.trim())) return 'Sai định dạng số Việt Nam (vd: 0901234567)'
  return ''
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getInitials(name = '', fallback = 'NV') {
  return (
    name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || fallback
  )
}

const COLOR_POOL = [
  { bg: 'bg-primary-container', text: 'text-primary-hover' },
]

export function getColor(id = '') {
  const idx = [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % COLOR_POOL.length
  return COLOR_POOL[idx]
}

export function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}


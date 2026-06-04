import { COLOR_CLASSES } from '../constants/employee'

export function getInitials(fullName) {
  if (!fullName) return '?'
  const parts = fullName.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function getColor(id) {
  return COLOR_CLASSES[id % COLOR_CLASSES.length]
}

export function formatLastLogin(date) {
  if (!date) return 'Chưa đăng nhập'
  const d      = new Date(date)
  const now    = new Date()
  const diffMs  = now - d
  const diffMin = Math.floor(diffMs / 60_000)
  const diffH   = Math.floor(diffMs / 3_600_000)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ap = d.getHours() < 12 ? 'AM' : 'PM'
  const time = `${hh}:${mm} ${ap}`
  if (diffMin < 5)  return 'Hiện tại'
  if (diffH  < 24)  return `${time}, ${d.toLocaleDateString('vi-VN')}`
  if (diffH  < 48)  return `Hôm qua, ${time}`
  return `${time}, ${d.toLocaleDateString('vi-VN')}`
}

export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
}
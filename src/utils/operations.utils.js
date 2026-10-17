export function timeAgo(date) {
  if (!date) return '—'
  const s = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (s < 60) return 'Vừa xong'
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`
  return `${Math.floor(s / 86400)} ngày trước`
}

export const HEALTH = {
  ok:       { label: 'Ổn định',       dot: 'bg-green-500',   cls: 'bg-green-50 text-green-700' },
  degraded: { label: 'Suy giảm',      dot: 'bg-amber-500',   cls: 'bg-amber-50 text-amber-700' },
  down:     { label: 'Lỗi nghiêm trọng', dot: 'bg-red-500', cls: 'bg-red-50 text-red-700' },
  idle:     { label: 'Chưa có hoạt động', dot: 'bg-outline', cls: 'bg-surface-variant text-on-surface-variant' },
}

export const TASK_STATUS = {
  pending:    { label: 'Chờ xử lý',  cls: 'bg-primary-container text-on-primary-container' },
  queued:     { label: 'Trong hàng đợi', cls: 'bg-primary-container text-on-primary-container' },
  processing: { label: 'Đang xử lý', cls: 'bg-primary-container text-on-primary-container' },
  running:    { label: 'Đang chạy',  cls: 'bg-primary-container text-on-primary-container' },
  succeeded:  { label: 'Thành công', cls: 'bg-green-50 text-green-700' },
  failed:     { label: 'Lỗi',        cls: 'bg-red-50 text-red-700' },
}

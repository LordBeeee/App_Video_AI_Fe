export const TASK_META = {
  chat:  { label: 'Chat AI',  icon: 'chat_bubble',    color: '#f38820' },
  image: { label: 'Tạo ảnh',  icon: 'image',          color: '#ffad5c' },
  video: { label: 'Tạo video', icon: 'smart_display', color: '#bd5706' },
  audio: { label: 'Giọng nói', icon: 'graphic_eq',    color: '#8a7c71' },
}

export const taskLabel = (m) => TASK_META[m]?.label || m
export const taskColor = (m) => TASK_META[m]?.color || '#8a7c71'

export const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + ' ₫'
export const formatNum = (n) => new Intl.NumberFormat('vi-VN').format(n || 0)
export const formatCompact = (n) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)
export const formatPct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '—')

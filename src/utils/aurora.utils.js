export const AU_RANGES = [
  { d: 7, l: '7 ngày' },
  { d: 30, l: '30 ngày' },
  { d: 90, l: '90 ngày' },
  { d: 365, l: '12 tháng' },
]

export const AU_TASK = {
  chat: { label: 'Chat AI', color: '#2E241D' },
  image: { label: 'Tạo ảnh', color: '#FFCBA0' },
  video: { label: 'Tạo video', color: '#FF7A1A' },
  audio: { label: 'Giọng nói', color: '#C2410C' },
}

export const auTaskLabel = (m) => AU_TASK[m]?.label || m
export const auTaskColor = (m) => AU_TASK[m]?.color || '#6B5444'

function dec(n, d) {
  const s = n.toFixed(d).replace('.', ',')
  return s.includes(',') ? s.replace(/,?0+$/, '') : s
}

export function moneyParts(n, d = 1) {
  const v = Math.abs(n || 0)
  if (v >= 1e9) return { v: dec(n / 1e9, d), u: 'tỷ' }
  if (v >= 1e6) return { v: dec(n / 1e6, d), u: 'triệu' }
  if (v >= 1e3) return { v: dec(n / 1e3, 0), u: 'nghìn' }
  return { v: String(Math.round(n || 0)), u: '₫' }
}

export function moneyShort(n, d = 1) {
  const v = Math.abs(n || 0)
  if (v >= 1e9) return `${dec(n / 1e9, d)} tỷ`
  if (v >= 1e6) return `${dec(n / 1e6, d)}tr`
  if (v >= 1e3) return `${dec(n / 1e3, v >= 1e5 ? 0 : 1)}k`
  return `${Math.round(n || 0)}₫`
}

export function axisMoney(n) {
  return n ? moneyShort(n) : '0'
}

export const pctOf = (a, b) => (b ? Math.round((a / b) * 100) : 0)

export const dayLabel = (day = '') => `${day.slice(8, 10)}/${day.slice(5, 7)}`

export function niceScale(max, n = 3) {
  const raw = (max || 1) / n
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / mag
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag
  return { step, top: step * n }
}

export const AU_TASK_DARK = {
  chat: '#FFFFFF',
  image: '#FFCBA0',
  video: '#FF7A1A',
  audio: '#C2410C',
}

export const MIN_SAMPLE = 5

export function priceDelta(r) {
  if (r.teamAvgCost === null || r.teamAvgCost === undefined) return { kind: 'na', text: 'Chưa có mốc' }
  if (r.requests < MIN_SAMPLE || r.teamRequests < MIN_SAMPLE) {
    return { kind: 'na', text: 'Mẫu nhỏ', title: `Cần ít nhất ${MIN_SAMPLE} yêu cầu ở cả hai bên` }
  }
  const diff = r.teamAvgCost ? Math.round(((r.avgCost - r.teamAvgCost) / r.teamAvgCost) * 100) : 0
  if (diff === 0) return { kind: 'eq', text: 'Ngang nhóm' }
  return { kind: diff > 0 ? 'up' : 'down', text: `${diff > 0 ? '+' : ''}${diff}%` }
}

export function priceIndex(rows = []) {
  const base = rows.filter((r) => r.teamAvgCost && r.requests >= MIN_SAMPLE && r.teamRequests >= MIN_SAMPLE)
  const expected = base.reduce((s, r) => s + r.requests * r.teamAvgCost, 0)
  const actual = base.reduce((s, r) => s + r.cost, 0)
  if (!expected) return null
  return Math.round((actual / expected - 1) * 100)
}

export function priceIndexText(idx) {
  if (idx === null || idx === undefined) return 'Chưa đủ mẫu để so với nhóm'
  if (idx === 0) return 'Ngang mức giá của nhóm'
  return idx > 0 ? `Cao hơn nhóm ${idx}%` : `Thấp hơn nhóm ${-idx}%`
}

export const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export const pct100 = (v) => (v === null || v === undefined ? null : Math.round(v * 100))

export function effScore(successRate, retryRate) {
  if (successRate === null || successRate === undefined) return null
  return Math.round(100 * (0.7 * successRate + 0.3 * (1 - (retryRate || 0))))
}

export function secText(s) {
  if (s === null || s === undefined || !Number.isFinite(s)) return '—'
  if (s < 1) return '<1s'
  if (s < 60) return `${Math.round(s)}s`
  return `${Math.floor(s / 60)}p${String(Math.round(s % 60)).padStart(2, '0')}s`
}

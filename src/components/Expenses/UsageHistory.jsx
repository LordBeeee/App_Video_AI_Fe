import { useEffect, useState } from 'react'
import { getEmployeeAiHistoryApi } from '../../services/user.service'
import { EmptyState, ErrorState, ChartSkeleton } from './ExpenseUI'
import { TASK_META, taskLabel, formatVND } from '../../utils/expense.utils'

const LIMIT = 10
const STATUS = {
  succeeded: { label: 'Thành công', cls: 'bg-green-50 text-green-700' },
  failed: { label: 'Lỗi', cls: 'bg-red-50 text-red-700' },
  pending: { label: 'Đang xử lý', cls: 'bg-primary-container text-on-primary-container' },
}
const field = 'h-10 rounded-lg border border-outline-variant bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary'

export default function UsageHistory({ userId }) {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [modality, setModality] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    getEmployeeAiHistoryApi(userId, { page, limit: LIMIT, status, modality })
      .then((d) => live && setData(d))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [userId, page, status, modality, tick])

  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className={field}>
          <option value="">Mọi trạng thái</option>
          <option value="succeeded">Thành công</option>
          <option value="failed">Lỗi</option>
          <option value="pending">Đang xử lý</option>
        </select>
        <select value={modality} onChange={(e) => { setModality(e.target.value); setPage(1) }} className={field}>
          <option value="">Mọi loại tác vụ</option>
          {Object.entries(TASK_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
      </div>

      {error ? <ErrorState message={error} onRetry={() => setTick((t) => t + 1)} />
        : loading && !data ? <ChartSkeleton height={280} />
        : !data?.items.length ? <EmptyState text="Chưa có lịch sử sử dụng phù hợp" />
        : (
          <div className={loading ? 'opacity-60 transition-opacity' : ''}>
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider text-outline">
                  <tr>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Tác vụ</th>
                    <th className="px-4 py-3">Mô hình</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Chi phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {data.items.map((it) => {
                    const st = STATUS[it.status] || { label: it.status, cls: 'bg-surface-variant text-on-surface-variant' }
                    return (
                      <tr key={it.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{new Date(it.createdAt).toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3">{taskLabel(it.modality)}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-on-surface" title={it.model}>{it.model}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.cls}`} title={it.errorMessage || undefined}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-on-surface">{it.chargedVnd === null ? '—' : formatVND(it.chargedVnd)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
              <span>Trang {page}/{pages} · {data.total} bản ghi</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-9 rounded-lg border border-outline-variant bg-white px-3 hover:border-primary disabled:opacity-40">Trước</button>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="h-9 rounded-lg border border-outline-variant bg-white px-3 hover:border-primary disabled:opacity-40">Sau</button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

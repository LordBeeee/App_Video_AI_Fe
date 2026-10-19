import { useEffect, useState } from 'react'
import { getEmployeeAiHistoryApi } from '../../services/user.service'
import { Card, Empty, Skeleton } from './AuroraUI'
import { INFO } from './metricInfo'
import { formatVND } from '../../utils/expense.utils'
import { AU_TASK, auTaskLabel, moneyShort } from '../../utils/aurora.utils'

const LIMIT = 8
const STATUS = {
  succeeded: { label: 'Thành công', cls: 'ok', icon: 'check_circle' },
  failed: { label: 'Lỗi', cls: 'bad', icon: 'error' },
  pending: { label: 'Đang xử lý', cls: 'run', icon: 'autorenew' },
}
const FILTERS = [['', 'Tất cả'], ['succeeded', 'OK'], ['failed', 'Lỗi'], ['pending', 'Chờ']]

export default function EmployeeHistory({ userId, className = '' }) {
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

  const controls = (
    <div className="au-hctl">
      {FILTERS.map(([v, l]) => (
        <button key={v} type="button" className={`au-fl${status === v ? ' on' : ''}`} onClick={() => { setStatus(v); setPage(1) }}>{l}</button>
      ))}
      <select className="au-sel sm" value={modality} onChange={(e) => { setModality(e.target.value); setPage(1) }} aria-label="Lọc theo loại tác vụ">
        <option value="">Tất cả</option>
        {Object.entries(AU_TASK).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
      </select>
    </div>
  )

  return (
    <Card className={className} icon="history" title="Lịch sử" info={INFO.empHistory} action={controls}>
      {error ? (
        <div className="au-empty">
          <span>{error}</span>
          <button type="button" className="au-btn" onClick={() => setTick((t) => t + 1)}>Thử lại</button>
        </div>
      ) : loading && !data ? <Skeleton h="100%" />
        : !data?.items.length ? <Empty text="Chưa có lịch sử" icon="history" hint="Mỗi lần tạo ảnh, video hay chat của nhân viên sẽ được ghi lại tại đây." />
        : (
          <>
            <div className={`au-scroll${loading ? ' au-dim' : ''}`}>
              <table className="au-tb">
                <thead>
                  <tr>
                    <th>Giờ</th>
                    <th>Tác vụ</th>
                    <th>Mô hình</th>
                    <th></th>
                    <th className="r">Chi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((it) => {
                    const st = STATUS[it.status] || { label: it.status, cls: '', icon: 'schedule' }
                    return (
                      <tr key={it.id}>
                        <td>{new Date(it.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{auTaskLabel(it.modality)}</td>
                        <td className="nm" title={it.model}>{it.model}</td>
                        <td><span className={`au-st ${st.cls}`} title={it.errorMessage || st.label}><span className="material-symbols-outlined">{st.icon}</span></span></td>
                        <td className="r" title={it.chargedVnd === null ? undefined : formatVND(it.chargedVnd)}><b>{it.chargedVnd === null ? '—' : moneyShort(it.chargedVnd)}</b></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="au-pg">
              <span>{page}/{pages} · {data.total}</span>
              <div>
                <button type="button" className="au-ico" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Trang trước">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button type="button" className="au-ico" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} aria-label="Trang sau">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
    </Card>
  )
}

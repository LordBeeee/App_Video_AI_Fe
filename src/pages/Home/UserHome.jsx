import { useCallback, useEffect, useMemo, useState } from 'react'
import { getGenerations } from '../../services/aiPlatform.service'
import { useAuthStore } from '../../store/auth.store'
import { Page, Card, Tile, Pills, Skeleton, ErrorBox } from '../../components/Aurora/AuroraUI'
import { TaskFeed, ErrorFeed, QuickLinks } from '../../components/Aurora/HomeParts'
import { formatNum } from '../../utils/expense.utils'
import { timeAgo } from '../../utils/operations.utils'
import { auTaskLabel } from '../../utils/aurora.utils'

const ACTIVE = ['pending', 'queued', 'processing', 'running']
const ACTIONS = [
  { to: '/create/image', icon: 'image', label: 'Tạo ảnh' },
  { to: '/create/video', icon: 'smart_display', label: 'Tạo video' },
  { to: '/create/audio', icon: 'graphic_eq', label: 'Tạo giọng nói' },
  { to: '/chat', icon: 'chat_bubble', label: 'Chat AI' },
  { to: '/library', icon: 'video_library', label: 'Thư viện' },
  { to: '/wallet', icon: 'account_balance_wallet', label: 'Ví & thanh toán' },
]

function mostCommon(list) {
  const m = new Map()
  list.forEach((x) => x && m.set(x, (m.get(x) || 0) + 1))
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

export default function UserHome() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('running')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getGenerations()
      .then((d) => setItems(d.items || []))
      .catch((e) => setError(e.message || 'Không tải được dữ liệu'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const list = useMemo(() => items.map((g) => ({
    id: g.id, modality: g.modality, status: g.status, model: g.modelName, createdAt: g.createdAt, message: g.errorMessage,
  })), [items])
  const running = useMemo(() => list.filter((g) => ACTIVE.includes(g.status)), [list])
  const failed = useMemo(() => list.filter((g) => g.status === 'failed'), [list])
  const succeeded = useMemo(() => list.filter((g) => g.status === 'succeeded').length, [list])
  const favModel = useMemo(() => mostCommon(list.map((g) => g.model)), [list])
  const favTask = useMemo(() => mostCommon(list.map((g) => g.modality)), [list])
  const firstName = (user?.fullName || '').trim().split(/\s+/).pop() || 'bạn'

  const tabs = [
    { value: 'running', label: `Chạy ${running.length}` },
    { value: 'recent', label: 'Gần đây' },
  ]

  return (
    <Page>
      <header className="au-head">
        <h1 className="au-title au-fd">Xin chào, {firstName}</h1>
        <button type="button" className="au-btn solid icon" title="Làm mới" aria-label="Làm mới" onClick={load}>
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      {error ? <ErrorBox message={error} onRetry={load} /> : (
        <>
          <div className="au-top">
            <Card tone="dark" className="au-ops">
              <div className="au-ops-top">
                <span className={`au-ops-ic ${running.length ? '' : 'idle'}`}><span className="material-symbols-outlined">{running.length ? 'autorenew' : 'bedtime'}</span></span>
                <h2 className="au-fd" title={list.length ? `${formatNum(list.length)} yêu cầu gần đây` : 'Bạn chưa tạo yêu cầu nào'}>
                  {running.length ? `${running.length} đang chạy` : 'Đang rảnh'}
                </h2>
              </div>
              {loading ? <Skeleton h={76} /> : (
                <div className="au-mini">
                  <div title="Hoạt động gần nhất">
                    <p><span className="material-symbols-outlined">schedule</span>Gần nhất</p>
                    <b>{list[0] ? timeAgo(list[0].createdAt) : '—'}</b>
                  </div>
                  <div title="Loại tác vụ hay dùng">
                    <p><span className="material-symbols-outlined">category</span>Tác vụ</p>
                    <b>{favTask ? auTaskLabel(favTask) : '—'}</b>
                  </div>
                  <div title="Mô hình hay dùng">
                    <p><span className="material-symbols-outlined">memory</span>Mô hình</p>
                    <b>{favModel || '—'}</b>
                  </div>
                </div>
              )}
            </Card>
            <div className="au-tiles t3">
              <Tile loading={loading} icon="sync" tone="orange" label="Đang chạy" value={formatNum(running.length)} hint="Đang xử lý lúc này" note={!loading && !running.length ? 'Không có gì đang chạy' : undefined} />
              <Tile loading={loading} icon="check_circle" label="Thành công" value={formatNum(succeeded)} hint="Trong các yêu cầu gần đây" />
              <Tile loading={loading} icon="error" tone="dark" label="Lỗi" value={formatNum(failed.length)} hint={failed.length ? 'Xem mục lỗi gần đây' : 'Không có lỗi'} note={!loading && !failed.length ? 'Mọi thứ đều ổn' : undefined} />
            </div>
          </div>

          <div className="au-trio">
            <Card icon="smart_toy" title="Tác vụ AI" sub={tab === 'running' ? 'Các tác vụ đang xử lý' : 'Hoạt động mới nhất'} action={<Pills items={tabs} value={tab} onChange={setTab} />}>
              {loading ? <Skeleton h="100%" /> : tab === 'running'
                ? <TaskFeed items={running.slice(0, 12)} icon="done_all" empty="Chưa có tác vụ nào đang chạy" hint="Gửi một yêu cầu mới, tiến độ sẽ hiện ngay tại đây." to="/create/image" cta="Tạo ngay" />
                : <TaskFeed items={list.slice(0, 12)} icon="rocket_launch" empty="Bạn chưa tạo gì cả" hint="Tạo ảnh, video, giọng nói hoặc chat AI để bắt đầu." to="/create/image" cta="Bắt đầu sáng tạo" />}
            </Card>
            <Card icon="report" title="Lỗi gần đây">
              {loading ? <Skeleton h="100%" /> : <ErrorFeed items={failed.slice(0, 6)} />}
            </Card>
            <Card icon="bolt" title="Lối tắt">
              <QuickLinks actions={ACTIONS} />
            </Card>
          </div>
        </>
      )}
    </Page>
  )
}

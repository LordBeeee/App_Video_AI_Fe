import { useCallback, useEffect, useState } from 'react'
import { getOperationsOverviewApi } from '../../services/operations.service'
import { Page, Card, Tile, Pills, Skeleton, ErrorBox } from '../../components/Aurora/AuroraUI'
import { TaskFeed, ErrorFeed, ServiceFeed, QuickLinks } from '../../components/Aurora/HomeParts'
import { formatNum } from '../../utils/expense.utils'
import { timeAgo } from '../../utils/operations.utils'

const ACTIONS = [
  { to: '/employees', icon: 'groups', label: 'Nhân viên' },
  { to: '/employees/expenses', icon: 'monitoring', label: 'Chi phí AI' },
  { to: '/wallet', icon: 'account_balance_wallet', label: 'Ví & thanh toán' },
  { to: '/library', icon: 'video_library', label: 'Thư viện' },
  { to: '/create/image', icon: 'image', label: 'Tạo ảnh' },
  { to: '/create/video', icon: 'smart_display', label: 'Tạo video' },
]

const LEVEL_ICON = { ok: 'verified', degraded: 'warning', down: 'error', idle: 'hourglass_empty' }

function overall(data) {
  if (!data) return { level: 'idle', head: 'Đang kiểm tra…', sub: '' }
  const alerts = data.alerts || []
  const services = data.services || []
  if (alerts.some((a) => a.level === 'critical') || services.some((s) => s.status === 'down')) {
    return { level: 'down', head: 'Cần xử lý ngay', sub: `${alerts.length} cảnh báo đang mở` }
  }
  if (alerts.length || services.some((s) => s.status === 'degraded')) {
    return { level: 'degraded', head: 'Cần chú ý', sub: `${alerts.length} cảnh báo đang mở` }
  }
  return { level: 'ok', head: 'Ổn định', sub: 'Không có cảnh báo' }
}

export default function AdminHome() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('running')

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    getOperationsOverviewApi()
      .then((d) => { setData(d); setError('') })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(() => load(true), 30000)
    return () => clearInterval(t)
  }, [load])

  const t = data?.tasks
  const a = data?.admin
  const st = overall(data)

  const tabs = [
    { value: 'running', label: `Chạy${t ? ` ${formatNum(t.running.length)}` : ''}` },
    { value: 'recent', label: 'Gần đây' },
  ]

  return (
    <Page>
      <header className="au-head">
        <h1 className="au-title au-fd">Vận hành</h1>
        <div className="au-tools">
          {data && <span className="au-stamp"><span className="material-symbols-outlined">schedule</span>{timeAgo(data.generatedAt)}</span>}
          <button type="button" className="au-btn solid icon" title="Làm mới" aria-label="Làm mới" onClick={() => load()}>
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </header>

      {error && !data ? <ErrorBox message={error} onRetry={() => load()} /> : (
        <>
          {error && <div className="au-warnline">Không làm mới được: {error}</div>}

          <div className="au-top">
            <Card tone="dark" className="au-ops">
              <div className="au-ops-top">
                <span className={`au-ops-ic ${st.level}`}><span className="material-symbols-outlined">{LEVEL_ICON[st.level]}</span></span>
                <h2 className="au-fd" title={st.sub}>{st.head}</h2>
              </div>
              {loading ? <Skeleton h={76} /> : (
                <div className="au-mini">
                  <div title={`${formatNum(a.employees.active)} hoạt động · ${formatNum(a.employees.banned)} bị khóa`}>
                    <p><span className="material-symbols-outlined">groups</span>Nhân sự</p>
                    <b>{formatNum(a.employees.total)}</b>
                  </div>
                  <div title={`${formatNum(a.todayUsers)} người dùng hôm nay`}>
                    <p><span className="material-symbols-outlined">bolt</span>Hôm nay</p>
                    <b>{formatNum(a.todayRequests)}</b>
                  </div>
                  <div title="Lệnh nạp ví chờ thanh toán">
                    <p><span className="material-symbols-outlined">hourglass_top</span>Chờ nạp</p>
                    <b>{formatNum(a.pendingTopups)}</b>
                  </div>
                </div>
              )}
            </Card>
            <div className="au-tiles">
              <Tile loading={loading} icon="sync" tone="orange" label="Đang chạy" value={formatNum(t?.active)} hint="Tác vụ đang xử lý" note={t && !t.active ? 'Hàng đợi đang trống' : undefined} />
              <Tile loading={loading} icon="hourglass_top" tone={t?.stuck ? 'orange' : ''} label={`Treo > ${data?.stuckThresholdMinutes ?? 30}p`} value={formatNum(t?.stuck)} hint={t?.stuck ? 'Cần kiểm tra' : 'Không có tác vụ treo'} note={t && !t.stuck ? 'Không có tác vụ nào bị treo' : undefined} />
              <Tile loading={loading} icon="check_circle" label="Thành công 24h" value={formatNum(t?.succeeded24h)} hint="Trong 24 giờ qua" note={t && !t.succeeded24h ? 'Chưa có lượt thành công hôm nay' : undefined} />
              <Tile loading={loading} icon="error" tone="dark" label="Lỗi 24h" value={formatNum(t?.failed24h)} hint={t?.failed24h ? 'Xem mục lỗi gần đây' : 'Không có lỗi'} note={t && !t.failed24h ? 'Sạch lỗi trong 24 giờ' : undefined} />
            </div>
          </div>

          <div className="au-trio">
            <Card icon="dns" title="Dịch vụ" sub="Cơ sở dữ liệu kiểm tra trực tiếp; dịch vụ khác suy ra từ hoạt động 24h">
              {loading ? <Skeleton h="100%" /> : <ServiceFeed services={data.services} alerts={data.alerts} />}
            </Card>
            <Card icon="smart_toy" title="Tác vụ AI" sub={tab === 'running' ? 'Cũ nhất trước' : 'Hoạt động mới nhất'} action={<Pills items={tabs} value={tab} onChange={setTab} />}>
              {loading ? <Skeleton h="100%" /> : tab === 'running'
                ? <TaskFeed items={t.running} showUser icon="done_all" empty="Hàng đợi đang trống" hint="Không có tác vụ nào đang xử lý, mọi yêu cầu đã hoàn tất." />
                : <TaskFeed items={data.recent} showUser icon="rocket_launch" empty="Chưa có hoạt động nào" hint="Tác vụ AI mới nhất của nhân viên sẽ hiện ở đây." to="/create/image" cta="Thử tạo ảnh" />}
            </Card>
            <div className="au-stack">
              <Card className="fit" icon="bolt" title="Lối tắt">
                <QuickLinks actions={ACTIONS} />
              </Card>
              <Card icon="report" title="Lỗi gần đây">
                {loading ? <Skeleton h="100%" /> : <ErrorFeed items={data.errors} showUser />}
              </Card>
            </div>
          </div>
        </>
      )}
    </Page>
  )
}

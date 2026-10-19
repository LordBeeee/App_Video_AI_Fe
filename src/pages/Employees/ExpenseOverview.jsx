import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getExpenseOverviewApi } from '../../services/user.service'
import { Page, Card, RangePicker, Skeleton, ErrorBox, Empty, InfoTip } from '../../components/Aurora/AuroraUI'
import { INFO } from '../../components/Aurora/metricInfo'
import AuroraTrend from '../../components/Aurora/AuroraTrend'
import AuroraDonut from '../../components/Aurora/AuroraDonut'
import EfficiencySection from '../../components/Aurora/EfficiencySection'
import ExpenseRank from '../../components/Aurora/ExpenseRank'
import TaskInsights from '../../components/Aurora/TaskInsights'
import { formatVND, formatNum } from '../../utils/expense.utils'
import { rangeParams, rangeText, isOneDay, auTaskLabel, auTaskColor, moneyParts, moneyShort, pctOf, dayLabel } from '../../utils/aurora.utils'

export default function ExpenseOverview() {
  const [range, setRange] = useState({ days: 30 })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getExpenseOverviewApi(rangeParams(range))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [range])

  useEffect(() => { load() }, [load])

  const k = data?.kpis
  const total = k?.totalCost || 0
  const trend = useMemo(() => data?.trend || [], [data])
  const rangeLabel = rangeText(range)
  const oneDay = isOneDay(range)
  const hourly = useMemo(() => (data?.hourly || []).map((h) => ({ day: `${String(h.hr).padStart(2, '0')}:00`, cost: h.cost, requests: h.requests })), [data])
  const avgDay = trend.length ? total / trend.length : 0
  const peak = useMemo(() => trend.reduce((b, d) => (!b || d.cost > b.cost ? d : b), null), [trend])
  const money = moneyParts(total)

  const tasks = useMemo(() => (data?.byTask || []).map((t) => ({
    key: t.modality, label: auTaskLabel(t.modality), value: t.cost, color: auTaskColor(t.modality), requests: t.requests,
  })), [data])

  const models = useMemo(() => (data?.byModel || []).slice(0, 5), [data])
  const modelMax = models.reduce((m, x) => Math.max(m, x.cost), 0) || 1

  return (
    <Page after={error ? null : (
      <>
        <TaskInsights byTask={data?.byTask} trendByTask={data?.trendByTask} loading={loading} rangeLabel={rangeLabel} />
        <EfficiencySection eff={data?.efficiency} loading={loading} scope="team" employees={data?.employees} />
      </>
    )}>
      <header className="au-head">
        <h1 className="au-title au-fd">Chi tiêu AI</h1>
        <div className="au-tools">
          <RangePicker range={range} onChange={setRange} />
          <Link to="/employees" className="au-btn icon" title="Quản lý nhân viên" aria-label="Quản lý nhân viên">
            <span className="material-symbols-outlined">groups</span>
          </Link>
        </div>
      </header>

      {error ? <ErrorBox message={error} onRetry={load} /> : (
        <div className="au-split au-cost-split">
          <div className="au-col">
            <Card tone="dark" className="au-hero au-cost">
              <div className="au-hero-top">
                <div className="au-min0">
                  <div className="au-lab"><span className="material-symbols-outlined">payments</span>Tổng chi · {rangeLabel}<InfoTip info={INFO.totalSpend} tone="dark" /></div>
                  {loading ? <Skeleton h={48} w={230} /> : (
                    <div className="au-big au-fd" title={formatVND(total)}>{money.v}<small>{money.u}</small></div>
                  )}
                  <div className="au-note">{loading ? '' : total ? formatVND(total) : `Chưa có chi tiêu trong ${rangeLabel}. Thử chọn khoảng dài hơn.`}</div>
                </div>
                <div className="au-chips">
                  <div className="au-chip"><span><span className="material-symbols-outlined">calendar_view_day</span>TB/ngày<InfoTip info={INFO.avgPerDay} tone="dark" /></span><b>{loading ? '…' : total ? moneyShort(avgDay) : '—'}</b></div>
                  <div className="au-chip"><span><span className="material-symbols-outlined">trending_up</span>{peak && peak.cost > 0 && !loading ? dayLabel(peak.day) : 'Đỉnh'}<InfoTip info={INFO.peakDay} tone="dark" /></span><b>{loading ? '…' : peak?.cost > 0 ? moneyShort(peak.cost) : '—'}</b></div>
                  <div className="au-chip" title={formatVND(k?.avgCostPerSuccess)}><span><span className="material-symbols-outlined">sell</span>Giá TB/lượt<InfoTip info={INFO.avgPrice} tone="dark" /></span><b>{loading ? '…' : k?.succeeded ? moneyShort(k.avgCostPerSuccess) : '—'}</b></div>
                </div>
              </div>
              <div className="au-plot">
                {loading ? <Skeleton h="100%" /> : <AuroraTrend data={oneDay && hourly.length ? hourly : trend} label={oneDay && hourly.length ? (x) => x : undefined} detail={(d) => `${formatNum(d.requests)} yêu cầu`} />}
              </div>
            </Card>

            <div className="au-row2 au-cost2">
              <Card icon="donut_large" title="Loại tác vụ" sub="Tỷ trọng chi phí" info={INFO.byTask}>
                {loading ? <Skeleton h="100%" /> : tasks.length === 0 ? <Empty icon="donut_large" text="Chưa có cơ cấu chi phí" hint="Biểu đồ tròn sẽ chia theo loại tác vụ khi có chi tiêu." /> : (
                  <div className="au-donut">
                    <AuroraDonut items={tasks} top={moneyShort(total)} bottom="tổng" size={128} />
                    <ul className="au-legend">
                      {tasks.map((t) => (
                        <li key={t.key}>
                          <i style={{ background: t.color, boxShadow: t.key === 'image' ? 'inset 0 0 0 1px rgba(42, 26, 14, 0.18)' : 'none' }} />
                          <span className="nm">{t.label}</span>
                          <span className="vl">{moneyShort(t.value)}</span>
                          <span className="pc">{pctOf(t.value, total)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
              <Card icon="memory" title="Mô hình top" sub="Top 5 theo chi phí" info={INFO.topModels}>
                {loading ? <Skeleton h="100%" /> : models.length === 0 ? <Empty icon="memory" text="Chưa có mô hình nào" hint="Top 5 mô hình tốn kém nhất sẽ xếp hạng tại đây." /> : (
                  <ul className="au-hb">
                    {models.map((m) => (
                      <li key={`${m.name}-${m.modality}`}>
                        <div className="au-hb-r"><span title={m.name}>{m.name}</span><b title={formatVND(m.cost)}>{moneyShort(m.cost)}</b></div>
                        <div className="au-trk"><div style={{ width: `${(m.cost / modelMax) * 100}%` }} /></div>
                        <div className="au-hb-s">{auTaskLabel(m.modality)} · {formatNum(m.requests)} · {pctOf(m.cost, total)}%</div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          <Card className="au-rank-card" icon="leaderboard" title="Xếp hạng" sub="Bấm vào nhân viên để xem chi tiết sử dụng AI" info={INFO.ranking}>
            {loading ? <Skeleton h="100%" /> : <ExpenseRank employees={data.employees} totalCost={total} />}
          </Card>
        </div>
      )}
    </Page>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEmployeeAiUsageApi } from '../../services/user.service'
import { Page, Card, Tile, RangePicker, Avatar, Skeleton, ErrorBox, Empty, InfoTip } from '../../components/Aurora/AuroraUI'
import { INFO } from '../../components/Aurora/metricInfo'
import AuroraCombo from '../../components/Aurora/AuroraCombo'
import ActivityTimeline from '../../components/Aurora/ActivityTimeline'
import EfficiencySection from '../../components/Aurora/EfficiencySection'
import EmployeeHistory from '../../components/Aurora/EmployeeHistory'
import TaskInsights from '../../components/Aurora/TaskInsights'
import { formatVND, formatNum } from '../../utils/expense.utils'
import { formatLastLogin } from '../../utils/employee.utils'
import { timeAgo } from '../../utils/operations.utils'
import {
  rangeParams, rangeText, isOneDay, AU_TASK_DARK, auTaskLabel, auTaskColor, moneyParts, moneyShort, pctOf, priceDelta, priceIndex, priceIndexText,
} from '../../utils/aurora.utils'

function Delta({ row }) {
  const d = priceDelta(row)
  return <span className={`au-dl ${d.kind}`} title={d.title}>{d.text}</span>
}

export default function EmployeeAiUsage() {
  const { id } = useParams()
  const [range, setRange] = useState({ days: 30 })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getEmployeeAiUsageApi(id, rangeParams(range))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, range])

  useEffect(() => { load() }, [load])

  const k = data?.kpis
  const emp = data?.employee
  const cost = k?.cost || 0
  const rangeLabel = rangeText(range)
  const trend = useMemo(() => data?.trend || [], [data])
  const byTask = useMemo(() => data?.byTask || [], [data])
  const byModel = useMemo(() => data?.byModel || [], [data])
  const activeDays = useMemo(() => trend.filter((d) => d.requests > 0).length, [trend])
  const idx = useMemo(() => priceIndex(byTask), [byTask])
  const money = moneyParts(cost)
  const topTask = byTask[0]
  const successRate = k?.successRate
  const taskMax = (r) => Math.max(r.avgCost, r.teamAvgCost || 0) || 1

  return (
    <Page after={error ? null : (
      <>
        <TaskInsights byTask={byTask} trendByTask={data?.trendByTask} loading={loading} rangeLabel={rangeLabel} />
        <EfficiencySection eff={data?.efficiency} loading={loading} scope="user" />
      </>
    )}>
      <div className="au-head2">
        <Link to="/employees/expenses" className="au-back" title="Chi tiêu nhân viên" aria-label="Quay lại">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="au-tools">
          <RangePicker range={range} onChange={setRange} />
          <Link to={`/employees/${id}`} className="au-btn icon" title="Hồ sơ nhân viên" aria-label="Hồ sơ nhân viên">
            <span className="material-symbols-outlined">person</span>
          </Link>
        </div>
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : (
        <>
          <Card tone="dark" className="au-prof au-cost">
            <div className="au-who">
              <Avatar name={emp?.fullName || emp?.email || ''} src={emp?.avatarUrl} size={64} onInk />
              <div className="au-min0">
                <h1 className="au-fd">{emp?.fullName || emp?.email || 'Nhân viên'}</h1>
                <div className="au-who-m">
                  {emp ? emp.email : '…'}
                </div>
                {emp && (
                  <div className="au-who-t">
                    <span className={`au-tg ${emp.status === 'banned' ? 'red' : 'ink'}`} title={`Truy cập: ${formatLastLogin(emp.lastLoginAt)}`}>
                      <span className="material-symbols-outlined">{emp.status === 'banned' ? 'lock' : 'check_circle'}</span>{emp.status === 'banned' ? 'Khóa' : 'Hoạt động'}
                    </span>
                    {topTask && <span className="au-tg" title="Chi nhiều nhất"><span className="material-symbols-outlined">star</span>{auTaskLabel(topTask.modality)}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="au-cost-main">
              <div className="au-lab"><span className="material-symbols-outlined">payments</span>Tổng chi · {rangeLabel}<InfoTip info={INFO.empCost} tone="dark" /></div>
              {loading ? <Skeleton h={72} w={260} /> : <div className="au-big au-fd" title={formatVND(cost)}>{money.v}<small>{money.u}</small></div>}
              <div className="au-note">{loading ? '' : cost ? formatVND(cost) : `Chưa có chi tiêu trong ${rangeLabel}`}</div>
            </div>

            <div className="au-cost-side">
              <div className="au-chips">
                <div className="au-chip" title={formatVND(k?.avgCostPerSuccess)}><span><span className="material-symbols-outlined">sell</span>Giá TB<InfoTip info={INFO.empAvgPrice} tone="dark" /></span><b>{loading ? '…' : k?.succeeded ? moneyShort(k.avgCostPerSuccess) : '—'}</b></div>
                <div className="au-chip"><span><span className="material-symbols-outlined">calendar_view_day</span>TB/ngày<InfoTip info={INFO.avgPerDay} tone="dark" /></span><b>{loading ? '…' : activeDays ? moneyShort(cost / activeDays) : '—'}</b></div>
                <div className="au-chip"><span><span className="material-symbols-outlined">balance</span>So nhóm<InfoTip info={INFO.empVsTeamTag} tone="dark" /></span><b>{loading || idx === null || idx === undefined ? '—' : `${idx > 0 ? '+' : ''}${idx}%`}</b></div>
              </div>
              <div className="au-mixw">
                <div className="au-mix">
                  {byTask.filter((t) => t.cost > 0).map((t) => <i key={t.modality} style={{ flexGrow: t.cost, background: AU_TASK_DARK[t.modality] || 'var(--t-soft, #f4ae52)' }} />)}
                </div>
                <div className="au-mixl">
                  {byTask.filter((t) => t.cost > 0).slice(0, 3).map((t) => <span key={t.modality}>{auTaskLabel(t.modality)} <b>{pctOf(t.cost, cost)}%</b></span>)}
                </div>
              </div>
            </div>
          </Card>

          <div className="au-tiles sm t3">
            <Tile loading={loading} icon="task_alt" label="Thành công" info={INFO.empSuccess} value={successRate === null || successRate === undefined ? '—' : `${Math.round(successRate * 100)}%`} hint={`${formatNum(k?.succeeded)} thành công · ${formatNum(k?.failed)} lỗi`} />
            <Tile loading={loading} icon="calendar_month" tone="orange" label="Ngày hoạt động" info={INFO.empActiveDays} value={`${activeDays}/${trend.length}`} hint={priceIndexText(idx)} />
            <Tile loading={loading} icon="schedule" tone="dark" label="Gần nhất" info={INFO.empLast} value={k?.lastUsedAt ? timeAgo(k.lastUsedAt) : '—'} hint={k?.totalTokens != null ? `${formatNum(k.totalTokens)} token` : `${formatNum(k?.requests)} yêu cầu trong kỳ`} />
          </div>

          <div className="au-grid2 au-cost2">
            {isOneDay(range) ? (
              <ActivityTimeline className="s7" userId={id} range={range} />
            ) : (
              <Card
                className="s7"
                icon="show_chart"
                title="Chi phí theo ngày"
                info={INFO.empDailyCost}
                sub="Cột: số yêu cầu (đen là lỗi) · Đường: chi phí"
                action={<div className="au-lg"><span><i style={{ background: 'color-mix(in srgb, var(--t-soft, #f4ae52) 70%, white)' }} />OK</span><span><i style={{ background: 'var(--t-ink, #2a1a0e)' }} />Lỗi</span><span><u />Chi</span></div>}
              >
                <div className="au-plot">{loading ? <Skeleton h="100%" /> : <AuroraCombo data={trend} />}</div>
              </Card>
            )}

            <Card className="s5" icon="balance" title="So với nhóm" info={INFO.empVsTeam} sub="Giá TB mỗi yêu cầu thành công · giá thấp chưa chắc hiệu quả hơn vì dữ liệu không đo chất lượng">
              {loading ? <Skeleton h="100%" /> : byTask.length === 0 ? <Empty icon="balance" text="Chưa có gì để so sánh" hint="Khi có yêu cầu thành công, giá trung bình sẽ được đặt cạnh mức của cả nhóm." /> : (
                <div className="au-scroll">
                  <ul className="au-cp">
                    {byTask.map((r) => (
                      <li key={r.modality}>
                        <div className="au-cp-n">
                          <span><i style={{ background: auTaskColor(r.modality), boxShadow: r.modality === 'image' ? 'inset 0 0 0 1px color-mix(in srgb, var(--t-soft, #f4ae52) 80%, black)' : 'none' }} />{auTaskLabel(r.modality)}</span>
                          <small>{pctOf(r.cost, cost)}% · {formatNum(r.requests)}</small>
                        </div>
                        <div className="au-cp-b">
                          <div className="au-cp-r"><em title="Nhân viên"><span className="material-symbols-outlined">person</span></em><div className="t"><div style={{ width: `${(r.avgCost / taskMax(r)) * 100}%`, background: 'var(--t-primary, #d4621a)' }} /></div><b>{moneyShort(r.avgCost)}</b></div>
                          <div className="au-cp-r"><em title="Nhóm"><span className="material-symbols-outlined">groups</span></em><div className="t"><div style={{ width: `${((r.teamAvgCost || 0) / taskMax(r)) * 100}%`, background: 'color-mix(in srgb, var(--t-ink, #2a1a0e), black 39%)' }} /></div><b>{r.teamAvgCost === null ? '—' : moneyShort(r.teamAvgCost)}</b></div>
                        </div>
                        <Delta row={r} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card className="s5" icon="memory" title="Mô hình" info={INFO.empModels} sub="Chi phí và chênh lệch giá so với nhóm">
              {loading ? <Skeleton h="100%" /> : byModel.length === 0 ? <Empty icon="memory" text="Chưa dùng mô hình nào" hint="Chi phí từng mô hình sẽ liệt kê tại đây." /> : (
                <div className="au-scroll">
                  <table className="au-tb">
                    <thead>
                      <tr><th>Mô hình</th><th className="r">SL</th><th className="r">Chi</th><th className="r">TB</th><th className="r">±</th></tr>
                    </thead>
                    <tbody>
                      {byModel.map((r) => (
                        <tr key={`${r.name}-${r.modality}`}>
                          <td className="nm" title={`${r.name} · ${auTaskLabel(r.modality)}`}><b>{r.name}</b></td>
                          <td className="r">{formatNum(r.requests)}</td>
                          <td className="r" title={formatVND(r.cost)}>{moneyShort(r.cost)}</td>
                          <td className="r" title={formatVND(r.avgCost)}>{moneyShort(r.avgCost)}</td>
                          <td className="r"><Delta row={r} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <EmployeeHistory userId={id} className="s7" />
          </div>
        </>
      )}
    </Page>
  )
}

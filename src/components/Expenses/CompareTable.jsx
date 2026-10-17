import { formatVND, formatNum } from '../../utils/expense.utils'
import { EmptyState } from './ExpenseUI'

const MIN_SAMPLE = 5

function Delta({ own, team, ownN, teamN }) {
  if (team === null || team === undefined) return <span className="text-xs text-outline">Chưa có mốc so sánh</span>
  if (ownN < MIN_SAMPLE || teamN < MIN_SAMPLE) {
    return <span className="text-xs text-outline" title={`Cần ít nhất ${MIN_SAMPLE} yêu cầu ở cả hai bên`}>Mẫu nhỏ</span>
  }
  const diff = team ? Math.round(((own - team) / team) * 100) : 0
  if (diff === 0) return <span className="text-xs text-on-surface-variant">Ngang trung bình</span>
  return (
    <span className={`text-xs font-medium ${diff > 0 ? 'text-secondary' : 'text-on-surface'}`}>
      {diff > 0 ? '+' : ''}{diff}% so với TB nhóm
    </span>
  )
}

export default function CompareTable({ rows = [], nameOf, firstLabel }) {
  if (!rows.length) return <EmptyState />
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-outline">
            <th className="py-2 pr-4">{firstLabel}</th>
            <th className="px-4 py-2 text-right">Yêu cầu</th>
            <th className="px-4 py-2 text-right">Chi phí</th>
            <th className="px-4 py-2 text-right">Giá TB / yêu cầu</th>
            <th className="px-4 py-2 text-right">TB nhóm (còn lại)</th>
            <th className="py-2 pl-4 text-right">Chênh lệch giá</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60">
          {rows.map((r) => (
            <tr key={nameOf(r)}>
              <td className="max-w-[220px] truncate py-3 pr-4 font-medium text-on-surface" title={nameOf(r)}>{nameOf(r)}</td>
              <td className="px-4 py-3 text-right text-on-surface-variant">{formatNum(r.requests)}</td>
              <td className="px-4 py-3 text-right text-on-surface">{formatVND(r.cost)}</td>
              <td className="px-4 py-3 text-right font-semibold text-on-surface">{formatVND(r.avgCost)}</td>
              <td className="px-4 py-3 text-right text-on-surface-variant">
                {r.teamAvgCost === null ? '—' : `${formatVND(r.teamAvgCost)} (${formatNum(r.teamRequests)})`}
              </td>
              <td className="py-3 pl-4 text-right"><Delta own={r.avgCost} team={r.teamAvgCost} ownN={r.requests} teamN={r.teamRequests} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

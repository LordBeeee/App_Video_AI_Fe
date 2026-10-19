import { useMemo, useState } from 'react'
import { Card, Empty, Pills, Skeleton } from './AuroraUI'
import AuroraDonut from './AuroraDonut'
import TaskDaily from './TaskDaily'
import { formatNum, formatVND } from '../../utils/expense.utils'
import { auTaskColor, auTaskLabel, moneyShort, pctOf } from '../../utils/aurora.utils'

const MODES = [
  { value: 'requests', label: 'Số lượng' },
  { value: 'cost', label: 'Chi phí' },
]

export default function TaskInsights({ byTask = [], trendByTask = [], loading, rangeLabel }) {
  const [mode, setMode] = useState('requests')
  const items = useMemo(() => byTask.map((t) => ({
    key: t.modality, label: auTaskLabel(t.modality), value: t.cost, color: auTaskColor(t.modality), requests: t.requests,
  })), [byTask])
  const total = items.reduce((s, i) => s + i.value, 0)
  const count = items.reduce((s, i) => s + i.requests, 0)

  return (
    <section className="au-sec" id="au-task">
      <div className="au-head2 au-sec-h">
        <div>
          <h2 className="au-sec-t au-fd">Cơ cấu theo tác vụ</h2>
          <p className="au-sec-s">Tỷ lệ chi phí, số lượng yêu cầu thành công của từng tác vụ và diễn biến theo ngày trong {rangeLabel}.</p>
        </div>
      </div>
      <div className="au-eg">
        <Card className="c5" icon="donut_large" title="Tỷ lệ chi phí" sub="Chi phí và số lượng theo từng tác vụ">
          {loading ? <Skeleton h="100%" /> : items.length === 0 ? <Empty icon="donut_large" text="Chưa có cơ cấu chi phí" hint="Biểu đồ tròn sẽ chia theo tác vụ khi có chi tiêu." /> : (
            <div className="au-donut au-donut-lg">
              <AuroraDonut items={items} top={moneyShort(total)} bottom={`${formatNum(count)} lượt`} size={160} />
              <ul className="au-legend au-legend-x">
                {items.map((t) => (
                  <li key={t.key} title={`${t.label}: ${formatVND(t.value)} · ${formatNum(t.requests)} lượt`}>
                    <i style={{ background: t.color, boxShadow: t.key === 'image' ? 'inset 0 0 0 1px color-mix(in srgb, var(--t-ink, #2a1a0e) 18%, transparent)' : 'none' }} />
                    <span className="nm">{t.label}<small>{formatNum(t.requests)} lượt · {pctOf(t.requests, count)}% số lượng</small></span>
                    <span className="vl">{moneyShort(t.value)}</span>
                    <span className="pc">{pctOf(t.value, total)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        <Card className="c7" icon="stacked_bar_chart" title="Theo ngày và tác vụ" sub="Mỗi cột là một ngày, chia màu theo tác vụ" action={<Pills items={MODES} value={mode} onChange={setMode} />}>
          <div className="au-plot">{loading ? <Skeleton h="100%" /> : <TaskDaily data={trendByTask} mode={mode} />}</div>
        </Card>
      </div>
    </section>
  )
}

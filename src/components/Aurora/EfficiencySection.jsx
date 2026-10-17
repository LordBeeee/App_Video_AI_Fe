import { useMemo, useState } from 'react'
import { Card, Skeleton, Empty } from './AuroraUI'
import { useReveal, useCountUp } from './useReveal'
import { Gauge, CostLine, Heatmap, ModelBars, Latency, Reasons, Scatter, ScoreRank } from './EfficiencyCharts'
import { formatNum } from '../../utils/expense.utils'
import { MIN_SAMPLE, effScore, moneyShort, pct100, secText } from '../../utils/aurora.utils'

const has = (v) => v !== null && v !== undefined

function Rv({ className = '', delay = 0, children }) {
  const [ref, shown] = useReveal()
  const [done, setDone] = useState(false)
  return (
    <div
      ref={ref}
      className={`au-rv ${className}${shown ? ' in' : ''}${done ? ' done' : ''}`}
      style={{ '--d': `${delay}ms` }}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget && e.animationName === 'au-rvin') setDone(true) }}
    >
      {typeof children === 'function' ? children(shown) : children}
    </div>
  )
}

function EffTile({ i, on, icon, tone = '', label, target, fmt, hint }) {
  const v = useCountUp(has(target) ? target : 0, on)
  return (
    <div className={`au-tile ${tone}`} style={{ '--i': i }}>
      <div className="au-tl">{label}</div>
      <div className="au-tv au-fd">{has(target) ? fmt(v) : '—'}</div>
      <span className="au-ti"><span className="material-symbols-outlined">{icon}</span></span>
      <div className="au-th">{hint}</div>
    </div>
  )
}

const Plot = ({ loading, children }) => <div className="au-plot">{loading ? <Skeleton h="100%" /> : children}</div>

export default function EfficiencySection({ eff, loading, scope = 'team', employees = [] }) {
  const sum = eff?.summary
  const team = scope === 'user' ? eff?.team : sum
  const failed = sum ? sum.total - sum.succeeded : 0

  const lat = useMemo(() => (eff?.latency || []).filter((r) => r.modality !== 'chat'), [eff])
  const latN = lat.reduce((s, r) => s + r.n, 0)
  const avgSec = latN ? lat.reduce((s, r) => s + r.avg * r.n, 0) / latN : null

  const people = useMemo(() => {
    const byId = new Map(employees.map((e) => [e.id, e]))
    return (eff?.people || [])
      .filter((p) => p.total >= MIN_SAMPLE && byId.has(p.id))
      .map((p) => {
        const e = byId.get(p.id)
        return { ...p, name: e.fullName || e.email, avatarUrl: e.avatarUrl, score: effScore(p.successRate, p.retryRate) }
      })
  }, [eff, employees])
  const ranked = useMemo(() => [...people].sort((a, b) => b.score - a.score), [people])

  const vs = (a, b, f) => (scope === 'user' && has(b) ? `Nhóm ${f(b)}` : a)

  return (
    <section className="au-sec" id="au-eff">
      <Rv className="au-sec-h">
        <div>
          <h2 className="au-sec-t au-fd">Hiệu quả sử dụng AI</h2>
          <p className="au-sec-s">Đo mức lãng phí và độ ổn định khi dùng AI. Điểm hiệu quả = 70% tỷ lệ thành công + 30% không lặp lại prompt. Chưa đo chất lượng đầu ra.</p>
        </div>
      </Rv>

      <div className="au-eg">
        <Rv className="c12">
          {(on) => (
            <div className="au-tiles">
              <EffTile i={0} on={on && !loading} icon="task_alt" label="Tỷ lệ thành công" target={has(sum?.successRate) ? sum.successRate * 100 : null} fmt={(v) => `${Math.round(v)}%`}
                hint={vs(`${formatNum(sum?.succeeded)}/${formatNum(sum?.total)} lượt`, team?.successRate, (x) => `${pct100(x)}%`)} />
              <EffTile i={1} on={on && !loading} tone="orange" icon="replay" label="Prompt lặp lại" target={has(sum?.retryRate) ? sum.retryRate * 100 : null} fmt={(v) => `${Math.round(v)}%`}
                hint={vs('Càng thấp càng ít phải tạo lại', team?.retryRate, (x) => `${pct100(x)}%`)} />
              <EffTile i={2} on={on && !loading} icon="sell" label="Chi phí / lượt thành công" target={sum?.succeeded ? sum.costPerSuccess : null} fmt={(v) => moneyShort(v)}
                hint={vs('Trung bình toàn kỳ', team?.costPerSuccess, moneyShort)} />
              <EffTile i={3} on={on && !loading} tone="dark" icon="timer" label="Thời gian xử lý TB" target={avgSec} fmt={secText}
                hint={latN ? `${formatNum(latN)} lượt ảnh · video · giọng nói` : 'Chưa có lượt ảnh/video/giọng nói'} />
            </div>
          )}
        </Rv>

        <Rv className="c4" delay={60}>
          {(on) => (
            <Card tone="dark" icon="verified" title="Độ ổn định" sub="Vòng ngoài: thành công · vòng trong: không lặp prompt">
              <div className="au-plot">
                {loading ? <Skeleton h="100%" /> : !sum?.total ? <Empty tone="dark" icon="speed" text="Chưa đo được độ ổn định" hint="Cần ít nhất một yêu cầu hoàn tất (thành công hoặc lỗi) trong kỳ." /> : (
                  <div className="au-gwrap">
                    <Gauge rate={sum.successRate} retry={sum.retryRate} on={on} />
                    <ul className="au-gl">
                      <li><i style={{ background: 'var(--or)' }} />Thành công<b>{formatNum(sum.succeeded)}</b></li>
                      <li><i style={{ background: '#fff' }} />Lỗi<b>{formatNum(failed)}</b></li>
                      <li><i style={{ background: 'var(--gold)' }} />Không lặp prompt<b>{pct100(has(sum.retryRate) ? 1 - sum.retryRate : null)}%</b></li>
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </Rv>

        <Rv className="c8" delay={140}>
          <Card icon="show_chart" title="Chi phí mỗi lượt thành công" sub="Đường: chi phí/lượt thành công · Cột đen: số lỗi trong ngày">
            <Plot loading={loading}><CostLine data={eff?.daily} base={scope === 'user' ? team?.costPerSuccess : undefined} /></Plot>
          </Card>
        </Rv>

        <Rv className="c7">
          <Card icon="grid_view" title="Nhịp sử dụng" sub="Số lượt thành công theo thứ và giờ trong ngày">
            {loading ? <Plot loading /> : <Heatmap heat={eff?.heat} />}
          </Card>
        </Rv>

        <Rv className="c5" delay={120}>
          <Card icon="memory" title="Độ tin cậy theo mô hình" sub="Tỷ lệ thành công của các mô hình dùng nhiều nhất">
            <Plot loading={loading}>{!eff?.models?.length ? <Empty icon="memory" text="Chưa có mô hình nào được dùng" hint="Tỷ lệ thành công từng mô hình sẽ xếp ở đây để bạn biết mô hình nào hay lỗi." /> : <div className="au-scroll"><ModelBars models={eff.models} /></div>}</Plot>
          </Card>
        </Rv>

        {scope === 'team' ? (
          <>
            <Rv className="c7">
              <Card icon="bubble_chart" title="Chi phí/lượt × tỷ lệ thành công" sub={`Mỗi bong bóng là một nhân viên (từ ${MIN_SAMPLE} lượt), kích thước theo số lượt. Chi phí chỉ tính lượt thành công. Bấm để xem chi tiết`}>
                <Plot loading={loading}>{people.length === 0 ? <Empty icon="bubble_chart" text="Chưa đủ mẫu để so sánh" hint={`Mỗi nhân viên cần ít nhất ${MIN_SAMPLE} yêu cầu để xuất hiện thành bong bóng.`} /> : <Scatter people={people} avg={sum?.successRate} avgCost={sum?.costPerSuccess} />}</Plot>
              </Card>
            </Rv>
            <Rv className="c5" delay={120}>
              <Card icon="timer" title="Tốc độ xử lý" sub="Thời gian từ lúc gửi đến lúc hoàn tất · vạch đen là P90">
                <Plot loading={loading}>{lat.length === 0 ? <Empty icon="timer" text="Chưa có dữ liệu tốc độ" hint="Thời gian xử lý được đo cho tác vụ ảnh, video và giọng nói." /> : <div className="au-scroll"><Latency rows={eff.latency} /></div>}</Plot>
              </Card>
            </Rv>
            <Rv className="c5">
              <Card icon="report" title="Lý do lỗi phổ biến" sub="Nhóm theo nội dung thông báo lỗi">
                <Plot loading={loading}>{!eff?.reasons?.length ? <Empty tone="ok" icon="check_circle" text="Không có lỗi nào trong kỳ" hint="Mọi yêu cầu đều chạy trơn tru. Nguyên nhân lỗi sẽ được gom nhóm tại đây nếu có." /> : <div className="au-scroll"><Reasons rows={eff.reasons} /></div>}</Plot>
              </Card>
            </Rv>
            <Rv className="c7" delay={120}>
              <Card icon="military_tech" title="Điểm hiệu quả" sub={`Xếp hạng nhân viên có từ ${MIN_SAMPLE} lượt trở lên`}>
                <Plot loading={loading}>{ranked.length === 0 ? <Empty icon="military_tech" text="Chưa đủ mẫu để xếp hạng" hint={`Điểm hiệu quả chỉ tính cho nhân viên có từ ${MIN_SAMPLE} yêu cầu.`} /> : <div className="au-scroll"><ScoreRank rows={ranked} /></div>}</Plot>
              </Card>
            </Rv>
          </>
        ) : (
          <>
            <Rv className="c5">
              <Card icon="timer" title="Tốc độ xử lý" sub="Thời gian từ lúc gửi đến lúc hoàn tất · vạch đen là P90">
                <Plot loading={loading}>{lat.length === 0 ? <Empty icon="timer" text="Chưa có dữ liệu tốc độ" hint="Thời gian xử lý được đo cho tác vụ ảnh, video và giọng nói." /> : <div className="au-scroll"><Latency rows={eff.latency} /></div>}</Plot>
              </Card>
            </Rv>
            <Rv className="c7" delay={120}>
              <Card icon="report" title="Lý do lỗi phổ biến" sub="Nhóm theo nội dung thông báo lỗi">
                <Plot loading={loading}>{!eff?.reasons?.length ? <Empty tone="ok" icon="check_circle" text="Không có lỗi nào trong kỳ" hint="Mọi yêu cầu đều chạy trơn tru. Nguyên nhân lỗi sẽ được gom nhóm tại đây nếu có." /> : <div className="au-scroll"><Reasons rows={eff.reasons} /></div>}</Plot>
              </Card>
            </Rv>
          </>
        )}
      </div>
    </section>
  )
}

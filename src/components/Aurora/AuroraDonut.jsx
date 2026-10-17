export default function AuroraDonut({ items = [], top, bottom, size = 132 }) {
  const total = items.reduce((a, i) => a + i.value, 0)
  let acc = 0
  return (
    <div className="au-donut-fig" style={{ width: size, height: size }}>
      <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label="Biểu đồ tròn cơ cấu chi phí">
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#FFE8D6" strokeWidth="6" />
        {items.map((it) => {
          const p = total ? (it.value / total) * 100 : 0
          const len = Math.max(p - 1, 0.01)
          const el = (
            <circle
              key={it.key}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={it.color}
              strokeWidth="6"
              strokeDasharray={`${len} ${100 - len}`}
              strokeDashoffset={25 - acc}
            />
          )
          acc += p
          return el
        })}
      </svg>
      <div className="au-donut-mid">
        <b className="au-fd">{top}</b>
        <span>{bottom}</span>
      </div>
    </div>
  )
}

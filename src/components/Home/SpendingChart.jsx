import { useState, useRef, useCallback, useMemo } from 'react';

function niceMax(val, steps = 5) {
  if (!val || val === 0) return steps * 20000; // default 100,000
  const rawStep  = val / steps;
  const mag      = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceStep = Math.ceil(rawStep / mag) * mag;
  return niceStep * steps;
}

function buildYLabels(yMax, steps = 5) {
  return Array.from({ length: steps + 1 }, (_, i) =>
    Math.round((yMax * (steps - i)) / steps),
  );
}

function buildPath(data, key, yMax, viewW = 1000, viewH = 300) {
  if (!data || data.length < 2) return '';
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * viewW,
    y: viewH - (Math.min(Math.max(d[key] || 0, 0), yMax) / yMax) * viewH,
  }));
  let path = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = ((pts[i - 1].x + pts[i].x) / 2).toFixed(1);
    path += ` C${cpx},${pts[i - 1].y.toFixed(1)} ${cpx},${pts[i].y.toFixed(1)} ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
  }
  return path;
}

function formatVND(val) {
  return val.toLocaleString('vi-VN');
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SpendingChart({
  data = [],
  loading = false,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  months,
  years,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const chartRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = chartRef.current?.getBoundingClientRect();
      if (!rect || !data.length) return;
      const x     = e.clientX - rect.left;
      const index = Math.round((x / rect.width) * (data.length - 1));
      setHoveredIndex(Math.max(0, Math.min(data.length - 1, index)));
    },
    [data],
  );
  const handleMouseLeave = useCallback(() => setHoveredIndex(null), []);

  const yMax = useMemo(() => {
    if (!data.length) return 100000;
    const max = Math.max(...data.map((d) => d.total || 0));
    return niceMax(max);
  }, [data]);

  const yLabels = useMemo(() => buildYLabels(yMax), [yMax]);

  const linePath = useMemo(() => buildPath(data, 'total', yMax), [data, yMax]);
  const areaPath = useMemo(
    () => (linePath ? `${linePath} L1000,300 L0,300 Z` : ''),
    [linePath],
  );

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredPct  =
    hoveredIndex !== null && data.length > 1
      ? (hoveredIndex / (data.length - 1)) * 100
      : null;
  const hoveredSvgX =
    hoveredIndex !== null && data.length > 1
      ? ((hoveredIndex / (data.length - 1)) * 1000).toFixed(1)
      : null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-sm rounded-2xl p-8 relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-10">
        <h3 className="text-lg font-bold text-white">Thống kê Tiền đã dùng</h3>

        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-10 min-w-[145px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                {months.map((m) => (
                  <option key={m} value={m} className="bg-slate-800 text-white">
                    Tháng {m}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-10 min-w-[130px] appearance-none rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm font-semibold text-white outline-none cursor-pointer transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-slate-800 text-white">
                    Năm {y}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] leading-none text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-xs font-mono text-slate-300">Tiền</span>
          </div>
        </div>
      </div>

      {/* Chart body */}
      <div className="w-full mt-4" style={{ display: 'grid', gridTemplateColumns: '72px 1fr' }}>
        {/* Y-axis — wider để chứa số VND lớn */}
        <div className="flex flex-col justify-between pb-6 pr-2" style={{ overflow: 'hidden' }}>
          {yLabels.map((v) => (
            <span
              key={v}
              className="text-[10px] text-slate-500 text-right leading-none block truncate"
            >
              {formatVND(v)}
            </span>
          ))}
        </div>

        <div className="flex flex-col min-w-0">
          {/* SVG area */}
          <div
            className="relative cursor-crosshair"
            style={{ height: 360 }}
            ref={chartRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {yLabels.map((v) => (
                <div key={v} className="border-t border-slate-800/50 w-full" />
              ))}
            </div>

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Đang tải dữ liệu...
                </div>
              </div>
            ) : (
              <>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 1000 300"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="amberGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"    />
                    </linearGradient>
                  </defs>

                  {/* Hover line */}
                  {hoveredSvgX !== null && (
                    <line
                      x1={hoveredSvgX} y1={0}
                      x2={hoveredSvgX} y2={300}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* Area */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#amberGradient)" fillOpacity="0.22" />
                  )}

                  {/* Glow */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="6"
                      strokeLinecap="round"
                      opacity="0.2"
                    />
                  )}

                  {/* Main line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {!linePath && (
                    <text x="500" y="155" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="14" fontFamily="sans-serif">
                      Không có dữ liệu
                    </text>
                  )}
                </svg>

                {/* Tooltip */}
                {hoveredData && hoveredPct !== null && (
                  <div
                    className="absolute z-10 pointer-events-none top-3"
                    style={{
                      left: hoveredPct > 72
                        ? `calc(${hoveredPct}% - 160px)`
                        : `calc(${hoveredPct}% + 14px)`,
                    }}
                  >
                    <div
                      className="rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-xl"
                      style={{ minWidth: 150 }}
                    >
                      <p className="text-[10px] text-slate-500 mb-2 font-mono">
                        Ngày {hoveredData.day}
                      </p>
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                          <span className="text-[11px] text-slate-400">Chi tiêu</span>
                        </div>
                        <span className="text-[11px] font-bold text-white">
                          {formatVND(hoveredData.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* X-axis */}
          <div className="relative border-t border-slate-800" style={{ height: 24 }}>
            {data.map((d, i) => {
              const pct       = data.length > 1 ? (i / (data.length - 1)) * 100 : 0;
              const isHovered = hoveredIndex === i;
              return (
                <div
                  key={d.day}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={`w-px h-1.5 ${isHovered ? 'bg-slate-300' : 'bg-slate-700'}`} />
                  <span
                    className={`text-[9px] leading-none mt-0.5 transition-colors ${
                      isHovered ? 'font-bold text-white' : 'text-slate-500'
                    }`}
                  >
                    D{d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
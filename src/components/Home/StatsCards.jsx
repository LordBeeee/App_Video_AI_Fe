export default function StatsCards({ stats, loading, formatCost }) {
  const statCards = [
    {
      label: 'TỔNG PROMPT',
      value: loading ? '...' : stats.totalPrompts.toLocaleString('vi-VN'),
      icon: 'description',
      bg: 'bg-primary-container',
      text: 'text-primary',
      shadow: 'text-primary',
    },
    {
      label: 'ẢNH ĐÃ TẠO',
      value: loading ? '...' : stats.totalImages.toLocaleString('vi-VN'),
      icon: 'image',
      bg: 'bg-primary-container',
      text: 'text-primary',
      shadow: 'text-primary',
    },
    {
      label: 'VIDEO ĐÃ TẠO',
      value: loading ? '...' : stats.totalVideos.toLocaleString('vi-VN'),
      icon: 'videocam',
      bg: 'bg-primary-container',
      text: 'text-primary',
      shadow: 'text-primary',
    },
    {
      label: 'TỔNG CHI TIÊU',
      value: loading ? '...' : formatCost(stats.totalCost),
      icon: 'payments',
      bg: 'bg-primary-container',
      text: 'text-primary',
      shadow: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 shadow-[0_10px_30px_rgba(92,55,24,0.06)] transition-shadow hover:shadow-[0_14px_36px_rgba(243,136,32,0.12)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className={`material-symbols-outlined text-4xl ${card.shadow}`}>
              {card.icon}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
            >
              <span className={`material-symbols-outlined ${card.text}`}>
                {card.icon}
              </span>
            </div>

            <span className="text-xs font-semibold tracking-widest text-on-surface-variant">
              {card.label}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl font-bold text-on-surface">
              {card.value}
            </span>
            <div className="min-h-[18px] mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

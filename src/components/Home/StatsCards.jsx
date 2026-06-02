export default function StatsCards({ stats, loading, formatCost }) {
  const statCards = [
    {
      label: 'TỔNG PROMPT',
      value: loading ? '...' : stats.totalPrompts.toLocaleString('vi-VN'),
      icon: 'description',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      shadow: 'text-indigo-500',
    },
    {
      label: 'ẢNH ĐÃ TẠO',
      value: loading ? '...' : stats.totalImages.toLocaleString('vi-VN'),
      icon: 'image',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      shadow: 'text-cyan-500',
    },
    {
      label: 'VIDEO ĐÃ TẠO',
      value: loading ? '...' : stats.totalVideos.toLocaleString('vi-VN'),
      icon: 'videocam',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      shadow: 'text-purple-500',
    },
    {
      label: 'TỔNG CHI TIÊU',
      value: loading ? '...' : formatCost(stats.totalCost),
      icon: 'payments',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      shadow: 'text-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="bg-slate-900/60 border border-slate-800 backdrop-blur-sm p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group"
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

            <span className="text-xs font-semibold tracking-widest text-slate-400">
              {card.label}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl font-bold text-white">
              {card.value}
            </span>
            <div className="min-h-[18px] mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
export default function ConversationList({ conversations, activeId, onNew, onSelect }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-outline-variant bg-white p-4 xl:flex xl:flex-col">
      <button
        onClick={onNew}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary shadow-sm hover:bg-primary-hover"
      >
        <span className="material-symbols-outlined">add</span>
        Cuộc trò chuyện mới
      </button>
      <div className="custom-scrollbar mt-5 flex-1 space-y-2 overflow-y-auto">
        {conversations.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full rounded-xl px-3 py-3 text-left text-sm ${activeId === item.id ? 'bg-primary-container text-primary-hover' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            <p className="truncate font-medium">{item.title}</p>
            <p className="mt-1 truncate text-xs text-slate-600">{item.modelSlug}</p>
          </button>
        ))}
      </div>
    </aside>
  )
}

export default function ThumbnailRail({ items, selectedId, onSelect, thumbRefs }) {
  return (
    <div className="flex h-full min-h-0 w-24 shrink-0 flex-col overflow-hidden border-l border-outline-variant bg-white">
      <div className="flex-1 min-h-0 overflow-y-auto py-3 px-2 flex flex-col gap-2 scrollbar-hide">
        {items.map((item) => (
          <button
            key={item.id}
            ref={(el) => { thumbRefs.current[item.id] = el; }}
            onClick={() => onSelect(item.id)}
            className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
              item.id === selectedId
                ? "border-primary"
                : "border-transparent hover:border-primary/40"
            }`}
          >
            <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

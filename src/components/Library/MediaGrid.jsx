import MediaCard from "./MediaCard";
import { Empty } from "../Aurora/AuroraUI";

export default function MediaGrid({
  items,
  loading,
  favoritesOnly,
  onSelect,
  onToggleFavorite,
  menuOpenId,
  setMenuOpenId,
  onDownload,
  onDelete,
  deletingId,
  emptyMessage,
}) {
  if (loading && items.length === 0) {
    return (
      <div className="au-scroll">
        <div className="lb-grid">
          {Array.from({ length: 10 }, (_, i) => <div key={i} className="au-sk lb-sk" />)}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty
        icon={favoritesOnly ? "favorite" : "perm_media"}
        text={emptyMessage || (favoritesOnly ? "Bạn chưa thích tài nguyên nào" : "Không có tài nguyên nào phù hợp với bộ lọc")}
      />
    );
  }

  return (
    <div className="au-scroll">
      <div className="lb-grid">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            onDownload={onDownload}
            onDelete={onDelete}
            deleting={deletingId === item.id}
          />
        ))}
      </div>
    </div>
  );
}

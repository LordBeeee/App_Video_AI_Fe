import { useState, useEffect, useCallback, useRef } from "react";
import {
  getLibraryAssetsApi,
  setAssetFavoriteApi,
  uploadAssetApi,
} from "../../services/asset.service";

import FilterBar from "../../components/Library/FilterBar";
import MediaGrid from "../../components/Library/MediaGrid";
import DetailOverlay from "../../components/Library/DetailOverlay";

function mapAssetToItem(asset) {
  const isVideo = asset.assetType === "video";
  return {
    id: asset.id,
    type: asset.assetType,
    category: asset.sourceType === "uploaded" ? "upload" : "creative",
    duration: asset.durationSeconds ? `${asset.durationSeconds}s` : undefined,
    favorite: !!asset.isFavorite,
    // Ảnh đại diện video = frame begin (asset.thumbnailUrl), fallback về chính video nếu chưa join được
    src: isVideo ? (asset.thumbnailUrl || asset.storedUrl) : asset.storedUrl,
    videoSrc: isVideo ? asset.storedUrl : undefined, // dùng khi mở overlay để phát video thật
    alt: `${asset.assetType}_${asset.id}`,
    createdAt: asset.createdAt
      ? new Date(asset.createdAt).toLocaleString("vi-VN")
      : undefined,
    prompt: asset.prompt,
    model: asset.model,
    resolution: asset.resolution,
    displayPriceVnd: asset.priceVnd,
    options: { duration: asset.duration },
    startImages: asset.frames,
  };
}

export default function Library() {
  const [activeTab, setActiveTab] = useState("Creative");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [overlayMenuOpen, setOverlayMenuOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const thumbRefs = useRef({});
  const fileInputRef = useRef(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLibraryAssetsApi({
        tab: activeTab.toLowerCase(),
        type: typeFilter,
        favorite: favoritesOnly,
      });
      setItems((data.items || []).map(mapAssetToItem));
    } catch (err) {
      console.error("Fetch library failed:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, typeFilter, favoritesOnly]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleUploadFile = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        await uploadAssetApi(file);
      }
      await fetchItems();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyPrompt = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleDownload = async (item, e) => {
    e?.stopPropagation();
    setMenuOpenId(null);
    setOverlayMenuOpen(false);
    const fileName = item.name || `${item.type}_${item.id}.${item.type === "video" ? "mp4" : "png"}`;
    try {
      const res = await fetch(item.src, { mode: "cors" });
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed, opening in new tab instead:", err);
      window.open(item.src, "_blank", "noopener,noreferrer");
    }
  };

  const toggleFavorite = async (id) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const next = !target.favorite;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, favorite: next } : item)));
    try {
      await setAssetFavoriteApi(id, next);
    } catch (err) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, favorite: !next } : item)));
      alert(err.message);
    }
  };

  const filteredItems = items;

  const selectedItem = filteredItems.find((i) => i.id === selectedId) || null;
  const selectedIndex = filteredItems.findIndex((i) => i.id === selectedId);

  useEffect(() => {
    if (!selectedId) return;
    const el = thumbRefs.current[selectedId];
    if (el) {
      el.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [selectedId, filteredItems]);

  const goTo = (dir) => {
    if (selectedIndex === -1) return;
    const nextIndex = (selectedIndex + dir + filteredItems.length) % filteredItems.length;
    setSelectedId(filteredItems[nextIndex].id);
    setOverlayMenuOpen(false);
  };

  return (
    // FIX 1: khoá chiều cao = viewport để cả trang không bao giờ bị đẩy cuộn
    <main className="h-screen flex-1 flex flex-col relative overflow-hidden bg-background">
      {/* Header */}
      <div className="items-center gap-4 p-8 pb-2">
        <h1 className="text-2xl font-semibold text-white">Thư Viện</h1>
        <p className="text-slate-400 text-sm mt-1">
          Danh sách tài nguyên sẽ được hiển thị ở đây.
        </p>
      </div>

      {/* Canvas / Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-8 pt-0 relative">
        <FilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          favoritesOnly={favoritesOnly}
          setFavoritesOnly={setFavoritesOnly}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onUploadFile={handleUploadFile}
        />

        <MediaGrid
          items={filteredItems}
          favoritesOnly={favoritesOnly}
          onSelect={setSelectedId}
          onToggleFavorite={toggleFavorite}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          onDownload={handleDownload}
        />
      </div>

      {/* Detail / Preview Overlay */}
      {selectedItem && (
        <DetailOverlay
          item={selectedItem}
          items={filteredItems}
          onClose={() => setSelectedId(null)}
          onPrev={() => goTo(-1)}
          onNext={() => goTo(1)}
          onSelect={setSelectedId}
          onToggleFavorite={toggleFavorite}
          onDownload={handleDownload}
          overlayMenuOpen={overlayMenuOpen}
          setOverlayMenuOpen={setOverlayMenuOpen}
          onCopyPrompt={handleCopyPrompt}
          promptCopied={promptCopied}
          thumbRefs={thumbRefs}
        />
      )}
    </main>
  );
}

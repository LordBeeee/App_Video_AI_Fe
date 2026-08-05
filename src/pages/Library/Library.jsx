import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  getLibraryAssetsApi,
  setAssetFavoriteApi,
  uploadAssetApi,
} from "../../services/asset.service";

import { getElementsHistoryApi, deleteElementApi, setElementFavoriteApi } from "../../services/element.service";
import { useCreateElement } from "../../hooks/useCreateElement";
import FilterBar from "../../components/Library/FilterBar";
import MediaGrid from "../../components/Library/MediaGrid";
import DetailOverlay from "../../components/Library/DetailOverlay";
import CreateElementModal from "../../components/Library/CreateElementModal";

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
    resolution: asset.mode,
    startImages: asset.frames,
  };
}

function mapElementToItem(el) {
  const isVideo = el.referenceType === "video_refer"
  return {
    id: `element-${el.id}`,
    rawId: el.id,
    type: isVideo ? "video" : "image",
    category: "element",
    favorite: !!el.isFavorite,
    src: isVideo ? el.videoUrl : el.frontalImageUrl,
    videoSrc: isVideo ? el.videoUrl : undefined,
    alt: el.elementName,
    createdAt: el.createdAt ? new Date(el.createdAt).toLocaleString("vi-VN") : undefined,
    status: el.status,
    prompt: el.elementDescription,
    provider: el.providerName,
  }
}

export default function Library() {
  const [activeTab, setActiveTab] = useState("Creative");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [items, setItems] = useState([]);
  const [elementItemsRaw, setElementItemsRaw] = useState([]); // ← THÊM: Element, CHƯA lọc
  const [providerFilter, setProviderFilter] = useState("all");        // ← THÊM
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [overlayMenuOpen, setOverlayMenuOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const thumbRefs = useRef({});
  const fileInputRef = useRef(null);
  const [createElementOpen, setCreateElementOpen] = useState(false);
  const createElementHook = useCreateElement();                  

  const fetchItems = useCallback(async () => {
    if (activeTab === "Element") {
      setLoading(true);
      try {
        const data = await getElementsHistoryApi();
        setElementItemsRaw((data || []).map(mapElementToItem));
      } catch (err) {
        console.error("Fetch elements failed:", err);
        setElementItemsRaw([]);
      } finally {
        setLoading(false);
      }
      return;
    }
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

  const providers = useMemo(
    () => Array.from(new Set(elementItemsRaw.map((i) => i.provider).filter(Boolean))),
    [elementItemsRaw],
  );

  const displayItems = useMemo(() => {
    if (activeTab !== "Element") return items;
    let list = elementItemsRaw;
    if (typeFilter !== "all") list = list.filter((i) => i.type === typeFilter);
    if (favoritesOnly) list = list.filter((i) => i.favorite);
    if (providerFilter !== "all") list = list.filter((i) => i.provider === providerFilter);
    return list;
  }, [activeTab, items, elementItemsRaw, typeFilter, favoritesOnly, providerFilter]);

  const toggleFavorite = async (id) => {
    const source = activeTab === "Element" ? elementItemsRaw : items; // ← SỬA
    const setSource = activeTab === "Element" ? setElementItemsRaw : setItems; // ← SỬA
    const target = source.find((i) => i.id === id);
    if (!target) return;
    const next = !target.favorite;
    setSource((prev) => prev.map((item) => (item.id === id ? { ...item, favorite: next } : item)));
    try {
      if (target.category === "element") {
        await setElementFavoriteApi(target.rawId, next);
      } else {
        await setAssetFavoriteApi(id, next);
      }
    } catch (err) {
      setSource((prev) => prev.map((item) => (item.id === id ? { ...item, favorite: !next } : item)));
      alert(err.message);
    }
  };

  const handleDeleteElement = async (item, e) => {
    e?.stopPropagation();
    setMenuOpenId(null);
    setOverlayMenuOpen(false);
    if (!window.confirm(`Xóa element "${item.alt}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteElementApi(item.rawId);
      setElementItemsRaw((prev) => prev.filter((i) => i.id !== item.id)); // ← SỬA: nguồn đúng là elementItemsRaw
      if (selectedId === item.id) setSelectedId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredItems = displayItems;

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
          onOpenCreateElement={() => setCreateElementOpen(true)}
          providerFilter={providerFilter}           
          setProviderFilter={setProviderFilter}      
          providerDropdownOpen={providerDropdownOpen}
          setProviderDropdownOpen={setProviderDropdownOpen}
          providers={providers} 
        />

        <MediaGrid
          items={filteredItems}
          favoritesOnly={favoritesOnly}
          onSelect={setSelectedId}
          onToggleFavorite={toggleFavorite}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          onDownload={handleDownload}
          onDelete={handleDeleteElement}
        />
      </div>

      {/* Detail / Preview Overlay - giống Kling */}
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
          onDelete={handleDeleteElement}
        />
      )}

      <CreateElementModal
        open={createElementOpen}
        onClose={() => setCreateElementOpen(false)}
        createElementHook={createElementHook}
        onCreated={fetchItems}
      />
    </main>
  );
}
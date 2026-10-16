import { useState, useEffect, useCallback, useRef } from "react";
import {
  getLibraryAssetsApi,
  setAssetFavoriteApi,
  uploadAssetApi,
  getReferencesApi,
} from "../../services/asset.service";

import FilterBar from "../../components/Library/FilterBar";
import MediaGrid from "../../components/Library/MediaGrid";
import DetailOverlay from "../../components/Library/DetailOverlay";
import CreateReferenceModal from "../../components/Library/CreateReferenceModal";

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
  const [providerFilter, setProviderFilter] = useState("all");
  const [fetchError, setFetchError] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingReference, setCreatingReference] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [overlayMenuOpen, setOverlayMenuOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const thumbRefs = useRef({});
  const fileInputRef = useRef(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeTab === "Reference" ? await getReferencesApi() : await getLibraryAssetsApi({
        tab: activeTab.toLowerCase(),
        type: typeFilter,
        favorite: favoritesOnly,
      });
      setItems((data.items || []).map((asset) => ({ ...mapAssetToItem(asset),
        name: asset.metadata?.name, provider: asset.metadata?.provider,
        status: asset.metadata?.status, elementId: asset.metadata?.elementId,
        voiceId: asset.metadata?.voiceId, trialUrl: asset.metadata?.trialUrl,
        role: asset.assetRole, error: asset.metadata?.error,
      })).filter((item) => !favoritesOnly || item.favorite).filter((item) => typeFilter === "all" || item.type === typeFilter).filter((item) => activeTab !== "Reference" || providerFilter === "all" || item.provider === providerFilter));
      setFetchError("");
    } catch (err) {
      console.error("Fetch library failed:", err);
      setFetchError(err.message || "Không tải được thư viện");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, typeFilter, favoritesOnly, providerFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (activeTab !== "Reference" || !items.some((item) => ["submitted", "processing"].includes(item.status))) return;
    const timer = setInterval(fetchItems, 10000);
    return () => clearInterval(timer);
  }, [activeTab, items, fetchItems]);

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
      <div className="items-center gap-4 px-4 pb-2 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <h1 className="text-2xl font-semibold text-on-background">Thư Viện</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Danh sách tài nguyên sẽ được hiển thị ở đây.
        </p>
      </div>

      {/* Canvas / Content Scrollable Area */}
      <div className="relative flex-1 overflow-y-auto px-4 pb-8 pt-0 scrollbar-hide sm:px-6 lg:px-8">
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
          onCreateReference={() => setCreatingReference(true)}
          providerFilter={providerFilter}
          setProviderFilter={setProviderFilter}
        />

        {fetchError && <p role="alert" className="mb-4 text-sm text-red-500">{fetchError}</p>}
        {activeTab === "Reference" && !loading && !fetchError && !filteredItems.length && <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-primary/30 bg-white py-12 text-center text-on-surface-variant"><span className="material-symbols-outlined text-4xl opacity-50">search_off</span><p>Chưa có Reference phù hợp.</p></div>}
        {activeTab === "Reference" ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{filteredItems.map((item) => <article key={item.id} className="overflow-hidden rounded-xl border border-outline-variant bg-white">
          {item.role === "voice" ? <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 bg-primary-container p-4"><span className="material-symbols-outlined text-6xl text-primary">graphic_eq</span><audio controls src={item.trialUrl || item.src} className="w-full" /></div> : <button type="button" onClick={() => setSelectedId(item.id)} className="relative aspect-[4/5] w-full bg-surface-variant">{item.type === "video" ? <video src={item.videoSrc || item.src} muted className="h-full w-full object-cover" /> : <img src={item.src} alt={item.name || "Element"} className="h-full w-full object-cover" />}</button>}
          <div className="flex items-center justify-between gap-2 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="text-xs text-on-surface-variant">{item.provider} · {item.role === "voice" ? "VOICE" : item.type === "video" ? "VIDEO" : "IMG"}</p></div><button type="button" onClick={() => toggleFavorite(item.id)} aria-label="Favorite" className={item.favorite ? "text-red-500" : "text-on-surface-variant"}><span className="material-symbols-outlined">favorite</span></button></div>
          <div className="flex items-center justify-between border-t border-outline-variant px-3 pb-3 pt-2 text-xs text-on-surface-variant"><span>{item.status === "succeed" ? "Sẵn sàng" : item.status === "failed" ? "Lỗi" : "Đang xử lý"}</span>{item.role === "voice" && item.voiceId && <button type="button" onClick={() => navigator.clipboard.writeText(String(item.voiceId))} className="text-primary hover:underline">Sao chép Voice ID</button>}</div>
          {item.error && <p className="px-3 pb-3 text-xs text-red-500">{item.error}</p>}
        </article>)}</div> : <MediaGrid
          items={filteredItems}
          favoritesOnly={favoritesOnly}
          onSelect={setSelectedId}
          onToggleFavorite={toggleFavorite}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          onDownload={handleDownload}
        />}
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
      {creatingReference && <CreateReferenceModal onClose={() => setCreatingReference(false)} onCreated={fetchItems} />}
    </main>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getLibraryAssetsApi,
  setAssetFavoriteApi,
  uploadAssetApi,
  getReferencesApi,
  deleteReferenceApi,
} from "../../services/asset.service";

import FilterBar, { TabBar } from "../../components/Library/FilterBar";
import { Page, Card, ErrorBox } from "../../components/Aurora/AuroraUI";
import MediaGrid from "../../components/Library/MediaGrid";
import DetailOverlay from "../../components/Library/DetailOverlay";
import CreateReferenceModal from "../../components/Library/CreateReferenceModal";
import { mapAssetToItem } from "../../utils/library.utils";
import "../../components/Library/library.css";

export default function Library() {
  const [activeTab, setActiveTab] = useState("Creative");
  const [typeFilter, setTypeFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [providerFilter, setProviderFilter] = useState("all");
  const [fetchError, setFetchError] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingReference, setCreatingReference] = useState(false);
  const [deletingReferenceId, setDeletingReferenceId] = useState(null);
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
      setItems((data.items || [])
        .map(mapAssetToItem)
        .filter((item) => !favoritesOnly || item.favorite)
        .filter((item) => typeFilter === "all" || item.type === typeFilter)
        .filter((item) => activeTab !== "Reference" || providerFilter === "all" || item.provider === providerFilter));
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
    if (activeTab !== "Reference" || !items.some((item) =>
      ["submitted", "processing"].includes(item.status) ||
      ["submitted", "processing"].includes(item.deleteStatus))) return;
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
    const url = item.type === "video" ? (item.videoSrc || item.src) : item.type === "audio" ? (item.trialUrl || item.src) : item.src;
    const extension = item.type === "video" ? "mp4" : item.type === "audio" ? "mp3" : "png";
    const baseName = item.name || `${item.type}_${item.id}`;
    const fileName = /\.[a-z0-9]{2,5}$/i.test(baseName) ? baseName : `${baseName}.${extension}`;
    try {
      const res = await fetch(url, { mode: "cors" });
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
      window.open(url, "_blank", "noopener,noreferrer");
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

  const handleDeleteReference = async (item) => {
    setMenuOpenId(null);
    setOverlayMenuOpen(false);
    if (!window.confirm(`Xóa Reference "${item.name || item.id}" khỏi Kling và thư viện?`)) return;
    setDeletingReferenceId(item.id);
    try {
      await deleteReferenceApi(item.id);
      setSelectedId((current) => current === item.id ? null : current);
      await fetchItems();
    } catch (err) {
      alert(err.message);
      await fetchItems();
    } finally {
      setDeletingReferenceId(null);
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
    <Page>
      <header className="au-head">
        <h1 className="au-title au-fd">Thư viện</h1>
        <div className="au-tools">
          <TabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            uploading={uploading}
            fileInputRef={fileInputRef}
            onUploadFile={handleUploadFile}
            onCreateReference={() => setCreatingReference(true)}
          />
        </div>
      </header>

      <FilterBar
        activeTab={activeTab}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        favoritesOnly={favoritesOnly}
        setFavoritesOnly={setFavoritesOnly}
        providerFilter={providerFilter}
        setProviderFilter={setProviderFilter}
        count={filteredItems.length}
      />

      {fetchError ? (
        <ErrorBox message={fetchError} onRetry={fetchItems} />
      ) : (
        <Card className="lb-card">
          <MediaGrid
            items={filteredItems}
            loading={loading}
            favoritesOnly={favoritesOnly}
            onSelect={setSelectedId}
            onToggleFavorite={toggleFavorite}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            onDownload={handleDownload}
            onDelete={activeTab === "Reference" ? handleDeleteReference : undefined}
            deletingId={deletingReferenceId}
            emptyMessage={activeTab === "Reference" && !loading ? "Chưa có Reference phù hợp" : undefined}
          />
        </Card>
      )}

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
          onDelete={activeTab === "Reference" ? handleDeleteReference : undefined}
          deleting={deletingReferenceId === selectedItem.id}
          overlayMenuOpen={overlayMenuOpen}
          setOverlayMenuOpen={setOverlayMenuOpen}
          onCopyPrompt={handleCopyPrompt}
          promptCopied={promptCopied}
          thumbRefs={thumbRefs}
        />
      )}
      {creatingReference && <CreateReferenceModal onClose={() => setCreatingReference(false)} onCreated={fetchItems} />}
    </Page>
  );
}

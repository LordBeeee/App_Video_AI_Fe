import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getLibraryAssetsApi,
  setAssetFavoriteApi,
  uploadAssetApi,
  getElementsApi,
  getVoicesApi,
  deleteElementApi,
  deleteVoiceApi,
} from "../../services/asset.service";

import FilterBar, { LibraryAction, TabBar } from "../../components/Library/FilterBar";
import { Page, Card, ErrorBox } from "../../components/Aurora/AuroraUI";
import MediaGrid from "../../components/Library/MediaGrid";
import DetailOverlay from "../../components/Library/DetailOverlay";
import CreateCustomAssetModal from "../../components/Library/CreateCustomAssetModal";
import { Toast } from "../../components/UserDetail/UserDetailUI";
import { mapAssetToItem } from "../../utils/library.utils";
import "../../components/Library/library.css";

const EMPTY_ITEMS = [];

export default function Library() {
  const [activeTab, setActiveTab] = useState("Creative");
  const [typeFilter, setTypeFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [providerFilter, setProviderFilter] = useState("all");
  const [fetchErrors, setFetchErrors] = useState({});
  const [itemsByTab, setItemsByTab] = useState({});
  const [loadingTab, setLoadingTab] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [creatingAssetKind, setCreatingAssetKind] = useState(null);
  const [deletingAssetId, setDeletingAssetId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [overlayMenuOpen, setOverlayMenuOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const thumbRefs = useRef({});
  const fileInputRef = useRef(null);
  const itemsByTabRef = useRef({});
  const requestIdsRef = useRef({});

  const updateTabItems = useCallback((tab, nextItems) => {
    itemsByTabRef.current = { ...itemsByTabRef.current, [tab]: nextItems };
    setItemsByTab(itemsByTabRef.current);
  }, []);

  const fetchItems = useCallback(async (tab) => {
    const requestId = (requestIdsRef.current[tab] || 0) + 1;
    requestIdsRef.current[tab] = requestId;
    if (!itemsByTabRef.current[tab]) {
      setLoadingTab(tab);
      setFetchErrors((current) => ({ ...current, [tab]: "" }));
    }
    try {
      const data = tab === "Element" ? await getElementsApi() : tab === "Voice" ? await getVoicesApi() : await getLibraryAssetsApi({
        tab: tab.toLowerCase(),
      });
      if (requestIdsRef.current[tab] !== requestId) return;
      updateTabItems(tab, (data.items || []).map(mapAssetToItem));
      setFetchErrors((current) => ({ ...current, [tab]: "" }));
    } catch (err) {
      if (requestIdsRef.current[tab] !== requestId) return;
      console.error("Fetch library failed:", err);
      setFetchErrors((current) => ({ ...current, [tab]: err.message || "Không tải được thư viện" }));
    } finally {
      if (requestIdsRef.current[tab] === requestId) {
        setLoadingTab((current) => current === tab ? null : current);
      }
    }
  }, [updateTabItems]);

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab, fetchItems]);

  const items = itemsByTab[activeTab] || EMPTY_ITEMS;
  const filteredItems = useMemo(() => items
    .filter((item) => !favoritesOnly || item.favorite)
    .filter((item) => typeFilter === "all" || item.type === typeFilter)
    .filter((item) => !["Element", "Voice"].includes(activeTab) || providerFilter === "all" || item.provider === providerFilter),
  [items, favoritesOnly, typeFilter, activeTab, providerFilter]);

  useEffect(() => {
    setMenuOpenId(null);
  }, [activeTab, typeFilter, favoritesOnly, providerFilter]);

  useEffect(() => {
    if (!["Element", "Voice"].includes(activeTab) || !items.some((item) =>
      ["submitted", "processing"].includes(item.status) ||
      ["submitted", "processing"].includes(item.deleteStatus))) return;
    const timer = setInterval(() => fetchItems(activeTab), 10000);
    return () => clearInterval(timer);
  }, [activeTab, items, fetchItems]);

  const handleUploadFile = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploadError("");
    setUploading(true);
    try {
      for (const file of files) {
        await uploadAssetApi(file);
      }
      await fetchItems("Upload");
    } catch (err) {
      setUploadError(err.message || "Tải file lên thất bại");
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
    updateTabItems(activeTab, items.map((item) => (item.id === id ? { ...item, favorite: next } : item)));
    try {
      await setAssetFavoriteApi(id, next);
    } catch (err) {
      updateTabItems(activeTab, (itemsByTabRef.current[activeTab] || []).map((item) =>
        item.id === id ? { ...item, favorite: !next } : item));
      alert(err.message);
    }
  };

  const handleDeleteCustomAsset = async (item) => {
    setMenuOpenId(null);
    setOverlayMenuOpen(false);
    const kind = item.role === "voice" ? "Voice" : "Element";
    if (!window.confirm(`Xóa ${kind} "${item.name || item.id}" khỏi Kling và thư viện?`)) return;
    setDeletingAssetId(item.id);
    try {
      await (item.role === "voice" ? deleteVoiceApi(item.id) : deleteElementApi(item.id));
      setSelectedId((current) => current === item.id ? null : current);
      await fetchItems(kind);
    } catch (err) {
      alert(err.message);
      await fetchItems(kind);
    } finally {
      setDeletingAssetId(null);
    }
  };

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
      <header className="au-head lb-head">
        <h1 className="au-title au-fd">Thư viện</h1>
        <div className="au-tools">
          <LibraryAction
            activeTab={activeTab}
            uploading={uploading}
            fileInputRef={fileInputRef}
            onUploadFile={handleUploadFile}
            onCreateCustomAsset={() => setCreatingAssetKind(activeTab.toLowerCase())}
          />
          <TabBar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setTypeFilter("all"); }} />
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

      {fetchErrors[activeTab] && !itemsByTab[activeTab] ? (
        <ErrorBox message={fetchErrors[activeTab]} onRetry={() => fetchItems(activeTab)} />
      ) : (
        <Card className="lb-card">
          <MediaGrid
            items={filteredItems}
            loading={loadingTab === activeTab || !itemsByTab[activeTab]}
            favoritesOnly={favoritesOnly}
            onSelect={setSelectedId}
            onToggleFavorite={toggleFavorite}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            onDownload={handleDownload}
            onDelete={["Element", "Voice"].includes(activeTab) ? handleDeleteCustomAsset : undefined}
            deletingId={deletingAssetId}
            emptyMessage={["Element", "Voice"].includes(activeTab) && loadingTab !== activeTab ? `Chưa có ${activeTab} phù hợp` : undefined}
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
          onDelete={["Element", "Voice"].includes(activeTab) ? handleDeleteCustomAsset : undefined}
          deleting={deletingAssetId === selectedItem.id}
          overlayMenuOpen={overlayMenuOpen}
          setOverlayMenuOpen={setOverlayMenuOpen}
          onCopyPrompt={handleCopyPrompt}
          promptCopied={promptCopied}
          thumbRefs={thumbRefs}
        />
      )}
      {creatingAssetKind && <CreateCustomAssetModal assetKind={creatingAssetKind} onClose={() => setCreatingAssetKind(null)} onCreated={() => {
        fetchItems(creatingAssetKind === "voice" ? "Voice" : "Element");
        fetchItems("Upload");
      }} />}
      {uploadError && <div role="alert"><Toast message={uploadError} type="error" onClose={() => setUploadError("")} /></div>}
    </Page>
  );
}

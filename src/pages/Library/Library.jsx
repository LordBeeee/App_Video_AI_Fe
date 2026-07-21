import { useState, useEffect, useCallback, useRef } from "react";
import {
  getLibraryAssetsApi,
  setAssetFavoriteApi,
  uploadAssetApi,
} from "../../services/asset.service";

const FILTER_TABS = ["Creative", "Upload", "Element"];
const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
];

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
  const thumbRailRef = useRef(null);
  const thumbRefs = useRef({});

  const fetchItems = useCallback(async () => {
    if (activeTab === "Element") {
      setItems([]);
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
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await uploadAssetApi(file);
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
    // optimistic update
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, favorite: next } : item)));
    try {
      await setAssetFavoriteApi(id, next);
    } catch (err) {
      // rollback nếu API fail
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, favorite: !next } : item)));
      alert(err.message);
    }
  };

  const filteredItems = items; // filter type/favorite đã xử lý ở BE, không lọc lại ở FE

  const selectedItem = items.find((i) => i.id === selectedId) || null;
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

      {/* Canvas / Content Scrollable Area (đây là vùng lưới, được phép cuộn) */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-8 pt-0 relative">
        {/* Filters row - sticky khi cuộn */}
        <div className="sticky top-0 z-20 bg-background backdrop-blur-sm flex items-center justify-between gap-3 mb-4 flex-wrap pt-2 pb-2 -mx-8 px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors border ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                    : "bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              aria-pressed={favoritesOnly}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors select-none ${
                favoritesOnly
                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] transition-colors ${
                  favoritesOnly ? "text-red-500" : "text-slate-400"
                }`}
                style={favoritesOnly ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                favorite
              </span>
              Favorites
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors text-sm font-medium"
              >
                {TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label}
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-40 overflow-hidden">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setTypeFilter(opt.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        typeFilter === opt.value
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className="media-card group relative bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500/60 transition-colors cursor-pointer flex flex-col aspect-[4/5]"
            >
              <div className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={item.src}
                  alt={item.alt}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm bg-black/40 transition-opacity duration-200 z-10 ${
                    item.favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] transition-colors ${
                      item.favorite ? "text-red-500" : "text-white hover:text-red-400"
                    }`}
                    style={item.favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    favorite
                  </span>
                </button>

                {item.type === "video" && (
                  <div className="play-overlay absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/90 flex items-center justify-center backdrop-blur-sm">
                      <span
                        className="material-symbols-outlined text-white ml-1"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_arrow
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-800/60 border-t border-slate-700 flex justify-between items-center shrink-0">
                {item.type === "video" ? (
                  <div className="bg-slate-900 px-2 py-1 rounded text-xs font-mono text-slate-400 font-medium">
                    {item.duration}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded text-xs font-mono text-slate-400 font-medium">
                    <span className="material-symbols-outlined text-[14px]">image</span>
                    IMG
                  </div>
                )}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId((id) => (id === item.id ? null : item.id));
                    }}
                    className={`text-slate-400 hover:text-indigo-400 transition-colors ${
                      menuOpenId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                  </button>

                  {menuOpenId === item.id && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                        }}
                      />
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-full right-0 mb-2 w-36 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-40 overflow-hidden"
                      >
                        <button
                          onClick={(e) => handleDownload(item, e)}
                          className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          Download
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="mt-12 text-center text-slate-400 flex flex-col items-center justify-center gap-4 py-12 border border-dashed border-slate-700 rounded-2xl bg-slate-900/40">
            <span className="material-symbols-outlined text-4xl opacity-50">search_off</span>
            <p>
              {favoritesOnly
                ? "Bạn chưa thích tài nguyên nào."
                : "Không có tài nguyên nào phù hợp với bộ lọc."}
            </p>
          </div>
        )}
      </div>

      {/* ===== Detail / Preview Overlay - giống Kling ===== */}
      {selectedItem && (
        // FIX 2: "fixed inset-0" thay vì "absolute inset-0" -> overlay luôn bám theo
        // viewport, không phụ thuộc vị trí cuộn của khối cha (khối lưới bên trên).
        // Đây là nguyên nhân khiến trước đây cảm giác "cả trang" bị cuộn theo.
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-150">
          {/* Top bar - đứng yên, không có overflow */}
          <div className="flex items-center justify-between px-6 h-16 shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <span className="text-white font-medium text-sm">
                {selectedItem.name || `${selectedItem.type}_${selectedItem.id}.${selectedItem.type === "video" ? "mp4" : "png"}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(selectedItem.id)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    selectedItem.favorite ? "text-red-500" : "text-slate-300"
                  }`}
                  style={selectedItem.favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  favorite
                </span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setOverlayMenuOpen((o) => !o)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>

                {overlayMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setOverlayMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-40 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-40 overflow-hidden">
                      <button
                        onClick={(e) => handleDownload(selectedItem, e)}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Download
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Body: main preview (đứng yên, KHÔNG overflow) + panel bên phải (cuộn riêng) */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Main preview area - không có overflow-y, không cuộn */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-8 gap-4 overflow-hidden">
              {/* Prev / Next nav */}
              <button
                onClick={() => goTo(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors z-10"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => goTo(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors z-10"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>

              <div className="max-w-3xl w-full max-h-[70vh] rounded-xl overflow-hidden bg-black flex items-center justify-center">
                {selectedItem.type === "video" ? (
                  <video
                    key={selectedItem.id}
                    // src={selectedItem.src}
                    src={selectedItem.videoSrc || selectedItem.src}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.alt}
                    className="w-full h-full max-h-[70vh] object-contain"
                  />
                )}
              </div>
            </div>

            {/* Panel thông tin bên phải - CHỈ hiện khi item thuộc Creative */}
            {selectedItem.category === "creative" && (
              <div className="w-96 shrink-0 border-l border-slate-800 overflow-y-auto p-5 flex flex-col gap-5 scrollbar-hide">
                {/* Header của panel: icon + label + hàng icon thao tác nhanh */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-medium text-sm">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      {selectedItem.type === "video" ? "movie" : "image"}
                    </span>
                    {selectedItem.type === "video" ? "Video" : "Image"}
                  </div>
                </div>

                {selectedItem.createdAt && (
                  <p className="text-xs text-slate-500 -mt-3">{selectedItem.createdAt}</p>
                )}

                {selectedItem.startImages?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Frames</h3>
                    <div className="flex items-center gap-2">
                      {selectedItem.startImages.map((src, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-700"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.prompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">Prompt</h3>
                      <button
                        onClick={() => handleCopyPrompt(selectedItem.prompt)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {promptCopied ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{selectedItem.prompt}</p>
                  </div>
                )}

                {/* Model / Resolution tách riêng thành 2 badge, dùng chung cho cả ảnh và video */}
                {(selectedItem.model || selectedItem.resolution) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedItem.model && (
                      <span className="text-xs text-slate-400 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-md">
                        {selectedItem.model}
                      </span>
                    )}
                    {selectedItem.resolution && (
                      <span className="text-xs text-slate-400 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-md">
                        {selectedItem.resolution}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail rail bên phải - CHỈ khối này được cuộn */}
            <div className="w-24 h-full shrink-0 border-l border-slate-800 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto py-3 px-2 flex flex-col gap-2 scrollbar-hide">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    ref={(el) => { thumbRefs.current[item.id] = el; }}
                    onClick={() => setSelectedId(item.id)}
                    className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      item.id === selectedItem.id
                        ? "border-indigo-500"
                        : "border-transparent hover:border-slate-600"
                    }`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
import { useEffect, useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { getLibraryAssetsApi, setAssetFavoriteApi } from "../../services/asset.service"

const TABS = [
  { key: "creative", label: "Sáng tạo" },
  { key: "upload", label: "Tải lên" },
]

export default function AssetPickerModal({ open, onClose, onSelect, assetType = "image" }) {
  const isVideo = assetType === "video"
  const mediaLabel = isVideo ? "video" : "ảnh"

  const [activeTab, setActiveTab] = useState("upload")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedId(null)
    setActiveTab("upload")
    setFavoritesOnly(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getLibraryAssetsApi({ tab: activeTab, type: assetType, favorite: favoritesOnly })
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [open, activeTab, favoritesOnly, assetType])

  const selectedAsset = useMemo(
    () => items.find((i) => i.id === selectedId) || null,
    [items, selectedId],
  )

  const handleToggleFavorite = async (assetId, e) => {
    e.stopPropagation()
    const target = items.find((i) => i.id === assetId)
    if (!target) return
    const next = !target.isFavorite

    setItems((prev) =>
      prev.map((item) => (item.id === assetId ? { ...item, isFavorite: next } : item)),
    )
    try {
      await setAssetFavoriteApi(assetId, next)
      if (favoritesOnly && !next) {
        setItems((prev) => prev.filter((item) => item.id !== assetId))
        if (selectedId === assetId) setSelectedId(null)
      }
    } catch (err) {
      setItems((prev) =>
        prev.map((item) => (item.id === assetId ? { ...item, isFavorite: !next } : item)),
      )
      alert(err.message)
    }
  }

  if (!open) return null

  const handleConfirm = () => {
    if (!selectedAsset) return
    onSelect(selectedAsset)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-semibold text-white">
            Chọn {mediaLabel} {selectedAsset ? "(1/1)" : "(0/1)"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Tabs + Favorites filter */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-500" />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              favoritesOnly
                ? "border-indigo-500 bg-indigo-600/15 text-indigo-300"
                : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600 hover:text-white"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                favoritesOnly ? "text-red-500" : "text-slate-400"
              }`}
              style={favoritesOnly ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
            Favorites
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              Đang tải...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <span className="material-symbols-outlined text-3xl opacity-50">
                {isVideo ? "video_library" : "image_not_supported"}
              </span>
              {favoritesOnly
                ? `Chưa có ${mediaLabel} yêu thích nào.`
                : activeTab === "upload"
                ? `Chưa có ${mediaLabel} nào trong thư viện. Vào Thư Viện → tab Upload để tải lên.`
                : `Chưa có ${mediaLabel} sáng tạo nào.`}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
              {items.map((asset) => {
                const isSelected = asset.id === selectedId
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedId(isSelected ? null : asset.id)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-indigo-500"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    {isVideo ? (
                      <video
                        src={asset.storedUrl}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <img
                        src={asset.storedUrl}
                        alt={`asset_${asset.id}`}
                        className="h-full w-full object-cover"
                      />
                    )}

                    {/* Nút yêu thích */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(asset.id, e)}
                      className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
                        asset.isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] transition-colors ${
                          asset.isFavorite ? "text-red-500" : "text-white hover:text-red-400"
                        }`}
                        style={asset.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        favorite
                      </span>
                    </button>

                    {isSelected && (
                      <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAsset}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
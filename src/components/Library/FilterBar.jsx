export const FILTER_TABS = ["Creative", "Upload"];

export const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
];

export default function FilterBar({
  activeTab,
  setActiveTab,
  typeFilter,
  setTypeFilter,
  dropdownOpen,
  setDropdownOpen,
  favoritesOnly,
  setFavoritesOnly,
  uploading,
  fileInputRef,
  onUploadFile,
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 bg-background/95 px-4 pb-2 pt-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors border ${
              activeTab === tab
                ? "border-primary bg-primary text-on-primary shadow-[0_6px_16px_rgba(243,136,32,0.2)]"
                : "border-outline-variant bg-white text-on-surface-variant hover:border-primary/50 hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {activeTab === "Upload" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              onChange={onUploadFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {uploading ? "progress_activity" : "upload"}
              </span>
              {uploading ? "Đang tải lên..." : "Tải lên"}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setFavoritesOnly((v) => !v)}
          aria-pressed={favoritesOnly}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors select-none ${
            favoritesOnly
              ? "border-primary bg-primary-container text-primary-hover"
              : "border-outline-variant bg-white text-on-surface-variant hover:border-primary/50 hover:text-primary"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-colors ${
              favoritesOnly ? "text-red-500" : "text-on-surface-variant"
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
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            {TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label}
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-40 mt-2 w-40 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTypeFilter(opt.value);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    typeFilter === opt.value
                      ? "bg-primary-container text-primary-hover"
                      : "text-on-surface hover:bg-surface-variant"
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
  );
}

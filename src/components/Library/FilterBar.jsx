export const FILTER_TABS = ["Creative", "Upload", "Element"];

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
  onOpenCreateElement,
}) {
  return (
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
        {activeTab === "Upload" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={onUploadFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {uploading ? "progress_activity" : "upload"}
              </span>
              {uploading ? "Đang tải lên..." : "Tải lên"}
            </button>
          </>
        )}

        {activeTab === "Element" && (
          <button
            type="button"
            onClick={onOpenCreateElement}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tạo Element
          </button>
        )}

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
  );
}

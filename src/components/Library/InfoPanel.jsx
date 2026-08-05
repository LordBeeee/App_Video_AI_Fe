export default function InfoPanel({ item, onCopyPrompt, promptCopied }) {
  return (
    <div className="w-96 shrink-0 border-l border-slate-800 overflow-y-auto p-5 flex flex-col gap-5 scrollbar-hide">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-medium text-sm">
          <span className="material-symbols-outlined text-[18px] text-slate-400">
            {item.type === "video" ? "movie" : "image"}
          </span>
          {item.category === "element" ? item.alt : (item.type === "video" ? "Video" : "Image")}
        </div>
      </div>

      {item.createdAt && (
        <p className="text-xs text-slate-500 -mt-3">{item.createdAt}</p>
      )}

      {item.startImages?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Frames</h3>
          <div className="flex items-center gap-2">
            {item.startImages.map((src, idx) => (
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

      {item.prompt && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">
              {item.category === "element" ? "Mô tả" : "Prompt"}
            </h3>
            <button
              onClick={() => onCopyPrompt(item.prompt)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {promptCopied ? "check" : "content_copy"}
              </span>
            </button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{item.prompt}</p>
        </div>
      )}

      {(item.provider || item.model || item.resolution) && (
        <div className="flex items-center gap-2 flex-wrap">
          {item.provider && (
            <span className="text-xs text-indigo-300 bg-indigo-600/15 border border-indigo-500/40 px-2 py-1 rounded-md">
              {item.provider}
            </span>
          )}
          {item.model && (
            <span className="text-xs text-slate-400 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-md">
              {item.model}
            </span>
          )}
          {item.resolution && (
            <span className="text-xs text-slate-400 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-md">
              {item.resolution}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function PreviewPanel({ item, onPrev, onNext }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative p-8 gap-4 overflow-hidden">
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors z-10"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors z-10"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="max-w-3xl w-full max-h-[70vh] rounded-xl overflow-hidden bg-black flex items-center justify-center">
        {item.type === "video" ? (
          <video
            key={item.id}
            src={item.videoSrc || item.src}
            controls
            autoPlay
            className="w-full h-full max-h-[70vh] object-contain"
          />
        ) : (
          <img
            src={item.src}
            alt={item.alt}
            className="w-full h-full max-h-[70vh] object-contain"
          />
        )}
      </div>
    </div>
  );
}

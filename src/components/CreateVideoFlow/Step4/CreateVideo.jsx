export default function CreateVideo({ onNext, onBack }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="glass-panel p-12 rounded-xl flex flex-col items-center justify-center gap-4 min-h-64">
        <span className="material-symbols-outlined text-indigo-400 text-5xl">video_library</span>
        <h2 className="font-h3 text-h3 text-white">Create Video</h2>
        <p className="font-body-md text-on-surface-variant">Tính năng đang được phát triển...</p>
      </div>
      <div className="pt-8 border-t border-white/5 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 font-label-caps text-on-surface-variant hover:text-white transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>Back
        </button>
        <button onClick={onNext} className="primary-gradient px-12 py-4 rounded-full font-label-caps text-white flex items-center gap-2 active:scale-95">
          Next Step<span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
import { useRef, useState } from 'react'

/**
 * MultiShotPanel
 * @param {Array}  shots           - [{id, prompt, duration}]
 * @param {Function} onShotsChange - (newShots) => void
 * @param {number} totalDuration   - tổng thời lượng video (giây)
 */
export default function MultiShotPanel({ shots, onShotsChange, totalDuration }) {
  const dragIndexRef = useRef(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // ─── tổng giây đang dùng ────────────────────────────────────────────────
  const usedDuration = shots.reduce((sum, s) => sum + s.duration, 0)
  const isOverLimit = usedDuration > totalDuration

  // ─── cập nhật 1 field của shot ──────────────────────────────────────────
  const updateShot = (index, field, value) => {
    onShotsChange(shots.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  // ─── xoá shot ───────────────────────────────────────────────────────────
  const removeShot = (index) => {
    if (shots.length <= 1) return
    onShotsChange(shots.filter((_, i) => i !== index))
  }

  // ─── thêm shot mới ──────────────────────────────────────────────────────
  const addShot = () => {
    const remaining = Math.max(1, totalDuration - usedDuration)
    const newDuration = Math.min(remaining, 1)
    onShotsChange([
      ...shots,
      { id: Date.now(), prompt: '', duration: newDuration },
    ])
  }

  // ─── drag & drop ────────────────────────────────────────────────────────
  const handleDragStart = (e, index) => {
    dragIndexRef.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) setDragOverIndex(index)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === index) return
    const updated = [...shots]
    const [moved] = updated.splice(from, 1)
    updated.splice(index, 0, moved)
    onShotsChange(updated)
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  // ─── render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      {shots.map((shot, index) => (
        <div
          key={shot.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`rounded-xl border bg-slate-800/80 transition-all duration-150 ${
            dragOverIndex === index && dragIndexRef.current !== index
              ? 'border-indigo-500 shadow-[0_0_0_1px_rgba(99,102,241,0.4)] scale-[1.01]'
              : 'border-slate-700'
          }`}
        >
          {/* ── Shot header ── */}
          <div className="flex items-center gap-2 px-3 py-2">
            {/* drag handle */}
            <span
              className="material-symbols-outlined cursor-grab select-none text-[18px] text-slate-500 active:cursor-grabbing"
              title="Kéo để sắp xếp"
            >
              drag_indicator
            </span>

            <span className="text-xs font-semibold text-slate-300">
              Shot {index + 1}
            </span>

            {/* duration input */}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateShot(index, 'duration', Math.max(1, shot.duration - 1))}
                className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <span className="material-symbols-outlined text-[14px]">remove</span>
              </button>
              <input
                type="number"
                min={1}
                max={totalDuration}
                value={shot.duration}
                onChange={(e) => {
                  const v = Math.max(1, Number(e.target.value))
                  updateShot(index, 'duration', v)
                }}
                className="w-10 rounded-md border border-slate-600 bg-slate-700 py-0.5 text-center text-xs font-semibold text-white outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => updateShot(index, 'duration', shot.duration + 1)}
                className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
              </button>
              <span className="text-[11px] text-slate-400">s</span>
            </div>

            {/* delete */}
            <button
              type="button"
              onClick={() => removeShot(index)}
              disabled={shots.length <= 1}
              className="ml-1 flex h-6 w-6 items-center justify-center rounded text-slate-600 transition hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>

          {/* ── Shot prompt textarea ── */}
          <textarea
            value={shot.prompt}
            onChange={(e) => updateShot(index, 'prompt', e.target.value)}
            rows={3}
            className="w-full resize-none rounded-b-xl border-t border-slate-700/60 bg-transparent px-3 py-2.5 font-mono text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:bg-slate-700/20 transition"
            placeholder={`Mô tả hành động cho shot ${index + 1}...`}
          />
        </div>
      ))}

      {/* ── Thêm shot ── */}
      <button
        type="button"
        onClick={addShot}
        className="flex items-center gap-2 rounded-lg border border-dashed border-slate-600 px-3 py-2 text-xs text-slate-400 transition hover:border-indigo-500/50 hover:text-indigo-400"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Thêm Shot
      </button>

      {/* ── Duration summary ── */}
      <div
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
          isOverLimit
            ? 'bg-red-500/10 border border-red-500/30'
            : 'bg-slate-800/60'
        }`}
      >
        <span className={isOverLimit ? 'text-red-400 font-medium' : 'text-slate-400'}>
          Tổng thời gian shot
        </span>
        <span className={`font-semibold tabular-nums ${isOverLimit ? 'text-red-400' : 'text-slate-300'}`}>
          {usedDuration}s / {totalDuration}s
          {isOverLimit && (
            <span className="ml-2 text-red-400">
              (vượt {usedDuration - totalDuration}s)
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
import { useEffect, useMemo, useRef, useState } from 'react'

function identity(model) {
  const name = model?.name || model?.id || ''
  const i = name.indexOf(':')
  if (i < 0) return { provider: model?.provider || '', name }
  return { provider: name.slice(0, i).trim(), name: name.slice(i + 1).trim() }
}

export default function ModelSelect({ models, value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const current = useMemo(() => models.find((m) => m.id === value), [models, value])
  const cur = identity(current)

  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('vi-VN')
    if (!q) return models
    return models.filter((m) => `${m.name} ${m.id}`.toLocaleLowerCase('vi-VN').includes(q))
  }, [models, query])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (id) => {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="st-dd" ref={ref}>
      <button
        type="button"
        className={`st-dd-btn${open ? ' open' : ''}`}
        disabled={disabled || !models.length}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ic"><span className="material-symbols-outlined">neurology</span></span>
        <span className="tx">{current ? cur.name : 'Đang tải model…'}</span>
        <span className="material-symbols-outlined chev">expand_more</span>
      </button>
      {open && (
        <div className="st-dd-pop" role="listbox">
          <label className="au-search">
            <span className="material-symbols-outlined">search</span>
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm model…" />
          </label>
          <div className="st-dd-list">
            {list.map((m) => {
              const id = identity(m)
              return (
                <button key={m.id} type="button" role="option" aria-selected={m.id === value} className={`st-dd-it${m.id === value ? ' on' : ''}`} onClick={() => pick(m.id)}>
                  <span className="nm">{id.name}</span>
                  {id.provider && <span className="pv">{id.provider}</span>}
                  <span className="material-symbols-outlined">check</span>
                </button>
              )
            })}
            {!list.length && <p className="st-dd-none">Không tìm thấy model</p>}
          </div>
        </div>
      )}
    </div>
  )
}

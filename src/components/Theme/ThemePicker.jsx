import { useEffect, useRef, useState } from 'react'
import { DEFAULT_COLORS, LAYERS, PRESETS, useThemeStore } from '../../store/theme.store'
import './theme.css'

const HEX = /^#[0-9a-f]{6}$/i

function HexField({ value, onCommit }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  const commit = () => {
    const next = draft.startsWith('#') ? draft : `#${draft}`
    if (HEX.test(next)) onCommit(next)
    else setDraft(value)
  }
  return (
    <input
      className="tp-hex"
      value={draft}
      maxLength={7}
      spellCheck={false}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
      aria-label="Mã màu"
    />
  )
}

export default function ThemePicker() {
  const open = useThemeStore((s) => s.open)
  const setOpen = useThemeStore((s) => s.setOpen)
  const colors = useThemeStore((s) => s.colors)
  const setColor = useThemeStore((s) => s.setColor)
  const setAll = useThemeStore((s) => s.setAll)
  const reset = useThemeStore((s) => s.reset)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen])

  const changed = LAYERS.some((l) => colors[l.key] !== DEFAULT_COLORS[l.key])

  return (
    <div ref={ref} className={`tp${open ? ' open' : ''}`}>
      {open && (
        <section className="tp-panel" role="dialog" aria-label="Màu giao diện">
          <header className="tp-h">
            <span className="tp-hic"><span className="material-symbols-outlined">palette</span></span>
            <h3>Màu giao diện</h3>
            <button type="button" className="tp-x" onClick={() => setOpen(false)} aria-label="Đóng">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="tp-presets" role="group" aria-label="Bộ màu có sẵn">
            {PRESETS.map((p) => {
              const on = LAYERS.every((l) => colors[l.key] === p.colors[l.key])
              return (
                <button key={p.name} type="button" className={`tp-pre${on ? ' on' : ''}`} onClick={() => setAll(p.colors)} aria-pressed={on}>
                  <span className="tp-dots">
                    <i style={{ background: p.colors.ink }} />
                    <i style={{ background: p.colors.primary }} />
                    <i style={{ background: p.colors.accent }} />
                  </span>
                  {p.name}
                </button>
              )
            })}
          </div>

          <ul className="tp-list">
            {LAYERS.map((l) => (
              <li key={l.key} className="tp-row">
                <label className="tp-sw" style={{ background: colors[l.key] }} title={`Chọn màu ${l.label}`}>
                  <input type="color" value={colors[l.key]} onChange={(e) => setColor(l.key, e.target.value)} aria-label={`Màu ${l.label}`} />
                </label>
                <div className="tp-tx">
                  <b>{l.label}</b>
                  <span>{l.hint}</span>
                </div>
                <HexField value={colors[l.key]} onCommit={(v) => setColor(l.key, v)} />
              </li>
            ))}
          </ul>

          <button type="button" className="tp-reset" onClick={reset} disabled={!changed}>
            <span className="material-symbols-outlined">restart_alt</span>Về màu mặc định
          </button>
        </section>
      )}

      <button
        type="button"
        className="tp-tab"
        onClick={() => setOpen(!open)}
        title="Đổi màu giao diện"
        aria-label="Đổi màu giao diện"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">palette</span>
      </button>
    </div>
  )
}

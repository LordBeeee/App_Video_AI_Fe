import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function SourcePreview({ item, controls = false }) {
  if (item.type === 'video') {
    return <video src={item.url} poster={item.thumbnailUrl || undefined} muted={!controls} playsInline preload="metadata" controls={controls} />
  }
  if (item.type === 'audio') {
    return controls ? <audio src={item.url} controls /> : <span className="material-symbols-outlined">graphic_eq</span>
  }
  return <img src={item.thumbnailUrl || item.url} alt="" />
}

function SourceGroup({ group }) {
  const compact = group.items.every((item) => item.type !== 'video' && item.type !== 'audio')
  const id = useId()
  const button = useRef(null)
  const popover = useRef(null)
  const timer = useRef(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)

  const place = useCallback(() => {
    if (!button.current || !popover.current) return
    const anchor = button.current.getBoundingClientRect()
    const width = popover.current.offsetWidth
    const height = popover.current.offsetHeight
    const margin = 12
    const left = Math.max(margin, Math.min(anchor.left, window.innerWidth - width - margin))
    const below = anchor.bottom + 8
    const above = anchor.top - height - 8
    const top = below + height + margin <= window.innerHeight || above < margin ? below : above
    setPosition({ left, top: Math.max(margin, Math.min(top, window.innerHeight - height - margin)) })
  }, [])

  useLayoutEffect(() => { if (open) place(); else setPosition(null) }, [open, place])

  useEffect(() => {
    if (!open) return undefined
    const close = () => setOpen(false)
    const onScroll = (event) => { if (!popover.current?.contains(event.target)) close() }
    const onKey = (event) => { if (event.key === 'Escape') { close(); button.current?.focus() } }
    const onPointerDown = (event) => {
      if (!button.current?.contains(event.target) && !popover.current?.contains(event.target)) close()
    }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', onScroll, true)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, place])

  useEffect(() => () => clearTimeout(timer.current), [])

  const hoverOn = (event) => {
    if (event.pointerType === 'mouse') {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setOpen(true), 120)
    }
  }
  const hoverOff = (event) => {
    if (event.pointerType === 'mouse') {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setOpen(false), 160)
    }
  }

  return (
    <>
      <button ref={button} type="button" className={`st-source-group${compact ? ' compact' : ''}${open ? ' on' : ''}`}
        aria-expanded={open} aria-controls={open ? id : undefined}
        aria-label={`${group.label}, ${group.items.length} mục`}
        onClick={() => { clearTimeout(timer.current); setOpen((value) => !value) }}
        onPointerEnter={hoverOn} onPointerLeave={hoverOff}>
        <span className="st-source-thumb"><SourcePreview item={group.items[0]} /></span>
        <span className="st-source-name">{group.label}</span>
        <span className="st-source-count">{group.items.length}</span>
      </button>
      {open && createPortal(
        <div ref={popover} id={id} className={`st-source-pop${compact ? ' compact' : ''}${group.items.length === 1 ? ' one' : ''}`}
          role="region" aria-label={group.label}
          style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden' }}
          onPointerEnter={hoverOn} onPointerLeave={hoverOff}>
          {!compact && <div className="st-source-pop-head"><strong>{group.label}</strong><span>{group.items.length} mục</span></div>}
          <div className="st-source-pop-grid" style={compact ? { gridTemplateColumns: `repeat(${Math.min(group.items.length, 6)}, 40px)` } : undefined}>
            {group.items.map((item, index) => (
              <div className="st-source-pop-item" key={`${item.id || item.url}-${index}`}
                role={compact ? 'img' : undefined} aria-label={compact ? `${item.label || group.label} ${index + 1}` : undefined}>
                <div className="st-source-pop-media"><SourcePreview item={item} controls={!compact} /></div>
                {!compact && <span title={item.label}>{item.label}</span>}
              </div>
            ))}
          </div>
        </div>, document.body,
      )}
    </>
  )
}

export default function VideoSourceGroups({ groups }) {
  if (!groups.length) return null
  return <div className="st-info-inputs" aria-label="Nguồn đầu vào video">
    {groups.map((group) => <SourceGroup key={group.label} group={group} />)}
  </div>
}

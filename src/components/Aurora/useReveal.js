import { useEffect, useRef, useState } from 'react'

const callbacks = new Map()
const queue = []
let observer = null
let timer = null

function pump() {
  if (timer !== null) return
  const next = queue.shift()
  if (!next) return
  next()
  timer = setTimeout(() => {
    timer = null
    pump()
  }, 80)
}

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e) => {
          const cb = callbacks.get(e.target)
          if (!cb) return
          callbacks.delete(e.target)
          observer.unobserve(e.target)
          queue.push(cb)
        })
      pump()
    }, { rootMargin: '0px 0px 8% 0px', threshold: 0.12 })
  }
  return observer
}

export function useReveal() {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || shown) return undefined
    const io = getObserver()
    callbacks.set(el, () => setShown(true))
    io.observe(el)
    return () => {
      callbacks.delete(el)
      io.unobserve(el)
    }
  }, [shown])
  return [ref, shown]
}

export function useCountUp(target, run, ms = 1300) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return undefined
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms)
      setV(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, ms])
  return run ? v : 0
}

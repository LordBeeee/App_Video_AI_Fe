import { useEffect, useState } from 'react'
import { getUploadLimitsApi } from '../services/asset.service'

const fallback = { image: 10_000_000, video: 100_000_000, audio: 100_000_000 }

export default function useUploadLimits() {
  const [limits, setLimits] = useState(fallback)
  useEffect(() => {
    let active = true
    getUploadLimitsApi().then((value) => { if (active) setLimits(value) })
    return () => { active = false }
  }, [])
  return limits
}

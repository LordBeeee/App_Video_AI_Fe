/** Maps UI resolution labels → API mode strings */
export const RESOLUTION_TO_MODE = {
  '720p':  'std',
  '1080p': 'pro',
  '4k':    '4k',
}

export const VIDEO_PRICING = {
  /* ── Kling v3 ─────────────────────────────────────────────────── */
  'kling-v3': {
    label: 'Kling v3',
    currency: 'VND',
    video: {
      std:  { noAudio: 2302, withAudio: 3452 },
      pro:  { noAudio: 3069, withAudio: 4603 },
      '4k': { noAudio: 11508, withAudio: 11508 },
    },
    motionControl: {
      std: 3452,
      pro: 4603,
    },
  },

  /* ── Kling v2.6 (placeholder – fill when available) ───────────── */
  'kling-v2-6': {
    label: 'Kling v2.6',
    currency: 'VND',
    video: {
      std:  { noAudio: 1151 },
      pro:  { noAudio: 1918, withAudio: 3836 },
    },
    motionControl: {
      std: 1918,
      pro: 3069,
    },
  },

  /* ── BytePlus Seedance 2.0 ─────────────────────────────────────── */
  'dreamina-seedance-2-0-260128': {
    label: 'Seedance 2.0',
    currency: 'VND',
    video: {
      // TODO: cập nhật giá thực tế khi có thông tin từ BytePlus
      // std:  { noAudio: 2000, withAudio: 3000 },
      // pro:  { noAudio: 3500, withAudio: 5000 },
    },
    motionControl: null, // Seedance chưa hỗ trợ motion control
  },

  /* ── ChatGPT Video (placeholder – fill when available) ────────── */
  // 'chatgpt-video': {
  //   label: 'ChatGPT Video',
  //   currency: 'USD',
  //   video: {
  //     std: { noAudio: 0.xxx, withAudio: 0.xxx },
  //     pro: { noAudio: 0.xxx, withAudio: 0.xxx },
  //   },
  //   // no motionControl support
  // },
}

// ─────────────────────────────────────────────────────────────────
// Pure calculator functions
// ─────────────────────────────────────────────────────────────────

/**
 * Calculate total cost for a standard video generation.
 *
 * @param {object} p
 * @param {string}  p.modelCode   — e.g. 'kling-v3'
 * @param {string}  p.resolution  — '720p' | '1080p' | '4k'
 * @param {number}  p.duration    — seconds
 * @param {boolean} p.nativeAudio
 * @returns {{ total: number, perSecond: number, mode: string } | null}
 */
export function calcVideoPrice({ modelCode, resolution, duration, nativeAudio }) {
  const pricing = VIDEO_PRICING[modelCode]
  if (!pricing) return null

  const mode      = RESOLUTION_TO_MODE[resolution?.toLowerCase()] ?? 'pro'
  const audioKey  = nativeAudio ? 'withAudio' : 'noAudio'
  const perSecond = pricing.video?.[mode]?.[audioKey]
  if (perSecond == null) return null

  return {
    perSecond,
    total: +(perSecond * duration).toFixed(4),
    mode,
    currency: pricing.currency ?? 'VND',
  }
}

/**
 * Calculate total cost for a motion-control video generation.
 *
 * @param {object} p
 * @param {string}  p.modelCode  — e.g. 'kling-v3'
 * @param {string}  p.resolution — '720p' | '1080p' | '4k'
 * @param {number}  p.duration   — seconds
 * @returns {{ total: number, perSecond: number, mode: string } | null}
 */
export function calcMotionControlPrice({ modelCode, resolution, duration }) {
  const pricing = VIDEO_PRICING[modelCode]
  if (!pricing?.motionControl) return null

  const mode      = RESOLUTION_TO_MODE[resolution?.toLowerCase()] ?? 'pro'
  const perSecond = pricing.motionControl[mode]
  if (perSecond == null) return null

  return {
    perSecond,
    total: +(perSecond * duration).toFixed(4),
    mode,
    currency: pricing.currency ?? 'VND',
  }
}
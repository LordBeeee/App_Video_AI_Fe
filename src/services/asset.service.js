import api from './api'

const FALLBACK_UPLOAD_LIMITS = { image: 10_000_000, video: 100_000_000, audio: 100_000_000 }
let uploadLimitsCache = null
let uploadLimitsExpires = 0
let uploadLimitsPending = null

export async function getUploadLimitsApi() {
  if (uploadLimitsCache && Date.now() < uploadLimitsExpires) return uploadLimitsCache
  if (uploadLimitsPending) return uploadLimitsPending
  uploadLimitsPending = api.get('/assets/upload-limits').then(({ data }) => {
    uploadLimitsCache = {
      image: Number(data.image) || FALLBACK_UPLOAD_LIMITS.image,
      video: Number(data.video) || FALLBACK_UPLOAD_LIMITS.video,
      audio: Number(data.audio) || FALLBACK_UPLOAD_LIMITS.audio,
    }
    uploadLimitsExpires = Date.now() + 5 * 60_000
    return uploadLimitsCache
  }).catch(() => FALLBACK_UPLOAD_LIMITS).finally(() => { uploadLimitsPending = null })
  return uploadLimitsPending
}

export function formatUploadLimit(bytes) {
  return `${Math.floor(bytes / 1_000_000)} MB`
}

export async function uploadAssetApi(file) {
  const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio'
  const limits = await getUploadLimitsApi()
  if (file.size > limits[type]) throw new Error(`${type === 'image' ? 'Ảnh' : type === 'video' ? 'Video' : 'Âm thanh'} tải lên không được vượt quá ${formatUploadLimit(limits[type])}`)
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await api.post('/assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Upload thất bại')
  }
}

export async function getLibraryAssetsApi({ tab = 'creative', type = 'all', favorite = false } = {}) {
  try {
    const res = await api.get('/assets', { params: { tab, type, favorite } })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy thư viện thất bại')
  }
}

export async function setAssetFavoriteApi(assetId, isFavorite) {
  try {
    const res = await api.patch(`/assets/${assetId}/favorite`, { isFavorite })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Cập nhật favorite thất bại')
  }
}

export async function getElementsApi() {
  const res = await api.get('/elements')
  return res.data
}

export async function getVoicesApi() {
  const res = await api.get('/voices')
  return res.data
}

export async function createElementApi(payload) {
  const res = await api.post('/elements', payload)
  return res.data
}

export async function createVoiceApi(payload) {
  const res = await api.post('/voices', payload)
  return res.data
}

export async function deleteElementApi(assetId) {
  try {
    const res = await api.delete(`/elements/${assetId}`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Xóa Element thất bại')
  }
}

export async function deleteVoiceApi(assetId) {
  try {
    const res = await api.delete(`/voices/${assetId}`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Xóa Voice thất bại')
  }
}

import api from './api'

export async function uploadAssetApi(file) {
  if (file.type.startsWith('image/') && file.size > 10_000_000) {
    throw new Error('Ảnh tải lên không được vượt quá 10 MB')
  }
  if (file.type.startsWith('video/') && file.size > 200_000_000) {
    throw new Error('Video tải lên không được vượt quá 200 MB')
  }
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

export async function getLibraryAssetsApi({ tab = 'creative', type = 'all', favorite = false, page = 1, pageSize = 30 } = {}) {
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

export async function getReferencesApi() {
  const res = await api.get('/references')
  return res.data
}

export async function createElementApi(payload) {
  const res = await api.post('/references/elements', payload)
  return res.data
}

export async function createVoiceApi(payload) {
  const res = await api.post('/references/voices', payload)
  return res.data
}

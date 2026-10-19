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

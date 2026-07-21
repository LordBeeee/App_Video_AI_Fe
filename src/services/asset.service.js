import api from './api'

export async function uploadAssetApi(file) {
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
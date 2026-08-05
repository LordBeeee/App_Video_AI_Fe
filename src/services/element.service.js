import api from './api'

export async function createElementApi(formData) {
  try {
    const res = await api.post('/elements/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Tạo element thất bại')
  }
}

export async function getElementStatusApi(elementId) {
  try {
    const res = await api.get(`/elements/${elementId}/status`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy trạng thái thất bại')
  }
}

export async function getElementsHistoryApi() {
  try {
    const res = await api.get('/elements/history')
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy lịch sử element thất bại')
  }
}

export async function deleteElementApi(elementId) {
  try {
    const res = await api.delete(`/elements/${elementId}`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Xóa element thất bại')
  }
}

export async function setElementFavoriteApi(elementId, isFavorite) {
  try {
    const res = await api.patch(`/elements/${elementId}/favorite`, { isFavorite })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Cập nhật favorite thất bại')
  }
}
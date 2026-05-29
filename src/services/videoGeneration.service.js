import api from './api'

export async function createVideoApi(formData) {
  try {
    const res = await api.post('/video-generations/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Tạo video thất bại')
  }
}

export async function getVideoStatusApi(videoGenerationId) {
  try {
    const res = await api.get(`/video-generations/${videoGenerationId}/status`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy trạng thái thất bại')
  }
}

export async function getVideoHistoryApi() {
  try {
    const res = await api.get('/video-generations/history')
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy lịch sử thất bại')
  }
}

export async function createMotionControlVideoApi(formData) {
  try {
    const res = await api.post('/video-generations/create-motion-control', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Tạo video motion control thất bại')
  }
}

export async function getMotionControlHistoryApi() {
  try {
    const res = await api.get('/video-generations/motion-control/history')
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy lịch sử thất bại')
  }
}
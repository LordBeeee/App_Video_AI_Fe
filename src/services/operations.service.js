import api from './api'

export async function getOperationsOverviewApi() {
  try {
    const res = await api.get('/operations/overview')
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy dữ liệu vận hành thất bại')
  }
}

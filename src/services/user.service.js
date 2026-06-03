import api from './api'

export async function getUserStatsApi() {
  try {
    const res = await api.get('/users/me/stats')
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy thống kê thất bại')
  }
}

export async function getUserDailyStatsApi({ month, year }) {
  try {
    const res = await api.get('/users/me/daily-stats', {
      params: { month, year },
    })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy thống kê ngày thất bại')
  }
}
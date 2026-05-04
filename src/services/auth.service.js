import api from './api'

export async function loginApi(payload) {
  try {
    const res = await api.post('/auth/login', payload)
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Đăng nhập thất bại'
    throw new Error(message)
  }
}
import axios from 'axios'
import { API_BASE_URL } from '../lib/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // tự động gửi/nhận cookie
})

// Không cần request interceptor đọc localStorage nữa

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthRoute = originalRequest?.url?.includes('/auth/')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true

      try {
        // Thử dùng refresh token để lấy access token mới
        await api.post('/auth/refresh')
        return api(originalRequest) // retry request gốc
      } catch {
        // Refresh thất bại → logout
        const { useAuthStore } = await import('../store/auth.store')
        useAuthStore.getState().clearSession()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
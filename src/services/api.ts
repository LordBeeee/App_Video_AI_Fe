// import axios from 'axios'
// import { API_BASE_URL } from '../lib/constants'
// import { useAuthStore } from '../store/auth.store'

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().accessToken

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }

//   return config
// })

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const isLoginRequest = error.config?.url?.includes('/auth/login')

//     if (error.response?.status === 401 && !isLoginRequest) {
//       useAuthStore.getState().clearSession()
//       window.location.href = '/login'
//     }

//     return Promise.reject(error)
//   },
// )

// export default api
import axios from 'axios'
import { API_BASE_URL } from '../lib/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
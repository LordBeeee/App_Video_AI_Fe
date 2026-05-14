import api from './api'

export async function loginApi(payload) {
  try {
    const res = await api.post('/auth/login', payload)
    return res.data
  } catch (error) {
    const responseMessage = error.response?.data?.message

    if (Array.isArray(responseMessage)) {
      throw new Error(responseMessage[0])
    }

    if (responseMessage) {
      throw new Error(responseMessage)
    }

    if (error.request) {
      throw new Error('Không nhận được phản hồi từ server. Kiểm tra CORS hoặc BE có đang chạy không.')
    }

    throw new Error('Đăng nhập thất bại')
  }
}
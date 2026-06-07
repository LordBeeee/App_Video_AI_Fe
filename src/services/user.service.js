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
    const res = await api.get('/users/me/daily-stats', { params: { month, year } })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy thống kê ngày thất bại')
  }
}

export async function getEmployeeStatsApi() {
  try {
    const res = await api.get('/users/employee-stats')
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy thống kê thất bại')
  }
}

export async function getAllUsersApi({ page = 1, limit = 6, search = '' } = {}) {
  try {
    const res = await api.get('/users', { params: { page, limit, search } })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy danh sách nhân viên thất bại')
  }
}

export async function toggleUserStatusApi(id) {
  try {
    const res = await api.patch(`/users/${id}/toggle-status`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Cập nhật trạng thái thất bại')
  }
}

export async function createEmployeeApi(data) {
  try {
    const res = await api.post('/users', data)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Tạo nhân viên thất bại')
  }
}

// ─── MỚI ──────────────────────────────────────────────────────────────────────

/** Lấy chi tiết 1 nhân viên */
export async function getEmployeeByIdApi(id) {
  try {
    const res = await api.get(`/users/${id}`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Lấy thông tin nhân viên thất bại')
  }
}

/** Cập nhật thông tin nhân viên — formData chứa fullName, username, phone, avatar (file) */
export async function updateEmployeeApi(id, formData) {
  try {
    const res = await api.patch(`/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Cập nhật thông tin thất bại')
  }
}

/** Reset mật khẩu về Bideptrai123@@ */
export async function resetEmployeePasswordApi(id) {
  try {
    const res = await api.patch(`/users/${id}/reset-password`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Reset mật khẩu thất bại')
  }
}

export async function deleteEmployeeApi(id) {
  try {
    const res = await api.delete(`/users/${id}`)
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Xóa nhân viên thất bại')
  }
}

/** Cập nhật profile của bản thân */
export async function updateProfileApi(formData) {
  try {
    const res = await api.patch('/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Cập nhật thông tin thất bại')
  }
}

/** Đổi mật khẩu của bản thân */
export async function changePasswordApi({ currentPassword, newPassword }) {
  try {
    const res = await api.patch('/users/me/change-password', { currentPassword, newPassword })
    return res.data
  } catch (error) {
    const msg = error.response?.data?.message
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Đổi mật khẩu thất bại')
  }
}
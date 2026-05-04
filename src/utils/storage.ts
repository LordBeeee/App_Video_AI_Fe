type AuthData = {
  accessToken?: string
  user?: unknown
}

export function saveAuthData(data: AuthData) {
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken)
  }

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user))
  }
}

export function getAccessToken() {
  return localStorage.getItem('accessToken')
}

export function getCurrentUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function clearAuthData() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
}
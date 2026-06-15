import { create } from 'zustand'

type User = {
  id: number
  email: string
  fullName: string
  avatarUrl: string | null
  roleId: number  // fix: number thay vì string
  roleName: string
  status: string
}

type AuthState = {
  user: User | null
  hydrated: boolean
  isAuthenticated: boolean

  setSession: (payload: { user: User | null }) => void
  setUser: (user: User | null) => void
  clearSession: () => void
}

const getSavedUser = (): User | null => {
  try {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const useAuthStore = create<AuthState>(() => ({
  user: getSavedUser(),
  hydrated: true,
  isAuthenticated: !!getSavedUser(),

  setSession: ({ user }) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    useAuthStore.setState({ user, isAuthenticated: !!user })
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    useAuthStore.setState({ user })
  },

  clearSession: () => {
    localStorage.removeItem('user')
    useAuthStore.setState({ user: null, isAuthenticated: false })
  },
}))
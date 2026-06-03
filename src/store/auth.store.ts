// import { create } from 'zustand'

// type User = {
//   id: number
//   email: string
//   fullName: string
//   avatarUrl: string | null
//   roleId: string
//   roleName: string
//   status: string
// }

// type AuthState = {
//   accessToken: string | null
//   user: User | null
//   hydrated: boolean
//   isAuthenticated: boolean
//   isLoadingProfile: boolean

//   setSession: (payload: { accessToken: string; user: User | null }) => void
//   setAccessToken: (token: string | null) => void
//   setUser: (user: User | null) => void
//   setHydrated: (value: boolean) => void
//   clearSession: () => void
// }

// const getSavedUser = (): User | null => {
//   const savedUser = localStorage.getItem('user')

//   if (!savedUser) return null

//   try {
//     return JSON.parse(savedUser)
//   } catch {
//     localStorage.removeItem('user')
//     return null
//   }
// }

// const savedAccessToken = localStorage.getItem('accessToken')
// const savedUser = getSavedUser()

// export const useAuthStore = create<AuthState>((set) => ({
//   accessToken: savedAccessToken,
//   user: savedUser,
//   hydrated: true,
//   isAuthenticated: !!savedAccessToken,
//   isLoadingProfile: false,

//   setSession: ({ accessToken, user }) => {
//     localStorage.setItem('accessToken', accessToken)

//     if (user) {
//       localStorage.setItem('user', JSON.stringify(user))
//     } else {
//       localStorage.removeItem('user')
//     }

//     set({
//       accessToken,
//       user,
//       isAuthenticated: true,
//       hydrated: true,
//       isLoadingProfile: false,
//     })
//   },

//   setAccessToken: (token) => {
//     if (token) {
//       localStorage.setItem('accessToken', token)
//     } else {
//       localStorage.removeItem('accessToken')
//     }

//     set({
//       accessToken: token,
//       isAuthenticated: !!token,
//     })
//   },

//   setUser: (user) => {
//     if (user) {
//       localStorage.setItem('user', JSON.stringify(user))
//     } else {
//       localStorage.removeItem('user')
//     }

//     set({ user })
//   },

//   setHydrated: (value) => {
//     set({ hydrated: value })
//   },

//   clearSession: () => {
//     localStorage.removeItem('accessToken')
//     localStorage.removeItem('user')
//     localStorage.removeItem('auth-storage')

//     set({
//       accessToken: null,
//       user: null,
//       hydrated: true,
//       isAuthenticated: false,
//       isLoadingProfile: false,
//     })
//   },
// }))

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
// import { create } from 'zustand'
// import type { UserProfile } from '../types/user'
// import { profileService } from '../services/profile.service'

// type AuthState = {
//   accessToken: string | null
//   user: UserProfile | null
//   hydrated: boolean
//   isAuthenticated: boolean
//   isLoadingProfile: boolean

//   setSession: (payload: {
//     accessToken: string
//     user?: UserProfile | null
//   }) => void

//   setAccessToken: (token: string | null) => void
//   setUser: (user: UserProfile | null) => void
//   setHydrated: (value: boolean) => void
//   fetchMe: () => Promise<void>
//   clearSession: () => void
// }

// export const useAuthStore = create<AuthState>((set, get) => ({
//   accessToken: localStorage.getItem('accessToken'),
//   user: null,
//   hydrated: true,
//   isAuthenticated: !!localStorage.getItem('accessToken'),
//   isLoadingProfile: false,

//   setSession: ({ accessToken, user = null }) => {
//     localStorage.setItem('accessToken', accessToken)

//     set({
//       accessToken,
//       user,
//       isAuthenticated: true,
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
//     set({ user })
//   },

//   setHydrated: (value) => {
//     set({ hydrated: value })
//   },

//   fetchMe: async () => {
//     const token = get().accessToken

//     if (!token) return

//     try {
//       set({ isLoadingProfile: true })

//       const user = await profileService.getMe()

//       set({
//         user,
//         isAuthenticated: true,
//       })
//     } catch (error) {
//       get().clearSession()
//     } finally {
//       set({ isLoadingProfile: false })
//     }
//   },

//   clearSession: () => {
//     localStorage.removeItem('accessToken')
//     localStorage.removeItem('auth-storage')

//     set({
//       accessToken: null,
//       user: null,
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
  roleId: string
  roleName: string
  status: string
}

type AuthState = {
  accessToken: string | null
  user: User | null
  hydrated: boolean
  isAuthenticated: boolean
  isLoadingProfile: boolean

  setSession: (payload: { accessToken: string; user: User | null }) => void
  setAccessToken: (token: string | null) => void
  setUser: (user: User | null) => void
  setHydrated: (value: boolean) => void
  clearSession: () => void
}

const getSavedUser = (): User | null => {
  const savedUser = localStorage.getItem('user')

  if (!savedUser) return null

  try {
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const savedAccessToken = localStorage.getItem('accessToken')
const savedUser = getSavedUser()

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: savedAccessToken,
  user: savedUser,
  hydrated: true,
  isAuthenticated: !!savedAccessToken,
  isLoadingProfile: false,

  setSession: ({ accessToken, user }) => {
    localStorage.setItem('accessToken', accessToken)

    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }

    set({
      accessToken,
      user,
      isAuthenticated: true,
      hydrated: true,
      isLoadingProfile: false,
    })
  },

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('accessToken', token)
    } else {
      localStorage.removeItem('accessToken')
    }

    set({
      accessToken: token,
      isAuthenticated: !!token,
    })
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }

    set({ user })
  },

  setHydrated: (value) => {
    set({ hydrated: value })
  },

  clearSession: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('auth-storage')

    set({
      accessToken: null,
      user: null,
      hydrated: true,
      isAuthenticated: false,
      isLoadingProfile: false,
    })
  },
}))
export type AuthUser = {
  id: string | number
  email: string
  full_name?: string
  avatar_url?: string | null
  role_id?: string | number
  status?: string
}

export type LoginResponse = {
  message?: string
  access_token?: string
  accessToken?: string
  user?: AuthUser | null
}
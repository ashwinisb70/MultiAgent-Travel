
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../services/api'

interface User {
  id: number
  email: string
  username: string
  full_name?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    username: string,
    password: string,
    full_name?: string
  ) => Promise<void>
  logout: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await apiClient.login(email, password)
        const { access_token, refresh_token } = response.data

        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          isAuthenticated: true
        })

        const userResponse = await apiClient.getCurrentUser()
        set({ user: userResponse.data })
      },

      register: async (email, username, password, full_name) => {
        const response = await apiClient.register(
          email,
          username,
          password,
          full_name
        )
        const { access_token, refresh_token } = response.data

        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          isAuthenticated: true
        })

        const userResponse = await apiClient.getCurrentUser()
        set({ user: userResponse.data })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        })
      },

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true
        })
      }
    }),
    {
      name: 'auth-store'
    }
  )
)


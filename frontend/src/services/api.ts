import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

let authStore: any = null

const getAuthStore = async () => {
  if (!authStore) {
    const { useAuthStore } = await import('../store/auth')
    authStore = useAuthStore
  }
  return authStore
}

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      // Use the global auth store reference
      if (authStore) {
        const { accessToken } = authStore.getState()
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
      }
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (authStore) {
            authStore.getState().logout()
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )

    // Initialize auth store on first creation
    getAuthStore()
  }

  // Auth endpoints
  async register(email: string, username: string, password: string, fullName?: string) {
    return this.client.post('/auth/register', {
      email,
      username,
      password,
      full_name: fullName
    })
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password })
  }

  async getCurrentUser() {
    return this.client.get('/auth/me')
  }

  // Trip endpoints
  async createTrip(tripData: any) {
    return this.client.post('/trips', tripData)
  }

  async getTrips(skip: number = 0, limit: number = 10) {
    return this.client.get('/trips', { params: { skip, limit } })
  }

  async getTrip(tripId: number) {
    return this.client.get(`/trips/${tripId}`)
  }

  async updateTrip(tripId: number, updates: any) {
    return this.client.put(`/trips/${tripId}`, updates)
  }

  async deleteTrip(tripId: number) {
    return this.client.delete(`/trips/${tripId}`)
  }

  async generateTrip(tripId: number, generationData: any) {
    return this.client.post(`/trips/${tripId}/generate`, generationData)
  }

  async getBudget(tripId: number) {
    return this.client.get(`/trips/${tripId}/budget`)
  }

  async simulateTrip(tripId: number, simulation: any) {
    return this.client.post(`/trips/${tripId}/simulate`, simulation)
  }

  async getRisks(tripId: number) {
    return this.client.get(`/trips/${tripId}/risks`)
  }

  async getReadiness(tripId: number) {
    return this.client.get(`/trips/${tripId}/readiness`)
  }

  async duplicateTrip(tripId: number) {
    return this.client.post(`/trips/${tripId}/duplicate`)
  }

  // Preferences endpoints
  async getPreferences() {
    return this.client.get('/preferences')
  }

  async updatePreferences(preferences: any) {
    return this.client.put('/preferences', preferences)
  }

  // Generic methods for flexible API calls
  async get(url: string, config?: any) {
    return this.client.get(url, config)
  }

  async post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config)
  }

  async put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config)
  }

  async delete(url: string, config?: any) {
    return this.client.delete(url, config)
  }
}

export const apiClient = new APIClient()

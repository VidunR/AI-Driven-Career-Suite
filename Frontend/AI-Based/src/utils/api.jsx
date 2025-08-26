import { projectId, publicAnonKey } from './supabase/info.js'

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-aa33bbfc`

class ApiClient {
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (includeAuth) {
      const token = localStorage.getItem('access_token') || publicAnonKey
      headers['Authorization'] = `Bearer ${token}`
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`
    }
    
    return headers
  }

  async request(endpoint, options = {}, requireAuth = true) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(requireAuth),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Authentication
  async signup(userData) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false)
    
    return response
  }

  async signin(credentials) {
    const response = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false)
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token)
    }
    
    return response
  }

  // CV Management
  async getCVs() {
    return this.request('/cvs')
  }

  async createCV(cvData) {
    return this.request('/cvs', {
      method: 'POST',
      body: JSON.stringify(cvData),
    })
  }

  async deleteCV(cvId) {
    return this.request(`/cvs/${cvId}`, {
      method: 'DELETE',
    })
  }

  // Job Recommendations
  async getJobRecommendations() {
    return this.request('/jobs/recommendations')
  }

  // Interview Management
  async getInterviews() {
    return this.request('/interviews')
  }

  async saveInterview(interviewData) {
    return this.request('/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    })
  }

  // User Profile
  async getUserProfile() {
    return this.request('/profile')
  }

  // Health Check
  async healthCheck() {
    return this.request('/health', {}, false)
  }
}

export const api = new ApiClient()
export default api
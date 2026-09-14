import axios from 'axios'

// Base URL comes from env so the frontend can point at any backend deployment
// without code changes. Configure VITE_API_URL in frontend/.env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

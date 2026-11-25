import axios from 'axios'

export const TOKEN_KEY = 'pp_token'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Attach the admin token to every request when logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Logged-out automatically if the token expires
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(err)
  },
)

export const errorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong'

export default api

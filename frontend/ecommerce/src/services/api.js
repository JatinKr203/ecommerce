import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kitchenly_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('kitchenly_token')
      window.dispatchEvent(new CustomEvent('kitchenly:unauthorized'))
    }
    const validationErrors = error.response?.data?.errors
    const validationMessage = Array.isArray(validationErrors)
      ? validationErrors.map((item) => item.msg).filter(Boolean).join('. ')
      : ''
    const message = error.response?.data?.message || validationMessage || error.message || 'Request failed'
    const normalizedError = new Error(message)
    normalizedError.status = status
    return Promise.reject(normalizedError)
  },
)

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
}

export const profileApi = {
  get: () => api.get('/users/profile'),
  update: (payload) => api.put('/users/profile', payload),
}

export const productsApi = {
  list: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (payload) => api.post('/products', payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  updateStock: (id, quantity) => api.patch(`/products/${id}/stock`, { quantity }),
}

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (payload) => api.post('/categories', payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`),
}

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
}

export const ordersApi = {
  create: (payload) => api.post('/orders', payload),
  list: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
}

export const adminOrdersApi = {
  list: () => api.get('/admin/orders'),
  updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
}

export const healthApi = {
  check: () => api.get('/health'),
}

export default api
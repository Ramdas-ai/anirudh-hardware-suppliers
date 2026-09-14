// Real backend-backed auth (Phase 4). Same function names/shapes as the
// Phase 3 localStorage version, so AuthContext didn't need to change at
// all — only this file did.
import api from './api'

const TOKEN_KEY = 'token'

export async function register({ name, email, phone, password }) {
  const { data } = await api.post('/auth/register', { name, email, phone, password })
  localStorage.setItem(TOKEN_KEY, data.token)
  return data.user
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  localStorage.setItem(TOKEN_KEY, data.token)
  return data.user
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function getCurrentUser() {
  if (!localStorage.getItem(TOKEN_KEY)) return null
  try {
    const { data } = await api.get('/auth/me')
    return data.user
  } catch {
    // token invalid/expired — clear it so we don't keep retrying
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
}

export async function addAddress(userId, address) {
  const { data } = await api.post('/auth/addresses', address)
  return data.user
}

export async function removeAddress(userId, addressId) {
  const { data } = await api.delete(`/auth/addresses/${addressId}`)
  return data.user
}

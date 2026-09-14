// Backend-persisted cart (Phase 4), used only for logged-in customers —
// guest carts stay in localStorage inside CartContext, matching the
// architecture doc ("Cart" model belongs to a User).
import api from './api'

export async function getCart() {
  const { data } = await api.get('/cart')
  return data.items
}

export async function addToCart(productId, quantity = 1) {
  const { data } = await api.post('/cart/add', { productId, quantity })
  return data.items
}

export async function updateCartItem(productId, quantity) {
  const { data } = await api.put('/cart/update', { productId, quantity })
  return data.items
}

export async function removeFromCart(productId) {
  const { data } = await api.delete(`/cart/remove/${productId}`)
  return data.items
}

export async function clearServerCart() {
  const { data } = await api.delete('/cart')
  return data.items
}

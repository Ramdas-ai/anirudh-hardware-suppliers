// Real backend-backed orders (Phase 4). Same function names/shapes as the
// Phase 3 localStorage version, so Checkout/OrderConfirmation/MyOrders/
// OrderDetail didn't need structural changes — just this file.
import api from './api'

// Mirrors the backend's delivery rule (backend/src/controllers/orderController.js)
// so the UI can show an accurate total before submitting — but the number
// that actually matters is the one the backend recomputes from the
// database when the order is created; this is display-only.
export const DELIVERY_CHARGE = 150
export const FREE_DELIVERY_THRESHOLD = 5000

export function calculateTotals(items) {
  const subtotal = items.reduce((sum, i) => {
    const finalPrice = i.discountPercent ? Math.round(i.price * (1 - i.discountPercent / 100)) : i.price
    return sum + finalPrice * i.quantity
  }, 0)
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_CHARGE
  const grandTotal = subtotal + deliveryCharge
  return { subtotal, deliveryCharge, grandTotal }
}

// Order items come back with `product` (the Mongo ref) — normalized here
// to `productId` so OrderConfirmation/MyOrders/OrderDetail, written against
// the Phase 3 shape, don't need changes.
function normalizeOrder(o) {
  return {
    ...o,
    id: o._id,
    userId: o.user,
    items: o.items.map((i) => ({ ...i, productId: i.product })),
  }
}

export async function createOrder({ items, customer, paymentMethod }) {
  const payload = {
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    customer,
    paymentMethod,
  }
  console.log('ORDER PAYLOAD:', JSON.stringify(payload, null, 2))
  const { data } = await api.post('/orders', payload)
  return normalizeOrder(data)
}

export async function getOrdersByUser() {
  const { data } = await api.get('/orders/my-orders')
  return data.map(normalizeOrder)
}

export async function getOrderById(id) {
  try {
    const { data } = await api.get(`/orders/${id}`)
    return normalizeOrder(data)
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 403) return null
    throw err
  }
}

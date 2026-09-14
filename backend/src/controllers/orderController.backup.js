import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'

const DELIVERY_CHARGE = 150
const FREE_DELIVERY_THRESHOLD = 5000

function generateOrderNumber() {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${Date.now().toString().slice(-6)}${n}`
}

// POST /api/orders
// Body: { items: [{ productId, quantity }], customer: {...}, paymentMethod }
//
// This is the one place price/stock/total manipulation is actually
// prevented, per the architecture doc: every number here is recomputed
// from the database, never trusted from the request body. The frontend
// only ever sends product IDs and quantities.
export const createOrder = asyncHandler(async (req, res) => {
  const { items, customer, paymentMethod } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400)
    throw new Error('Cannot place an order with an empty cart.')
  }
  if (!['cod', 'esewa'].includes(paymentMethod)) {
    res.status(400)
    throw new Error('Invalid payment method.')
  }
  for (const field of ['name', 'phone', 'email', 'address', 'city', 'province']) {
    if (!customer?.[field]) {
      res.status(400)
      throw new Error(`Customer ${field} is required.`)
    }
  }

  // Load every product referenced by the cart in one query, then validate
  // stock for each line item before committing to any stock changes — an
  // out-of-stock item anywhere in the cart fails the whole order rather
  // than silently shipping a partial one.
  const productIds = items.map((i) => i.productId)
  const products = await Product.find({ _id: { $in: productIds } })
  const productMap = new Map(products.map((p) => [p._id.toString(), p]))

  const orderItems = []
  for (const { productId, quantity } of items) {
    const product = productMap.get(productId)
    if (!product || !product.isActive) {
      res.status(400)
      throw new Error(`Product ${productId} is no longer available.`)
    }
    if (quantity < 1) {
      res.status(400)
      throw new Error(`Invalid quantity for ${product.name}.`)
    }
    if (product.stock < quantity) {
      res.status(409)
      throw new Error(
        `${product.name} only has ${product.stock} in stock — requested ${quantity}.`
      )
    }
    const priceAtPurchase = product.discountPercent
      ? Math.round(product.price * (1 - product.discountPercent / 100))
      : product.price
    orderItems.push({ product: product._id, name: product.name, quantity, priceAtPurchase })
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0)
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE
  const grandTotal = subtotal + deliveryCharge

  // Decrement stock. A standalone MongoDB instance (the common local dev
  // setup) doesn't support multi-document transactions, so this is a
  // sequential best-effort update rather than an atomic transaction —
  // acceptable for this phase, but worth revisiting with $inc + a replica
  // set (or a transaction) before this handles real concurrent traffic.
  for (const item of orderItems) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
  }

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user?._id || null,
    items: orderItems,
    customer,
    subtotal,
    deliveryCharge,
    grandTotal,
    paymentMethod,
    // Neither COD nor eSewa is verified yet — eSewa has no real merchant
    // integration until Phase 9, so payment always starts pending here,
    // regardless of what the client sent.
    paymentStatus: 'pending',
    orderStatus: 'pending',
  })

  if (req.user) {
    await Cart.updateOne({ user: req.user._id }, { items: [] })
  }

  res.status(201).json(order)
})

// GET /api/orders/my-orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(orders)
})

// GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  // Ownership check: an order tied to an account is only visible to that
  // account (never to a guest, even with the right ID). A guest order
  // (order.user === null) is viewable by anyone with the link, which is
  // what lets the post-checkout confirmation page work without login.
  if (order.user && (!req.user || order.user.toString() !== req.user._id.toString())) {
    res.status(403)
    throw new Error('Not authorized to view this order.')
  }
  res.json(order)
})

// GET /api/orders (admin) — ready ahead of Phase 7
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 })
  res.json(orders)
})

// PATCH /api/orders/:id/status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body
  const valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!valid.includes(orderStatus)) {
    res.status(400)
    throw new Error('Invalid order status.')
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true })
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  res.json(order)
})

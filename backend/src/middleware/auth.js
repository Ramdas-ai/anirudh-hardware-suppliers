import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'

// Verifies the JWT from the Authorization header and attaches the
// authenticated user (minus passwordHash) to req.user. Every route that
// needs to know "who is this customer" — cart, orders, profile — uses this.
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized — no token provided.')
  }

  const token = header.split(' ')[1]
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    res.status(401)
    throw new Error('Not authorized — invalid or expired token.')
  }

  const user = await User.findById(decoded.id)
  if (!user) {
    res.status(401)
    throw new Error('Not authorized — user no longer exists.')
  }

  req.user = user
  next()
})

// Admin-only routes (product/category/order management) — wired up ahead
// of Phase 7 (Admin Dashboard) so the backend is ready when that UI lands.
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403)
    throw new Error('Admin access required.')
  }
  next()
}

// Like protect, but doesn't reject the request when there's no/invalid
// token — it just leaves req.user unset. Used for order creation, which
// supports both guest and logged-in checkout.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return next()

  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (user) req.user = user
  } catch {
    // invalid/expired token on an optional route — proceed as a guest
  }
  next()
})

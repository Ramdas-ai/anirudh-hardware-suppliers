import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Order from '../models/Order.js'
import User from '../models/User.js'

// GET /api/admin/stats
export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    totalCategories,
    totalOrders,
    totalCustomers,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
  ])

  res.json({
    totalProducts,
    totalCategories,
    totalOrders,
    totalCustomers,
  })
})
// GET /api/admin/customers
export const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: 'customer' })
    .select('-passwordHash')
    .sort({ createdAt: -1 })

  res.json(customers)
})
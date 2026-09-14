import { Router } from 'express'
import { body } from 'express-validator'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.post(
  '/',
  optionalAuth,
  [
    body('items').isArray({ min: 1 }).withMessage('Cart is empty.'),
    body('paymentMethod').isIn(['cod', 'esewa']).withMessage('Invalid payment method.'),
    body('customer.name').trim().notEmpty().withMessage('Name is required.'),
    body('customer.phone').matches(/^9[6-8]\d{8}$/).withMessage('Enter a valid Nepali mobile number.'),
    body('customer.email').isEmail().withMessage('Enter a valid email address.'),
    body('customer.address').trim().notEmpty().withMessage('Delivery address is required.'),
    body('customer.city').trim().notEmpty().withMessage('City is required.'),
    body('customer.province').trim().notEmpty().withMessage('Province is required.'),
  ],
  validate,
  createOrder
)

router.get('/my-orders', protect, getMyOrders)
router.get('/all', protect, adminOnly, getAllOrders) // placed before /:id so it isn't swallowed as an id
router.get('/:id', optionalAuth, getOrderById)
router.patch('/:id/status', protect, adminOnly, updateOrderStatus)

export default router

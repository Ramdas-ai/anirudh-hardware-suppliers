import { Router } from 'express'
import { body } from 'express-validator'
import {
  register,
  login,
  getMe,
  addAddress,
  removeAddress,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.'),

    body('email')
      .isEmail()
      .withMessage('Enter a valid email address.'),

    body('phone')
      .matches(/^9[6-8]\d{8}$/)
      .withMessage(
        'Enter a valid 10-digit Nepali mobile number.'
      ),

    body('password')
      .isLength({ min: 6 })
      .withMessage(
        'Password must be at least 6 characters.'
      ),
  ],
  validate,
  register
)

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Enter a valid email address.'),

    body('password')
      .notEmpty()
      .withMessage('Password is required.'),
  ],
  validate,
  login
)

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Enter a valid email address.'),
  ],
  validate,
  forgotPassword
)

// POST /api/auth/reset-password/:token
router.post(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage(
        'Password must be at least 6 characters.'
      ),
  ],
  validate,
  resetPassword
)

router.get('/me', protect, getMe)

router.post(
  '/addresses',
  protect,
  [
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Address is required.'),

    body('city')
      .trim()
      .notEmpty()
      .withMessage('City is required.'),

    body('province')
      .trim()
      .notEmpty()
      .withMessage('Province is required.'),
  ],
  validate,
  addAddress
)

router.delete(
  '/addresses/:addressId',
  protect,
  removeAddress
)

export default router
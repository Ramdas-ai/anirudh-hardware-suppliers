import { Router } from 'express'
import {
  createEsewaPaymentRequest,
  verifyEsewaPayment,
} from '../controllers/paymentController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.post(
  '/esewa/create',
  optionalAuth,
  createEsewaPaymentRequest
)

router.post(
  '/esewa/verify',
  optionalAuth,
  verifyEsewaPayment
)

export default router
import { Router } from 'express'
import { getAdminStats, getAllCustomers } from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.get('/stats', protect, adminOnly, getAdminStats)
router.get('/customers', protect, adminOnly, getAllCustomers)

export default router
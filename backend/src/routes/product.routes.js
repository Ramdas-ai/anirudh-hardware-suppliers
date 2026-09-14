import { Router } from 'express'
import upload from '../middleware/upload.js'

import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
} from '../controllers/productController.js'

import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// Public product routes
router.get('/', getProducts)
router.get('/id/:id', getProductById)
router.get('/:slug', getProductBySlug)

// Admin product routes
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'),
  createProduct
)

router.put(
  '/:id',
  protect,
  adminOnly,
  upload.single('image'),
  updateProduct
)

router.patch(
  '/:id/stock',
  protect,
  adminOnly,
  updateStock
)

router.delete(
  '/:id',
  protect,
  adminOnly,
  deleteProduct
)

export default router
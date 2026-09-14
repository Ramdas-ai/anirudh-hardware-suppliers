import { Router } from 'express'
import { body } from 'express-validator'
import {
  getProductReviews,
  createReview,
  deleteReview,
} from '../controllers/reviewController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// GET /api/reviews/product/:productId
router.get('/product/:productId', getProductReviews)

// POST /api/reviews/product/:productId
router.post(
  '/product/:productId',
  protect,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5.'),

    body('comment')
      .trim()
      .notEmpty()
      .withMessage('Review comment is required.')
      .isLength({ max: 1000 })
      .withMessage('Review comment cannot exceed 1000 characters.'),
  ],
  validate,
  createReview
)

// DELETE /api/reviews/:id
router.delete('/:id', protect, deleteReview)

export default router
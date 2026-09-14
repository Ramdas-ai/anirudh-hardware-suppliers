import asyncHandler from 'express-async-handler'
import Review from '../models/Review.js'
import Product from '../models/Product.js'

// GET /api/reviews/product/:productId
// Get all reviews for a product
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    product: req.params.productId,
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 })

  res.json(reviews)
})

// POST /api/reviews/product/:productId
// Add a review for a product
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const product = await Product.findById(req.params.productId)

  if (!product) {
    res.status(404)
    throw new Error('Product not found.')
  }

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400)
    throw new Error('Rating must be between 1 and 5.')
  }

  if (!comment || !comment.trim()) {
    res.status(400)
    throw new Error('Review comment is required.')
  }

  const existingReview = await Review.findOne({
    product: product._id,
    user: req.user._id,
  })

  if (existingReview) {
    res.status(400)
    throw new Error('You have already reviewed this product.')
  }

  const review = await Review.create({
    product: product._id,
    user: req.user._id,
    rating: Number(rating),
    comment: comment.trim(),
  })

  const populatedReview = await review.populate('user', 'name')

  res.status(201).json(populatedReview)
})

// DELETE /api/reviews/:id
// Delete own review
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    res.status(404)
    throw new Error('Review not found.')
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to delete this review.')
  }

  await review.deleteOne()

  res.json({
    message: 'Review deleted successfully.',
  })
})
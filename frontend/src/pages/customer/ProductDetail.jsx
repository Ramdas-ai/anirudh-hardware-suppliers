import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductBySlug } from '../../services/productService'
import {
  getProductReviews,
  createReview,
  deleteReview,
} from '../../services/reviewService'
import { useCategories } from '../../context/CategoryContext'
import { useAuth } from '../../context/AuthContext'
import StockGauge from '../../components/common/StockGauge'
import TickDivider from '../../components/common/TickDivider'
import { useCart } from '../../context/CartContext'

function formatNPR(amount) {
  return `NPR ${amount.toLocaleString('en-IN')}`
}

export default function ProductDetail() {
  const { id: slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { getCategoryName } = useCategories()
  const { user, loading: authLoading } = useAuth()

  const [product, setProduct] = useState(undefined)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    setProduct(undefined)

    getProductBySlug(slug)
      .then(setProduct)
      .catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    if (!product?._id) return

    setReviewsLoading(true)
    setReviewError('')

    getProductReviews(product._id)
      .then(setReviews)
      .catch(() => {
        setReviewError('Failed to load reviews.')
      })
      .finally(() => {
        setReviewsLoading(false)
      })
  }, [product?._id])

  if (product === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center font-body text-iron-gray md:px-6">
        Loading product...
      </div>
    )
  }

  if (product === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-ink-navy">
          Product not found
        </h1>

        <Link
          to="/products"
          className="btn-primary mt-6 inline-block"
        >
          Back to Shop
        </Link>
      </div>
    )
  }

  const {
    name,
    categoryId,
    price,
    discountPercent = 0,
    stock,
    description,
  } = product

  const finalPrice = discountPercent
    ? Math.round(price * (1 - discountPercent / 100))
    : price

  const outOfStock = stock === 0

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + Number(review.rating),
            0
          ) / reviews.length
        ).toFixed(1)
      : null

  function handleAddToCart() {
    if (outOfStock) return

    addItem(product, qty)

    setJustAdded(true)

    setTimeout(() => {
      setJustAdded(false)
    }, 1200)
  }

  async function handleBuyNow() {
    if (outOfStock) return

    await addItem(product, qty)
    navigate('/checkout')
  }

  async function handleSubmitReview(event) {
    event.preventDefault()

    if (!user) {
      alert('Please login to submit a review.')
      return
    }

    if (!reviewComment.trim()) {
      setReviewError('Please write your feedback.')
      return
    }

    try {
      setReviewSubmitting(true)
      setReviewError('')

      const newReview = await createReview(product._id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      })

      setReviews((previous) => [newReview, ...previous])
      setReviewComment('')
      setReviewRating(5)

      alert('Review submitted successfully.')
    } catch (err) {
      setReviewError(
        err.response?.data?.message ||
          'Failed to submit review.'
      )
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete your review?'
    )

    if (!confirmed) return

    try {
      await deleteReview(reviewId)

      setReviews((previous) =>
        previous.filter((review) => review._id !== reviewId)
      )
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to delete review.'
      )
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <nav className="font-mono text-xs text-iron-gray">
        <Link
          to="/products"
          className="hover:text-ink-navy"
        >
          Shop
        </Link>

        {' / '}

        <Link
          to={`/products?category=${categoryId}`}
          className="hover:text-ink-navy"
        >
          {getCategoryName(categoryId)}
        </Link>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-gray-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-mono text-sm text-iron-gray">
              Image placeholder
            </span>
          )}
        </div>

        {/* Product Information */}
        <div>
          <span className="font-mono text-xs uppercase text-iron-gray">
            {getCategoryName(categoryId)}
          </span>

          <h1 className="mt-1 font-display text-3xl font-bold text-ink-navy">
            {name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-ink-navy">
              {formatNPR(finalPrice)}
            </span>

            {discountPercent > 0 && (
              <>
                <span className="font-mono text-sm text-iron-gray line-through">
                  {formatNPR(price)}
                </span>

                <span className="rounded-sm bg-safety-amber px-2 py-0.5 font-display text-xs font-bold text-ink-navy">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <div className="mt-4 max-w-xs">
            <StockGauge stock={stock} />
          </div>

          <p className="mt-5 font-body text-sm leading-relaxed text-iron-gray">
            {description}
          </p>

          <TickDivider />

          {!outOfStock && (
            <div className="mt-5 flex items-center gap-3">
              <label
                htmlFor="qty"
                className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy"
              >
                Quantity
              </label>

              <div className="flex items-center rounded-sm border border-gray-300">
                <button
                  type="button"
                  onClick={() =>
                    setQty((q) => Math.max(1, q - 1))
                  }
                  className="px-3 py-1 font-display text-lg text-ink-navy hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <input
                  id="qty"
                  type="number"
                  min="1"
                  max={stock}
                  value={qty}
                  onChange={(e) =>
                    setQty(
                      Math.max(
                        1,
                        Math.min(
                          stock,
                          Number(e.target.value) || 1
                        )
                      )
                    )
                  }
                  className="w-14 border-x border-gray-300 py-1 text-center font-mono text-sm focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setQty((q) => Math.min(stock, q + 1))
                  }
                  className="px-3 py-1 font-display text-lg text-ink-navy hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <span className="font-mono text-xs text-iron-gray">
                {stock} available
              </span>
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={outOfStock}
              onClick={handleAddToCart}
              className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              {outOfStock
                ? 'Out of Stock'
                : justAdded
                  ? 'Added ✓'
                  : 'Add to Cart'}
            </button>

            <button
              type="button"
              disabled={outOfStock}
              onClick={handleBuyNow}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200 disabled:hover:text-gray-400"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews and Ratings */}
      <section className="mt-12 border-t border-gray-200 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-ink-navy">
            Reviews & Ratings
          </h2>

          {averageRating ? (
            <div className="font-display font-bold text-ink-navy">
              ⭐ {averageRating} / 5 ({reviews.length}{' '}
              {reviews.length === 1 ? 'review' : 'reviews'})
            </div>
          ) : (
            <div className="font-mono text-xs text-iron-gray">
              No reviews yet
            </div>
          )}
        </div>

        {/* Write Review */}
        <div className="mt-6 rounded-sm border border-gray-200 bg-gray-50 p-5">
          <h3 className="font-display text-lg font-bold text-ink-navy">
            Write a Review
          </h3>

          {authLoading ? (
            <p className="mt-3 font-mono text-sm text-iron-gray">
              Checking login status...
            </p>
          ) : !user ? (
            <p className="mt-3 font-body text-sm text-iron-gray">
              Please{' '}
              <Link
                to="/login"
                className="font-bold text-steel-blue hover:underline"
              >
                login
              </Link>{' '}
              to write a review.
            </p>
          ) : (
            <form
              onSubmit={handleSubmitReview}
              className="mt-4"
            >
              <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">
                Rating
              </label>

              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    aria-label={`Give ${star} star${star > 1 ? 's' : ''}`}
                    className="text-2xl"
                  >
                    {star <= reviewRating ? '★' : '☆'}
                  </button>
                ))}
              </div>

              <label
                htmlFor="reviewComment"
                className="mt-4 block font-display text-xs font-bold uppercase tracking-wide text-ink-navy"
              >
                Your Feedback
              </label>

              <textarea
                id="reviewComment"
                value={reviewComment}
                onChange={(e) =>
                  setReviewComment(e.target.value)
                }
                maxLength={1000}
                rows="4"
                placeholder="Tell us about the product and service..."
                className="mt-2 w-full rounded-sm border border-gray-300 p-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-steel-blue"
              />

              <div className="mt-1 text-right font-mono text-xs text-iron-gray">
                {reviewComment.length}/1000
              </div>

              {reviewError && (
                <div className="mt-3 rounded-sm bg-red-50 p-3 font-body text-sm text-red-700">
                  {reviewError}
                </div>
              )}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reviewSubmitting
                  ? 'Submitting...'
                  : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews */}
        <div className="mt-8">
          {reviewsLoading ? (
            <p className="font-mono text-sm text-iron-gray">
              Loading reviews...
            </p>
          ) : reviewError && reviews.length === 0 ? (
            <p className="font-body text-sm text-red-700">
              {reviewError}
            </p>
          ) : reviews.length === 0 ? (
            <p className="font-body text-sm text-iron-gray">
              Be the first to review this product.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isOwnReview =
                  user &&
                  review.user?._id === user.id

                return (
                  <div
                    key={review._id}
                    className="rounded-sm border border-gray-200 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-display font-bold text-ink-navy">
                          {review.user?.name || 'Customer'}
                        </div>

                        <div className="font-mono text-sm text-safety-amber">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>

                      {isOwnReview && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteReview(review._id)
                          }
                          className="font-mono text-xs text-red-600 hover:underline"
                        >
                          Delete Review
                        </button>
                      )}
                    </div>

                    <p className="mt-3 font-body text-sm leading-relaxed text-iron-gray">
                      {review.comment}
                    </p>

                    <div className="mt-3 font-mono text-xs text-gray-400">
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
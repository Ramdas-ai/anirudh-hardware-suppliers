import api from './api'

export async function getProductReviews(productId) {
  const { data } = await api.get(`/reviews/product/${productId}`)
  return data
}

export async function createReview(productId, reviewData) {
  const { data } = await api.post(
    `/reviews/product/${productId}`,
    reviewData
  )
  return data
}

export async function deleteReview(reviewId) {
  const { data } = await api.delete(`/reviews/${reviewId}`)
  return data
}
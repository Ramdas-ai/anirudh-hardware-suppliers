// Real backend-backed products/categories (Phase 4). Same function
// names/signatures as the Phase 2 localStorage-catalog version, so
// ProductListing/ProductDetail/Home didn't need to change.
import api from './api'

export async function getCategories() {
  const { data } = await api.get('/categories')
  return data
}

export async function getProducts({ search = '', categoryId = '', sort = 'newest', maxPrice = null, inStockOnly = false } = {}) {
  const params = {}
  if (search) params.search = search
  if (categoryId) params.category = categoryId
  if (sort) params.sort = sort
  if (maxPrice) params.maxPrice = maxPrice
  if (inStockOnly) params.inStock = '1'

  const { data } = await api.get('/products', { params })
  return data
}

export async function getProductBySlug(slug) {
  try {
    const { data } = await api.get(`/products/${slug}`)
    return data
  } catch (err) {
    if (err.response?.status === 404) return null
    throw err
  }
}

export async function getProductById(id) {
  try {
    const { data } = await api.get(`/products/id/${id}`)
    return data
  } catch (err) {
    if (err.response?.status === 404) return null
    throw err
  }
}
// Admin: create product with optional image
export async function createProduct(productData, imageFile = null) {
  const formData = new FormData()

  Object.entries(productData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })

  if (imageFile) {
    formData.append('image', imageFile)
  }

  const { data } = await api.post('/products', formData)
  return data
}

// Admin: update product
export async function updateProduct(id, productData) {
  const { data } = await api.put(`/products/${id}`, productData)
  return data
}

// Admin: update stock
export async function updateProductStock(id, stock) {
  const { data } = await api.patch(`/products/${id}/stock`, { stock })
  return data
}

// Admin: delete product
export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`)
  return data
}
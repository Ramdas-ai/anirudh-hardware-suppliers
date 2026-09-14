import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js'

// GET /api/products?search=&category=&sort=&maxPrice=&inStock=
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search = '',
    category = '',
    sort = 'newest',
    maxPrice,
    inStock,
  } = req.query

  const filter = { isActive: true }

  if (category) {
    filter.categoryId = category
  }

  if (maxPrice) {
    filter.price = { $lte: Number(maxPrice) }
  }

  if (inStock === '1' || inStock === 'true') {
    filter.stock = { $gt: 0 }
  }

  if (search.trim()) {
    filter.$or = [
      {
        name: {
          $regex: search.trim(),
          $options: 'i',
        },
      },
      {
        description: {
          $regex: search.trim(),
          $options: 'i',
        },
      },
    ]
  }

  let sortSpec = { createdAt: -1 }

  if (sort === 'price_low') {
    sortSpec = { price: 1 }
  } else if (sort === 'price_high') {
    sortSpec = { price: -1 }
  } else if (sort === 'popular') {
    sortSpec = { stock: -1 }
  }

  const products = await Product.find(filter).sort(sortSpec)

  res.json(products)
})

// GET /api/products/:slug
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  })

  if (!product) {
    res.status(404)
    throw new Error('Product not found.')
  }

  res.json(product)
})

// GET /api/products/id/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found.')
  }

  res.json(product)
})

// POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body }

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer)

    productData.images = [result.secure_url]
  }

  const product = await Product.create(productData)

  res.status(201).json(product)
})

// PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body }

  // If a new image was selected, upload it to Cloudinary
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer)

    productData.images = [result.secure_url]
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    productData,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!product) {
    res.status(404)
    throw new Error('Product not found.')
  }

  res.json(product)
})

// PATCH /api/products/:id/stock (admin)
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!product) {
    res.status(404)
    throw new Error('Product not found.')
  }

  res.json(product)
})

// DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found.')
  }

  res.json({
    message: 'Product deleted.',
  })
})
import asyncHandler from 'express-async-handler'
import Category from '../models/Category.js'

// GET /api/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 })
  res.json(categories)
})

// POST /api/categories (admin) — ready for Phase 7's Admin Dashboard
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body)
  res.status(201).json(category)
})

// PUT /api/categories/:id (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!category) {
    res.status(404)
    throw new Error('Category not found.')
  }
  res.json(category)
})

// DELETE /api/categories/:id (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) {
    res.status(404)
    throw new Error('Category not found.')
  }
  res.json({ message: 'Category deleted.' })
})

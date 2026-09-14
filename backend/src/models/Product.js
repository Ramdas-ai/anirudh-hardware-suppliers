import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    categoryId: { type: String, required: true, index: true }, // references Category.id
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

productSchema.virtual('status').get(function () {
  if (this.stock === 0) return 'out_of_stock'
  if (this.stock <= 5) return 'low_stock'
  return 'in_stock'
})
productSchema.set('toJSON', { virtuals: true })
productSchema.set('toObject', { virtuals: true })

productSchema.index({ name: 'text', description: 'text' })

export default mongoose.model('Product', productSchema)

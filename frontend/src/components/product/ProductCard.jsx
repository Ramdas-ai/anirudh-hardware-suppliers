import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StockGauge from '../common/StockGauge'
import { useCart } from '../../context/CartContext'
import { useCategories } from '../../context/CategoryContext'

function formatNPR(amount) {
  return `NPR ${amount.toLocaleString('en-IN')}`
}

export default function ProductCard({ product }) {
  const { name, slug, categoryId, price, discountPercent = 0, stock } = product
  const finalPrice = discountPercent ? Math.round(price * (1 - discountPercent / 100)) : price
  const outOfStock = stock === 0
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [justAdded, setJustAdded] = useState(false)
  const { getCategoryName } = useCategories()

  function handleAddToCart() {
    if (outOfStock) return
    addItem(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  async function handleBuyNow() {
    if (outOfStock) return
    await addItem(product, 1)
    navigate('/checkout')
  }

  return (
    <div className="group flex flex-col rounded-sm border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
     <Link
  to={`/products/${slug}`}
  className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-gray-100"
>
  {product.images?.[0] ? (
    <img
      src={product.images[0]}
      alt={name}
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="font-mono text-xs text-iron-gray">
      Image placeholder
    </span>
  )}

  {discountPercent > 0 && (
    <span className="absolute left-2 top-2 rounded-sm bg-safety-amber px-2 py-0.5 font-display text-xs font-bold text-ink-navy">
      -{discountPercent}%
    </span>
  )}

  {outOfStock && (
    <span className="absolute inset-0 grid place-items-center bg-ink-navy/60 font-display text-sm font-bold uppercase tracking-wide text-warm-white">
      Out of Stock
    </span>
  )}
</Link>

      <span className="font-mono text-xs uppercase text-iron-gray">{getCategoryName(categoryId)}</span>
      <Link to={`/products/${slug}`}>
        <h3 className="mt-1 font-body text-sm font-semibold leading-snug text-ink-navy hover:text-steel-blue">
          {name}
        </h3>
      </Link>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-lg font-bold text-ink-navy">{formatNPR(finalPrice)}</span>
        {discountPercent > 0 && (
          <span className="font-mono text-xs text-iron-gray line-through">{formatNPR(price)}</span>
        )}
      </div>

      <div className="mt-2">
        <StockGauge stock={stock} />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAddToCart}
          className="flex-1 rounded-sm border-2 border-ink-navy px-3 py-2 font-display text-xs font-bold uppercase tracking-wide text-ink-navy transition-colors hover:bg-ink-navy hover:text-warm-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
        >
          {justAdded ? 'Added ✓' : 'Add to Cart'}
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleBuyNow}
          className="flex-1 rounded-sm bg-safety-amber px-3 py-2 font-display text-xs font-bold uppercase tracking-wide text-ink-navy transition-colors hover:bg-ink-navy hover:text-safety-amber disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          Buy Now
        </button>
      </div>
    </div>
  )
}

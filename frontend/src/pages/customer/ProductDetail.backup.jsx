import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductBySlug } from '../../services/productService'
import { useCategories } from '../../context/CategoryContext'
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

  const [product, setProduct] = useState(undefined)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    setProduct(undefined)

    getProductBySlug(slug)
      .then(setProduct)
      .catch(() => setProduct(null))
  }, [slug])

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
    </div>
  )
}
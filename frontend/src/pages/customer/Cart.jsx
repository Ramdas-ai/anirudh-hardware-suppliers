import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useCart } from '../../context/CartContext'
import { calculateTotals } from '../../services/orderService'
import TickDivider from '../../components/common/TickDivider'

function formatNPR(amount) {
  return `NPR ${amount.toLocaleString('en-IN')}`
}

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  const { subtotal, deliveryCharge, grandTotal } = useMemo(
    () => calculateTotals(items),
    [items]
  )

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-3xl font-bold text-ink-navy">
          Your Cart is Empty
        </h1>

        <p className="mt-2 font-body text-iron-gray">
          Add some tools or materials to get started.
        </p>

        <Link
          to="/products"
          className="btn-primary mt-6 inline-block"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">
        Your Cart
      </h1>

      <TickDivider />

      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {items.map((item) => {
            const finalPrice = item.discountPercent
              ? Math.round(
                  item.price *
                    (1 - item.discountPercent / 100)
                )
              : item.price

            const imageUrl = item.images?.[0]

            return (
              <div
                key={item.productId}
                className="flex gap-4 rounded-sm border border-gray-200 p-4"
              >
                {/* Product Image */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center font-mono text-[10px] text-iron-gray">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-body text-sm font-semibold text-ink-navy">
                    {item.name}
                  </h3>

                  <span className="font-display text-base font-bold text-ink-navy">
                    {formatNPR(finalPrice)}
                  </span>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-sm border border-gray-300">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                        className="px-2 py-1 font-display text-ink-navy hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span className="w-10 border-x border-gray-300 py-1 text-center font-mono text-sm">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          item.quantity >= item.stock
                        }
                        className="px-2 py-1 font-display text-ink-navy hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.productId)
                      }
                      className="font-body text-xs font-semibold text-signal-rust hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {item.quantity >= item.stock && (
                    <p className="mt-1 font-mono text-xs text-safety-amber">
                      Max available stock reached
                    </p>
                  )}
                </div>

                <span className="font-display text-base font-bold text-ink-navy">
                  {formatNPR(
                    finalPrice * item.quantity
                  )}
                </span>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-sm border border-gray-200 p-5">
          <h2 className="font-display text-lg font-bold text-ink-navy">
            Order Summary
          </h2>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between font-body text-sm text-iron-gray">
              <span>Subtotal</span>

              <span className="font-mono">
                {formatNPR(subtotal)}
              </span>
            </div>

            <div className="flex justify-between font-body text-sm text-iron-gray">
              <span>Delivery</span>

              <span className="font-mono">
                {deliveryCharge === 0
                  ? 'Free'
                  : formatNPR(deliveryCharge)}
              </span>
            </div>
          </div>

          <p className="mt-1 font-mono text-xs text-iron-gray">
            Final total is always re-verified by the server before payment.
          </p>

          <TickDivider />

          <div className="mt-3 flex justify-between font-display text-base font-bold text-ink-navy">
            <span>Total</span>

            <span className="font-mono">
              {formatNPR(grandTotal)}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary mt-5 w-full"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderById } from '../../services/orderService'
import TickDivider from '../../components/common/TickDivider'

function formatNPR(amount) {
  return `NPR ${amount.toLocaleString('en-IN')}`
}

const PAYMENT_LABEL = { cod: 'Cash on Delivery', esewa: 'eSewa (test mode)' }

export default function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState(undefined)

  useEffect(() => {
    getOrderById(id).then(setOrder)
  }, [id])

  if (order === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center font-body text-iron-gray md:px-6">Loading...</div>
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-ink-navy">Order Not Found</h1>
        <Link to="/" className="btn-primary mt-6 inline-block">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <div className="text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-leaf-green/10 font-display text-2xl text-leaf-green mx-auto">✓</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-navy">Order Received</h1>
        <p className="mt-2 font-body text-iron-gray">
          Thank you — your order has been placed. We'll confirm it shortly.
        </p>
      </div>

      <div className="mt-8 rounded-sm border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-sm text-iron-gray">Order #{order.orderNumber}</span>
          <span className="rounded-sm bg-safety-amber px-2 py-0.5 font-display text-xs font-bold uppercase text-ink-navy">
            {order.orderStatus}
          </span>
        </div>
        <TickDivider />

        <div className="mt-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between font-body text-sm text-iron-gray">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-mono">{formatNPR(item.priceAtPurchase * item.quantity)}</span>
            </div>
          ))}
        </div>

        <TickDivider />
        <div className="mt-3 space-y-1">
          <div className="flex justify-between font-body text-sm text-iron-gray">
            <span>Subtotal</span>
            <span className="font-mono">{formatNPR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between font-body text-sm text-iron-gray">
            <span>Delivery</span>
            <span className="font-mono">{order.deliveryCharge === 0 ? 'Free' : formatNPR(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between font-display text-base font-bold text-ink-navy">
            <span>Total</span>
            <span className="font-mono">{formatNPR(order.grandTotal)}</span>
          </div>
        </div>

        <TickDivider />
        <div className="mt-3 grid gap-1 font-body text-sm text-iron-gray">
          <span><strong className="text-ink-navy">Payment:</strong> {PAYMENT_LABEL[order.paymentMethod]} — {order.paymentStatus}</span>
          <span><strong className="text-ink-navy">Deliver to:</strong> {order.customer.address}, {order.customer.city}, {order.customer.province}</span>
          <span><strong className="text-ink-navy">Contact:</strong> {order.customer.name}, {order.customer.phone}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        {order.userId && <Link to="/orders" className="btn-primary">View My Orders</Link>}
      </div>
    </div>
  )
}

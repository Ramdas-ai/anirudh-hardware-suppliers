import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getOrderById } from '../../services/orderService'
import TickDivider from '../../components/common/TickDivider'

function formatNPR(amount) {
  return `NPR ${amount.toLocaleString('en-IN')}`
}

const PAYMENT_LABEL = { cod: 'Cash on Delivery', esewa: 'eSewa (test mode)' }

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(undefined)

  useEffect(() => {
    getOrderById(id).then(setOrder)
  }, [id])

  if (order === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center font-body text-iron-gray md:px-6">Loading...</div>
  }

  if (order === null || order.userId !== user?.id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-ink-navy">Order Not Found</h1>
        <Link to="/orders" className="btn-primary mt-6 inline-block">Back to My Orders</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <Link to="/orders" className="font-mono text-xs text-iron-gray hover:text-ink-navy">← Back to My Orders</Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold text-ink-navy">Order #{order.orderNumber}</h1>
        <span className="rounded-sm bg-safety-amber px-2 py-0.5 font-display text-xs font-bold uppercase text-ink-navy">
          {order.orderStatus}
        </span>
      </div>
      <p className="font-body text-xs text-iron-gray">
        Placed {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>

      <TickDivider />

      <div className="mt-4 space-y-2">
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
        <span><strong className="text-ink-navy">Deliver to:</strong> {order.customer.address}, {order.customer.city}, {order.customer.province}{order.customer.postalCode ? ` — ${order.customer.postalCode}` : ''}</span>
        <span><strong className="text-ink-navy">Contact:</strong> {order.customer.name}, {order.customer.phone}</span>
      </div>
    </div>
  )
}

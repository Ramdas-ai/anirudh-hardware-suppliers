import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getOrdersByUser } from '../../services/orderService'
import TickDivider from '../../components/common/TickDivider'

function formatNPR(amount) {
  return `NPR ${amount.toLocaleString('en-IN')}`
}

const STATUS_COLOR = {
  pending: 'bg-safety-amber text-ink-navy',
  confirmed: 'bg-steel-blue text-warm-white',
  processing: 'bg-steel-blue text-warm-white',
  shipped: 'bg-ink-navy text-warm-white',
  delivered: 'bg-leaf-green text-warm-white',
  cancelled: 'bg-signal-rust text-warm-white',
}

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(undefined)

  useEffect(() => {
    if (user) getOrdersByUser(user.id).then(setOrders)
  }, [user])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">My Orders</h1>
      <TickDivider />

      {orders === undefined && (
        <p className="mt-6 font-body text-iron-gray">Loading orders...</p>
      )}

      {orders?.length === 0 && (
        <div className="mt-10 text-center">
          <p className="font-body text-iron-gray">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {orders?.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-gray-200 p-4 transition-colors hover:border-ink-navy"
          >
            <div>
              <span className="font-mono text-sm text-ink-navy">#{order.orderNumber}</span>
              <p className="font-body text-xs text-iron-gray">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}{order.items.length} item{order.items.length === 1 ? '' : 's'}
              </p>
            </div>
            <span className="font-display text-sm font-bold text-ink-navy">{formatNPR(order.grandTotal)}</span>
            <span className={`rounded-sm px-2 py-0.5 font-display text-xs font-bold uppercase ${STATUS_COLOR[order.orderStatus] || ''}`}>
              {order.orderStatus}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

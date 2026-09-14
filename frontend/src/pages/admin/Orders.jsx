import { useEffect, useState } from 'react'
import api from '../../services/api'

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

function formatNPR(amount) {
  return `NPR ${Number(amount || 0).toLocaleString('en-IN')}`
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getStatusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const loadOrders = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/orders/all')

      setOrders(data)
      setError('')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load orders.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      setUpdatingId(orderId)
      setError('')

      const { data } = await api.patch(
        `/orders/${orderId}/status`,
        { orderStatus }
      )

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? data : order
        )
      )

      if (selectedOrder?._id === orderId) {
        setSelectedOrder(data)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update order status.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        Loading orders...
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1>Manage Orders</h1>

          <p>
            Total Orders:{' '}
            <strong>{orders.length}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          style={refreshButtonStyle}
        >
          Refresh Orders
        </button>
      </div>

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div
          style={{
            marginTop: '24px',
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#f8fafc',
          }}
        >
          No orders found.
        </div>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            marginTop: '24px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '1000px',
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Order</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Items</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Payment</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={tdStyle}>
                    <strong>
                      {order.orderNumber}
                    </strong>
                  </td>

                  <td style={tdStyle}>
                    <div>
                      <strong>
                        {order.customer?.name ||
                          'N/A'}
                      </strong>
                    </div>

                    <div style={smallTextStyle}>
                      {order.customer?.phone ||
                        'N/A'}
                    </div>

                    <div style={smallTextStyle}>
                      {order.customer?.email ||
                        'N/A'}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    {formatDate(order.createdAt)}
                  </td>

                  <td style={tdStyle}>
                    {order.items?.reduce(
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0
                    )}
                  </td>

                  <td style={tdStyle}>
                    <strong>
                      {formatNPR(order.grandTotal)}
                    </strong>
                  </td>

                  <td style={tdStyle}>
                    <div>
                      {String(
                        order.paymentMethod || ''
                      ).toUpperCase()}
                    </div>

                    <span
                      style={{
                        ...paymentStatusStyle,
                        ...(order.paymentStatus ===
                        'paid'
                          ? paidStyle
                          : pendingStyle),
                      }}
                    >
                      {order.paymentStatus ||
                        'pending'}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <select
                      value={
                        order.orderStatus || 'pending'
                      }
                      disabled={
                        updatingId === order._id
                      }
                      onChange={(event) =>
                        updateOrderStatus(
                          order._id,
                          event.target.value
                        )
                      }
                      style={statusSelectStyle}
                    >
                      {ORDER_STATUSES.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {getStatusLabel(status)}
                          </option>
                        )
                      )}
                    </select>

                    {updatingId === order._id && (
                      <div style={smallTextStyle}>
                        Updating...
                      </div>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOrder(order)
                      }
                      style={viewButtonStyle}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <h2>
                Order Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <hr />

            <div style={detailsGridStyle}>
              <div>
                <strong>Order Number</strong>
                <p>
                  {selectedOrder.orderNumber}
                </p>
              </div>

              <div>
                <strong>Order Date</strong>
                <p>
                  {formatDate(
                    selectedOrder.createdAt
                  )}
                </p>
              </div>

              <div>
                <strong>Customer Name</strong>
                <p>
                  {selectedOrder.customer?.name ||
                    'N/A'}
                </p>
              </div>

              <div>
                <strong>Phone</strong>
                <p>
                  {selectedOrder.customer?.phone ||
                    'N/A'}
                </p>
              </div>

              <div>
                <strong>Email</strong>
                <p>
                  {selectedOrder.customer?.email ||
                    'N/A'}
                </p>
              </div>

              <div>
                <strong>City</strong>
                <p>
                  {selectedOrder.customer?.city ||
                    'N/A'}
                </p>
              </div>

              <div>
                <strong>Province</strong>
                <p>
                  {selectedOrder.customer?.province ||
                    'N/A'}
                </p>
              </div>

              <div>
                <strong>Payment Method</strong>
                <p>
                  {String(
                    selectedOrder.paymentMethod ||
                      ''
                  ).toUpperCase()}
                </p>
              </div>

              <div
                style={{
                  gridColumn: '1 / -1',
                }}
              >
                <strong>Delivery Address</strong>
                <p>
                  {selectedOrder.customer?.address ||
                    'N/A'}
                </p>
              </div>
            </div>

            <h3 style={{ marginTop: '24px' }}>
              Ordered Products
            </h3>

            <div
              style={{
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '600px',
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Product
                    </th>
                    <th style={thStyle}>
                      Quantity
                    </th>
                    <th style={thStyle}>
                      Price
                    </th>
                    <th style={thStyle}>
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedOrder.items?.map(
                    (item, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>
                          {item.name}
                        </td>

                        <td style={tdStyle}>
                          {item.quantity}
                        </td>

                        <td style={tdStyle}>
                          {formatNPR(
                            item.priceAtPurchase
                          )}
                        </td>

                        <td style={tdStyle}>
                          {formatNPR(
                            Number(
                              item.priceAtPurchase || 0
                            ) *
                              Number(
                                item.quantity || 0
                              )
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: '20px',
                marginLeft: 'auto',
                maxWidth: '350px',
              }}
            >
              <div style={summaryRowStyle}>
                <span>Subtotal</span>
                <strong>
                  {formatNPR(
                    selectedOrder.subtotal
                  )}
                </strong>
              </div>

              <div style={summaryRowStyle}>
                <span>Delivery Charge</span>
                <strong>
                  {formatNPR(
                    selectedOrder.deliveryCharge
                  )}
                </strong>
              </div>

              <div
                style={{
                  ...summaryRowStyle,
                  borderTop:
                    '2px solid #111827',
                  paddingTop: '12px',
                  marginTop: '8px',
                  fontSize: '18px',
                }}
              >
                <span>Grand Total</span>
                <strong>
                  {formatNPR(
                    selectedOrder.grandTotal
                  )}
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <strong>Order Status:</strong>

              <select
                value={
                  selectedOrder.orderStatus ||
                  'pending'
                }
                disabled={
                  updatingId ===
                  selectedOrder._id
                }
                onChange={(event) =>
                  updateOrderStatus(
                    selectedOrder._id,
                    event.target.value
                  )
                }
                style={statusSelectStyle}
              >
                {ORDER_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedOrder(null)
              }
              style={{
                ...viewButtonStyle,
                marginTop: '24px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  border: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
  background: '#f1f5f9',
}

const tdStyle = {
  border: '1px solid #ddd',
  padding: '10px',
  verticalAlign: 'top',
}

const smallTextStyle = {
  marginTop: '4px',
  fontSize: '12px',
  color: '#6b7280',
}

const errorStyle = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: '12px',
  marginTop: '20px',
  borderRadius: '6px',
}

const refreshButtonStyle = {
  padding: '10px 16px',
  cursor: 'pointer',
  border: '1px solid #111827',
  background: '#111827',
  color: '#fff',
  borderRadius: '5px',
}

const viewButtonStyle = {
  padding: '8px 12px',
  cursor: 'pointer',
  border: '1px solid #111827',
  background: '#fff',
  color: '#111827',
  borderRadius: '5px',
}

const closeButtonStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '28px',
  cursor: 'pointer',
}

const statusSelectStyle = {
  padding: '7px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  background: '#fff',
}

const paymentStatusStyle = {
  display: 'inline-block',
  marginTop: '5px',
  padding: '3px 7px',
  borderRadius: '4px',
  fontSize: '11px',
  textTransform: 'uppercase',
}

const paidStyle = {
  background: '#dcfce7',
  color: '#166534',
}

const pendingStyle = {
  background: '#fef3c7',
  color: '#92400e',
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 1000,
}

const modalStyle = {
  width: '100%',
  maxWidth: '900px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#fff',
  borderRadius: '8px',
  padding: '24px',
  boxSizing: 'border-box',
}

const detailsGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '18px',
  marginTop: '20px',
}

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  padding: '7px 0',
}
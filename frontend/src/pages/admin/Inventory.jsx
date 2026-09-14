import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AdminInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const { data } = await api.get('/products')
      setProducts(data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load inventory.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const updateStock = async (id, currentStock) => {
    const newStock = window.prompt(
      'Enter new stock quantity:',
      currentStock
    )

    if (newStock === null) return

    const stock = Number(newStock)

    if (!Number.isInteger(stock) || stock < 0) {
      alert('Please enter a valid stock number.')
      return
    }

    try {
      await api.patch(
        `/products/${id}/stock`,
        { stock }
      )

      await loadProducts()

      alert('Stock updated successfully.')
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to update stock.'
      )
    }
  }

  const getStatus = (stock) => {
    if (stock === 0) return 'Out of Stock'
    if (stock <= 5) return 'Low Stock'
    return 'In Stock'
  }

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        Loading inventory...
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <h1>Inventory Management</h1>

      <p>
        Total Products:{' '}
        <strong>{products.length}</strong>
      </p>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '6px',
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={loadProducts}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          cursor: 'pointer',
        }}
      >
        Refresh Inventory
      </button>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td style={tdStyle}>
                    {product.name}
                  </td>

                  <td style={tdStyle}>
                    Rs. {product.price}
                  </td>

                  <td style={tdStyle}>
                    {product.stock}
                  </td>

                  <td style={tdStyle}>
                    {getStatus(product.stock)}
                  </td>

                  <td style={tdStyle}>
                    <button
                      onClick={() =>
                        updateStock(
                          product._id,
                          product.stock
                        )
                      }
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  border: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
}

const tdStyle = {
  border: '1px solid #ddd',
  padding: '10px',
}
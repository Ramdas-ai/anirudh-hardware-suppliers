import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError('')

      const { data } = await api.get('/admin/customers')
      setCustomers(data)
    } catch (err) {
      console.error('Failed to load customers:', err)
      setError(
        err.response?.data?.message ||
        'Failed to load customers.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <div>
      <h1>MANAGE CUSTOMERS</h1>

      <p>Total Customers: {customers.length}</p>

      <button onClick={loadCustomers}>
        Refresh Customers
      </button>

      {loading && <p>Loading customers...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && customers.length === 0 && (
        <p>No customers found.</p>
      )}

      {!loading && !error && customers.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Joined</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.name || 'N/A'}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>{customer.email || 'N/A'}</td>
                <td>
                  {customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalCustomers: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get('/admin/stats')
        setStats(data)
        setError('')
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to load dashboard statistics.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-4 text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mb-8 text-gray-600">
          Welcome to Anirudh Hardware Admin Panel
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Products
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              {stats.totalProducts}
            </h2>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Categories
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              {stats.totalCategories}
            </h2>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              {stats.totalOrders}
            </h2>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Customers
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              {stats.totalCustomers}
            </h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <a
            href="/admin/products"
            className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Manage Products
            </h2>
            <p className="mt-2 text-gray-600">
              Add, edit and delete products.
            </p>
          </a>

          <a
            href="/admin/orders"
            className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Manage Orders
            </h2>
            <p className="mt-2 text-gray-600">
              View and manage customer orders.
            </p>
          </a>

          <a
            href="/admin/customers"
            className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Customers
            </h2>
            <p className="mt-2 text-gray-600">
              View registered customers.
            </p>
          </a>

          <a
            href="/admin/inventory"
            className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Inventory
            </h2>
            <p className="mt-2 text-gray-600">
              Monitor product stock.
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
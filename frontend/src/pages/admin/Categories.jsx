import { useEffect, useState } from 'react'
import api from '../../services/api'

const initialForm = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError('')

      const { data } = await api.get('/categories')
      setCategories(data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load categories.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      alert('Category name is required.')
      return false
    }

    if (!form.slug.trim()) {
      alert('Category slug is required.')
      return false
    }

    return true
  }

  const saveCategory = async (event) => {
    event.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)
      setError('')

      const categoryData = {
  id: form.slug.trim(),
  name: form.name.trim(),
  slug: form.slug.trim(),
  description: form.description.trim(),
  isActive: form.isActive,
}

      if (editingId) {
        await api.put(
          `/categories/${editingId}`,
          categoryData
        )

        alert('Category updated successfully.')
      } else {
        await api.post('/categories', categoryData)

        alert('Category added successfully.')
      }

      resetForm()
      await loadCategories()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save category.'
      )
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (category) => {
    setEditingId(category._id)

    setForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      isActive: category.isActive !== false,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const deleteCategory = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    )

    if (!confirmed) return

    try {
      await api.delete(`/categories/${id}`)

      await loadCategories()

      alert('Category deleted successfully.')
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to delete category.'
      )
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        Loading categories...
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
      <h1>Manage Categories</h1>

      <p>
        Total Categories:{' '}
        <strong>{categories.length}</strong>
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

      {/* Category Form */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px',
          marginBottom: '30px',
        }}
      >
        <h2>
          {editingId ? 'Edit Category' : 'Add Category'}
        </h2>

        <form onSubmit={saveCategory}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            <div>
              <label>Category Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter category name"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Slug</label>

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="example-category"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter category description"
              rows="4"
              style={{
                ...inputStyle,
                width: '100%',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />{' '}
              Category is Active
            </label>
          </div>

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 20px',
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {saving
                ? editingId
                  ? 'Updating Category...'
                  : 'Adding Category...'
                : editingId
                  ? 'Update Category'
                  : 'Add Category'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  cursor: saving
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category List */}
      <h2>Category List</h2>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '20px',
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td style={tdStyle}>
                    {category.name}
                  </td>

                  <td style={tdStyle}>
                    {category.slug}
                  </td>

                  <td style={tdStyle}>
                    {category.description || 'N/A'}
                  </td>

                  <td style={tdStyle}>
                    {category.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </td>

                  <td style={tdStyle}>
                    <button
                      onClick={() =>
                        startEdit(category)
                      }
                      style={{
                        marginRight: '8px',
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteCategory(category._id)
                      }
                    >
                      Delete
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

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginTop: '6px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  boxSizing: 'border-box',
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
import { useEffect, useState } from 'react'
import api from '../../services/api'

const initialForm = {
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  price: '',
  discountPercent: '0',
  stock: '0',
  isActive: true,
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [image, setImage] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const loadProducts = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/products')

      setProducts(data)
      setError('')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load products.'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories')

      setCategories(data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load categories.'
      )
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0] || null

    if (!file) {
      setImage(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      event.target.value = ''
      setImage(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5 MB.')
      event.target.value = ''
      setImage(null)
      return
    }

    setImage(file)
  }

  const resetForm = () => {
    setForm(initialForm)
    setImage(null)
    setEditingId(null)
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      alert('Product name is required.')
      return false
    }

    if (!form.slug.trim()) {
      alert('Product slug is required.')
      return false
    }

    if (!form.categoryId) {
      alert('Please select a category.')
      return false
    }

    if (
      form.price === '' ||
      Number(form.price) < 0
    ) {
      alert('Please enter a valid price.')
      return false
    }

    if (
      form.discountPercent === '' ||
      Number(form.discountPercent) < 0 ||
      Number(form.discountPercent) > 100
    ) {
      alert('Discount must be between 0 and 100.')
      return false
    }

    if (
      form.stock === '' ||
      Number(form.stock) < 0
    ) {
      alert('Please enter a valid stock quantity.')
      return false
    }

    return true
  }

  // ADD PRODUCT
  const addProduct = async (event) => {
    event.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)
      setError('')

      const formData = new FormData()

      formData.append(
        'name',
        form.name.trim()
      )

      formData.append(
        'slug',
        form.slug.trim()
      )

      formData.append(
        'description',
        form.description.trim()
      )

      formData.append(
        'categoryId',
        form.categoryId
      )

      formData.append(
        'price',
        Number(form.price)
      )

      formData.append(
        'discountPercent',
        Number(form.discountPercent)
      )

      formData.append(
        'stock',
        Number(form.stock)
      )

      formData.append(
        'isActive',
        form.isActive
      )

      if (image) {
        formData.append('image', image)
      }

      await api.post(
        '/products',
        formData
      )

      alert('Product added successfully.')

      resetForm()

      await loadProducts()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to add product.'
      )
    } finally {
      setSaving(false)
    }
  }

  // START EDIT
  const startEdit = (product) => {
    setEditingId(product._id)

    setForm({
      name: product.name || '',
      slug: product.slug || '',
      description:
        product.description || '',
      categoryId:
        product.categoryId || '',
      price: String(
        product.price ?? ''
      ),
      discountPercent: String(
        product.discountPercent ?? 0
      ),
      stock: String(
        product.stock ?? 0
      ),
      isActive:
        product.isActive !== false,
    })

    setImage(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // UPDATE PRODUCT
  const updateProduct = async (event) => {
    event.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)
      setError('')

      const formData = new FormData()

      formData.append(
        'name',
        form.name.trim()
      )

      formData.append(
        'slug',
        form.slug.trim()
      )

      formData.append(
        'description',
        form.description.trim()
      )

      formData.append(
        'categoryId',
        form.categoryId
      )

      formData.append(
        'price',
        Number(form.price)
      )

      formData.append(
        'discountPercent',
        Number(form.discountPercent)
      )

      formData.append(
        'stock',
        Number(form.stock)
      )

      formData.append(
        'isActive',
        form.isActive
      )

      // IMPORTANT:
      // Send new image only if user selected one.
      if (image) {
        formData.append('image', image)
      }

      await api.put(
        `/products/${editingId}`,
        formData
      )

      alert(
        image
          ? 'Product and image updated successfully.'
          : 'Product updated successfully.'
      )

      resetForm()

      await loadProducts()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update product.'
      )
    } finally {
      setSaving(false)
    }
  }

  // UPDATE STOCK
  const updateStock = async (
    id,
    currentStock
  ) => {
    const newStock = window.prompt(
      'Enter new stock quantity:',
      currentStock
    )

    if (newStock === null) return

    const stock = Number(newStock)

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      alert(
        'Please enter a valid stock number.'
      )
      return
    }

    try {
      await api.patch(
        `/products/${id}/stock`,
        { stock }
      )

      await loadProducts()

      alert(
        'Stock updated successfully.'
      )
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to update stock.'
      )
    }
  }

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this product?'
      )

    if (!confirmed) return

    try {
      await api.delete(
        `/products/${id}`
      )

      await loadProducts()

      alert(
        'Product deleted successfully.'
      )
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to delete product.'
      )
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        Loading products...
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
      <h1>Manage Products</h1>

      <p>
        Total Products:{' '}
        <strong>
          {products.length}
        </strong>
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

      {/* Product Form */}
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
          {editingId
            ? 'Edit Product'
            : 'Add Product'}
        </h2>

        <form
          onSubmit={
            editingId
              ? updateProduct
              : addProduct
          }
        >
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
              <label>
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Slug
              </label>

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="example-product"
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Category
              </label>

              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label>
                Price
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter price"
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Discount (%)
              </label>

              <input
                type="number"
                name="discountPercent"
                value={
                  form.discountPercent
                }
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                step="1"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Product Image */}
          <div
            style={{
              marginTop: '16px',
            }}
          >
            <label>
              {editingId
                ? 'Change Product Image'
                : 'Product Image'}
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                display: 'block',
                marginTop: '6px',
              }}
            />

            {image && (
              <p
                style={{
                  marginTop: '6px',
                }}
              >
                Selected: {image.name}
              </p>
            )}

            {editingId &&
              !image &&
              products.find(
                (product) =>
                  product._id ===
                  editingId
              )?.images?.[0] && (
                <div
                  style={{
                    marginTop: '10px',
                  }}
                >
                  <p>
                    Current Image:
                  </p>

                  <img
                    src={
                      products.find(
                        (product) =>
                          product._id ===
                          editingId
                      ).images[0]
                    }
                    alt="Current product"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border:
                        '1px solid #ddd',
                    }}
                  />
                </div>
              )}
          </div>

          {/* Description */}
          <div
            style={{
              marginTop: '16px',
            }}
          >
            <label>
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
              style={{
                ...inputStyle,
                width: '100%',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Active */}
          <div
            style={{
              marginTop: '16px',
            }}
          >
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={
                  form.isActive
                }
                onChange={handleChange}
              />{' '}
              Product is Active
            </label>
          </div>

          {/* Submit Buttons */}
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
                padding:
                  '10px 20px',
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {saving
                ? editingId
                  ? 'Updating Product...'
                  : 'Adding Product...'
                : editingId
                  ? 'Update Product'
                  : 'Add Product'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                style={{
                  padding:
                    '10px 20px',
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

      {/* Product List */}
      <h2>Product List</h2>

      {products.length === 0 ? (
        <p>
          No products found.
        </p>
      ) : (
        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'collapse',
              marginTop: '20px',
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>
                  Image
                </th>

                <th style={thStyle}>
                  Name
                </th>

                <th style={thStyle}>
                  Price
                </th>

                <th style={thStyle}>
                  Stock
                </th>

                <th style={thStyle}>
                  Status
                </th>

                <th style={thStyle}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map(
                (product) => (
                  <tr
                    key={
                      product._id
                    }
                  >
                    <td
                      style={
                        tdStyle
                      }
                    >
                      {product
                        .images?.[0] ? (
                        <img
                          src={
                            product
                              .images[0]
                          }
                          alt={
                            product.name
                          }
                          style={{
                            width:
                              '70px',
                            height:
                              '70px',
                            objectFit:
                              'cover',
                            borderRadius:
                              '6px',
                          }}
                        />
                      ) : (
                        'No image'
                      )}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {product.name}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      Rs.{' '}
                      {
                        product.price
                      }
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {
                        product.stock
                      }
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {product.stock ===
                      0
                        ? 'Out of Stock'
                        : product.stock <=
                            5
                          ? 'Low Stock'
                          : 'In Stock'}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      <button
                        onClick={() =>
                          startEdit(
                            product
                          )
                        }
                        style={{
                          marginRight:
                            '8px',
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          updateStock(
                            product._id,
                            product.stock
                          )
                        }
                        style={{
                          marginRight:
                            '8px',
                        }}
                      >
                        Update Stock
                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(
                            product._id
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
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
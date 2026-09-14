import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import TickDivider from '../../components/common/TickDivider'
import { getProducts, getCategories } from '../../services/productService'

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const inStockOnly = searchParams.get('inStock') === '1'
  const maxPrice = searchParams.get('maxPrice') || ''

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    getProducts({
      search,
      categoryId,
      sort,
      inStockOnly,
      maxPrice: maxPrice ? Number(maxPrice) : null,
    }).then((results) => {
      setProducts(results)
      setLoading(false)
    })
  }, [search, categoryId, sort, inStockOnly, maxPrice])

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams)
      if (value) next.set(key, value)
      else next.delete(key)
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  function handleSearchSubmit(e) {
    e.preventDefault()
    setParam('search', searchInput)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">
        {categoryId
          ? categories.find((c) => c.id === categoryId)?.name || 'Products'
          : 'All Products'}
      </h1>
      <TickDivider />

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {/* Filters sidebar */}
        <aside className="w-full shrink-0 space-y-6 md:w-64">
          <form onSubmit={handleSearchSubmit}>
            <label htmlFor="search" className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">
              Search
            </label>
            <div className="mt-2 flex">
              <input
                id="search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Drill, cement, pipe..."
                className="w-full rounded-sm border border-gray-300 px-3 py-2 font-body text-sm focus:border-ink-navy focus:outline-none"
              />
              <button type="submit" className="bg-safety-amber px-3 font-display text-xs font-bold text-ink-navy">
                Go
              </button>
            </div>
          </form>

          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">Category</h3>
            <div className="mt-2 flex flex-col gap-1">
              <button
                onClick={() => setParam('category', '')}
                className={`rounded-sm px-2 py-1 text-left font-body text-sm ${
                  !categoryId ? 'bg-ink-navy text-warm-white' : 'text-iron-gray hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setParam('category', c.id)}
                  className={`flex items-center gap-2 rounded-sm px-2 py-1 text-left font-body text-sm ${
                    categoryId === c.id ? 'bg-ink-navy text-warm-white' : 'text-iron-gray hover:bg-gray-100'
                  }`}
                >
                  <span>{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">Max Price (NPR)</h3>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setParam('maxPrice', e.target.value)}
              placeholder="e.g. 1000"
              className="mt-2 w-full rounded-sm border border-gray-300 px-3 py-2 font-body text-sm focus:border-ink-navy focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 font-body text-sm text-iron-gray">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setParam('inStock', e.target.checked ? '1' : '')}
              className="h-4 w-4 accent-ink-navy"
            />
            In stock only
          </label>

          {(search || categoryId || maxPrice || inStockOnly) && (
            <button
              onClick={() => {
                setSearchInput('')
                setSearchParams({})
              }}
              className="font-body text-sm font-semibold text-steel-blue hover:underline"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-iron-gray">
              {loading ? 'Searching...' : `${products.length} product${products.length === 1 ? '' : 's'} found`}
            </span>
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="rounded-sm border border-gray-300 px-2 py-1 font-body text-sm focus:border-ink-navy focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          {!loading && products.length === 0 && (
            <div className="mt-10 rounded-sm border border-dashed border-gray-300 p-10 text-center">
              <p className="font-body text-iron-gray">No products match your filters.</p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

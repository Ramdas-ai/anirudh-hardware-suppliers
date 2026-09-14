import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getCategories } from '../services/productService'

const CategoryContext = createContext(null)

// Fetches categories from the backend once and shares them app-wide, so
// every component that needs a category list or a categoryId → name lookup
// (Home, ProductListing, ProductCard, ProductDetail) reflects whatever is
// actually in the database instead of a static frontend file — important
// now that categories are admin-editable (Phase 7) via the API built in
// Phase 4.
export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  const getCategoryName = useCallback(
    (id) => categories.find((c) => c.id === id)?.name || id,
    [categories]
  )

  const value = { categories, loading, getCategoryName }
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export function useCategories() {
  return useContext(CategoryContext)
}

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import * as cartService from '../services/cartService'

const CartContext = createContext(null)

const STORAGE_KEY = 'anirudh_cart_v1'

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistLocal(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // storage unavailable — cart still works for the session
  }
}

// Phase 4: for a logged-in customer, the cart is persisted server-side
// (backend/src/models/Cart.js) and every mutation calls the API. A guest
// (no user) keeps the Phase 2/3 localStorage behavior — there's no account
// to attach a server cart to. On login, any items added as a guest are
// merged into the server cart so nothing is lost.
export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState(loadLocal)
  const mergedForUserId = useRef(null)

  // When a user logs in, merge whatever was in the local guest cart into
  // their server cart, then switch to server cart as the source of truth.
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      mergedForUserId.current = null
      setItems(loadLocal())
      return
    }

    if (mergedForUserId.current === user.id) return
    mergedForUserId.current = user.id

    async function syncOnLogin() {
      const guestItems = loadLocal()
      for (const item of guestItems) {
        try {
          await cartService.addToCart(item.productId, item.quantity)
        } catch {
          // an item may have gone out of stock or been removed since it was
          // added as a guest — skip it rather than failing the whole merge
        }
      }
      localStorage.removeItem(STORAGE_KEY)
      const serverItems = await cartService.getCart()
      setItems(serverItems)
    }

    syncOnLogin().catch(() => {
      // if the merge fails entirely, fall back to whatever the server has
      cartService.getCart().then(setItems).catch(() => {})
    })
  }, [user, authLoading])

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (user) {
        const next = await cartService.addToCart(product.id, quantity)
        setItems(next)
        return
      }
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id)
        const maxQty = product.stock
        let next
        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, maxQty)
          next = prev.map((i) => (i.productId === product.id ? { ...i, quantity: newQty } : i))
        } else {
          next = [
            ...prev,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              discountPercent: product.discountPercent || 0,
              quantity: Math.min(quantity, maxQty),
              stock: product.stock,
            },
          ]
        }
        persistLocal(next)
        return next
      })
    },
    [user]
  )

  const removeItem = useCallback(
    async (productId) => {
      if (user) {
        const next = await cartService.removeFromCart(productId)
        setItems(next)
        return
      }
      setItems((prev) => {
        const next = prev.filter((i) => i.productId !== productId)
        persistLocal(next)
        return next
      })
    },
    [user]
  )

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (user) {
        const next = await cartService.updateCartItem(productId, quantity)
        setItems(next)
        return
      }
      setItems((prev) => {
        const next = prev
          .map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
          )
          .filter((i) => i.quantity > 0)
        persistLocal(next)
        return next
      })
    },
    [user]
  )

  const clear = useCallback(async () => {
    if (user) {
      // Order creation already clears the server cart (see orderController),
      // but this covers any other case that needs an explicit clear.
      await cartService.clearServerCart().catch(() => {})
    }
    setItems([])
    persistLocal([])
  }, [user])

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items])

  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const finalPrice = i.discountPercent ? Math.round(i.price * (1 - i.discountPercent / 100)) : i.price
        return sum + finalPrice * i.quantity
      }, 0),
    [items]
  )

  const value = { items, addItem, removeItem, updateQuantity, clear, count, subtotal }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}

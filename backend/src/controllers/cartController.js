import asyncHandler from 'express-async-handler'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

// Shapes a populated cart into the flat item format the frontend already
// expects (see CartContext).
function serializeCart(cart) {
  if (!cart) return { items: [] }

  return {
    items: cart.items
      .filter((i) => i.product)
      .map((i) => ({
        productId: i.product._id.toString(),
        slug: i.product.slug,
        name: i.product.name,
        price: i.product.price,
        discountPercent: i.product.discountPercent || 0,
        stock: i.product.stock,
        quantity: i.quantity,
        images: i.product.images || [],
      })),
  }
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate(
    'items.product'
  )

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    })
  }

  return cart
}

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)

  res.json(serializeCart(cart))
})

// POST /api/cart/add
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body

  const product = await Product.findById(productId)

  if (!product) {
    res.status(404)
    throw new Error('Product not found.')
  }

  let cart = await Cart.findOne({
    user: req.user._id,
  })

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    })
  }

  const existing = cart.items.find(
    (i) => i.product.toString() === productId
  )

  const requestedQty =
    (existing?.quantity || 0) + Number(quantity)

  const clampedQty = Math.min(
    requestedQty,
    product.stock
  )

  if (existing) {
    existing.quantity = clampedQty
  } else {
    cart.items.push({
      product: productId,
      quantity: Math.min(
        Number(quantity),
        product.stock
      ),
    })
  }

  await cart.save()
  await cart.populate('items.product')

  res.json(serializeCart(cart))
})

// PUT /api/cart/update
export const updateCartItem = asyncHandler(
  async (req, res) => {
    const { productId, quantity } = req.body

    const cart = await Cart.findOne({
      user: req.user._id,
    })

    if (!cart) {
      res.status(404)
      throw new Error('Cart not found.')
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    )

    if (!item) {
      res.status(404)
      throw new Error('Item not in cart.')
    }

    const product = await Product.findById(productId)

    const clampedQty = Math.max(
      1,
      Math.min(
        Number(quantity),
        product?.stock ?? Number(quantity)
      )
    )

    if (clampedQty <= 0) {
      cart.items = cart.items.filter(
        (i) =>
          i.product.toString() !== productId
      )
    } else {
      item.quantity = clampedQty
    }

    await cart.save()
    await cart.populate('items.product')

    res.json(serializeCart(cart))
  }
)

// DELETE /api/cart/remove/:productId
export const removeFromCart = asyncHandler(
  async (req, res) => {
    const cart = await Cart.findOne({
      user: req.user._id,
    })

    if (!cart) {
      res.status(404)
      throw new Error('Cart not found.')
    }

    cart.items = cart.items.filter(
      (i) =>
        i.product.toString() !==
        req.params.productId
    )

    await cart.save()
    await cart.populate('items.product')

    res.json(serializeCart(cart))
  }
)

// DELETE /api/cart
export const clearCart = asyncHandler(
  async (req, res) => {
    const cart = await Cart.findOne({
      user: req.user._id,
    })

    if (cart) {
      cart.items = []
      await cart.save()
    }

    res.json({ items: [] })
  }
)
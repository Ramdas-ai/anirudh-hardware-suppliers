import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Cart is only persisted server-side for logged-in customers; guest carts
// stay client-side (localStorage) in the frontend, per the architecture
// doc — every route here requires auth.
router.use(protect)

router.get('/', getCart)
router.post('/add', addToCart)
router.put('/update', updateCartItem)
router.delete('/remove/:productId', removeFromCart)
router.delete('/', clearCart)

export default router

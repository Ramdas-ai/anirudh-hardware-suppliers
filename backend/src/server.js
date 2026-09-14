import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

import { connectDB } from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import healthRoutes from './routes/health.routes.js'
import authRoutes from './routes/auth.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import adminRoutes from './routes/admin.routes.js'
import reviewRoutes from './routes/review.routes.js'
import paymentRoutes from './routes/payment.routes.js'

dotenv.config()

const app = express()

app.use(helmet())

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:5173',
    credentials: true,
  })
)

app.use(express.json())
app.use(morgan('dev'))

// Rate limiting on auth routes specifically
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    message:
      'Too many attempts. Please try again later.',
  },
})

app.use('/api/health', healthRoutes)
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/payments', paymentRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(
      `[server] listening on port ${PORT}`
    )
  )
})
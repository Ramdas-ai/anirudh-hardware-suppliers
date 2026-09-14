import mongoose from 'mongoose'

// Connects to MongoDB Atlas (or local Mongo in dev) using MONGO_URI from env.
// From Phase 4 onward this connection is required for auth/products/cart/
// orders to work — the warn-and-continue behavior below just keeps
// /api/health reachable for a quick sanity check even without a DB.
export async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.warn('[db] MONGO_URI not set — API routes that touch the database will fail until it is configured.')
    return
  }
  await mongoose.connect(uri)
  console.log('[db] MongoDB connected')
}

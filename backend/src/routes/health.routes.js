import { Router } from 'express'

const router = Router()

// Simple health check so the frontend/deployment can verify the API is up
// before real routes (products, orders, etc.) land in later phases.
router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'anirudh-hardware-backend', phase: 4 })
})

export default router

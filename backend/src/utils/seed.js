// Seeds the database with the same placeholder categories/products the
// frontend used in Phases 1-3 (src/data/catalog.js on the frontend), so
// switching the frontend over to real API calls doesn't change what
// customers see. Run with: npm run seed (see package.json).
import 'dotenv/config'
import mongoose from 'mongoose'
import Category from '../models/Category.js'
import Product from '../models/Product.js'

const categories = [
  { id: 'power-tools', name: 'Power Tools', icon: '🔌' },
  { id: 'hand-tools', name: 'Hand Tools', icon: '🔧' },
  { id: 'plumbing', name: 'Plumbing', icon: '🚿' },
  { id: 'electrical', name: 'Electrical', icon: '💡' },
  { id: 'building-materials', name: 'Building Materials', icon: '🧱' },
  { id: 'paints', name: 'Paints & Accessories', icon: '🎨' },
  { id: 'fittings', name: 'Hardware Fittings', icon: '🔩' },
  { id: 'safety', name: 'Safety Equipment', icon: '🦺' },
  { id: 'measuring', name: 'Measuring Tools', icon: '📏' },
]

const products = [
  { slug: 'drill-machine-13mm-impact', name: 'Drill Machine — 13mm Impact', categoryId: 'power-tools', price: 5000, discountPercent: 10, stock: 8, description: 'A 13mm impact drill for masonry, wood and metal. Includes chuck key and side handle.' },
  { slug: 'angle-grinder-4-inch', name: 'Angle Grinder — 4 inch', categoryId: 'power-tools', price: 3200, discountPercent: 0, stock: 6, description: 'Compact angle grinder for cutting and grinding metal, tile and stone.' },
  { slug: 'circular-saw-7-inch', name: 'Circular Saw — 7 inch', categoryId: 'power-tools', price: 6800, discountPercent: 5, stock: 0, description: 'A powerful circular saw for clean, straight cuts through timber and boards.' },
  { slug: 'claw-hammer-450g', name: 'Claw Hammer — 450g', categoryId: 'hand-tools', price: 650, discountPercent: 0, stock: 24, description: 'Forged steel claw hammer with a shock-absorbing rubber grip.' },
  { slug: 'screwdriver-set-6pc', name: 'Screwdriver Set — 6 pc', categoryId: 'hand-tools', price: 950, discountPercent: 0, stock: 18, description: 'A 6-piece flathead and Phillips screwdriver set for home and workshop use.' },
  { slug: 'adjustable-wrench-10-inch', name: 'Adjustable Wrench — 10 inch', categoryId: 'hand-tools', price: 480, discountPercent: 0, stock: 4, description: 'Chrome-vanadium adjustable wrench with a smooth-turning worm gear.' },
  { slug: 'pvc-pipe-1-inch-3m', name: 'PVC Pipe — 1 inch (3m)', categoryId: 'plumbing', price: 320, discountPercent: 0, stock: 3, description: 'Food-grade PVC pipe, 1 inch diameter, 3 metre length, for water supply lines.' },
  { slug: 'brass-tap-standard', name: 'Brass Tap — Standard', categoryId: 'plumbing', price: 780, discountPercent: 0, stock: 15, description: 'Corrosion-resistant brass tap suitable for kitchen and bathroom fittings.' },
  { slug: 'pipe-wrench-14-inch', name: 'Pipe Wrench — 14 inch', categoryId: 'plumbing', price: 1100, discountPercent: 0, stock: 0, description: 'Heavy-duty pipe wrench for gripping and turning pipes and fittings.' },
  { slug: 'mcb-switch-32a', name: 'MCB Switch — 32A', categoryId: 'electrical', price: 480, discountPercent: 5, stock: 0, description: 'Miniature circuit breaker rated 32A, for overload and short-circuit protection.' },
  { slug: 'led-bulb-9w', name: 'LED Bulb — 9W', categoryId: 'electrical', price: 220, discountPercent: 0, stock: 50, description: 'Energy-efficient 9W LED bulb, cool daylight, standard B22 base.' },
  { slug: 'electrical-wire-1-5mm-90m', name: 'Electrical Wire — 1.5mm (90m coil)', categoryId: 'electrical', price: 2600, discountPercent: 0, stock: 9, description: 'Copper electrical wire, 1.5mm, 90 metre coil, for domestic wiring.' },
  { slug: 'cement-50kg-bag', name: 'Cement — 50kg Bag', categoryId: 'building-materials', price: 1150, discountPercent: 0, stock: 60, description: 'OPC 43-grade cement, 50kg bag, for general construction use.' },
  { slug: 'sand-per-cubic-ft', name: 'Sand — per Cubic Ft', categoryId: 'building-materials', price: 90, discountPercent: 0, stock: 200, description: 'Fine construction sand, sold per cubic foot.' },
  { slug: 'red-bricks-per-piece', name: 'Red Bricks — per Piece', categoryId: 'building-materials', price: 14, discountPercent: 0, stock: 5, description: 'Standard fired red clay bricks, sold individually.' },
  { slug: 'emulsion-paint-4l', name: 'Emulsion Paint — 4L', categoryId: 'paints', price: 2200, discountPercent: 8, stock: 5, description: 'Washable interior emulsion paint, 4 litre tin, smooth matte finish.' },
  { slug: 'paint-brush-set-3pc', name: 'Paint Brush Set — 3 pc', categoryId: 'paints', price: 380, discountPercent: 0, stock: 22, description: 'A 3-piece brush set in assorted sizes for trim and detail work.' },
  { slug: 'door-hinge-4-inch', name: 'Door Hinge — 4 inch', categoryId: 'fittings', price: 150, discountPercent: 0, stock: 40, description: 'Stainless steel door hinge, 4 inch, sold individually.' },
  { slug: 'cabinet-handle-set', name: 'Cabinet Handle Set', categoryId: 'fittings', price: 260, discountPercent: 0, stock: 30, description: 'Brushed-steel cabinet handles, set of 4, standard screw spacing.' },
  { slug: 'safety-helmet', name: 'Safety Helmet', categoryId: 'safety', price: 900, discountPercent: 15, stock: 12, description: 'ISI-marked safety helmet with adjustable strap, for site and workshop use.' },
  { slug: 'safety-gloves-pair', name: 'Safety Gloves — Pair', categoryId: 'safety', price: 180, discountPercent: 0, stock: 45, description: 'Cut-resistant work gloves, one pair, for handling tools and materials.' },
  { slug: 'measuring-tape-5m', name: 'Measuring Tape — 5m', categoryId: 'measuring', price: 250, discountPercent: 0, stock: 40, description: 'Retractable steel measuring tape, 5 metre, with a locking blade.' },
  { slug: 'spirit-level-24-inch', name: 'Spirit Level — 24 inch', categoryId: 'measuring', price: 620, discountPercent: 0, stock: 2, description: 'Aluminium spirit level, 24 inch, with three vials for level and plumb.' },
]

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in backend/.env — cannot seed.')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('[seed] connected to MongoDB')

  await Category.deleteMany({})
  await Product.deleteMany({})

  await Category.insertMany(categories)
  await Product.insertMany(products)

  console.log(`[seed] inserted ${categories.length} categories and ${products.length} products`)
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

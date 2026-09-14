import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TickDivider from '../../components/common/TickDivider'
import ProductCard from '../../components/product/ProductCard'
import { useCategories } from '../../context/CategoryContext'
import { getProducts } from '../../services/productService'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const { categories } = useCategories()

  useEffect(() => {
    getProducts({ sort: 'popular', inStockOnly: true }).then((results) => {
      setFeaturedProducts(results.slice(0, 8))
    })
  }, [])

  return (
    <div>
      {/* HERO — leads with the value proposition + a category "aisle directory"
          instead of a generic stat/gradient hero, since a hardware shop's most
          characteristic thing is "everything you need is organized and in stock". */}
      <section className="bg-ink-navy text-warm-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
          <div className="flex flex-col justify-center">
            <span className="font-mono text-sm text-safety-amber">Kathmandu, Nepal · Since day one</span>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Every tool.
              <br />
              Every fitting.
              <br />
              <span className="text-safety-amber">Built to last.</span>
            </h1>
            <p className="mt-5 max-w-md font-body text-warm-white/80">
              अनिरुद्ध हार्डवेयर एण्ड सप्लायर्स stocks power tools, hand tools,
              plumbing, electrical and building materials — priced in NPR,
              delivered to your door, backed by real stock you can trust.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">Shop All Products</Link>
              <a href="#categories" className="btn-secondary border-warm-white text-warm-white hover:bg-warm-white hover:text-ink-navy">
                Browse Categories
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 self-center">
            {categories.slice(0, 9).map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.id}`}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-sm bg-warm-white/5 p-2 text-center ring-1 ring-warm-white/10 transition-colors hover:bg-warm-white/10 hover:ring-safety-amber"
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="font-mono text-[10px] uppercase leading-tight text-warm-white/70">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <TickDivider />

      {/* CATEGORY STRIP */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h2 className="font-display text-2xl font-bold text-ink-navy">Shop by Category</h2>
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="flex min-w-[120px] flex-col items-center gap-2 rounded-sm border border-gray-200 bg-white px-4 py-5 text-center transition-colors hover:border-safety-amber"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="font-body text-xs font-medium text-ink-navy">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
      <TickDivider />

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-ink-navy">Featured Products</h2>
          <Link to="/products" className="font-body text-sm font-semibold text-steel-blue hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* SPECIAL OFFERS BANNER */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-sm bg-safety-amber p-6 md:flex-row md:items-center">
          <div>
            <span className="font-mono text-xs uppercase text-ink-navy/70">Limited-time</span>
            <h3 className="font-display text-2xl font-extrabold text-ink-navy">
              Up to 15% off selected safety &amp; power tools
            </h3>
          </div>
          <Link to="/products" className="btn-secondary border-ink-navy text-ink-navy hover:bg-ink-navy hover:text-safety-amber">
            See Offers
          </Link>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <TrustItem title="Delivery Across Nepal" body="Order online, get it delivered — or pick up at the shop." />
          <TrustItem title="Secure Payment" body="Pay via eSewa or cash on delivery. Every order is verified before confirmation." />
          <TrustItem title="Talk to Us" body="Questions about stock or a bulk order? Message us on WhatsApp." />
        </div>
      </section>
    </div>
  )
}

function TrustItem({ title, body }) {
  return (
    <div className="border-l-4 border-safety-amber pl-4">
      <h4 className="font-display text-sm font-bold uppercase tracking-wide text-ink-navy">{title}</h4>
      <p className="mt-1 font-body text-sm text-iron-gray">{body}</p>
    </div>
  )
}

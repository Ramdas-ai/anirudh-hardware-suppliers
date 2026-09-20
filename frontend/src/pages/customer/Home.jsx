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
      {/* HERO */}
      <section className="bg-ink-navy text-warm-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          
          {/* BRANDING */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">
              ANURADH HARDWARE
              <br />
              <span className="text-safety-amber">SUPPLIER</span>
            </h1>

            <p className="mt-3 font-mono text-sm uppercase tracking-widest text-warm-white/80 md:text-base">
              Taulihawa, Kapilvastu
            </p>

            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-warm-white/80">
              Quality hardware, tools, electrical, plumbing and building
              materials.
            </p>

            <div className="mt-5 flex items-center gap-2 font-body text-sm font-semibold text-safety-amber">
              <span className="text-lg">✓</span>
              <span>All Nepal Delivery</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">
                Shop All Products
              </Link>

              <a
                href="#categories"
                className="btn-secondary border-warm-white text-warm-white hover:bg-warm-white hover:text-ink-navy"
              >
                Browse Categories
              </a>
            </div>
          </div>

          {/* HERO CATEGORIES */}
          <div className="grid grid-cols-3 gap-3 self-center">
            {categories.slice(0, 9).map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.id}`}
                className="flex aspect-square flex-col items-center justify-center gap-3 rounded-md bg-warm-white/5 p-4 text-center ring-1 ring-warm-white/10 transition-all hover:bg-warm-white/10 hover:ring-safety-amber"
              >
                <span className="text-4xl md:text-5xl">{c.icon}</span>

                <span className="font-mono text-xs uppercase leading-tight text-warm-white/80">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TickDivider />

      {/* CATEGORY STRIP */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-14 md:px-6"
      >
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-steel-blue">
            Browse
          </span>

          <h2 className="mt-1 font-display text-3xl font-bold text-ink-navy">
            Shop by Category
          </h2>
        </div>

        <div className="mt-7 flex gap-5 overflow-x-auto pb-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="flex min-w-[155px] flex-col items-center gap-4 rounded-md border border-gray-200 bg-white px-5 py-7 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-safety-amber hover:shadow-md"
            >
              <span className="text-5xl">{c.icon}</span>

              <span className="font-body text-sm font-semibold text-ink-navy">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <TickDivider />

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold text-ink-navy">
            Featured Products
          </h2>

          <Link
            to="/products"
            className="font-body text-sm font-semibold text-steel-blue hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* SPECIAL OFFERS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-safety-amber p-7 md:flex-row md:items-center">
          <div>
            <span className="font-mono text-xs uppercase text-ink-navy/70">
              Limited-time
            </span>

            <h3 className="mt-1 font-display text-2xl font-extrabold text-ink-navy">
              Up to 15% off selected safety &amp; power tools
            </h3>
          </div>

          <Link
            to="/products"
            className="btn-secondary border-ink-navy text-ink-navy hover:bg-ink-navy hover:text-safety-amber"
          >
            See Offers
          </Link>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <TrustItem
            title="Delivery Across Nepal"
            body="Order online, get it delivered — or pick up at the shop."
          />

          <TrustItem
            title="Secure Payment"
            body="Pay via eSewa or cash on delivery. Every order is verified before confirmation."
          />

          <TrustItem
            title="Talk to Us"
            body="Questions about stock or a bulk order? Message us on WhatsApp."
          />
        </div>
      </section>
    </div>
  )
}

function TrustItem({ title, body }) {
  return (
    <div className="border-l-4 border-safety-amber pl-5">
      <h4 className="font-display text-sm font-bold uppercase tracking-wide text-ink-navy">
        {title}
      </h4>

      <p className="mt-2 font-body text-sm leading-relaxed text-iron-gray">
        {body}
      </p>
    </div>
  )
}
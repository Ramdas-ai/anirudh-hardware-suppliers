import TickDivider from './TickDivider'

export default function Footer() {
  return (
    <footer className="bg-ink-navy text-warm-white">
      <TickDivider />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div>
          <h3 className="font-display text-lg font-bold text-safety-amber">
            अनिरुद्ध हार्डवेयर
          </h3>
          <p className="mt-2 font-body text-sm text-warm-white/70">
            Quality tools, building materials and hardware fittings — delivered
            across Nepal.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-wide text-safety-amber">Shop</h4>
          <ul className="mt-2 space-y-1 font-body text-sm text-warm-white/70">
            <li><a href="/products" className="hover:text-warm-white">All Products</a></li>
            <li><a href="/products" className="hover:text-warm-white">Categories</a></li>
            <li><a href="/orders" className="hover:text-warm-white">Track Order</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-wide text-safety-amber">Delivery & Payment</h4>
          <ul className="mt-2 space-y-1 font-body text-sm text-warm-white/70">
            <li>Cash on Delivery</li>
            <li>eSewa Online Payment</li>
            <li>Delivery information coming soon</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-wide text-safety-amber">Contact</h4>
          <ul className="mt-2 space-y-1 font-body text-sm text-warm-white/70">
            <li>Address: to be added</li>
            <li>Phone: to be added</li>
            <li>
              <a href="#" className="inline-flex items-center gap-1 hover:text-warm-white">
                WhatsApp us
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-warm-white/10 px-4 py-4 text-center font-mono text-xs text-warm-white/50">
        © {new Date().getFullYear()} अनिरुद्ध हार्डवेयर एण्ड सप्लायर्स. All rights reserved.
      </div>
    </footer>
  )
}

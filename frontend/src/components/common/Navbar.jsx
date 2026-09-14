import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import TickDivider from './TickDivider'

const navLink = ({ isActive }) =>
  `font-display uppercase tracking-wide text-sm transition-colors ${
    isActive ? 'text-safety-amber' : 'text-warm-white hover:text-safety-amber'
  }`

export default function Navbar() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleSearchSubmit(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    navigate(`/products?${params.toString()}`)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink-navy text-warm-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-safety-amber font-display text-lg font-extrabold text-ink-navy">
              अ
            </span>
            <span className="hidden font-display text-lg font-bold uppercase tracking-wide sm:block">
              Anirudh Hardware
            </span>
          </Link>

          <form
            role="search"
            className="hidden flex-1 md:flex"
            onSubmit={handleSearchSubmit}
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for tools, materials, fittings..."
              aria-label="Search products"
              className="w-full rounded-sm border-0 px-4 py-2 font-body text-ink-navy placeholder:text-iron-gray focus:outline-none focus-visible:ring-2 focus-visible:ring-safety-amber"
            />
            <button type="submit" className="bg-safety-amber px-4 font-display font-bold text-ink-navy">
              Search
            </button>
          </form>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/products" className={navLink}>Shop</NavLink>
            <NavLink to="/orders" className={navLink}>My Orders</NavLink>
            {user ? (
              <div className="flex items-center gap-3">
                <NavLink to="/account" className={navLink}>Hi, {user.name.split(' ')[0]}</NavLink>
                <button onClick={logout} className="font-display text-sm uppercase tracking-wide text-warm-white/70 hover:text-safety-amber">
                  Log Out
                </button>
              </div>
            ) : (
              <NavLink to="/login" className={navLink}>Account</NavLink>
            )}
            <NavLink to="/cart" className="relative">
              <span className={navLink({ isActive: false })}>Cart</span>
              {count > 0 && (
                <span className="absolute -right-3 -top-2 grid h-5 w-5 place-items-center rounded-full bg-safety-amber text-xs font-bold text-ink-navy">
                  {count}
                </span>
              )}
            </NavLink>
          </nav>

          <button
            className="ml-auto grid h-9 w-9 place-items-center rounded-sm border border-warm-white/40 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="font-display text-xl leading-none">☰</span>
          </button>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-3 border-t border-warm-white/10 px-4 py-4 md:hidden">
            <form role="search" className="flex" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full rounded-sm border-0 px-4 py-2 font-body text-ink-navy placeholder:text-iron-gray focus:outline-none"
              />
              <button type="submit" className="bg-safety-amber px-4 font-display font-bold text-ink-navy">
                Go
              </button>
            </form>
            <NavLink to="/products" className={navLink} onClick={() => setMenuOpen(false)}>Shop</NavLink>
            <NavLink to="/orders" className={navLink} onClick={() => setMenuOpen(false)}>My Orders</NavLink>
            {user ? (
              <>
                <NavLink to="/account" className={navLink} onClick={() => setMenuOpen(false)}>Hi, {user.name.split(' ')[0]}</NavLink>
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="text-left font-display text-sm uppercase tracking-wide text-warm-white/70 hover:text-safety-amber"
                >
                  Log Out
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navLink} onClick={() => setMenuOpen(false)}>Account</NavLink>
            )}
            <NavLink to="/cart" className={navLink} onClick={() => setMenuOpen(false)}>Cart ({count})</NavLink>
          </nav>
        )}
      </div>
      <TickDivider />
    </header>
  )
}

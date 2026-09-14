import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center md:px-6">
      <h1 className="font-display text-4xl font-extrabold text-ink-navy">404</h1>
      <p className="mt-3 font-body text-iron-gray">This page doesn't exist — like an item we don't stock.</p>
      <Link to="/" className="btn-primary mt-6 inline-block">Back to Home</Link>
    </div>
  )
}

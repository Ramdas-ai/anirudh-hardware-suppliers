import { Link } from 'react-router-dom'

export default function Failure() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
      <h1 className="font-display text-3xl font-bold text-signal-rust">
        Payment Failed
      </h1>

      <p className="mt-4 font-body text-iron-gray">
        Your eSewa payment could not be completed.
        Please try again or choose another payment method.
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/checkout"
          className="btn-primary"
        >
          Back to Checkout
        </Link>

        <Link
          to="/"
          className="rounded-sm border border-gray-300 px-5 py-3 font-body text-sm font-semibold text-ink-navy"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
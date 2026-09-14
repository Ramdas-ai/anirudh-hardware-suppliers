import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import TickDivider from '../../components/common/TickDivider'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setMessage('')
    setResetUrl('')

    if (!email.trim()) {
      setError('Email address is required.')
      return
    }

    setSubmitting(true)

    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim(),
      })

      setMessage(
        data.message ||
          'Password reset link generated successfully.'
      )

      if (data.resetUrl) {
        setResetUrl(data.resetUrl)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to process your request. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">
        Forgot Password
      </h1>

      <TickDivider />

      <p className="mt-5 font-body text-sm leading-6 text-iron-gray">
        Enter the email address associated with your account.
        A password reset link will be generated for you.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 space-y-4"
      >
        {error && (
          <div className="rounded-sm border border-signal-rust/30 bg-signal-rust/10 px-3 py-2 font-body text-sm text-signal-rust">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-sm border border-green-600/30 bg-green-50 px-3 py-2 font-body text-sm text-green-700">
            {message}
          </div>
        )}

        {resetUrl && (
          <div className="rounded-sm border border-steel-blue/30 bg-blue-50 px-3 py-3">
            <p className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">
              Your Password Reset Link
            </p>

            <a
              href={resetUrl}
              className="mt-2 block break-all font-body text-sm text-steel-blue hover:underline"
            >
              {resetUrl}
            </a>

            <p className="mt-2 font-body text-xs text-iron-gray">
              Click the link above to create your new password.
              This link expires in 15 minutes.
            </p>
          </div>
        )}

        <div>
          <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">
            Email
          </label>

          <div className="mt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Enter your registered email"
              autoComplete="email"
              disabled={submitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-60"
        >
          {submitting
            ? 'Generating Reset Link...'
            : 'Generate Reset Link'}
        </button>
      </form>

      <p className="mt-5 text-center font-body text-sm text-iron-gray">
        Remember your password?{' '}
        <Link
          to="/login"
          className="font-semibold text-steel-blue hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  )
}
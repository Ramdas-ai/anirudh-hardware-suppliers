import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import TickDivider from '../../components/common/TickDivider'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!password) {
      setError('Password is required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!token) {
      setError('Password reset link is invalid.')
      return
    }

    try {
      setSubmitting(true)

      const { data } = await api.post(
        `/auth/reset-password/${token}`,
        { password }
      )

      setMessage(
        data.message ||
          'Password reset successful. You can now log in.'
      )

      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to reset password. The link may be invalid or expired.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">
        Reset Password
      </h1>

      <TickDivider />

      <p className="mt-4 font-body text-sm text-iron-gray">
        Enter your new password below.
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

        <div>
          <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">
            New Password
          </label>

          <div className="mt-1">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">
            Confirm Password
          </label>

          <div className="mt-1">
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              className="input"
              placeholder="Confirm new password"
              autoComplete="new-password"
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
            ? 'Resetting Password...'
            : 'Reset Password'}
        </button>
      </form>

      <p className="mt-5 text-center font-body text-sm text-iron-gray">
        Remember your password?{' '}
        <Link
          to="/login"
          className="font-semibold text-steel-blue hover:underline"
        >
          Back to Login
        </Link>
      </p>
    </div>
  )
}
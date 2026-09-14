import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isValidEmail } from '../../utils/validators'
import TickDivider from '../../components/common/TickDivider'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  function setField(key, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }))
  }

  function validate() {
    const errs = {}

    if (!isValidEmail(form.email)) {
      errs.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      errs.password = 'Password is required.'
    }

    setErrors(errs)

    return Object.keys(errs).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!validate()) {
      return
    }

    setSubmitting(true)

    try {
      await login(form)
      navigate(redirectTo)
    } catch (err) {
      setFormError(err.message || 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">
        Log In
      </h1>

      <TickDivider />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 space-y-4"
      >
        {formError && (
          <div className="rounded-sm border border-signal-rust/30 bg-signal-rust/10 px-3 py-2 font-body text-sm text-signal-rust">
            {formError}
          </div>
        )}

        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setField('email', event.target.value)
            }
            className="input"
            autoComplete="email"
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setField('password', event.target.value)
            }
            className="input"
            autoComplete="current-password"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="font-body text-sm text-steel-blue hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>

      <p className="mt-5 text-center font-body text-sm text-iron-gray">
        New here?{' '}
        <Link
          to="/register"
          state={{ from: redirectTo }}
          className="font-semibold text-steel-blue hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">
        {label}
      </label>

      <div className="mt-1">
        {children}
      </div>

      {error && (
        <p className="mt-1 font-body text-xs text-signal-rust">
          {error}
        </p>
      )}
    </div>
  )
}
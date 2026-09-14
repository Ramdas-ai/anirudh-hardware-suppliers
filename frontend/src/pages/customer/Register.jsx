import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isValidEmail, isValidPhone, isRequired } from '../../utils/validators'
import TickDivider from '../../components/common/TickDivider'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const errs = {}
    if (!isRequired(form.name)) errs.name = 'Name is required.'
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address.'
    if (!isValidPhone(form.phone)) errs.phone = 'Enter a valid 10-digit Nepali mobile number.'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      navigate(redirectTo)
    } catch (err) {
      setFormError(err.message || 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">Create Account</h1>
      <TickDivider />

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {formError && (
          <div className="rounded-sm border border-signal-rust/30 bg-signal-rust/10 px-3 py-2 font-body text-sm text-signal-rust">
            {formError}
          </div>
        )}

        <Field label="Full Name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className="input"
            autoComplete="name"
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            className="input"
            autoComplete="email"
          />
        </Field>

        <Field label="Mobile Number" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            className="input"
            placeholder="98XXXXXXXX"
            autoComplete="tel"
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            className="input"
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirm Password" error={errors.confirmPassword}>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            className="input"
            autoComplete="new-password"
          />
        </Field>

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          {submitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-5 text-center font-body text-sm text-iron-gray">
        Already have an account?{' '}
        <Link to="/login" state={{ from: redirectTo }} className="font-semibold text-steel-blue hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 font-body text-xs text-signal-rust">{error}</p>}
    </div>
  )
}

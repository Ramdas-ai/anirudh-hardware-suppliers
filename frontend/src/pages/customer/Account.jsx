import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { isRequired } from '../../utils/validators'
import TickDivider from '../../components/common/TickDivider'

const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']

export default function Account() {
  const { user, logout, addAddress, removeAddress } = useAuth()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ label: 'Home', address: '', city: '', province: '', postalCode: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    if (!isRequired(form.address) || !isRequired(form.city) || !isRequired(form.province)) {
      setError('Address, city and province are required.')
      return
    }
    setSubmitting(true)
    try {
      await addAddress(form)
      setForm({ label: 'Home', address: '', city: '', province: '', postalCode: '' })
      setAdding(false)
    } catch (err) {
      setError(err.message || 'Could not save address.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-ink-navy">My Account</h1>
        <button onClick={logout} className="font-body text-sm font-semibold text-signal-rust hover:underline">
          Log Out
        </button>
      </div>
      <TickDivider />

      <section className="mt-6">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-navy">Profile</h2>
        <div className="mt-2 rounded-sm border border-gray-200 p-4 font-body text-sm text-iron-gray">
          <p><strong className="text-ink-navy">Name:</strong> {user.name}</p>
          <p><strong className="text-ink-navy">Email:</strong> {user.email}</p>
          <p><strong className="text-ink-navy">Phone:</strong> {user.phone}</p>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-navy">Delivery Addresses</h2>
          {!adding && (
            <button onClick={() => setAdding(true)} className="font-body text-sm font-semibold text-steel-blue hover:underline">
              + Add Address
            </button>
          )}
        </div>

        <div className="mt-2 space-y-2">
          {user.addresses.length === 0 && !adding && (
            <p className="font-body text-sm text-iron-gray">No saved addresses yet.</p>
          )}
          {user.addresses.map((addr) => (
            <div key={addr.id} className="flex items-start justify-between gap-3 rounded-sm border border-gray-200 p-3">
              <span className="font-body text-sm text-iron-gray">
                {addr.address}, {addr.city}, {addr.province}{addr.postalCode ? ` — ${addr.postalCode}` : ''}
              </span>
              <button
                onClick={() => removeAddress(addr.id)}
                className="shrink-0 font-body text-xs font-semibold text-signal-rust hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {adding && (
          <form onSubmit={handleAdd} noValidate className="mt-4 grid gap-3 rounded-sm border border-gray-200 p-4 sm:grid-cols-2">
            {error && (
              <div className="rounded-sm border border-signal-rust/30 bg-signal-rust/10 px-3 py-2 font-body text-sm text-signal-rust sm:col-span-2">
                {error}
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">Street Address</label>
              <input type="text" value={form.address} onChange={(e) => setField('address', e.target.value)} className="input mt-1" />
            </div>
            <div>
              <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">City</label>
              <input type="text" value={form.city} onChange={(e) => setField('city', e.target.value)} className="input mt-1" />
            </div>
            <div>
              <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">Province</label>
              <select value={form.province} onChange={(e) => setField('province', e.target.value)} className="input mt-1">
                <option value="">Select province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="font-display text-xs font-bold uppercase tracking-wide text-ink-navy">Postal Code (optional)</label>
              <input type="text" value={form.postalCode} onChange={(e) => setField('postalCode', e.target.value)} className="input mt-1" />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => { setAdding(false); setError('') }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

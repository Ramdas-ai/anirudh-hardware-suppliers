import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import {
  createOrder,
  calculateTotals,
} from '../../services/orderService'
import { createEsewaPayment } from '../../services/paymentService'
import {
  isValidEmail,
  isValidPhone,
  isRequired,
} from '../../utils/validators'
import TickDivider from '../../components/common/TickDivider'

function formatNPR(amount) {
  return `NPR ${amount.toLocaleString('en-IN')}`
}

const PROVINCES = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim',
]

export default function Checkout() {
  const { items, clear } = useCart()
  const { user, addAddress } = useAuth()
  const navigate = useNavigate()

  const savedAddresses = user?.addresses || []

  const [selectedAddressId, setSelectedAddressId] = useState(
    savedAddresses[0]?.id || ''
  )

  const [useNewAddress, setUseNewAddress] = useState(
    savedAddresses.length === 0
  )

  const [saveAddress, setSaveAddress] = useState(true)

  const [form, setForm] = useState({
    name: user?.name || user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    subtotal,
    deliveryCharge,
    grandTotal,
  } = useMemo(() => calculateTotals(items), [items])

  function setField(key, value) {
    setForm((f) => ({
      ...f,
      [key]: value,
    }))
  }

  function currentDeliveryDetails() {
    if (!useNewAddress) {
      const addr = savedAddresses.find(
        (a) => a.id === selectedAddressId
      )

      return addr
        ? {
            address: addr.address,
            city: addr.city,
            province: addr.province,
            postalCode: addr.postalCode || '',
          }
        : null
    }

    return {
      address: form.address,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
    }
  }

  function validate() {
    const errs = {}

    if (!isRequired(form.name)) {
      errs.name = 'Name is required.'
    }

    if (!isValidPhone(form.phone)) {
      errs.phone =
        'Enter a valid 10-digit Nepali mobile number.'
    }

    if (!isValidEmail(form.email)) {
      errs.email = 'Enter a valid email address.'
    }

    const delivery = currentDeliveryDetails()

    if (!useNewAddress && !selectedAddressId) {
      errs.address =
        'Select a delivery address or add a new one.'
    } else {
      if (!isRequired(delivery?.address)) {
        errs.address = 'Delivery address is required.'
      }

      if (!isRequired(delivery?.city)) {
        errs.city = 'City is required.'
      }

      if (!isRequired(delivery?.province)) {
        errs.province = 'Province is required.'
      }
    }

    setErrors(errs)

    return Object.keys(errs).length === 0
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setFormError('')

    if (items.length === 0) {
      setFormError('Your cart is empty.')
      return
    }

    if (!validate()) return

    setSubmitting(true)

    try {
      const delivery = currentDeliveryDetails()

      if (useNewAddress && user && saveAddress) {
        await addAddress({
          label: 'Delivery Address',
          address: delivery.address,
          city: delivery.city,
          province: delivery.province,
          postalCode: delivery.postalCode,
        })
      }

      const order = await createOrder({
        userId: user?.id || null,
        items,
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: delivery.address,
          city: delivery.city,
          province: delivery.province,
          postalCode: delivery.postalCode,
        },
        paymentMethod,
      })

      // eSewa payment flow
      if (paymentMethod === 'esewa') {
        const paymentData = await createEsewaPayment(
          order.id
        )

        const paymentForm =
          document.createElement('form')

        paymentForm.method = 'POST'
        paymentForm.action = paymentData.paymentUrl

        Object.entries(paymentData.fields).forEach(
          ([key, value]) => {
            const input =
              document.createElement('input')

            input.type = 'hidden'
            input.name = key
            input.value = value

            paymentForm.appendChild(input)
          }
        )

        document.body.appendChild(paymentForm)

        paymentForm.submit()

        return
      }

      // Existing COD flow
      await clear()

      navigate(
        `/order-confirmation/${order.id}`
      )
    } catch (err) {
      console.error(
        'Checkout error:',
        err
      )

      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Could not place order. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-3xl font-bold text-ink-navy">
          Nothing to Checkout
        </h1>

        <p className="mt-2 font-body text-iron-gray">
          Your cart is empty.
        </p>

        <Link
          to="/products"
          className="btn-primary mt-6 inline-block"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-navy">
        Checkout
      </h1>

      <TickDivider />

      {!user && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-steel-blue/30 bg-steel-blue/5 px-4 py-3">
          <span className="font-body text-sm text-iron-gray">
            Have an account? Log in to reuse a saved
            address and see this order in My Orders.
          </span>

          <Link
            to="/login"
            state={{ from: '/checkout' }}
            className="font-body text-sm font-semibold text-steel-blue hover:underline"
          >
            Log in
          </Link>
        </div>
      )}

      <form
        onSubmit={handlePlaceOrder}
        noValidate
        className="mt-6 grid gap-8 md:grid-cols-3"
      >
        <div className="space-y-6 md:col-span-2">

          {/* Contact details */}
          <section>
            <h2 className="font-display text-lg font-bold text-ink-navy">
              Contact Details
            </h2>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">

              <Field
                label="Full Name"
                error={errors.name}
              >
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setField(
                      'name',
                      e.target.value
                    )
                  }
                  className="input"
                />
              </Field>

              <Field
                label="Mobile Number"
                error={errors.phone}
              >
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setField(
                      'phone',
                      e.target.value
                    )
                  }
                  placeholder="98XXXXXXXX"
                  className="input"
                />
              </Field>

              <Field
                label="Email"
                error={errors.email}
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setField(
                      'email',
                      e.target.value
                    )
                  }
                  className="input"
                />
              </Field>

            </div>
          </section>

          {/* Delivery address */}
          <section>
            <h2 className="font-display text-lg font-bold text-ink-navy">
              Delivery Address
            </h2>

            {savedAddresses.length > 0 && (
              <div className="mt-3 space-y-2">

                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 ${
                      !useNewAddress &&
                      selectedAddressId === addr.id
                        ? 'border-ink-navy bg-gray-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={
                        !useNewAddress &&
                        selectedAddressId === addr.id
                      }
                      onChange={() => {
                        setUseNewAddress(false)
                        setSelectedAddressId(
                          addr.id
                        )
                      }}
                      className="mt-1 accent-ink-navy"
                    />

                    <span className="font-body text-sm text-iron-gray">
                      {addr.address}, {addr.city},{' '}
                      {addr.province}
                      {addr.postalCode
                        ? ` — ${addr.postalCode}`
                        : ''}
                    </span>
                  </label>
                ))}

                <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-steel-blue">
                  <input
                    type="radio"
                    name="address"
                    checked={useNewAddress}
                    onChange={() =>
                      setUseNewAddress(true)
                    }
                    className="accent-ink-navy"
                  />

                  Use a new address
                </label>
              </div>
            )}

            {useNewAddress && (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">

                <Field
                  label="Street Address"
                  error={errors.address}
                  full
                >
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setField(
                        'address',
                        e.target.value
                      )
                    }
                    className="input"
                  />
                </Field>

                <Field
                  label="City"
                  error={errors.city}
                >
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setField(
                        'city',
                        e.target.value
                      )
                    }
                    className="input"
                  />
                </Field>

                <Field
                  label="Province"
                  error={errors.province}
                >
                  <select
                    value={form.province}
                    onChange={(e) =>
                      setField(
                        'province',
                        e.target.value
                      )
                    }
                    className="input"
                  >
                    <option value="">
                      Select province
                    </option>

                    {PROVINCES.map((p) => (
                      <option
                        key={p}
                        value={p}
                      >
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Postal Code (optional)">
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) =>
                      setField(
                        'postalCode',
                        e.target.value
                      )
                    }
                    className="input"
                  />
                </Field>

                {user && (
                  <label className="flex items-center gap-2 font-body text-sm text-iron-gray sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) =>
                        setSaveAddress(
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 accent-ink-navy"
                    />

                    Save this address to my account
                  </label>
                )}

              </div>
            )}

            {!useNewAddress && errors.address && (
              <p className="mt-2 font-body text-xs text-signal-rust">
                {errors.address}
              </p>
            )}
          </section>

          {/* Payment method */}
          <section>
            <h2 className="font-display text-lg font-bold text-ink-navy">
              Payment Method
            </h2>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

              <label
                className={`cursor-pointer rounded-sm border p-4 ${
                  paymentMethod === 'cod'
                    ? 'border-ink-navy bg-gray-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={
                      paymentMethod === 'cod'
                    }
                    onChange={() =>
                      setPaymentMethod('cod')
                    }
                    className="accent-ink-navy"
                  />

                  <span className="font-display text-sm font-bold uppercase tracking-wide text-ink-navy">
                    Cash on Delivery
                  </span>
                </div>

                <p className="mt-1 font-body text-xs text-iron-gray">
                  Pay in cash when your order arrives,
                  or at the shop.
                </p>
              </label>

              <label
                className={`cursor-pointer rounded-sm border p-4 ${
                  paymentMethod === 'esewa'
                    ? 'border-ink-navy bg-gray-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={
                      paymentMethod === 'esewa'
                    }
                    onChange={() =>
                      setPaymentMethod('esewa')
                    }
                    className="accent-ink-navy"
                  />

                  <span className="font-display text-sm font-bold uppercase tracking-wide text-ink-navy">
                    eSewa
                  </span>
                </div>

                <p className="mt-1 font-body text-xs text-iron-gray">
                  Online payment via eSewa test
                  environment.
                </p>
              </label>

            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="h-fit space-y-4">

          <div className="rounded-sm border border-gray-200 p-5">
            <h2 className="font-display text-lg font-bold text-ink-navy">
              Order Summary
            </h2>

            <div className="mt-3 space-y-2">
              {items.map((item) => {
                const finalPrice =
                  item.discountPercent
                    ? Math.round(
                        item.price *
                          (1 -
                            item.discountPercent /
                              100)
                      )
                    : item.price

                return (
                  <div
                    key={item.productId}
                    className="flex justify-between font-body text-sm text-iron-gray"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <span className="font-mono">
                      {formatNPR(
                        finalPrice *
                          item.quantity
                      )}
                    </span>
                  </div>
                )
              })}
            </div>

            <TickDivider />

            <div className="mt-3 space-y-1">

              <div className="flex justify-between font-body text-sm text-iron-gray">
                <span>Subtotal</span>

                <span className="font-mono">
                  {formatNPR(subtotal)}
                </span>
              </div>

              <div className="flex justify-between font-body text-sm text-iron-gray">
                <span>Delivery</span>

                <span className="font-mono">
                  {deliveryCharge === 0
                    ? 'Free'
                    : formatNPR(
                        deliveryCharge
                      )}
                </span>
              </div>

              <div className="flex justify-between font-display text-base font-bold text-ink-navy">
                <span>Total</span>

                <span className="font-mono">
                  {formatNPR(grandTotal)}
                </span>
              </div>

            </div>
          </div>

          {formError && (
            <div className="rounded-sm border border-signal-rust/30 bg-signal-rust/10 px-3 py-2 font-body text-sm text-signal-rust">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting
              ? 'Processing...'
              : paymentMethod === 'esewa'
                ? 'Pay with eSewa'
                : 'Place Order'}
          </button>

        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  children,
  full,
}) {
  return (
    <div
      className={
        full ? 'sm:col-span-2' : ''
      }
    >
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
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEsewaPayment } from '../../services/paymentService'

export default function Success() {
  const [searchParams] = useSearchParams()

  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState(
    'Verifying your eSewa payment...'
  )
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    async function verifyPayment() {
      try {
        const dataParam = searchParams.get('data')

        if (!dataParam) {
          setStatus('error')
          setMessage(
            'Payment information is missing. Please contact support if money was deducted.'
          )
          return
        }

        const decodedData = JSON.parse(
          atob(dataParam)
        )

        const transactionUuid =
          decodedData.transaction_uuid

        if (!transactionUuid) {
          setStatus('error')
          setMessage(
            'Transaction information is missing. Please contact support if money was deducted.'
          )
          return
        }

        const result = await verifyEsewaPayment(
          null,
          transactionUuid
        )

        const verifiedOrderId =
          result?.order?._id || result?.order?.id

        if (verifiedOrderId) {
          setOrderId(verifiedOrderId)
        }

        setStatus('success')
        setMessage(
          'Your eSewa payment was verified successfully.'
        )
      } catch (error) {
        console.error(
          'eSewa verification error:',
          error
        )

        setStatus('error')
        setMessage(
          error.response?.data?.message ||
            'eSewa payment verification failed.'
        )
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
      {status === 'verifying' && (
        <>
          <h1 className="font-display text-3xl font-bold text-ink-navy">
            Verifying Payment
          </h1>

          <p className="mt-4 font-body text-iron-gray">
            Please wait while we verify your eSewa payment.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <h1 className="font-display text-3xl font-bold text-green-700">
            Payment Successful
          </h1>

          <p className="mt-4 font-body text-iron-gray">
            {message}
          </p>

          {orderId && (
            <Link
              to={`/order-confirmation/${orderId}`}
              className="btn-primary mt-6 inline-block"
            >
              View Order
            </Link>
          )}
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="font-display text-3xl font-bold text-signal-rust">
            Payment Verification Failed
          </h1>

          <p className="mt-4 font-body text-iron-gray">
            {message}
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
        </>
      )}
    </div>
  )
}
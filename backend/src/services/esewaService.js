import crypto from 'crypto'
import {
  ESEWA_MERCHANT_ID,
  ESEWA_SECRET_KEY,
  ESEWA_PAYMENT_URL,
  ESEWA_STATUS_URL,
} from '../config/esewa.js'

export const generateEsewaSignature = ({
  totalAmount,
  transactionUuid,
  productCode,
}) => {
  const signedFieldNames = 'total_amount,transaction_uuid,product_code'

  const message =
    `total_amount=${totalAmount},` +
    `transaction_uuid=${transactionUuid},` +
    `product_code=${productCode}`

  const hash = crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64')

  return {
    signature: hash,
    signedFieldNames,
  }
}

export const createEsewaPayment = ({
  totalAmount,
  transactionUuid,
}) => {
  if (!ESEWA_MERCHANT_ID) {
    throw new Error('eSewa merchant ID is not configured.')
  }

  if (!ESEWA_SECRET_KEY) {
    throw new Error('eSewa secret key is not configured.')
  }

  const productCode = ESEWA_MERCHANT_ID

  const { signature, signedFieldNames } =
    generateEsewaSignature({
      totalAmount,
      transactionUuid,
      productCode,
    })

  return {
    paymentUrl: ESEWA_PAYMENT_URL,

    fields: {
      amount: totalAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url:
        `${process.env.CLIENT_URL || 'http://localhost:5174'}/payment/success`,
      failure_url:
        `${process.env.CLIENT_URL || 'http://localhost:5174'}/payment/failure`,
      signed_field_names: signedFieldNames,
      signature,
    },
  }
}

export const getEsewaTransactionStatus = async ({
  totalAmount,
  transactionUuid,
}) => {
  const productCode = ESEWA_MERCHANT_ID

  const url =
    `${ESEWA_STATUS_URL}` +
    `?product_code=${encodeURIComponent(productCode)}` +
    `&total_amount=${encodeURIComponent(totalAmount)}` +
    `&transaction_uuid=${encodeURIComponent(transactionUuid)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `eSewa status request failed with status ${response.status}.`
    )
  }

  return response.json()
}
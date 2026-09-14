const ESEWA_ENVIRONMENT = 'test'

const isTestEnvironment =
  ESEWA_ENVIRONMENT === 'test'

export const ESEWA_MERCHANT_ID = 'EPAYTEST'

export const ESEWA_SECRET_KEY =
  '8gBm/:&EnhH.1/q'

export const ESEWA_PAYMENT_URL = isTestEnvironment
  ? 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
  : 'https://epay.esewa.com.np/api/epay/main/v2/form'

export const ESEWA_STATUS_URL = isTestEnvironment
  ? 'https://rc-epay.esewa.com.np/api/epay/transaction/status/'
  : 'https://epay.esewa.com.np/api/epay/transaction/status/'

export const ESEWA_SUCCESS_URL =
  `${process.env.CLIENT_URL || 'http://localhost:5174'}/payment/success`

export const ESEWA_FAILURE_URL =
  `${process.env.CLIENT_URL || 'http://localhost:5174'}/payment/failure`
import api from './api'

export async function createEsewaPayment(orderId) {
  const { data } = await api.post('/payments/esewa/create', {
    orderId,
  })

  return data
}

export async function verifyEsewaPayment(
  orderId,
  transactionUuid
) {
  const { data } = await api.post('/payments/esewa/verify', {
    orderId,
    transactionUuid,
  })

  return data
}
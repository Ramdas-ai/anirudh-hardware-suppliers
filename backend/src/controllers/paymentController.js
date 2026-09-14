import asyncHandler from 'express-async-handler'
import crypto from 'crypto'

import Order from '../models/Order.js'
import Payment from '../models/Payment.js'
import {
  createEsewaPayment,
  getEsewaTransactionStatus,
} from '../services/esewaService.js'

// POST /api/payments/esewa/create
export const createEsewaPaymentRequest = asyncHandler(
  async (req, res) => {
    const { orderId } = req.body

    if (!orderId) {
      res.status(400)
      throw new Error('Order ID is required.')
    }

    const order = await Order.findById(orderId)

    if (!order) {
      res.status(404)
      throw new Error('Order not found.')
    }

    if (order.paymentMethod !== 'esewa') {
      res.status(400)
      throw new Error(
        'This order is not configured for eSewa payment.'
      )
    }

    if (order.paymentStatus === 'paid') {
      res.status(400)
      throw new Error('This order is already paid.')
    }

    const transactionUuid =
      `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

    const payment = await Payment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        method: 'esewa',
        amount: order.grandTotal,
        status: 'pending',
      },
      {
        new: true,
        upsert: true,
      }
    )

    const esewaPayment = createEsewaPayment({
      totalAmount: order.grandTotal,
      transactionUuid,
    })

    payment.esewaRefId = transactionUuid
    await payment.save()

    res.json({
      orderId: order._id,
      transactionUuid,
      paymentUrl: esewaPayment.paymentUrl,
      fields: esewaPayment.fields,
    })
  }
)

// POST /api/payments/esewa/verify
export const verifyEsewaPayment = asyncHandler(
  async (req, res) => {
    let { orderId, transactionUuid } = req.body

    if (!transactionUuid) {
      res.status(400)
      throw new Error(
        'Transaction UUID is required.'
      )
    }

    // If the frontend does not have orderId,
    // find the payment using the eSewa transaction UUID.
    if (!orderId) {
      const paymentByTransaction = await Payment.findOne({
        esewaRefId: transactionUuid,
      })

      if (!paymentByTransaction) {
        res.status(404)
        throw new Error(
          'Payment record not found for this transaction.'
        )
      }

      orderId = paymentByTransaction.order
    }

    const order = await Order.findById(orderId)

    if (!order) {
      res.status(404)
      throw new Error('Order not found.')
    }

    if (order.paymentMethod !== 'esewa') {
      res.status(400)
      throw new Error(
        'This order is not configured for eSewa payment.'
      )
    }

    const payment = await Payment.findOne({
      order: order._id,
    })

    if (!payment) {
      res.status(404)
      throw new Error('Payment record not found.')
    }

    if (payment.esewaRefId !== transactionUuid) {
      res.status(400)
      throw new Error('Invalid transaction UUID.')
    }

    const gatewayResponse =
      await getEsewaTransactionStatus({
        totalAmount: order.grandTotal,
        transactionUuid,
      })

    payment.rawGatewayResponse = gatewayResponse

    const gatewayStatus =
      String(gatewayResponse?.status || '').toUpperCase()

    if (
      gatewayStatus === 'COMPLETE' ||
      gatewayStatus === 'SUCCESS'
    ) {
      payment.status = 'paid'
      payment.verifiedAt = new Date()

      order.paymentStatus = 'paid'
      order.transactionId = transactionUuid

      await payment.save()
      await order.save()

      return res.json({
        success: true,
        message: 'eSewa payment verified successfully.',
        order,
        payment,
      })
    }

    payment.status = 'failed'
    await payment.save()

    order.paymentStatus = 'failed'
    await order.save()

    res.status(400)
    throw new Error(
      'eSewa payment could not be verified.'
    )
  }
)
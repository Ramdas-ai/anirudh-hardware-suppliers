import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },

    method: {
      type: String,
      enum: ['esewa'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    esewaRefId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    rawGatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Payment', paymentSchema)
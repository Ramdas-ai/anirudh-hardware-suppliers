import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, default: '' },
  },
  { _id: true, timestamps: false }
)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Password is stored only as a bcrypt hash.
    passwordHash: {
      type: String,
      required: true,
    },

    // Forgot Password / Password Reset
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },

    addresses: [addressSchema],
  },
  { timestamps: true }
)

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject()

  // Never send password or reset token information to frontend
  delete obj.passwordHash
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  delete obj.__v

  obj.id = obj._id.toString()

  obj.addresses = (obj.addresses || []).map((a) => ({
    ...a,
    id: a._id.toString(),
  }))

  return obj
}

export default mongoose.model('User', userSchema)
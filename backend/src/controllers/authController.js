import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { sendEmail } from '../utils/mail.js'

const SALT_ROUNDS = 10

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body

  const existing = await User.findOne({
    email: email.toLowerCase(),
  })

  if (existing) {
    res.status(409)
    throw new Error('An account with this email already exists.')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
  })

  res.status(201).json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  })
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({
    email: email.toLowerCase(),
  })

  if (!user) {
    res.status(401)
    throw new Error('No account found with this email.')
  }

  const match = await user.comparePassword(password)

  if (!match) {
    res.status(401)
    throw new Error('Incorrect password.')
  }

  res.json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  })
})

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({
    email: email.toLowerCase(),
  })

  // Do not reveal whether an email exists.
  if (!user) {
    return res.json({
      message:
        'If an account with that email exists, a password reset link has been generated.',
    })
  }

  // Generate a random reset token.
  const resetToken = crypto.randomBytes(32).toString('hex')

  // Store only the hashed token in MongoDB.
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  user.resetPasswordToken = hashedToken

  // Token expires after 15 minutes.
  user.resetPasswordExpires = new Date(
    Date.now() + 15 * 60 * 1000
  )

  await user.save()

  const frontendUrl =
    process.env.CLIENT_URL || 'http://localhost:5173'

  const resetUrl =
    `${frontendUrl}/reset-password/${resetToken}`

  // Send reset link to user's email.
  await sendEmail({
    to: user.email,
    subject: 'Anirudh Hardware - Password Reset',
    html: `
      <h2>Password Reset</h2>

      <p>Hello ${user.name},</p>

      <p>
        You requested to reset your Anirudh Hardware account password.
      </p>

      <p>
        This password reset link will expire in 15 minutes.
      </p>

      <p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      </p>

      <p>
        If you did not request this password reset, you can safely ignore this email.
      </p>
    `,
  })

  res.json({
    message: 'Password reset link has been sent to your email.',
  })
})

// POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  if (!token) {
    res.status(400)
    throw new Error('Password reset token is required.')
  }

  if (!password || password.length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters.')
  }

  // Hash the token received from the reset URL.
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: {
      $gt: new Date(),
    },
  })

  if (!user) {
    res.status(400)
    throw new Error(
      'Password reset link is invalid or has expired.'
    )
  }

  // Create a new bcrypt password hash.
  user.passwordHash = await bcrypt.hash(
    password,
    SALT_ROUNDS
  )

  // Invalidate the reset token after successful reset.
  user.resetPasswordToken = null
  user.resetPasswordExpires = null

  await user.save()

  res.json({
    message:
      'Password reset successful. You can now log in with your new password.',
  })
})

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    user: req.user.toSafeObject(),
  })
})

// POST /api/auth/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const {
    label,
    address,
    city,
    province,
    postalCode,
  } = req.body

  req.user.addresses.push({
    label,
    address,
    city,
    province,
    postalCode,
  })

  await req.user.save()

  res.status(201).json({
    user: req.user.toSafeObject(),
  })
})

// DELETE /api/auth/addresses/:addressId
export const removeAddress = asyncHandler(async (req, res) => {
  req.user.addresses = req.user.addresses.filter(
    (a) => a._id.toString() !== req.params.addressId
  )

  await req.user.save()

  res.json({
    user: req.user.toSafeObject(),
  })
})
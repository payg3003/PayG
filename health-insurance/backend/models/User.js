const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^(\+?234|0)[789]\d{9}$/, 'Invalid Nigerian phone number'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    // Personal details (filled during onboarding)
    firstName:   { type: String, trim: true },
    lastName:    { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender:      { type: String, enum: ['Male', 'Female', 'Other'] },

    // Next of kin
    kinName:     { type: String, trim: true },
    kinPhone:    { type: String, trim: true },
    kinRelation: { type: String, trim: true },

    // OTP verification
    otp:          { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts:  { type: Number, default: 0 },

    // Status
    isVerified:   { type: Boolean, default: false },
    isOnboarded:  { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },

    // Paystack customer code (stored after first payment)
    paystackCustomerCode: { type: String },
  },
  {
    timestamps: true,
  }
)

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`
  return this.phone || this.email || 'PAYG User'
})

// Ensure at least phone or email is provided
userSchema.pre('save', function (next) {
  if (!this.phone && !this.email) {
    return next(new Error('User must have either a phone number or email'))
  }
  next()
})

module.exports = mongoose.model('User', userSchema)

const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [100, 'Minimum transaction amount is ₦100'],
    },

    type: {
      type: String,
      enum: ['payment', 'refund', 'adjustment'],
      default: 'payment',
    },

    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },

    // Paystack fields
    paystackReference: { type: String, unique: true, sparse: true },
    paystackStatus:    { type: String },
    channel:           { type: String }, // card, bank, ussd, etc.

    // Metadata
    description: { type: String },
    metadata:    { type: mongoose.Schema.Types.Mixed },

    // Verified server-side by Paystack
    verifiedAt: { type: Date },
  },
  {
    timestamps: true,
  }
)

// Index for fast user transaction lookups
transactionSchema.index({ user: 1, createdAt: -1 })
transactionSchema.index({ paystackReference: 1 })

module.exports = mongoose.model('Transaction', transactionSchema)

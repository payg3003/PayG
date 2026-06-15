const mongoose = require('mongoose')

const PLANS = {
  Basic:    { price: 500,  id: 1 },
  Standard: { price: 1000, id: 2 },
  Premium:  { price: 2000, id: 3 },
}

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    plan: {
      type: String,
      enum: ['Basic', 'Standard', 'Premium'],
      default: 'Basic',
    },

    status: {
      type: String,
      enum: ['active', 'pending', 'inactive', 'lapsed'],
      default: 'pending',
    },

    // Wallet: amount paid toward current month's premium
    walletBalance: { type: Number, default: 0, min: 0 },

    // Coverage window
    coverageStartDate: { type: Date },
    coverageEndDate:   { type: Date },

    // Grace period tracking
    lapsedAt:      { type: Date },
    gracePeriodEnd: { type: Date },

    // Unique policy number
    policyNumber: {
      type: String,
      unique: true,
    },

    // Cancellation
    cancelledAt:     { type: Date },
    cancellationNote: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

// Virtual: price based on plan
subscriptionSchema.virtual('planPrice').get(function () {
  return PLANS[this.plan]?.price || 0
})

// Virtual: remaining amount needed
subscriptionSchema.virtual('remainingBalance').get(function () {
  return Math.max(0, this.planPrice - this.walletBalance)
})

// Virtual: days until coverage expires
subscriptionSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.coverageEndDate) return 0
  const diff = new Date(this.coverageEndDate) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

// Auto-generate policy number before first save
subscriptionSchema.pre('save', async function (next) {
  if (!this.policyNumber) {
    const year = new Date().getFullYear()
    const count = await mongoose.model('Subscription').countDocuments()
    this.policyNumber = `PAYG-${year}-${String(count + 1).padStart(6, '0')}`
  }
  next()
})

// Update status based on wallet balance
subscriptionSchema.methods.refreshStatus = function () {
  const planPrice = PLANS[this.plan]?.price || 0
  if (this.walletBalance >= planPrice) {
    this.status = 'active'
    if (!this.coverageStartDate) this.coverageStartDate = new Date()
    // Set/extend coverage end to end of current month
    const end = new Date()
    end.setMonth(end.getMonth() + 1)
    end.setDate(1)
    end.setHours(0, 0, 0, 0)
    this.coverageEndDate = end
    this.lapsedAt = undefined
  } else if (this.walletBalance > 0) {
    this.status = 'pending'
  } else {
    this.status = 'inactive'
  }
}

module.exports = mongoose.model('Subscription', subscriptionSchema)
module.exports.PLANS = PLANS

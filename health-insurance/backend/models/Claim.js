const mongoose = require('mongoose')

const claimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Auto-generated claim reference
    ref: {
      type: String,
      unique: true,
    },

    type: {
      type: String,
      enum: ['Outpatient', 'Inpatient', 'Emergency', 'Pharmacy', 'Laboratory', 'Dental', 'Optical'],
      required: true,
    },

    description: { type: String, required: true, trim: true },
    hospital:    { type: String, required: true, trim: true },
    treatmentDate: { type: Date, required: true },
    amountClaimed: { type: Number, required: true, min: 100 },
    amountApproved: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'paid'],
      default: 'submitted',
    },

    // Admin notes
    reviewNote: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },

    // Supporting documents (file URLs — for future upload integration)
    documents: [{ type: String }],

    // Payment reference if claim was paid out
    payoutReference: { type: String },
    paidAt:          { type: Date },
  },
  {
    timestamps: true,
  }
)

// Auto-generate claim reference
claimSchema.pre('save', async function (next) {
  if (!this.ref) {
    const year = new Date().getFullYear()
    const count = await mongoose.model('Claim').countDocuments()
    this.ref = `CLM-${year}-${String(count + 1).padStart(4, '0')}`
  }
  next()
})

claimSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Claim', claimSchema)

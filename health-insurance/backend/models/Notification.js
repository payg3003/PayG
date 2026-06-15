const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type:  { type: String, enum: ['payment', 'coverage', 'claim', 'alert', 'info'], default: 'info' },
    title: { type: String, required: true },
    body:  { type: String, required: true },
    read:  { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)

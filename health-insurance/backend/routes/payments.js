const express = require('express')
const { body, validationResult } = require('express-validator')

const Transaction = require('../models/Transaction')
const Subscription = require('../models/Subscription')
const { protect } = require('../middleware/auth')
const paystack = require('../utils/paystack')
const { sendSMS, smsTemplates } = require('../utils/sms')
const notif = require('../utils/notifications')

const router = express.Router()

// ─── POST /api/payments/initialize ───────────────────────────────────────────
// Called before opening Paystack modal — creates a pending transaction
router.post(
  '/initialize',
  protect,
  [body('amount').isInt({ min: 100 }).withMessage('Minimum amount is ₦100')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const { amount } = req.body
      const reference = `PAYG_${req.user._id}_${Date.now()}`

      // Create pending transaction record
      const transaction = await Transaction.create({
        user: req.user._id,
        amount,
        status: 'pending',
        paystackReference: reference,
        description: `Wallet top-up — ${amount}`,
      })

      res.json({
        success: true,
        reference,
        transactionId: transaction._id,
        // Frontend passes this reference to Paystack inline JS
      })
    } catch (err) {
      console.error('initialize payment error:', err)
      res.status(500).json({ success: false, message: 'Failed to initialize payment' })
    }
  }
)

// ─── POST /api/payments/verify ────────────────────────────────────────────────
// Called after Paystack modal success callback — verifies with Paystack API
router.post(
  '/verify',
  protect,
  [body('reference').notEmpty().withMessage('Payment reference is required')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const { reference } = req.body

      // Prevent double-processing
      const existing = await Transaction.findOne({ paystackReference: reference, status: 'success' })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Payment already verified' })
      }

      // Verify with Paystack
      const paystackRes = await paystack.verifyTransaction(reference)

      if (!paystackRes.status || paystackRes.data.status !== 'success') {
        await Transaction.findOneAndUpdate(
          { paystackReference: reference },
          { status: 'failed', paystackStatus: paystackRes.data?.status }
        )
        return res.status(400).json({ success: false, message: 'Payment verification failed' })
      }

      const amountPaid = paystackRes.data.amount / 100 // convert from kobo

      // Update transaction
      const transaction = await Transaction.findOneAndUpdate(
        { paystackReference: reference },
        {
          status: 'success',
          paystackStatus: 'success',
          channel: paystackRes.data.channel,
          verifiedAt: new Date(),
          amount: amountPaid,
        },
        { new: true, upsert: true }
      )

      // Update wallet
      const sub = await Subscription.findOne({ user: req.user._id })
      if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' })

      sub.walletBalance = Math.min(sub.walletBalance + amountPaid, sub.planPrice)
      sub.refreshStatus()
      await sub.save()

      // Notifications + SMS
      await notif.paymentReceived(req.user._id, amountPaid)

      if (sub.status === 'active') {
        await notif.coverageActive(req.user._id, sub.plan)
      } else {
        await notif.coverageLow(req.user._id, sub.remainingBalance)
      }

      if (req.user.phone) {
        await sendSMS(
          req.user.phone,
          smsTemplates.paymentReceived(amountPaid, sub.walletBalance, sub.plan)
        )
      }

      res.json({
        success: true,
        message: 'Payment verified',
        amount: amountPaid,
        subscription: {
          walletBalance: sub.walletBalance,
          status: sub.status,
          planPrice: sub.planPrice,
          coverageEndDate: sub.coverageEndDate,
        },
      })
    } catch (err) {
      console.error('verify payment error:', err)
      res.status(500).json({ success: false, message: 'Payment verification failed' })
    }
  }
)

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
// Paystack sends this automatically on every successful payment
// This is the SECURE way to confirm payments — always verify the signature
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-paystack-signature']

  // Verify the webhook came from Paystack
  if (!paystack.verifyWebhookSignature(req.body, signature)) {
    console.warn('⚠️ Invalid Paystack webhook signature')
    return res.status(401).send('Unauthorized')
  }

  // Acknowledge immediately — Paystack expects a fast 200 response
  res.sendStatus(200)

  try {
    const event = JSON.parse(req.body.toString())
    console.log(`📦 Paystack webhook: ${event.event}`)

    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data

      // Check we haven't already processed this
      const already = await Transaction.findOne({ paystackReference: reference, status: 'success' })
      if (already) return

      // Find transaction by reference
      const transaction = await Transaction.findOne({ paystackReference: reference })
      if (!transaction) {
        console.warn(`Webhook: no transaction found for reference ${reference}`)
        return
      }

      const amountPaid = amount / 100
      transaction.status = 'success'
      transaction.paystackStatus = 'success'
      transaction.verifiedAt = new Date()
      transaction.amount = amountPaid
      await transaction.save()

      // Update wallet
      const sub = await Subscription.findOne({ user: transaction.user })
      if (sub) {
        sub.walletBalance = Math.min(sub.walletBalance + amountPaid, sub.planPrice)
        sub.refreshStatus()
        await sub.save()
      }

      console.log(`✅ Webhook processed: ₦${amountPaid} for ref ${reference}`)
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
  }
})

// ─── GET /api/payments ────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    const transactions = await Transaction.find({ user: req.user._id, status: 'success' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v')

    const total = await Transaction.countDocuments({ user: req.user._id, status: 'success' })

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('get payments error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' })
  }
})

module.exports = router

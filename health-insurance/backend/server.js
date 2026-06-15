const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const authRoutes         = require('./routes/auth')
const subscriptionRoutes = require('./routes/subscription')
const paymentRoutes      = require('./routes/payments')
const claimRoutes        = require('./routes/claims')
const notificationRoutes = require('./routes/notifications')
const ussdRoutes         = require('./routes/ussd')         // ← NEW
const airtimeRoutes      = require('./routes/airtime')      // ← NEW

const app = express()

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// ─── Raw body for Paystack webhook (must come before express.json) ─────────────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
}))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PAYG API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/ussd',          ussdRoutes)         // ← NEW (no auth — AT posts here)
app.use('/api/airtime',       airtimeRoutes)      // ← NEW
app.use('/api/auth',          authRoutes)
app.use('/api/subscription',  subscriptionRoutes)
app.use('/api/payments',      paymentRoutes)
app.use('/api/claims',        claimRoutes)
app.use('/api/notifications', notificationRoutes)

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
})

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  })
})

// ─── Database + start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => {
      console.log(`🚀 PAYG API running on port ${PORT}`)
      console.log(`   Environment: ${process.env.NODE_ENV}`)
      console.log(`   Health: http://localhost:${PORT}/health`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })

module.exports = app
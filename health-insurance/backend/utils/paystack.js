const axios = require('axios')
const crypto = require('crypto')

const PAYSTACK_BASE = 'https://api.paystack.co'

const paystackRequest = async (method, path, data) => {
  const res = await axios({
    method,
    url: `${PAYSTACK_BASE}${path}`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(data ? { data } : {}),
  })
  return res.data
}

const paystack = {
  // Verify a transaction after frontend callback
  verifyTransaction: (reference) =>
    paystackRequest('GET', `/transaction/verify/${reference}`),

  // Initialize transaction (alternative to inline JS — useful for mobile)
  initializeTransaction: (email, amount, metadata = {}) =>
    paystackRequest('POST', '/transaction/initialize', {
      email,
      amount: amount * 100, // convert to kobo
      currency: 'NGN',
      metadata,
    }),

  // Create or fetch a Paystack customer
  createCustomer: (email, firstName, lastName, phone) =>
    paystackRequest('POST', '/customer', { email, first_name: firstName, last_name: lastName, phone }),

  // Verify webhook signature — CRITICAL for security
  // Paystack signs every webhook with your secret key
  verifyWebhookSignature: (rawBody, signature) => {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex')
    return hash === signature
  },
}

module.exports = paystack

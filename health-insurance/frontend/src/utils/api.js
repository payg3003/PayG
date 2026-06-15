// API utility — swap VITE_API_BASE_URL in .env to point at your Express server
// All functions here mirror the expected REST endpoints

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function request(method, path, body) {
  const token = localStorage.getItem('payg_token')
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

// Auth
export const api = {
  auth: {
    sendOtp: (phone) => request('POST', '/auth/send-otp', { phone }),           // POST /api/auth/send-otp
    verifyOtp: (phone, otp) => request('POST', '/auth/verify-otp', { phone, otp }), // POST /api/auth/verify-otp → { token, user, isNew }
    updateProfile: (data) => request('PUT', '/auth/profile', data),             // PUT /api/auth/profile
  },
  subscription: {
    get: () => request('GET', '/subscription'),                                  // GET /api/subscription
    changePlan: (planId) => request('POST', '/subscription/change', { planId }), // POST /api/subscription/change
    cancel: () => request('POST', '/subscription/cancel'),                       // POST /api/subscription/cancel
  },
  payments: {
    initialize: (amount) => request('POST', '/payments/initialize', { amount }), // POST /api/payments/initialize → { reference }
    verify: (reference) => request('POST', '/payments/verify', { reference }),   // POST /api/payments/verify
    list: () => request('GET', '/payments'),                                     // GET /api/payments
  },
  claims: {
    submit: (data) => request('POST', '/claims', data),                          // POST /api/claims
    list: () => request('GET', '/claims'),                                       // GET /api/claims
  },
  notifications: {
    list: () => request('GET', '/notifications'),                                 // GET /api/notifications
    markRead: (id) => request('PUT', `/notifications/${id}/read`),               // PUT /api/notifications/:id/read
  },
}

export default api

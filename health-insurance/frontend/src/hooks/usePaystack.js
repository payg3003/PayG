// usePaystack.js — wraps the Paystack inline JS SDK
// Replace VITE_PAYSTACK_PUBLIC_KEY in .env with your real test key from dashboard.paystack.com

export function usePaystack() {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_REPLACE_WITH_YOUR_KEY'

  /**
   * Opens the Paystack payment modal
   * @param {object} opts
   * @param {string} opts.email - user email (required by Paystack)
   * @param {number} opts.amount - amount in NAIRA (we convert to kobo internally)
   * @param {string} opts.reference - unique reference string
   * @param {function} opts.onSuccess - called with { reference } on success
   * @param {function} opts.onClose - called when modal is closed without payment
   */
  const openPaystack = ({ email, amount, reference, onSuccess, onClose }) => {
    // Check if Paystack SDK loaded
    if (typeof window.PaystackPop === 'undefined') {
      console.warn('Paystack SDK not loaded — running in mock mode')
      // Mock flow for development without a real key
      setTimeout(() => onSuccess({ reference: reference || `mock_${Date.now()}` }), 1500)
      return
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email || 'user@payg.ng',
      amount: amount * 100, // Paystack uses kobo
      currency: 'NGN',
      ref: reference || `payg_${Date.now()}`,
      metadata: { custom_fields: [{ display_name: 'Platform', value: 'PAYG Insurance' }] },
      callback: (response) => onSuccess(response),
      onClose: () => onClose && onClose(),
    })
    handler.openIframe()
  }

  return { openPaystack }
}

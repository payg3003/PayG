const Notification = require('../models/Notification')

const createNotification = async (userId, type, title, body) => {
  try {
    await Notification.create({ user: userId, type, title, body })
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('Failed to create notification:', err.message)
  }
}

const notifications = {
  paymentReceived: (userId, amount) =>
    createNotification(userId, 'payment', 'Payment received',
      `₦${amount.toLocaleString()} has been added to your insurance wallet.`),

  coverageActive: (userId, plan) =>
    createNotification(userId, 'coverage', 'Coverage activated',
      `Your ${plan} plan is now active. Visit any partner hospital and show your policy number.`),

  coverageLow: (userId, remaining) =>
    createNotification(userId, 'coverage', 'Top up needed',
      `You need ₦${remaining.toLocaleString()} more to stay covered this month.`),

  coverageExpiringSoon: (userId, days) =>
    createNotification(userId, 'alert', `Coverage expires in ${days} days`,
      `Top up your wallet to avoid a lapse in coverage.`),

  claimSubmitted: (userId, ref) =>
    createNotification(userId, 'claim', 'Claim submitted',
      `Your claim ${ref} has been received and is under review.`),

  claimApproved: (userId, ref, amount) =>
    createNotification(userId, 'claim', 'Claim approved! 🎉',
      `Claim ${ref} approved. ₦${amount.toLocaleString()} will be paid within 5 working days.`),

  claimRejected: (userId, ref) =>
    createNotification(userId, 'claim', 'Claim not approved',
      `Claim ${ref} could not be approved. Contact support@payg.ng for details.`),

  welcome: (userId, name) =>
    createNotification(userId, 'info', `Welcome to PAYG, ${name}! 🎉`,
      'Your account is set up. Top up your wallet to activate your first month of coverage.'),
}

module.exports = notifications

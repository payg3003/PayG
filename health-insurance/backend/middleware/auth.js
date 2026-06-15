const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorised — no token provided' })
    }

    const token = header.split(' ')[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user to request (exclude OTP fields)
    const user = await User.findById(decoded.id).select('-otp -otpExpiresAt -otpAttempts')
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' })
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired — please sign in again' })
    }
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// Generate JWT
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  })

module.exports = { protect, signToken }

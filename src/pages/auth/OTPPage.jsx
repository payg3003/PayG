import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import PageWrapper from '../../components/ui/PageWrapper'
import { transition } from '../../utils/animations'
import './Auth.css'

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const refs          = useRef([])
  const navigate      = useNavigate()

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]
    next[i] = v
    setOtp(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = [...otp]
    text.split('').forEach((char, i) => { next[i] = char })
    setOtp(next)
    refs.current[Math.min(text.length, 5)]?.focus()
    e.preventDefault()
  }

  return (
    <PageWrapper>
      <div className="auth-centered">
        <motion.div
          className="auth-centered__card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0  }}
          transition={transition.smooth}
        >
          <motion.div
            className="auth-centered__icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: .2 }}
          >
            <Shield size={28} strokeWidth={1.75} />
          </motion.div>

          <h2 className="auth-centered__heading">Verify Your Phone</h2>
          <p className="auth-centered__sub">
            Enter the 6-digit code sent to your phone number.
          </p>

          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <motion.input
                key={i}
                ref={el => refs.current[i] = el}
                className={`otp-input ${digit ? 'otp-input--filled' : ''}`}
                value={digit}
                maxLength={1}
                inputMode="numeric"
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                whileFocus={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => navigate('/success')}
          >
            Verify Code
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: '.75rem' }}>
            Resend Code
          </button>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
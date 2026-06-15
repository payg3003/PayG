import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react'
import PageWrapper from '../../components/ui/PageWrapper'
import { transition } from '../../utils/animations'
import './Auth.css'

const steps = ['Enter Phone', 'Verify Code', 'New Password', 'Done']

export default function ForgotPasswordPage() {
  const [step,     setStep    ] = useState(0)
  const [phone,    setPhone   ] = useState('')
  const [otp,      setOtp     ] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm ] = useState('')
  const refs    = useRef([])
  const navigate = useNavigate()

  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2 : 3

  const strengthMeta = [
    { label: '',       color: 'var(--border)'   },
    { label: 'Weak',   color: 'var(--error)'    },
    { label: 'Medium', color: 'var(--orange)'   },
    { label: 'Strong', color: 'var(--success)'  },
  ]

  const handleOtp = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const n = [...otp]; n[i] = v; setOtp(n)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  return (
    <PageWrapper>
      <div className="auth-centered auth-centered--wide">
        <div className="auth-centered__card">

          {/* Step progress */}
          <div className="auth-steps auth-steps--compact">
            {steps.map((_, i) => (
              <div
                key={i}
                className="auth-step__bar"
                style={{ background: i <= step ? 'var(--primary)' : 'var(--border)', flex: 1, height: '4px', borderRadius: '999px', transition: 'background .3s' }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* Step 0: Phone */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={transition.smooth}>
                <div className="auth-centered__icon">
                  <Shield size={26} strokeWidth={1.75} />
                </div>
                <h2 className="auth-centered__heading">Forgot Password?</h2>
                <p className="auth-centered__sub">Enter your phone number and we will send a verification code.</p>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+234 800 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(1)}>Send Code</button>
                <button className="btn btn-ghost" style={{ width: '100%', marginTop: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.35rem' }} onClick={() => navigate('/login')}>
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </motion.div>
            )}

            {/* Step 1: OTP */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={transition.smooth}>
                <h2 className="auth-centered__heading">Enter Code</h2>
                <p className="auth-centered__sub">We sent a 6-digit code to {phone || 'your phone'}.</p>
                <div className="otp-inputs" style={{ marginBottom: '1.5rem' }}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={el => refs.current[i] = el}
                      className={`otp-input ${d ? 'otp-input--filled' : ''}`}
                      value={d} maxLength={1} inputMode="numeric"
                      onChange={e => handleOtp(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                    />
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(2)}>Verify</button>
                <p style={{ textAlign: 'center', marginTop: '.875rem', fontSize: '.875rem', color: 'var(--text-muted)' }}>
                  Did not get it?{' '}
                  <button className="auth-link">Resend</button>
                </p>
              </motion.div>
            )}

            {/* Step 2: New password */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={transition.smooth}>
                <h2 className="auth-centered__heading">New Password</h2>
                <p className="auth-centered__sub">Must be different from your previous password.</p>
                <div className="auth-form">
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
                    {password && (
                      <div style={{ marginTop: '.5rem' }}>
                        <div style={{ height: '4px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden' }}>
                          <motion.div
                            style={{ height: '100%', background: strengthMeta[strength].color, borderRadius: '999px' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(strength / 3) * 100}%` }}
                            transition={transition.smooth}
                          />
                        </div>
                        <p style={{ fontSize: '.75rem', color: strengthMeta[strength].color, marginTop: '.3rem', fontWeight: 600 }}>
                          {strengthMeta[strength].label}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input className="form-input" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(3)}>Reset Password</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity:0, scale:.85 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring', stiffness:200 }} style={{ textAlign: 'center' }}>
                <motion.div
                  className="auth-centered__icon auth-centered__icon--success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: .1 }}
                >
                  <CheckCircle size={30} strokeWidth={1.75} />
                </motion.div>
                <h2 className="auth-centered__heading">Password Reset!</h2>
                <p className="auth-centered__sub">You can now log in with your new password.</p>
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                  Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}
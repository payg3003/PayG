import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import PageWrapper from '../../components/ui/PageWrapper'
import { transition } from '../../utils/animations'
import './Auth.css'

const steps = ['Personal Details', 'Security & Interest']

export default function IndividualSignup() {
  const [step,   setStep  ] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const [form,   setForm  ] = useState({
    firstName: '', lastName: '', phone: '',
    email: '', password: '', confirm: '', interests: [],
  })
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleInterest = (v) =>
    setForm(f => ({
      ...f,
      interests: f.interests.includes(v)
        ? f.interests.filter(i => i !== v)
        : [...f.interests, v],
    }))

  return (
    <PageWrapper>
      <div className="auth-page">

        {/* Left panel */}
        <div className="auth-page__left">
          <div className="auth-page__left-inner">

            <div className="auth-logo">
              <div className="auth-logo__icon">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <span className="auth-logo__text">PayG<span>Insure</span></span>
            </div>

            {/* Step indicator */}
            <div className="auth-steps">
              {steps.map((s, i) => (
                <div key={s} className="auth-step">
                  <div
                    className="auth-step__bar"
                    style={{ background: i <= step ? 'var(--primary)' : 'var(--border)' }}
                  />
                  <span
                    className="auth-step__label"
                    style={{ color: i <= step ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>

            <h2 className="auth-form-heading">Create Your Account</h2>
            <p className="auth-form-sub">Step {step + 1} of {steps.length} — {steps[step]}</p>

            <AnimatePresence mode="wait">

              {/* Step 1 */}
              {step === 0 && (
                <motion.div
                  key="s1"
                  className="auth-form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0  }}
                  exit={{   opacity: 0, x: -30 }}
                  transition={transition.smooth}
                >
                  <div className="auth-form__row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input className="form-input" placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-input" placeholder="Doe" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+234 800 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="optional">(Optional)</span></label>
                    <input className="form-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }} onClick={() => setStep(1)}>
                    Next <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 1 && (
                <motion.div
                  key="s2"
                  className="auth-form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0  }}
                  exit={{   opacity: 0, x: -30 }}
                  transition={transition.smooth}
                >
                  <div className="form-group auth-pw-group">
                    <label className="form-label">Password</label>
                    <input
                      className="form-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      style={{ paddingRight: '3rem' }}
                    />
                    <button className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Insurance Interest</label>
                    <div className="auth-interests">
                      {['Health Insurance', 'Life Insurance'].map(opt => (
                        <label
                          key={opt}
                          className={`auth-interest ${form.interests.includes(opt) ? 'auth-interest--active' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={form.interests.includes(opt)}
                            onChange={() => toggleInterest(opt)}
                            className="auth-interest__input"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="auth-form__row auth-form__row--btns">
                    <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }} onClick={() => setStep(0)}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/verify')}>
                      Create Account <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-page__right">
          <div className="auth-page__right-inner">
            <blockquote className="auth-quote">
              <p>"Flexible insurance designed for how Africans actually earn and live."</p>
              <cite>— PayG Insure</cite>
            </blockquote>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
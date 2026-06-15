import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User, Building2, ArrowRight, Shield } from 'lucide-react'
import PageWrapper from '../../components/ui/PageWrapper'
import { transition } from '../../utils/animations'
import './Auth.css'

export default function JoinPage() {
  const navigate = useNavigate()

  const options = [
    {
      icon:    User,
      bg:      'var(--primary)',
      label:   'Individual',
      desc:    'For personal insurance access and flexible contributions.',
      path:    '/signup/individual',
    },
    {
      icon:    Building2,
      bg:      'var(--teal)',
      label:   'Cooperative / Trade Union',
      desc:    'For organisations managing insurance access for members.',
      path:    '/signup/organisation',
    },
  ]

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
            <h1 className="auth-page__heading">Join PayG Insure</h1>
            <p className="auth-page__sub">Choose how you want to access insurance.</p>

            <div className="join-options">
              {options.map((opt, i) => (
                <motion.button
                  key={opt.label}
                  className="join-option"
                  style={{ background: opt.bg }}
                  onClick={() => navigate(opt.path)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: i * .15, ...transition.smooth }}
                  whileHover={{ y: -4, scale: 1.015 }}
                  whileTap={{ scale: .98 }}
                >
                  <opt.icon size={30} strokeWidth={1.5} style={{ opacity: .85, marginBottom: '1.1rem' }} />
                  <h3 className="join-option__label">{opt.label}</h3>
                  <p  className="join-option__desc">{opt.desc}</p>
                  <span className="join-option__cta">
                    Continue <ArrowRight size={15} />
                  </span>
                </motion.button>
              ))}
            </div>

            <p className="auth-page__footer-text">
              Already have an account?{' '}
              <button className="auth-link" onClick={() => navigate('/login')}>Login</button>
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-page__right">
          <div className="auth-page__right-inner">
            <blockquote className="auth-quote">
              <p>"Insurance should not be a privilege. With PayG Insure, it finally isn't."</p>
              <cite>— Designed for Africa</cite>
            </blockquote>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
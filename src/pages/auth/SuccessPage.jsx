import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import PageWrapper from '../../components/ui/PageWrapper'
import { transition } from '../../utils/animations'
import './Auth.css'

export default function SuccessPage() {
  const navigate = useNavigate()

  return (
    <PageWrapper>
      <div className="auth-centered">
        <motion.div
          className="auth-centered__card"
          initial={{ opacity: 0, scale: .85 }}
          animate={{ opacity: 1, scale: 1   }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          <motion.div
            className="auth-centered__icon auth-centered__icon--success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: .2 }}
          >
            <CheckCircle size={32} strokeWidth={1.75} />
          </motion.div>

          <motion.h2
            className="auth-centered__heading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: .35, ...transition.smooth }}
          >
            Account Created!
          </motion.h2>

          <motion.p
            className="auth-centered__sub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: .45, ...transition.smooth }}
          >
            Your PayG Insure account is ready. You can now browse and access flexible insurance plans.
          </motion.p>

          <motion.button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => navigate('/dashboard')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: .55, ...transition.smooth }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: .97 }}
          >
            Go to Dashboard <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
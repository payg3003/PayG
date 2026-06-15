import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -12 },
}

export default function PageWrapper({ children, style = {} }) {
  return (
    <motion.main
      style={style}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: .45, ease: [.22, 1, .36, 1] }}
    >
      {children}
    </motion.main>
  )
}
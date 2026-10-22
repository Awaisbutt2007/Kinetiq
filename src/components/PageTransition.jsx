import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ease } from './Motion'

/** Curtain wipe between routes: covers the old page, then lifts off the new one. */
export default function PageTransition({ children, label }) {
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <motion.div
        className="curtain"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.9, ease, delay: 0.15 } }}
        exit={{ scaleY: 0 }}
        style={{ originY: 0 }}
      >
        <motion.span
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -40, transition: { duration: 0.4 } }}
        >
          {label}
        </motion.span>
      </motion.div>
      <motion.div
        className="curtain curtain-out"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1, transition: { duration: 0.7, ease } }}
        style={{ originY: 1 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 1, ease, delay: 0.35 } }}
        exit={{ opacity: 0, y: -40, transition: { duration: 0.6, ease } }}
      >
        {children}
      </motion.div>
    </>
  )
}

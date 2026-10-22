import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ease } from '../components/Motion'

export default function NotFound() {
  return (
    <section className="not-found">
      <motion.h1
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1, ease, delay: 0.4 }}
      >
        404
      </motion.h1>
      <p className="lead">Offside! This page isn't on the pitch.</p>
      <Link className="btn" to="/">Back to Home</Link>
    </section>
  )
}

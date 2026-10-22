import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SplitText, Reveal } from './Motion'

export default function CtaBand({ title = 'Your kit.', accent = 'Your rules.', to = '/contact', label = 'Start Your Order' }) {
  return (
    <section className="cta-band">
      <motion.div
        className="cta-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 200 200">
          <defs><path id="circ" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
          <text><textPath href="#circ">CUSTOM TEAMWEAR · DESIGNED FOR YOU · BUILT TO WIN · </textPath></text>
        </svg>
      </motion.div>
      <h2 className="h2"><SplitText text={title} /> <SplitText text={accent} className="accent" delay={0.15} /></h2>
      <Reveal delay={0.3}>
        <Link className="btn" to={to}>{label} →</Link>
      </Reveal>
    </section>
  )
}

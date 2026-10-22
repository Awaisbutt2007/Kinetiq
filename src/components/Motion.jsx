import { motion } from 'framer-motion'

export const ease = [0.76, 0, 0.24, 1]

/** Splits text into words that slide up from a mask when scrolled into view. */
export function SplitText({ text, className = '', delay = 0, as: Tag = 'span' }) {
  return (
    <Tag className={`split ${className}`} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span className="split-mask" key={i} aria-hidden>
          <motion.span
            className="split-word"
            initial={{ y: '110%', rotate: 6 }}
            whileInView={{ y: '0%', rotate: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.9, ease, delay: delay + i * 0.06 }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

export function Reveal({ children, delay = 0, y = 60, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

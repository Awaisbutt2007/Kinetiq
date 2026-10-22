import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const items = ['Match Jerseys', 'Training Wear', 'Club Kits', 'Custom Crests', 'Sublimation', 'Team Orders']

/** Two rows of text that drift in opposite directions as the page scrolls. */
export default function Marquee() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-35%'])
  const x2 = useTransform(scrollYProgress, [0, 1], ['-35%', '0%'])

  const row = (
    <>
      {[...items, ...items, ...items].map((t, i) => (
        <span key={i}>{t}<b>✦</b></span>
      ))}
    </>
  )

  return (
    <section className="marquee" ref={ref}>
      <motion.div className="marquee-row" style={{ x: x1 }}>{row}</motion.div>
      <motion.div className="marquee-row alt" style={{ x: x2 }}>{row}</motion.div>
    </section>
  )
}

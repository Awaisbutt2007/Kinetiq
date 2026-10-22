import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { SplitText, Reveal } from './Motion'

const steps = [
  { t: 'Brief', d: 'Share your colours, crest and squad size. We reply within 24 hours.' },
  { t: 'Design', d: 'Our designers mock up your kit in 3D — unlimited revisions until it feels right.' },
  { t: 'Produce', d: 'Full sublimation printing so colours never crack, fade or peel.' },
  { t: 'Deliver', d: 'Named, numbered and packed per player. Shipped to your door worldwide.' },
]

export default function Process() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const line = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <section className="section" id="process">
      <div className="section-head">
        <Reveal><p className="eyebrow">04 — Process</p></Reveal>
        <h2 className="h2"><SplitText text="From sketch" /><br /><SplitText text="to starting XI" className="accent" delay={0.2} /></h2>
      </div>
      <div className="steps" ref={ref}>
        <div className="steps-line"><motion.i style={{ scaleY: line }} /></div>
        {steps.map((s, i) => (
          <motion.div
            className="step"
            key={s.t}
            initial={{ opacity: 0, x: i % 2 ? 80 : -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="step-dot"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
            />
            <span className="step-num">0{i + 1}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

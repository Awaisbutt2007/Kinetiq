import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SplitText, Reveal } from './Motion'
import { faqs } from '../data'

export default function Faq({ title = 'Questions,', accent = 'answered' }) {
  const [open, setOpen] = useState(0)
  return (
    <section className="section faq">
      <div className="faq-grid">
        <div className="section-head">
          <Reveal><p className="eyebrow">FAQ</p></Reveal>
          <h2 className="h2"><SplitText text={title} /><br /><SplitText text={accent} className="accent" delay={0.15} /></h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.06}>
              <div className={`faq-item ${open === i ? 'is-open' : ''}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <motion.i animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.4 }}>+</motion.i>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <p>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

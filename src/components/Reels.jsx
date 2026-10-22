import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SplitText, Reveal } from './Motion'
import { reels, A } from '../data'
import ScrollVideo from './ScrollVideo'

function Reel({ r, i }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return (
    <motion.div
      ref={ref}
      className="reel"
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: i * 0.12 }}
    >
      <ScrollVideo src={r.src} progress={scrollYProgress} />
      <div className="reel-meta">
        <h4>{r.title}</h4>
        <p>{r.sub}</p>
      </div>
    </motion.div>
  )
}

export default function Reels() {
  const zoomRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: zoomRef, offset: ['start end', 'center center'] })
  const { scrollYProgress: playback } = useScroll({ target: zoomRef, offset: ['start end', 'end start'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(18% 28% 18% 28% round 40px)', 'inset(0% 0% 0% 0% round 0px)'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.4, 1])
  const textOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 1])

  return (
    <section className="section reels" id="reels">
      <div className="section-head">
        <Reveal><p className="eyebrow">03 — In Motion</p></Reveal>
        <h2 className="h2"><SplitText text="Feel the fabric" /><br /><SplitText text="before you touch it" className="accent" delay={0.2} /></h2>
      </div>

      <div className="zoom" ref={zoomRef}>
        <motion.div className="zoom-inner" style={{ clipPath: clip }}>
          <ScrollVideo src={A('scrub-black-red-collection.mp4')} progress={playback} style={{ scale }} />
          <motion.div className="zoom-caption" style={{ opacity: textOpacity }}>
            <span>New drop</span>
            <h3>INFERNO COLLECTION</h3>
          </motion.div>
        </motion.div>
      </div>

      <div className="reel-grid">
        {reels.map((r, i) => <Reel key={r.title} r={r} i={i} />)}
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ease } from './Motion'
import ScrollVideo from './ScrollVideo'

/** Banner used at the top of every inner page. Pass either `img` or `video` (scrubbed by scroll). */
export default function PageHero({ eyebrow, title, accent, sub, img, video, crumb }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.3])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const words = [...title.split(' ').map((w) => [w, false]), ...(accent ? accent.split(' ').map((w) => [w, true]) : [])]

  return (
    <section className="page-hero" ref={ref}>
      <motion.div className="page-hero-media" style={{ scale }}>
        {video ? <ScrollVideo src={video} progress={scrollYProgress} /> : <img src={img} alt="" />}
      </motion.div>
      <div className="page-hero-overlay" />
      <motion.div className="page-hero-content" style={{ y, opacity: fade }}>
        <motion.nav
          className="crumbs"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.6 }}
        >
          <Link to="/">Home</Link><span>/</span>{crumb || eyebrow}
        </motion.nav>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, letterSpacing: '1em' }}
          animate={{ opacity: 1, letterSpacing: '0.4em' }}
          transition={{ duration: 1.2, ease, delay: 0.5 }}
        >
          {eyebrow}
        </motion.p>
        <h1 className="page-title">
          {words.map(([w, isAccent], i) => (
            <span className="split-mask" key={i}>
              <motion.span
                className={`split-word ${isAccent ? 'accent' : ''}`}
                initial={{ y: '110%', rotate: 8 }}
                animate={{ y: '0%', rotate: 0 }}
                transition={{ duration: 1, ease, delay: 0.55 + i * 0.07 }}
              >
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h1>
        {sub && (
          <motion.p
            className="lead"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.9 }}
          >
            {sub}
          </motion.p>
        )}
      </motion.div>
    </section>
  )
}

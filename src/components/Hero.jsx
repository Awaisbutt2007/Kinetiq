import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion'
import { ease } from './Motion'
import ScrollVideo from './ScrollVideo'
import { useProducts } from '../store'

// Scroll map of the pinned hero (0 → 1 over the whole section):
// [0, INTRO]  the centred video card expands to full screen while the title flies apart
// [INTRO, 1]  one segment per product — its video scrubs with scroll, the next wipes in
const INTRO = 0.16
const WIPE = 0.035
const segStart = (n, seg) => INTRO + n * seg
const title = ['WEAR', 'THE', 'GAME']

/** Characters that rise out of a mask one after another on load. */
function Chars({ text, delay = 0, className = '' }) {
  return (
    <span className={`hx-word ${className}`} aria-label={text}>
      {text.split('').map((c, i) => (
        <span className="split-mask" key={i} aria-hidden>
          <motion.span
            initial={{ y: '115%', rotate: 12, filter: 'blur(8px)' }}
            animate={{ y: '0%', rotate: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.1, ease, delay: delay + i * 0.045 }}
          >
            {c}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/** One product: a scroll-scrubbed video layer plus its caption. */
function Layer({ p, n, seg, progress }) {
  const s = segStart(n, seg)
  const e = s + seg
  // the video plays across the wipe-in and its own segment
  const local = useTransform(progress, [Math.max(0, s - WIPE), e], [0, 1])
  const clip = useTransform(
    progress,
    [s - WIPE, s],
    n === 0 ? ['inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'] : ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  )
  const zoom = useTransform(progress, [s - WIPE, e], [1.25, 1])
  return (
    <motion.div className="hx-layer" style={{ clipPath: clip, zIndex: n + 1 }}>
      <ScrollVideo src={p.scrub} progress={local} style={{ scale: zoom }} />
    </motion.div>
  )
}

function Caption({ p, n, seg, last, progress }) {
  const s = segStart(n, seg)
  const e = s + seg
  const inS = n === 0 ? INTRO - 0.03 : s - 0.01
  const opacity = useTransform(progress, [inS, inS + 0.03, e - 0.03, e], [0, 1, 1, last ? 1 : 0])
  const y = useTransform(progress, [inS, inS + 0.04, e - 0.03, e], [80, 0, 0, last ? 0 : -80])
  const nameX = useTransform(progress, [s, e], ['6%', '-6%'])
  // captions are stacked on top of each other — only the visible one may take clicks
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'))
  const visibility = useTransform(opacity, (o) => (o > 0.01 ? 'visible' : 'hidden'))
  return (
    <motion.div className="hx-caption" style={{ opacity, visibility, '--accent': p.color }}>
      <motion.div className="hx-name" style={{ x: nameX, y }} aria-hidden>{p.name}</motion.div>
      <motion.div className="hx-info" style={{ y, pointerEvents }}>
        <span className="hx-info-tag">0{n + 1} — {p.tag}</span>
        <p>{p.desc}</p>
        <span className="hx-info-row">
          <b>{p.price}</b>
          <Link to={`/collection/${p.id}`}>View kit →</Link>
        </span>
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  const all = useProducts()
  const products = all.filter((p) => p.scrub).slice(0, 4)
  const seg = (1 - INTRO) / Math.max(products.length, 1)
  const ref = useRef(null)
  const [active, setActive] = useState(-1)
  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // a touch of inertia so every scroll-driven value glides
  const progress = useSpring(raw, { stiffness: 140, damping: 30, mass: 0.4 })

  useMotionValueEvent(raw, 'change', (v) => {
    const n = v < INTRO - 0.02 ? -1 : Math.min(products.length - 1, Math.floor((v - INTRO) / seg))
    setActive((cur) => (cur === n ? cur : n))
  })

  // intro: card → full bleed, title spreads out and dissolves
  const cardClip = useTransform(
    progress,
    [0, INTRO],
    ['inset(24% 34% 24% 34% round 28px)', 'inset(0% 0% 0% 0% round 0px)'],
  )
  const titleScale = useTransform(progress, [0, INTRO], [1, 1.9])
  const titleGap = useTransform(progress, [0, INTRO], ['0.02em', '0.6em'])
  const titleOpacity = useTransform(progress, [0, INTRO * 0.4, INTRO * 0.85], [1, 1, 0])
  const titleBlur = useTransform(progress, [0, INTRO * 0.85], ['blur(0px)', 'blur(14px)'])
  const introFade = useTransform(progress, [0, INTRO * 0.4], [1, 0])
  const shade = useTransform(progress, [0, INTRO], [0, 1])
  const bar = useTransform(progress, [INTRO, 1], [0, 1])
  const accent = (products[Math.max(active, 0)] || all[0])?.color

  return (
    <section className="hx" id="top" ref={ref} style={{ height: `${120 + products.length * 110}vh`, '--accent': accent }}>
      <div className="hx-sticky">
        <div className="hx-grid" />

        {/* video stack, clipped into a card during the intro */}
        <motion.div
          className="hx-media"
          style={{ clipPath: cardClip }}
          initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease, delay: 0.5 }}
        >
          {products.map((p, n) => <Layer key={p.id} p={p} n={n} seg={seg} progress={progress} />)}
          <motion.div className="hx-shade" style={{ opacity: shade }} />
        </motion.div>

        {/* giant title sitting over the card */}
        <motion.h1
          className="hx-title"
          style={{ scale: titleScale, gap: titleGap, opacity: titleOpacity, filter: titleBlur }}
        >
          {title.map((w, n) => <Chars key={w} text={w} delay={0.2 + n * 0.18} className={n === 1 ? 'outline' : ''} />)}
        </motion.h1>

        <motion.p
          className="hx-eyebrow"
          style={{ opacity: introFade }}
          initial={{ opacity: 0, letterSpacing: '1em' }}
          animate={{ opacity: 1, letterSpacing: '0.4em' }}
          transition={{ duration: 1.4, ease, delay: 0.3 }}
        >
          Custom Teamwear · Season 26
        </motion.p>

        {products.map((p, n) => <Caption key={p.id} p={p} n={n} seg={seg} last={n === products.length - 1} progress={progress} />)}

        {/* bottom rail: copy + CTAs, then live product progress */}
        <motion.div
          className="hx-rail"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 1.2 }}
        >
          <div className="hx-actions">
            <Link className="btn" to="/collection">Explore Collection</Link>
            <Link className="btn btn-ghost" to="/reels"><span className="play" /> Watch Reels</Link>
          </div>
          <div className="hx-progress">
            <span className="hx-count">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.b key={active} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                  0{Math.max(active, 0) + 1}
                </motion.b>
              </AnimatePresence>
              / 0{products.length}
            </span>
            <div className="hx-bar"><motion.i style={{ scaleX: bar }} /></div>
          </div>
        </motion.div>

        <motion.div className="scroll-hint" style={{ opacity: introFade }}>
          <span>Scroll</span>
          <div className="scroll-line">
            <motion.i animate={{ y: ['-100%', '200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

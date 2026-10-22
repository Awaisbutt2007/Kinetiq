import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { SplitText, Reveal } from './Motion'
import { useProducts } from '../store'

export function Card({ p, i, animateIn = true }) {
  const videoRef = useRef(null)
  const [active, setActive] = useState(false)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 20 })

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const enter = () => { setActive(true); videoRef.current?.play().catch(() => {}) }
  const leave = () => { setActive(false); mx.set(0); my.set(0); videoRef.current?.pause() }

  const enterAnim = animateIn
    ? {
        initial: { opacity: 0, y: 120, rotate: i % 2 ? 4 : -4 },
        whileInView: { opacity: 1, y: 0, rotate: 0 },
        viewport: { once: true, margin: '-10% 0px' },
        transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.15 },
      }
    : {}

  return (
    <motion.article
      className="card"
      style={{ rotateX: rx, rotateY: ry, '--accent': p.color }}
      onMouseMove={onMove}
      onMouseEnter={enter}
      onMouseLeave={leave}
      {...enterAnim}
    >
      <Link to={`/collection/${p.id}`} data-cursor="View" className="card-link">
        <div className="card-media">
          <motion.img src={p.img} alt={p.name} animate={{ scale: active ? 1.12 : 1 }} transition={{ duration: 0.8 }} />
          {p.video && (
            <motion.video
              ref={videoRef}
              src={p.video}
              muted loop playsInline preload="metadata"
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
          <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
        </div>
        <div className="card-body">
          <div>
            <p className="card-tag">{p.tag}</p>
            <h3>{p.name}</h3>
          </div>
          <span className="card-price">{p.price}</span>
        </div>
        <motion.div className="card-bar" animate={{ scaleX: active ? 1 : 0 }} transition={{ duration: 0.6 }} />
      </Link>
    </motion.article>
  )
}

export default function Collection() {
  const products = useProducts()
  return (
    <section className="section" id="collection">
      <div className="section-head section-head-row">
        <div>
          <Reveal><p className="eyebrow">01 — The Collection</p></Reveal>
          <h2 className="h2"><SplitText text="Kits built to" /><br /><SplitText text="win the moment" className="accent" delay={0.2} /></h2>
          <Reveal delay={0.3}><p className="lead">Hover a piece to watch it in motion. Every design can be re-coloured, re-crested and numbered for your squad.</p></Reveal>
        </div>
        <Reveal delay={0.4}><Link to="/collection" className="btn btn-ghost">View All Products →</Link></Reveal>
      </div>
      <div className="cards">
        {products.slice(0, 3).map((p, i) => <Card key={p.id} p={p} i={i} />)}
      </div>
    </section>
  )
}

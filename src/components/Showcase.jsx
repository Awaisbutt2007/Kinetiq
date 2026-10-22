import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useProducts } from '../store'

function Panel({ p, i, total, progress }) {
  // Each panel's image drifts against the horizontal scroll for depth
  const imgX = useTransform(progress, [0, 1], ['18%', '-18%'])
  return (
    <div className="panel" style={{ '--accent': p.color }}>
      <div className="panel-bg-text">{p.name.split(' ')[0]}</div>
      <div className="panel-info">
        <span className="panel-num">0{i + 1} / 0{total}</span>
        <p className="card-tag">{p.tag}</p>
        <h3 className="panel-title">{p.name}</h3>
        <p className="panel-desc">{p.desc}</p>
        <ul className="panel-specs">
          <li><b>100%</b> Recycled poly</li>
          <li><b>4-Way</b> Stretch</li>
          <li><b>UPF</b> 50+</li>
        </ul>
      </div>
      <div className="panel-media">
        <motion.img src={p.img} alt={p.name} style={{ x: imgX }} />
      </div>
    </div>
  )
}

/** Vertical scroll is pinned and converted into a horizontal ride through the products. */
export default function Showcase() {
  const all = useProducts()
  const withFilm = all.filter((p) => p.scrub)
  const products = (withFilm.length ? withFilm : all).slice(0, 5)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${(products.length - 1) * 100}vw`])
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section className="showcase" id="showcase" ref={ref} style={{ height: `${products.length * 100}vh` }}>
      <div className="showcase-sticky">
        <div className="showcase-label">02 — Showcase</div>
        <motion.div className="showcase-track" style={{ x }}>
          {products.map((p, i) => <Panel key={p.id} p={p} i={i} total={products.length} progress={scrollYProgress} />)}
        </motion.div>
        <div className="showcase-progress"><motion.i style={{ scaleX: bar }} /></div>
      </div>
    </section>
  )
}

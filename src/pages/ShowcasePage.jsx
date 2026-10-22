import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHero from '../components/PageHero'
import Showcase from '../components/Showcase'
import Stats from '../components/Stats'
import CtaBand from '../components/CtaBand'
import { SplitText, Reveal } from '../components/Motion'
import { A } from '../data'

const tech = [
  { t: 'DryPace Fabric', d: 'Pulls sweat away from skin and dries 2× faster than cotton.', i: 'M12 2c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z' },
  { t: 'Air Mesh Zones', d: 'Laser-cut ventilation under the arms and down the back.', i: 'M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z' },
  { t: '4-Way Stretch', d: 'Moves with you in every direction — no restriction on the sprint.', i: 'M12 2v20M2 12h20M5 5l14 14M19 5L5 19' },
  { t: 'Sublimated Ink', d: 'Dyed into the fibre. Never cracks, peels or fades.', i: 'M3 21l3-9 9-9 6 6-9 9-9 3zM14 4l6 6' },
  { t: 'Recycled Poly', d: 'Every jersey is made from ~12 recycled plastic bottles.', i: 'M7 19H4l3-5M17 19h3l-3-5M12 4l-2 4h4l-2-4zM7 14l5-6 5 6' },
  { t: 'UPF 50+', d: 'Built-in sun protection for long summer tournaments.', i: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2' },
]

const hotspots = [
  { x: 82, y: 6, t: 'Premium Collar', d: 'Ribbed collar with reinforced stitching that keeps its shape.' },
  { x: 84, y: 40, t: 'Breathable Mesh', d: 'Micro-perforated knit for maximum airflow.' },
  { x: 50, y: 30, t: 'Name & Number', d: 'Heat-pressed, stretch-flex vinyl that moves with the fabric.' },
  { x: 60, y: 85, t: 'Matching Socks', d: 'Cushioned sole with red contrast cuff.' },
]

export default function ShowcasePage() {
  const [active, setActive] = useState(null)

  return (
    <>
      <PageHero
        eyebrow="Showcase"
        title="Engineered"
        accent="for pace"
        sub="A closer look at the design details, fabrics and technology inside every Kinetiq kit."
        video={A('scrub-navy-gold.mp4')}
      />

      <Showcase />

      <section className="section">
        <div className="section-head">
          <Reveal><p className="eyebrow">Fabric Technology</p></Reveal>
          <h2 className="h2"><SplitText text="What's inside" /><br /><SplitText text="the thread" className="accent" delay={0.15} /></h2>
        </div>
        <div className="tech-grid">
          {tech.map((x, i) => (
            <motion.div
              key={x.t}
              className="tech"
              initial={{ opacity: 0, y: 80, rotateX: -30 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.12 }}
              whileHover={{ y: -10 }}
            >
              <svg viewBox="0 0 24 24" width="42" height="42">
                <motion.path
                  d={x.i}
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: 0.3 + i * 0.1 }}
                />
              </svg>
              <h3>{x.t}</h3>
              <p>{x.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <Reveal><p className="eyebrow">Detail Explorer</p></Reveal>
          <h2 className="h2"><SplitText text="Tap the" /> <SplitText text="details" className="accent" delay={0.15} /></h2>
        </div>
        <Reveal>
          <div className="hotspot-wrap">
            <img src={A('inferno-kit.jpg')} alt="Inferno kit details" />
            {hotspots.map((h, i) => (
              <button
                key={h.t}
                className={`hotspot ${active === i ? 'is-active' : ''}`}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
                aria-label={h.t}
              >
                <span />
                <AnimatePresence>
                  {active === i && (
                    <motion.div
                      className={`hotspot-tip ${h.x > 60 ? 'left' : ''}`}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    >
                      <b>{h.t}</b>
                      <p>{h.d}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      <Stats />
      <CtaBand />
    </>
  )
}

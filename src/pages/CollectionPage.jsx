import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import PageHero from '../components/PageHero'
import { Card } from '../components/Collection'
import Marquee from '../components/Marquee'
import CtaBand from '../components/CtaBand'
import { Reveal } from '../components/Motion'
import { A } from '../data'
import { useProducts } from '../store'

export default function CollectionPage() {
  const products = useProducts()
  const filters = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]
  const [filter, setFilter] = useState('All')
  const list = filter === 'All' ? products : products.filter((p) => p.category === filter)

  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Every kit."
        accent="Every squad."
        sub="Match jerseys, full kits and training wear — every piece fully customisable with your colours, crest, names and numbers."
        video={A('scrub-jersey-blue.mp4')}
      />

      <section className="section">
        <Reveal>
          <LayoutGroup>
            <div className="filters">
              {filters.map((f) => (
                <button key={f} className={`filter ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>
                  {filter === f && <motion.span className="filter-pill" layoutId="filter-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="filter-label">{f}</span>
                </button>
              ))}
              <span className="filter-count">{list.length} products</span>
            </div>
          </LayoutGroup>
        </Reveal>

        <motion.div layout className="cards cards-shop">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.85, y: 60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              >
                <Card p={p} i={products.indexOf(p)} animateIn={false} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <Marquee />
      <CtaBand title="Can't find it?" accent="We'll design it." label="Request a Custom Design" />
    </>
  )
}

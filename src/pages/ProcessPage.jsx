import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import Process from '../components/Process'
import Faq from '../components/Faq'
import CtaBand from '../components/CtaBand'
import { SplitText, Reveal } from '../components/Motion'
import { A } from '../data'

const sizeChart = {
  Adult: [
    ['XS', '86–91', '66', '160–165'],
    ['S', '91–97', '69', '165–170'],
    ['M', '97–102', '72', '170–178'],
    ['L', '102–109', '74', '178–183'],
    ['XL', '109–116', '76', '183–188'],
    ['XXL', '116–124', '78', '188–193'],
  ],
  Youth: [
    ['YXS', '61–66', '50', '115–125'],
    ['YS', '66–71', '54', '125–135'],
    ['YM', '71–76', '58', '135–145'],
    ['YL', '76–81', '62', '145–155'],
    ['YXL', '81–86', '64', '155–160'],
  ],
}

const included = ['Free 3D design mock-up', 'Unlimited revisions', 'Names & numbers', 'Crest & sponsor logos', 'Per-player packing', 'Tracked delivery']

export default function ProcessPage() {
  const [group, setGroup] = useState('Adult')
  const { hash } = useLocation()

  // Support /process#size-guide links from the footer
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => {
      const el = document.querySelector(hash)
      if (el) window.__lenis?.scrollTo(el, { offset: -80, duration: 1.6 })
    }, 1300)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <>
      <PageHero
        eyebrow="Process"
        title="Sketch to"
        accent="starting XI"
        sub="Four simple steps from your first idea to a fully kitted squad — usually in under two weeks."
        img={A('inferno-kit.jpg')}
      />

      <Process />

      <section className="section included">
        <div className="section-head">
          <Reveal><p className="eyebrow">Every order includes</p></Reveal>
          <h2 className="h2"><SplitText text="No hidden" /> <SplitText text="extras" className="accent" delay={0.15} /></h2>
        </div>
        <div className="included-grid">
          {included.map((x, i) => (
            <motion.div
              key={x}
              className="included-item"
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: i * 0.08 }}
            >
              <span>✓</span>{x}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section" id="size-guide">
        <div className="section-head section-head-row">
          <div>
            <Reveal><p className="eyebrow">Size Guide</p></Reveal>
            <h2 className="h2"><SplitText text="Find the" /> <SplitText text="perfect fit" className="accent" delay={0.15} /></h2>
          </div>
          <Reveal delay={0.2}>
            <div className="filters">
              {Object.keys(sizeChart).map((g) => (
                <button key={g} className={`filter ${group === g ? 'is-active' : ''}`} onClick={() => setGroup(g)}>
                  {group === g && <motion.span className="filter-pill" layoutId="size-group" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="filter-label">{g}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal>
          <div className="size-table">
            <div className="size-row size-head"><span>Size</span><span>Chest (cm)</span><span>Length (cm)</span><span>Height (cm)</span></div>
            {sizeChart[group].map((r, i) => (
              <motion.div
                key={group + r[0]}
                className="size-row"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                {r.map((c, j) => <span key={j}>{c}</span>)}
              </motion.div>
            ))}
          </div>
        </Reveal>
      </section>

      <Faq />
      <CtaBand />
    </>
  )
}

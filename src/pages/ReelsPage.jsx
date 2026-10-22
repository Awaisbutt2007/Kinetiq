import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import PageHero from '../components/PageHero'
import ScrollVideo from '../components/ScrollVideo'
import CtaBand from '../components/CtaBand'
import { SplitText, Reveal } from '../components/Motion'
import { reels, A } from '../data'

function ReelTile({ r, i, onOpen }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return (
    <motion.button
      ref={ref}
      className={`reel reel-tile reel-${i}`}
      data-cursor="Watch"
      onClick={() => onOpen(i)}
      layoutId={`reel-${i}`}
      initial={{ clipPath: 'inset(100% 0 0 0 round 18px)' }}
      whileInView={{ clipPath: 'inset(0% 0 0 0 round 18px)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: (i % 2) * 0.15 }}
    >
      <ScrollVideo src={r.src} progress={scrollYProgress} />
      <div className="reel-meta">
        <span className="reel-no">0{i + 1}</span>
        <h4>{r.title}</h4>
        <p>{r.sub}</p>
      </div>
      <span className="reel-play"><i className="play" /></span>
    </motion.button>
  )
}

export default function ReelsPage() {
  const [open, setOpen] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    if (open !== null) window.__lenis?.stop()
    else window.__lenis?.start()
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <PageHero
        eyebrow="Reels"
        title="Kits in"
        accent="motion"
        sub="Scroll to scrub through every reel. Click any reel to watch it full screen."
        video={A('scrub-black-red-collection.mp4')}
      />

      <section className="section">
        <div className="section-head">
          <Reveal><p className="eyebrow">The Reel Library</p></Reveal>
          <h2 className="h2"><SplitText text="Scroll to" /> <SplitText text="play" className="accent" delay={0.15} /></h2>
        </div>
        <div className="reel-library">
          {reels.map((r, i) => <ReelTile key={r.title} r={r} i={i} onOpen={setOpen} />)}
        </div>
      </section>

      <AnimatePresence>
        {open !== null && (
          <motion.div className="lightbox" onClick={() => setOpen(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="lightbox-inner" layoutId={`reel-${open}`} onClick={(e) => e.stopPropagation()}>
              <video src={reels[open].full} autoPlay controls loop playsInline />
            </motion.div>
            <motion.div className="lightbox-meta" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }} exit={{ opacity: 0 }}>
              <h3>{reels[open].title}</h3>
              <p>{reels[open].sub}</p>
            </motion.div>
            <button className="lightbox-close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <CtaBand title="Love the look?" accent="Make it yours." label="Design Your Kit" />
    </>
  )
}

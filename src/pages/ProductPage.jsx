import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { ease, Reveal, SplitText } from '../components/Motion'
import { Card } from '../components/Collection'
import ScrollVideo from '../components/ScrollVideo'
import NotFound from './NotFound'
import { useProducts, useQuote } from '../store'

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const tabs = {
  Details: (p) => (
    <ul className="tick-list">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
  ),
  Fabric: () => (
    <p>140 GSM recycled polyester interlock with micro-mesh zones. Fully sublimated — colours are dyed into the fibre, so they never crack, peel or fade. Machine wash cold.</p>
  ),
  Delivery: () => (
    <p>Production in 10–14 days after design approval. Tracked worldwide shipping, packed and labelled per player. Rush 7-day production available.</p>
  ),
}

// variants so the dip-and-turn only plays when the side changes, not on every keystroke
const flipT = { rotateY: { duration: 1, ease }, scale: { duration: 1, times: [0, 0.5, 1] } }
const flip = {
  front: { rotateY: 0, scale: [1, 0.9, 1], transition: flipT },
  back: { rotateY: 180, scale: [1, 0.9, 1], transition: flipT },
}
const pop = { initial: { opacity: 0, scale: 1.3 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }

/** Back face: the product's back view (front shot as fallback) with the player's name and number in the centre. */
function JerseyBack({ p, name, num }) {
  const label = name.toUpperCase()
  return (
    <>
      <img src={p.back || p.img} alt="" />
      <div className="back-shade" />
      <div className="back-print">
        {label && <motion.span key={label} className="print-name" {...pop}>{label}</motion.span>}
        {num && <motion.span key={num} className="print-num" {...pop}>{num}</motion.span>}
      </div>
    </>
  )
}

/** Pinned film of the product, scrubbed by scroll. */
function Film({ p }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return (
    <section className="film" ref={ref}>
      <div className="film-sticky">
        <ScrollVideo src={p.scrub} progress={scrollYProgress} />
        <div className="film-caption">
          <Reveal><p className="eyebrow">In Motion</p></Reveal>
          <h2 className="h2"><SplitText text={p.name} /></h2>
        </div>
      </div>
    </section>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const products = useProducts()
  const quote = useQuote()
  const p = products.find((x) => x.id === id)
  const [size, setSize] = useState('M')
  const [qty, setQty] = useState(10)
  const [name, setName] = useState('')
  const [num, setNum] = useState('')
  const [back, setBack] = useState(false)
  const [tab, setTab] = useState('Details')
  const [toast, setToast] = useState(false)

  if (!p) return <NotFound />

  const related = products.filter((x) => x.id !== p.id).slice(0, 3)

  // typing turns the shirt round to its back; clearing both fields turns it to the front again
  const personalise = (n, no) => {
    setName(n)
    setNum(no)
    setBack(Boolean(n || no))
  }

  const addToQuote = () => {
    quote.add({ id: p.id, name: p.name, size, qty, player: name, num })
    setToast(true)
    setTimeout(() => setToast(false), 2800)
  }

  return (
    <div style={{ '--accent': p.color }}>
      <section className="product">
        <div className="product-media">
          <motion.div
            className="product-flip"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease, delay: 0.4 }}
          >
            <motion.div
              className="product-flip-inner"
              variants={flip}
              initial={false}
              animate={back ? 'back' : 'front'}
            >
              <div className="product-img product-face">
                <motion.img
                  src={p.img}
                  alt={p.name}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.6, ease, delay: 0.4 }}
                />
              </div>
              <div className="product-img product-face product-back" aria-label={`${p.name} back print preview`}>
                <JerseyBack p={p} name={name} num={num} />
              </div>
            </motion.div>
            <button className="flip-btn" onClick={() => setBack((v) => !v)}>
              <motion.span animate={{ rotate: back ? 180 : 0 }} transition={{ duration: 0.6 }}>↻</motion.span>
              {back ? 'Show front' : 'Show back'}
            </button>
          </motion.div>
        </div>

        <div className="product-info">
          <motion.nav className="crumbs" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
            <Link to="/">Home</Link><span>/</span><Link to="/collection">Collection</Link><span>/</span>{p.name}
          </motion.nav>
          <motion.p className="card-tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>{p.tag}</motion.p>
          <h1 className="product-title">
            {p.name.split(' ').map((w, i) => (
              <span className="split-mask" key={i}>
                <motion.span className="split-word" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: 0.55 + i * 0.08 }}>
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.8 }}>
            <div className="product-price">{p.price}<small> / piece</small></div>
            <p className="product-desc">{p.desc}</p>

            <div className="opt">
              <div className="opt-label">Size <span>{size}</span></div>
              <div className="sizes">
                {sizes.map((s) => (
                  <button key={s} className={`size ${size === s ? 'is-active' : ''}`} onClick={() => setSize(s)}>
                    {size === s && <motion.span className="size-pill" layoutId="size-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="opt">
              <div className="opt-label">Personalise <span>live preview</span></div>
              <div className="personalise">
                <input placeholder="Player name" maxLength={12} value={name} onChange={(e) => personalise(e.target.value, num)} onFocus={() => setBack(true)} />
                <input placeholder="No." maxLength={2} inputMode="numeric" value={num} onChange={(e) => personalise(name, e.target.value.replace(/\D/g, ''))} onFocus={() => setBack(true)} />
              </div>
            </div>

            <div className="opt opt-row">
              <div className="qty">
                <button onClick={() => setQty(Math.max(10, qty - 1))} aria-label="Less">−</button>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={qty} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>{qty}</motion.span>
                </AnimatePresence>
                <button onClick={() => setQty(qty + 1)} aria-label="More">+</button>
              </div>
              <motion.button className="btn btn-accent" whileTap={{ scale: 0.96 }} onClick={addToQuote}>
                Add to Quote →
              </motion.button>
            </div>
            <p className="opt-note">Minimum order 10 pieces · mix sizes freely</p>

            <div className="tabs">
              <div className="tab-heads">
                {Object.keys(tabs).map((t) => (
                  <button key={t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>
                    {t}
                    {tab === t && <motion.i layoutId="tab-line" />}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={tab} className="tab-body" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
                  {tabs[tab](p)}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {p.scrub && <Film p={p} />}

      <section className="section">
        <div className="section-head">
          <Reveal><p className="eyebrow">You may also like</p></Reveal>
          <h2 className="h2"><SplitText text="Complete the" /> <SplitText text="squad" className="accent" delay={0.15} /></h2>
        </div>
        <div className="cards">
          {related.map((r) => <Card key={r.id} p={r} i={products.indexOf(r)} />)}
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            ✓ {qty} × {p.name} ({size}) added to your quote · <Link to="/contact">Send request →</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

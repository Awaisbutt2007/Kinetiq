import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ease } from './Motion'
import { api } from '../store'

const cols = [
  {
    h: 'Shop',
    l: [
      ['All Products', '/collection'],
      ['Storm Strike', '/collection/storm-strike'],
      ['Royal Crest', '/collection/royal-crest'],
      ['Inferno Kit', '/collection/inferno'],
      ['Pulse Tech', '/collection/pulse-tech'],
    ],
  },
  {
    h: 'Explore',
    l: [
      ['Showcase', '/showcase'],
      ['Reels', '/reels'],
      ['Process', '/process'],
      ['Size Guide', '/process#size-guide'],
      ['Contact', '/contact'],
    ],
  },
  {
    h: 'Follow',
    l: [
      ['Instagram', 'https://instagram.com'],
      ['TikTok', 'https://tiktok.com'],
      ['Facebook', 'https://facebook.com'],
      ['YouTube', 'https://youtube.com'],
    ],
  },
]

const toTop = () => window.__lenis?.scrollTo(0, { duration: 1.6 }) ?? window.scrollTo({ top: 0, behavior: 'smooth' })

function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    setState('sending')
    try {
      await api('/api/newsletter', { method: 'POST', body: { email } })
      setEmail('')
      setState('ok')
    } catch (err) {
      setState(err.message === 'Invalid email' ? 'Please enter a valid email.' : 'Could not subscribe right now — try again.')
    }
  }
  return (
    <>
      <form className="newsletter" onSubmit={submit}>
        <input type="email" required placeholder="Email for new drops" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email for new drops" />
        <button aria-label="Subscribe" disabled={state === 'sending'}>→</button>
      </form>
      {state && state !== 'sending' && (
        <p className={`newsletter-msg ${state === 'ok' ? 'ok' : ''}`}>{state === 'ok' ? '✓ You are on the list for new drops.' : state}</p>
      )}
    </>
  )
}

export default function Footer() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-30%', '0%'])

  return (
    <footer className="footer" ref={ref}>
      <motion.div className="footer-inner" style={{ y }}>
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="logo" to="/">
              <span className="logo-mark">K</span>KINETIQ
            </Link>
            <p>Custom teamwear for clubs, academies and weekend legends.</p>
            <Newsletter />
          </div>
          {cols.map((c, ci) => (
            <div className="footer-col" key={c.h}>
              <h5>{c.h}</h5>
              {c.l.map(([label, to], i) => {
                const anim = {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: ci * 0.1 + i * 0.05, duration: 0.6 },
                }
                return to.startsWith('http') ? (
                  <motion.a key={label} href={to} target="_blank" rel="noreferrer" {...anim}>{label}</motion.a>
                ) : (
                  <motion.div key={label} {...anim}><Link to={to}>{label}</Link></motion.div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="footer-giant" aria-hidden>
          {'KINETIQ'.split('').map((c, i) => (
            <span className="split-mask" key={i}>
              <motion.span
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease, delay: i * 0.06 }}
                whileHover={{ y: '-12%', color: 'var(--blue)' }}
              >
                {c}
              </motion.span>
            </span>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Kinetiq Teamwear. All rights reserved.</span>
          <button className="to-top" onClick={toTop}>Back to top ↑</button>
        </div>
      </motion.div>
    </footer>
  )
}

import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { ease } from './Motion'
import { navLinks } from '../data'

export default function Header() {
  const { scrollY } = useScroll()
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(v > prev && v > 300)
    setSolid(v > 60)
  })

  // Close the mobile menu and reveal the header whenever the route changes
  useEffect(() => {
    setOpen(false)
    setHidden(false)
  }, [pathname])

  return (
    <>
      <motion.header
        className={`header ${solid ? 'is-solid' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: hidden && !open ? -100 : 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <Link className="logo" to="/">
          <span className="logo-mark">K</span>KINETIQ
        </Link>
        <nav className="nav">
          {navLinks.map((l, i) => (
            <motion.div
              key={l.to}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease }}
            >
              <NavLink to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <span data-text={l.label}>{l.label}</span>
                    {isActive && <motion.i className="nav-dot" layoutId="nav-dot" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>
        <Link className="btn btn-sm header-cta" to="/contact">Get a Quote</Link>
        <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span />
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.8, ease }}
          >
            {[{ to: '/', label: 'Home' }, ...navLinks].map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease }}
              >
                <NavLink to={l.to} end className={({ isActive }) => (isActive ? 'is-active' : '')}>
                  <small>0{i + 1}</small>{l.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

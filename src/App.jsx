import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Lenis from 'lenis'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Header from './components/Header'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import CollectionPage from './pages/CollectionPage'
import ProductPage from './pages/ProductPage'
import ShowcasePage from './pages/ShowcasePage'
import ReelsPage from './pages/ReelsPage'
import ProcessPage from './pages/ProcessPage'
import ContactPage from './pages/ContactPage'
import NotFound from './pages/NotFound'
import { ProductsProvider, QuoteProvider } from './store'

const AdminPage = lazy(() => import('./pages/AdminPage'))

const routes = [
  { path: '/', el: <Home />, label: 'Home' },
  { path: '/collection', el: <CollectionPage />, label: 'Collection' },
  { path: '/collection/:id', el: <ProductPage />, label: 'Product' },
  { path: '/showcase', el: <ShowcasePage />, label: 'Showcase' },
  { path: '/reels', el: <ReelsPage />, label: 'Reels' },
  { path: '/process', el: <ProcessPage />, label: 'Process' },
  { path: '/contact', el: <ContactPage />, label: 'Contact' },
  { path: '*', el: <NotFound />, label: '404' },
]

function AnimatedRoutes() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) {
    return <Suspense fallback={null}><AdminPage /></Suspense>
  }
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routes.map((r) => (
          <Route key={r.path} path={r.path} element={<PageTransition label={r.label}>{r.el}</PageTransition>} />
        ))}
      </Routes>
    </AnimatePresence>
  )
}

/** Header + footer around the public site; the admin panel gets the full screen. */
function Shell() {
  const isAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <>
      {!isAdmin && <Header />}
      <main>
        <AnimatedRoutes />
      </main>
      {!isAdmin && <Footer />}
    </>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const done = useCallback(() => setLoading(false), [])
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  // Smooth inertial scrolling
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2 })
    window.__lenis = lenis
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy(); window.__lenis = null }
  }, [])

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    if (loading) window.__lenis?.stop()
    else window.__lenis?.start()
  }, [loading])

  return (
    <ProductsProvider>
    <QuoteProvider>
    <BrowserRouter>
      <AnimatePresence>{loading && <Preloader onDone={done} />}</AnimatePresence>
      <Cursor />
      <motion.div className="progress" style={{ scaleX: progress }} />
      <div className="noise" />
      {!loading && (
        <>
          <Shell />
        </>
      )}
    </BrowserRouter>
    </QuoteProvider>
    </ProductsProvider>
  )
}

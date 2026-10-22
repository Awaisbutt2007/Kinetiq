import { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'
import { Reveal } from './Motion'

const stats = [
  { n: 1200, s: '+', l: 'Teams kitted' },
  { n: 48, s: 'K', l: 'Jerseys shipped' },
  { n: 32, s: '', l: 'Countries' },
  { n: 14, s: 'days', l: 'Avg. delivery' },
]

function Counter({ n, s }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, n, { duration: 2.2, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, n])
  return <span ref={ref}>{v.toLocaleString()}{s && <small>{s}</small>}</span>
}

export default function Stats() {
  return (
    <section className="stats">
      {stats.map((x, i) => (
        <Reveal key={x.l} delay={i * 0.1} className="stat">
          <div className="stat-n"><Counter n={x.n} s={x.s} /></div>
          <div className="stat-l">{x.l}</div>
        </Reveal>
      ))}
    </section>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ease } from './Motion'

export default function Preloader({ onDone }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    let v = 0
    let t
    const id = setInterval(() => {
      v = Math.min(100, v + Math.ceil(Math.random() * 9))
      setN(v)
      if (v === 100) {
        clearInterval(id)
        t = setTimeout(onDone, 450)
      }
    }, 45)
    return () => { clearInterval(id); clearTimeout(t) }
  }, [onDone])

  return (
    <motion.div
      className="preloader"
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 1, ease }}
    >
      <div className="preloader-word">
        {'KINETIQ'.split('').map((c, i) => (
          <span className="split-mask" key={i}>
            <motion.span
              style={{ display: 'inline-block' }}
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.07 }}
            >
              {c}
            </motion.span>
          </span>
        ))}
      </div>
      <div className="preloader-bar">
        <motion.div className="preloader-fill" style={{ scaleX: n / 100 }} />
      </div>
      <div className="preloader-count">{String(n).padStart(3, '0')}</div>
    </motion.div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent } from 'framer-motion'

/**
 * A video whose playhead is driven by a scroll progress MotionValue (0 → 1)
 * instead of autoplay. Scrolling down plays forward, scrolling up rewinds.
 * The file is fetched into a blob so every frame is seekable immediately.
 */
export default function ScrollVideo({ src, progress, className, style }) {
  const videoRef = useRef(null)
  const target = useRef(0)
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let blobUrl
    let cancelled = false
    fetch(src)
      .then((r) => r.blob())
      .then((b) => {
        if (cancelled) return
        blobUrl = URL.createObjectURL(b)
        setUrl(blobUrl)
      })
      .catch(() => !cancelled && setUrl(src))
    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [src])

  useMotionValueEvent(progress, 'change', (v) => {
    target.current = Math.min(1, Math.max(0, v))
  })

  // Ease the playhead toward the scroll target so seeking feels smooth
  useEffect(() => {
    target.current = progress.get()
    let id
    const tick = () => {
      const v = videoRef.current
      if (v && v.duration) {
        const want = target.current * (v.duration - 0.05)
        const diff = want - v.currentTime
        if (Math.abs(diff) > 0.01 && !v.seeking) v.currentTime += diff * 0.2
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [progress])

  return (
    <motion.video
      ref={videoRef}
      className={className}
      style={style}
      src={url || undefined}
      muted
      playsInline
      preload="auto"
    />
  )
}

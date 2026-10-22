import { motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import Contact from '../components/Contact'
import Faq from '../components/Faq'
import { A, EMAIL, PHONE_LABEL, WHATSAPP } from '../data'

const info = [
  { h: 'Email', v: EMAIL, s: 'Replies within 24 hours', href: `mailto:${EMAIL}` },
  { h: 'WhatsApp', v: PHONE_LABEL, s: 'Mon–Sat, 10am – 8pm', href: `https://wa.me/${WHATSAPP}` },
  { h: 'Studio', v: 'Sialkot, Pakistan', s: 'Visits by appointment', href: null },
  { h: 'Turnaround', v: '10–14 days', s: 'Rush 7-day available', href: null },
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's build"
        accent="your kit"
        sub="Tell us about your team — we'll send a free 3D mock-up within 24 hours. No commitment."
        img={A('jersey-navy-gold.jpg')}
      />

      <section className="section info">
        <div className="info-grid">
          {info.map((x, i) => {
            const Tag = x.href ? motion.a : motion.div
            return (
              <Tag
                key={x.h}
                className="info-card"
                {...(x.href ? { href: x.href, target: x.href.startsWith('http') ? '_blank' : undefined, rel: 'noreferrer' } : {})}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <span className="info-h">{x.h}</span>
                <span className="info-v">{x.v}</span>
                <span className="info-s">{x.s}</span>
              </Tag>
            )
          })}
        </div>
      </section>

      <Contact />
      <Faq title="Before you" accent="ask" />
    </>
  )
}

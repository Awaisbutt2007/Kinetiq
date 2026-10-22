import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SplitText, Reveal } from './Motion'
import { A, EMAIL, PHONE_LABEL, WHATSAPP } from '../data'
import { api, useProducts, useQuote, whatsappQuoteUrl } from '../store'

const empty = { name: '', team: '', phone: '', email: '', qty: '', product: '', message: '' }

export default function Contact() {
  const products = useProducts()
  const quote = useQuote()
  const [f, setF] = useState(empty)
  const [sent, setSent] = useState(null)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const url = whatsappQuoteUrl(f, quote.items)
    // open WhatsApp straight from the click so popup blockers allow it
    const win = window.open(url, '_blank')
    if (win) win.opener = null
    else window.location.href = url
    api('/api/quotes', { method: 'POST', body: { ...f, items: quote.items } }).catch(() => {})
    setSent(url)
    setF(empty)
    quote.clear()
  }

  return (
    <section className="section contact" id="contact">
      <motion.img
        className="contact-img"
        src={A('jersey-blue.jpg')}
        alt=""
        initial={{ opacity: 0, scale: 1.2 }}
        whileInView={{ opacity: 0.35, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6 }}
      />
      <div className="contact-inner">
        <div>
          <Reveal><p className="eyebrow">06 — Let's Build Your Kit</p></Reveal>
          <h2 className="h2"><SplitText text="Ready to" /><br /><SplitText text="suit up?" className="accent" delay={0.15} /></h2>
          <Reveal delay={0.3}>
            <p className="lead">Tell us about your team — your request opens straight in WhatsApp and we'll send a free 3D mock-up within 24 hours.</p>
            <div className="contact-lines">
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp {PHONE_LABEL}</a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="ok"
                className="form-done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              >
                <motion.svg viewBox="0 0 52 52" width="80" height="80">
                  <motion.path
                    d="M14 27 l8 8 l16 -18"
                    fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </motion.svg>
                <h3>Request ready!</h3>
                <p>Hit send in WhatsApp and we'll reply within 24 hours.</p>
                <div className="form-done-actions">
                  <a className="btn btn-sm" href={sent} target="_blank" rel="noreferrer">Open WhatsApp again</a>
                  <button className="btn btn-sm btn-ghost" onClick={() => setSent(null)}>New request</button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" className="form" onSubmit={submit} exit={{ opacity: 0, y: -30 }}>
                {quote.items.length > 0 && (
                  <div className="quote-items">
                    <span className="quote-items-h">Your quote · {quote.items.length} item{quote.items.length > 1 ? 's' : ''}</span>
                    <AnimatePresence initial={false}>
                      {quote.items.map((x) => (
                        <motion.div key={x.key} className="quote-item" layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <span>{x.qty} × {x.name} <small>({x.size}{x.player ? ` · ${x.player}` : ''}{x.num ? ` #${x.num}` : ''})</small></span>
                          <button type="button" onClick={() => quote.remove(x.key)} aria-label={`Remove ${x.name}`}>×</button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                <div className="form-grid">
                  {[
                    ['name', 'Your name *', 'text', true],
                    ['team', 'Team / club name', 'text', false],
                    ['phone', 'WhatsApp number *', 'tel', true],
                    ['email', 'Email address', 'email', false],
                    ['qty', 'Number of players', 'number', false],
                  ].map(([n, l, t, req]) => (
                    <label className="field" key={n}>
                      <input name={n} type={t} placeholder=" " required={req} value={f[n]} onChange={set(n)} min={t === 'number' ? 1 : undefined} />
                      <span>{l}</span>
                      <i />
                    </label>
                  ))}
                  <label className="field field-select">
                    <select name="product" value={f.product} onChange={set('product')}>
                      <option value="">Not sure yet</option>
                      {products.map((p) => <option key={p.id} value={`${p.name} (${p.tag})`}>{p.name} — {p.tag}</option>)}
                    </select>
                    <span>Interested in</span>
                    <i />
                  </label>
                </div>
                <label className="field">
                  <textarea name="message" rows={2} placeholder=" " value={f.message} onChange={set('message')} />
                  <span>Colours, crest, deadline… (optional)</span>
                  <i />
                </label>
                <motion.button className="btn btn-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  Request Free Mock-up →
                </motion.button>
                <p className="form-note">Opens WhatsApp chat with {PHONE_LABEL} with your details filled in.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  )
}

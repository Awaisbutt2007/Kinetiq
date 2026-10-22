import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { products as fallback, WHATSAPP } from './data'

export async function api(path, { token, ...opts } = {}) {
  const headers = { ...(opts.body && !(opts.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...opts.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const body = opts.body && !(opts.body instanceof Blob) && typeof opts.body !== 'string' ? JSON.stringify(opts.body) : opts.body
  const res = await fetch(path, { ...opts, headers, body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status })
  return data
}

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }

/* ---------- products: static data until the API answers ---------- */

const ProductsCtx = createContext({ products: fallback, reload: () => {} })

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(fallback)
  const reload = useCallback(() => {
    api('/api/products').then((list) => Array.isArray(list) && list.length && setProducts(list)).catch(() => {})
  }, [])
  useEffect(reload, [reload])
  const value = useMemo(() => ({ products, reload }), [products, reload])
  return <ProductsCtx.Provider value={value}>{children}</ProductsCtx.Provider>
}

export const useProducts = () => useContext(ProductsCtx).products
export const useReloadProducts = () => useContext(ProductsCtx).reload

/* ---------- quote basket filled from product pages ---------- */

const QuoteCtx = createContext(null)

export function QuoteProvider({ children }) {
  const [items, setItems] = useState(() => read('kinetiq-quote', []))
  useEffect(() => write('kinetiq-quote', items), [items])
  const value = useMemo(() => ({
    items,
    add: (item) => setItems((xs) => [...xs, { ...item, key: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]),
    remove: (key) => setItems((xs) => xs.filter((x) => x.key !== key)),
    clear: () => setItems([]),
  }), [items])
  return <QuoteCtx.Provider value={value}>{children}</QuoteCtx.Provider>
}

export const useQuote = () => useContext(QuoteCtx)

/* ---------- WhatsApp hand-off ---------- */

export function whatsappQuoteUrl(f, items = []) {
  const lines = ['*New Quote Request — Kinetiq Teamwear*', '', `*Name:* ${f.name}`]
  if (f.team) lines.push(`*Team / Club:* ${f.team}`)
  lines.push(`*WhatsApp:* ${f.phone}`)
  if (f.email) lines.push(`*Email:* ${f.email}`)
  if (f.qty) lines.push(`*Players:* ${f.qty}`)
  if (f.product) lines.push(`*Interested in:* ${f.product}`)
  if (items.length) {
    lines.push('', '*Items:*')
    items.forEach((x, i) => {
      const print = [x.player, x.num && `#${x.num}`].filter(Boolean).join(' ')
      lines.push(`${i + 1}. ${x.qty} × ${x.name} (${x.size})${print ? ` — ${print}` : ''}`)
    })
  }
  if (f.message) lines.push('', `*Message:* ${f.message}`)
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`
}

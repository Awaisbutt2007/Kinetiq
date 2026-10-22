import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api, useReloadProducts } from '../store'
import '../admin.css'

const TOKEN_KEY = 'kinetiq-admin-token'
const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
const putToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch { /* storage unavailable */ } }

const STATUSES = ['new', 'contacted', 'won', 'closed']
const fmtDate = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
// Pakistani local numbers (03xx…) → international for wa.me
const waNumber = (phone) => {
  const d = String(phone).replace(/\D/g, '')
  return d.startsWith('0') ? `92${d.slice(1)}` : d
}

function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const { token } = await api('/api/admin/login', { method: 'POST', body: { password: pw } })
      onLogin(token)
    } catch (e2) {
      setErr(e2.status ? e2.message : 'Cannot reach the server — is it running? (npm run server)')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="admin-login">
      <motion.form initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="admin-card">
        <div className="logo"><span className="logo-mark">K</span>KINETIQ</div>
        <h1>Admin</h1>
        <label className="admin-field">
          <span>Password</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus required />
        </label>
        {err && <p className="admin-err">{err}</p>}
        <button className="btn btn-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</button>
        <Link to="/" className="admin-back">← Back to site</Link>
      </motion.form>
    </div>
  )
}

/* ---------- quotes ---------- */

function Quotes({ call }) {
  const [list, setList] = useState(null)
  const [filter, setFilter] = useState('all')
  const load = useCallback(() => call('/api/admin/quotes').then(setList).catch(() => {}), [call])
  useEffect(() => { load() }, [load])

  const setStatus = async (q, status) => {
    setList((xs) => xs.map((x) => (x.id === q.id ? { ...x, status } : x)))
    await call(`/api/admin/quotes/${q.id}`, { method: 'PATCH', body: { status } }).catch(load)
  }
  const remove = async (q) => {
    if (!confirm(`Delete the quote from ${q.name}?`)) return
    await call(`/api/admin/quotes/${q.id}`, { method: 'DELETE' })
    load()
  }

  if (!list) return <p className="admin-empty">Loading…</p>
  const shown = filter === 'all' ? list : list.filter((q) => q.status === filter)
  return (
    <>
      <div className="admin-toolbar">
        {['all', ...STATUSES].map((s) => (
          <button key={s} className={`admin-chip ${filter === s ? 'is-active' : ''}`} onClick={() => setFilter(s)}>
            {s} <b>{s === 'all' ? list.length : list.filter((q) => q.status === s).length}</b>
          </button>
        ))}
        <button className="admin-chip" onClick={load}>↻ Refresh</button>
      </div>
      {!shown.length && <p className="admin-empty">No quote requests yet.</p>}
      <div className="admin-quotes">
        {shown.map((q) => (
          <motion.article layout key={q.id} className={`admin-quote status-${q.status}`}>
            <header>
              <div>
                <h3>{q.name}{q.team && <small> · {q.team}</small>}</h3>
                <time>{fmtDate(q.created_at)}</time>
              </div>
              <select value={q.status} onChange={(e) => setStatus(q, e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </header>
            <dl>
              <dt>WhatsApp</dt><dd><a href={`https://wa.me/${waNumber(q.phone)}`} target="_blank" rel="noreferrer">{q.phone}</a></dd>
              {q.email && <><dt>Email</dt><dd><a href={`mailto:${q.email}`}>{q.email}</a></dd></>}
              {q.qty > 0 && <><dt>Players</dt><dd>{q.qty}</dd></>}
              {q.product && <><dt>Product</dt><dd>{q.product}</dd></>}
            </dl>
            {q.items.length > 0 && (
              <ul className="admin-items">
                {q.items.map((x, i) => (
                  <li key={i}>{x.qty} × {x.name} ({x.size}){x.player && ` · ${x.player}`}{x.num && ` #${x.num}`}</li>
                ))}
              </ul>
            )}
            {q.message && <p className="admin-msg">{q.message}</p>}
            <footer>
              <a className="btn btn-sm" href={`https://wa.me/${waNumber(q.phone)}`} target="_blank" rel="noreferrer">Reply on WhatsApp</a>
              <button className="admin-del" onClick={() => remove(q)}>Delete</button>
            </footer>
          </motion.article>
        ))}
      </div>
    </>
  )
}

/* ---------- products ---------- */

const blank = { name: '', id: '', tag: '', category: '', price: '', color: '#1fa2ff', desc: '', features: [], img: '', back: '', video: '', scrub: '', active: true }

function MediaField({ label, value, onChange, accept, call }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const upload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setErr('')
    try {
      const { url } = await call(`/api/admin/upload?name=${encodeURIComponent(file.name)}`, {
        method: 'POST', body: file, headers: { 'Content-Type': file.type },
      })
      onChange(url)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }
  const isVideo = accept.startsWith('video')
  return (
    <div className="admin-field admin-media">
      <span>{label}</span>
      <div className="admin-media-row">
        {value && (isVideo ? <video src={value} muted /> : <img src={value} alt="" />)}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/assets/… or upload" />
        <label className="admin-chip admin-upload">
          {busy ? 'Uploading…' : 'Upload'}
          <input type="file" accept={accept} onChange={upload} hidden />
        </label>
      </div>
      {err && <p className="admin-err">{err}</p>}
    </div>
  )
}

function ProductEditor({ initial, categories, call, onClose, onSaved }) {
  const isNew = !initial.id
  const [p, setP] = useState({ ...blank, ...initial })
  const [features, setFeatures] = useState((initial.features || []).join('\n'))
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setP((x) => ({ ...x, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }))

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const body = { ...p, features: features.split('\n').map((s) => s.trim()).filter(Boolean) }
    try {
      await call(isNew ? '/api/admin/products' : `/api/admin/products/${initial.id}`, { method: isNew ? 'POST' : 'PUT', body })
      onSaved()
    } catch (e2) {
      setErr(e2.message)
      setBusy(false)
    }
  }

  return (
    <motion.div className="admin-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form
        className="admin-card admin-editor"
        data-lenis-prevent
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
      >
        <h2>{isNew ? 'Add product' : `Edit · ${initial.name}`}</h2>
        <div className="admin-grid">
          <label className="admin-field"><span>Name *</span><input value={p.name} onChange={set('name')} required /></label>
          {isNew && <label className="admin-field"><span>URL id (auto from name)</span><input value={p.id} onChange={set('id')} placeholder="e.g. team-hoodie" /></label>}
          <label className="admin-field"><span>Type / tag</span><input value={p.tag} onChange={set('tag')} placeholder="Match Jersey" /></label>
          <label className="admin-field">
            <span>Category</span>
            <input value={p.category} onChange={set('category')} list="admin-cats" placeholder="Jerseys" />
            <datalist id="admin-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label className="admin-field"><span>Price</span><input value={p.price} onChange={set('price')} placeholder="$49" /></label>
          <label className="admin-field admin-color"><span>Accent colour</span><input type="color" value={p.color} onChange={set('color')} /></label>
          <label className="admin-field"><span>Sort order</span><input type="number" value={p.sort ?? ''} onChange={set('sort')} /></label>
          <label className="admin-check"><input type="checkbox" checked={p.active} onChange={set('active')} /> Show on website</label>
        </div>
        <label className="admin-field"><span>Description</span><textarea rows={3} value={p.desc} onChange={set('desc')} /></label>
        <label className="admin-field"><span>Features (one per line)</span><textarea rows={4} value={features} onChange={(e) => setFeatures(e.target.value)} /></label>
        <MediaField label="Image (front)" value={p.img} onChange={set('img')} accept="image/*" call={call} />
        <MediaField label="Back image (shown when a customer types a name / number)" value={p.back} onChange={set('back')} accept="image/*" call={call} />
        <MediaField label="Hover video (optional)" value={p.video} onChange={set('video')} accept="video/mp4,video/webm" call={call} />
        <MediaField label="Scroll film video (optional — shows in hero & product page)" value={p.scrub} onChange={set('scrub')} accept="video/mp4,video/webm" call={call} />
        {err && <p className="admin-err">{err}</p>}
        <div className="admin-actions">
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-sm" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button>
        </div>
      </motion.form>
    </motion.div>
  )
}

function Products({ call }) {
  const reloadSite = useReloadProducts()
  const [list, setList] = useState(null)
  const [editing, setEditing] = useState(null)
  const load = useCallback(() => call('/api/admin/products').then(setList).catch(() => {}), [call])
  useEffect(() => { load() }, [load])

  const refresh = () => { load(); reloadSite() }
  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    await call(`/api/admin/products/${p.id}`, { method: 'DELETE' })
    refresh()
  }
  const toggle = async (p) => {
    await call(`/api/admin/products/${p.id}`, { method: 'PUT', body: { ...p, active: !p.active } })
    refresh()
  }

  if (!list) return <p className="admin-empty">Loading…</p>
  const categories = [...new Set(list.map((p) => p.category).filter(Boolean))]
  return (
    <>
      <div className="admin-toolbar">
        <span className="admin-count">{list.length} products</span>
        <button className="btn btn-sm" onClick={() => setEditing({})}>+ Add product</button>
      </div>
      <div className="admin-products">
        {list.map((p) => (
          <article key={p.id} className={`admin-product ${p.active ? '' : 'is-hidden'}`} style={{ '--accent': p.color }}>
            <div className="admin-product-img">{p.img && <img src={p.img} alt="" />}{!p.active && <span>Hidden</span>}</div>
            <div className="admin-product-body">
              <small>{p.category} · {p.tag}</small>
              <h3>{p.name}</h3>
              <b>{p.price}</b>
            </div>
            <div className="admin-product-actions">
              <button className="admin-chip" onClick={() => setEditing(p)}>Edit</button>
              <button className="admin-chip" onClick={() => toggle(p)}>{p.active ? 'Hide' : 'Show'}</button>
              <button className="admin-del" onClick={() => remove(p)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
      <AnimatePresence>
        {editing && (
          <ProductEditor
            initial={editing}
            categories={categories}
            call={call}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); refresh() }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------- subscribers ---------- */

function Subscribers({ call }) {
  const [list, setList] = useState(null)
  const [copied, setCopied] = useState(false)
  const load = useCallback(() => call('/api/admin/subscribers').then(setList).catch(() => {}), [call])
  useEffect(() => { load() }, [load])

  const remove = async (s) => {
    if (!confirm(`Remove ${s.email}?`)) return
    await call(`/api/admin/subscribers/${s.id}`, { method: 'DELETE' })
    load()
  }
  const copy = async () => {
    await navigator.clipboard.writeText(list.map((s) => s.email).join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  const csv = () => {
    const rows = ['email,subscribed_at', ...list.map((s) => `${s.email},${s.created_at}`)]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    a.download = 'kinetiq-subscribers.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  if (!list) return <p className="admin-empty">Loading…</p>
  return (
    <>
      <div className="admin-toolbar">
        <span className="admin-count">{list.length} subscribers</span>
        {list.length > 0 && <>
          <button className="admin-chip" onClick={copy}>{copied ? '✓ Copied' : 'Copy all emails'}</button>
          <button className="admin-chip" onClick={csv}>Download CSV</button>
        </>}
      </div>
      {!list.length && <p className="admin-empty">No newsletter sign-ups yet.</p>}
      <div className="admin-table">
        {list.map((s) => (
          <div key={s.id} className="admin-row">
            <a href={`mailto:${s.email}`}>{s.email}</a>
            <time>{fmtDate(s.created_at)}</time>
            <button className="admin-del" onClick={() => remove(s)}>Remove</button>
          </div>
        ))}
      </div>
    </>
  )
}

/* ---------- shell ---------- */

const TABS = { quotes: Quotes, products: Products, subscribers: Subscribers }

export default function AdminPage() {
  const [token, setToken] = useState(getToken)
  const [tab, setTab] = useState('quotes')
  const [stats, setStats] = useState(null)

  const logout = useCallback(() => { putToken(null); setToken(null) }, [])
  const call = useCallback(async (path, opts = {}) => {
    try {
      return await api(path, { ...opts, token })
    } catch (e) {
      if (e.status === 401) logout()
      throw e
    }
  }, [token, logout])

  useEffect(() => {
    const prev = document.title
    document.title = 'Admin · Kinetiq'
    return () => { document.title = prev }
  }, [])
  useEffect(() => {
    if (token) call('/api/admin/stats').then(setStats).catch(() => {})
  }, [token, tab, call])

  if (!token) return <div className="admin"><Login onLogin={(t) => { putToken(t); setToken(t) }} /></div>

  const Tab = TABS[tab]
  return (
    <div className="admin">
      <header className="admin-top">
        <Link to="/" className="logo"><span className="logo-mark">K</span>KINETIQ <small>admin</small></Link>
        <nav>
          {Object.keys(TABS).map((t) => (
            <button key={t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>
              {t}
              {t === 'quotes' && stats?.newQuotes > 0 && <b>{stats.newQuotes}</b>}
              {tab === t && <motion.i layoutId="admin-tab" />}
            </button>
          ))}
        </nav>
        <div className="admin-top-right">
          <Link to="/" className="admin-chip">View site ↗</Link>
          <button className="admin-chip" onClick={logout}>Log out</button>
        </div>
      </header>

      {stats && (
        <div className="admin-stats">
          <div><b>{stats.quotes}</b><span>Quote requests</span></div>
          <div><b>{stats.newQuotes}</b><span>New / unanswered</span></div>
          <div><b>{stats.products}</b><span>Products</span></div>
          <div><b>{stats.subscribers}</b><span>Subscribers</span></div>
        </div>
      )}

      <main className="admin-main">
        <Tab call={call} />
      </main>
    </div>
  )
}

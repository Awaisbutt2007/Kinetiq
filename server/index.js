import express from 'express'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import { db, DATA_DIR, toProduct, fromProduct, upsertProduct } from './db.js'
import { checkPassword, issueToken, requireAdmin, loginLimiter, usingDefaultPassword } from './auth.js'

const here = dirname(fileURLToPath(import.meta.url))
const DIST = join(here, '..', 'dist')
const UPLOADS = join(DATA_DIR, 'uploads')
mkdirSync(UPLOADS, { recursive: true })

const PORT = process.env.PORT || 4000
const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '200kb' }))

const str = (v, max = 500) => String(v ?? '').trim().slice(0, max)
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const slug = (v) => str(v, 80).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* ---------- public ---------- */

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY sort, created_at').all()
  res.json(rows.map(toProduct))
})

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(toProduct(row))
})

app.post('/api/quotes', (req, res) => {
  const b = req.body || {}
  const q = {
    name: str(b.name, 120),
    team: str(b.team, 120),
    phone: str(b.phone, 40),
    email: str(b.email, 160),
    qty: Math.max(0, Math.min(100000, parseInt(b.qty, 10) || 0)),
    product: str(b.product, 120),
    items: JSON.stringify(Array.isArray(b.items) ? b.items.slice(0, 50).map((x) => ({
      id: str(x.id, 80), name: str(x.name, 120), size: str(x.size, 10), qty: parseInt(x.qty, 10) || 0,
      player: str(x.player, 30), num: str(x.num, 4),
    })) : []),
    message: str(b.message, 2000),
  }
  if (!q.name || !q.phone) return res.status(400).json({ error: 'Name and WhatsApp number are required' })
  if (q.email && !isEmail(q.email)) return res.status(400).json({ error: 'Invalid email' })
  const r = db.prepare(`INSERT INTO quotes (name, team, phone, email, qty, product, items, message)
    VALUES (:name, :team, :phone, :email, :qty, :product, :items, :message)`).run(q)
  res.status(201).json({ id: Number(r.lastInsertRowid) })
})

app.post('/api/newsletter', (req, res) => {
  const email = str(req.body?.email, 160).toLowerCase()
  if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email' })
  db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').run(email)
  res.status(201).json({ ok: true })
})

app.use('/uploads', express.static(UPLOADS, { maxAge: '30d' }))

/* ---------- admin ---------- */

app.post('/api/admin/login', loginLimiter, (req, res) => {
  if (!checkPassword(req.body?.password)) return res.status(401).json({ error: 'Wrong password' })
  res.json({ token: issueToken() })
})

const admin = express.Router()
admin.use(requireAdmin)

admin.get('/stats', (req, res) => {
  const n = (sql) => db.prepare(sql).get().n
  res.json({
    quotes: n('SELECT COUNT(*) AS n FROM quotes'),
    newQuotes: n("SELECT COUNT(*) AS n FROM quotes WHERE status = 'new'"),
    products: n('SELECT COUNT(*) AS n FROM products'),
    subscribers: n('SELECT COUNT(*) AS n FROM subscribers'),
  })
})

admin.get('/quotes', (req, res) => {
  const rows = db.prepare('SELECT * FROM quotes ORDER BY id DESC').all()
  res.json(rows.map((r) => ({ ...r, items: JSON.parse(r.items || '[]') })))
})

admin.patch('/quotes/:id', (req, res) => {
  const status = str(req.body?.status, 20)
  if (!['new', 'contacted', 'won', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, req.params.id)
  res.json({ ok: true })
})

admin.delete('/quotes/:id', (req, res) => {
  db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

admin.get('/subscribers', (req, res) => {
  res.json(db.prepare('SELECT * FROM subscribers ORDER BY id DESC').all())
})

admin.delete('/subscribers/:id', (req, res) => {
  db.prepare('DELETE FROM subscribers WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

admin.get('/products', (req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY sort, created_at').all().map(toProduct))
})

admin.post('/products', (req, res) => {
  const p = req.body || {}
  const id = slug(p.id || p.name)
  if (!id || !str(p.name)) return res.status(400).json({ error: 'Name is required' })
  if (db.prepare('SELECT 1 FROM products WHERE id = ?').get(id)) return res.status(409).json({ error: 'A product with this id already exists' })
  const sort = db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM products').get().n
  upsertProduct(fromProduct({ ...p, id, sort: p.sort ?? sort }))
  res.status(201).json(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id)))
})

admin.put('/products/:id', (req, res) => {
  if (!db.prepare('SELECT 1 FROM products WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Not found' })
  if (!str(req.body?.name)) return res.status(400).json({ error: 'Name is required' })
  upsertProduct(fromProduct({ ...req.body, id: req.params.id }))
  res.json(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)))
})

admin.delete('/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// Raw image/video upload: body is the file, ?name= is the original filename
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' }
admin.post('/upload', express.raw({ type: Object.keys(EXT), limit: '60mb' }), (req, res) => {
  const ext = EXT[req.headers['content-type']]
  if (!ext || !Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'Send a JPG, PNG, WEBP, GIF, AVIF, MP4 or WEBM file' })
  const base = slug(String(req.query.name || 'file').replace(/\.[^.]+$/, '')) || 'file'
  const file = `${base}-${randomBytes(4).toString('hex')}.${ext}`
  writeFileSync(join(UPLOADS, file), req.body)
  res.status(201).json({ url: `/uploads/${file}` })
})

app.use('/api/admin', admin)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

/* ---------- built frontend (production) ---------- */

if (existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }))
  app.get('*', (req, res) => res.sendFile(join(DIST, 'index.html')))
}

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.status === 413 ? 'File too large' : 'Server error' })
})

app.listen(PORT, () => {
  console.log(`[server] Kinetiq API on http://localhost:${PORT}`)
  if (usingDefaultPassword) console.warn('[server] ADMIN_PASSWORD not set — using default "kinetiq-admin". Set it before going live.')
})

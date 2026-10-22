import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { products as seedProducts } from '../src/data.js'

const here = dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = process.env.DATA_DIR || join(here, 'data')
mkdirSync(DATA_DIR, { recursive: true })

export const db = new DatabaseSync(join(DATA_DIR, 'kinetiq.db'))
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    tag        TEXT NOT NULL DEFAULT '',
    category   TEXT NOT NULL DEFAULT '',
    price      TEXT NOT NULL DEFAULT '',
    img        TEXT NOT NULL DEFAULT '',
    back       TEXT NOT NULL DEFAULT '',
    video      TEXT NOT NULL DEFAULT '',
    scrub      TEXT NOT NULL DEFAULT '',
    color      TEXT NOT NULL DEFAULT '#1fa2ff',
    descr      TEXT NOT NULL DEFAULT '',
    features   TEXT NOT NULL DEFAULT '[]',
    sort       INTEGER NOT NULL DEFAULT 0,
    active     INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS quotes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    team       TEXT NOT NULL DEFAULT '',
    phone      TEXT NOT NULL DEFAULT '',
    email      TEXT NOT NULL DEFAULT '',
    qty        INTEGER NOT NULL DEFAULT 0,
    product    TEXT NOT NULL DEFAULT '',
    items      TEXT NOT NULL DEFAULT '[]',
    message    TEXT NOT NULL DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS subscribers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)

// databases created before the back-view image existed
if (!db.prepare('PRAGMA table_info(products)').all().some((c) => c.name === 'back')) {
  db.exec("ALTER TABLE products ADD COLUMN back TEXT NOT NULL DEFAULT ''")
}

const PRODUCT_COLS = ['id', 'name', 'tag', 'category', 'price', 'img', 'back', 'video', 'scrub', 'color', 'descr', 'features', 'sort', 'active']

/** DB row → the shape the frontend uses (same as src/data.js). */
export function toProduct(r) {
  return {
    id: r.id,
    name: r.name,
    tag: r.tag,
    category: r.category,
    price: r.price,
    img: r.img,
    back: r.back || undefined,
    video: r.video || undefined,
    scrub: r.scrub || undefined,
    color: r.color,
    desc: r.descr,
    features: JSON.parse(r.features || '[]'),
    sort: r.sort,
    active: !!r.active,
  }
}

/** Frontend shape → DB row values. */
export function fromProduct(p, sort = 0) {
  return {
    id: p.id,
    name: p.name,
    tag: p.tag || '',
    category: p.category || '',
    price: p.price || '',
    img: p.img || '',
    back: p.back || '',
    video: p.video || '',
    scrub: p.scrub || '',
    color: p.color || '#1fa2ff',
    descr: p.desc || '',
    features: JSON.stringify(Array.isArray(p.features) ? p.features : []),
    sort: Number.isFinite(+p.sort) ? +p.sort : sort,
    active: p.active === false ? 0 : 1,
  }
}

export function upsertProduct(row) {
  const cols = PRODUCT_COLS.join(', ')
  const vals = PRODUCT_COLS.map((c) => `:${c}`).join(', ')
  const set = PRODUCT_COLS.filter((c) => c !== 'id').map((c) => `${c} = excluded.${c}`).join(', ')
  db.prepare(`INSERT INTO products (${cols}) VALUES (${vals}) ON CONFLICT(id) DO UPDATE SET ${set}`).run(row)
}

// First run: fill the catalogue from src/data.js
if (db.prepare('SELECT COUNT(*) AS n FROM products').get().n === 0) {
  seedProducts.forEach((p, i) => upsertProduct(fromProduct(p, i)))
  console.log(`[db] seeded ${seedProducts.length} products`)
}

export function setting(key, make) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
  if (row) return row.value
  const value = make()
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value)
  return value
}

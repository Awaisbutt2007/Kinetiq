import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { setting } from './db.js'

const SECRET = process.env.TOKEN_SECRET || setting('token_secret', () => randomBytes(32).toString('hex'))
const PASSWORD = process.env.ADMIN_PASSWORD || 'kinetiq-admin'
const TTL_MS = 7 * 24 * 60 * 60 * 1000

export const usingDefaultPassword = !process.env.ADMIN_PASSWORD

const sign = (payload) => createHmac('sha256', SECRET).update(payload).digest('base64url')

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

export function checkPassword(pw) {
  return safeEqual(pw || '', PASSWORD)
}

export function issueToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function verify(token) {
  const [payload, sig] = String(token || '').split('.')
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now()
  } catch {
    return false
  }
}

export function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!verify(token)) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

// Simple in-memory brute-force guard: 10 failed logins per IP per 15 minutes
const fails = new Map()
export function loginLimiter(req, res, next) {
  const now = Date.now()
  const rec = fails.get(req.ip)
  if (rec && now - rec.start > 15 * 60 * 1000) fails.delete(req.ip)
  if ((fails.get(req.ip)?.count || 0) >= 10) return res.status(429).json({ error: 'Too many attempts, try again later' })
  res.on('finish', () => {
    if (res.statusCode !== 401) return
    const r = fails.get(req.ip) || { count: 0, start: now }
    r.count++
    fails.set(req.ip, r)
  })
  next()
}

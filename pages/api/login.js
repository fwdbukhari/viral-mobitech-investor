import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { serialize } from 'cookie'

function getInvestors() {
  try {
    return JSON.parse(process.env.INVESTORS_JSON || '[]')
  } catch { return [] }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' })

  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  let payload = null

  // Check admin
  if (username === process.env.ADMIN_USERNAME) {
    const valid = await bcrypt.compare(password, await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
      .then(() => bcrypt.hash(process.env.ADMIN_PASSWORD, 10)))
    // Direct string compare for admin (no hash stored)
    if (password === process.env.ADMIN_PASSWORD) {
      payload = { username, role: 'admin', name: 'Admin' }
    }
  }

  // Check investors
  if (!payload) {
    const investors = getInvestors()
    const investor = investors.find(i => i.username === username)
    if (investor && password === investor.password) {
      payload = {
        username,
        role: 'investor',
        name: investor.name,
        sharePercent: investor.sharePercent || 30,
      }
    }
  }

  if (!payload) return res.status(401).json({ error: 'Invalid credentials' })

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  res.setHeader('Set-Cookie', serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }))

  return res.status(200).json({ ok: true, role: payload.role, name: payload.name })
}

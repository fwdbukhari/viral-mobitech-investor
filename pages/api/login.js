import bcrypt from 'bcryptjs'
import redis from '../../lib/redis'
import { createToken, setAuthCookie } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  try {
    // Check if admin
    const adminData = await redis.get('admin:credentials')
    if (adminData) {
      const admin = typeof adminData === 'string' ? JSON.parse(adminData) : adminData
      if (admin.username.toLowerCase() === username.toLowerCase()) {
        const valid = await bcrypt.compare(password, admin.passwordHash)
        if (valid) {
          const token = await createToken({
            id: 'admin',
            role: 'admin',
            name: 'Admin',
          })
          setAuthCookie(res, token)
          return res.status(200).json({ role: 'admin', name: 'Admin' })
        }
        return res.status(401).json({ error: 'Invalid credentials' })
      }
    }

    // Check investors
    const investorIds = await redis.get('investors:list')
    const list = Array.isArray(investorIds) ? investorIds : (investorIds ? JSON.parse(investorIds) : [])

    for (const id of list) {
      const inv = await redis.get(`investor:${id}`)
      if (!inv) continue
      const investor = typeof inv === 'string' ? JSON.parse(inv) : inv
      if (investor.username.toLowerCase() === username.toLowerCase()) {
        const valid = await bcrypt.compare(password, investor.passwordHash)
        if (valid) {
          const token = await createToken({
            id: investor.id,
            role: 'investor',
            name: investor.name,
          })
          setAuthCookie(res, token)
          return res.status(200).json({ role: 'investor', name: investor.name })
        }
        return res.status(401).json({ error: 'Invalid credentials' })
      }
    }

    return res.status(401).json({ error: 'Invalid credentials' })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

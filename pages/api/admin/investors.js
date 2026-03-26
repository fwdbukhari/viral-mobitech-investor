import bcrypt from 'bcryptjs'
import redis from '../../../lib/redis'
import { requireAdmin } from '../../../lib/auth'

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const investorIds = await redis.get('investors:list')
      const list = Array.isArray(investorIds) ? investorIds : (investorIds ? JSON.parse(investorIds) : [])
      const investors = []
      for (const id of list) {
        const inv = await redis.get(`investor:${id}`)
        if (inv) {
          const data = typeof inv === 'string' ? JSON.parse(inv) : inv
          const { passwordHash, ...safe } = data
          investors.push(safe)
        }
      }
      return res.status(200).json(investors)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, username, password, sharePercent, email, notes } = req.body
      if (!name || !username || !password) {
        return res.status(400).json({ error: 'name, username, and password are required' })
      }

      // Check username uniqueness
      const investorIds = await redis.get('investors:list')
      const list = Array.isArray(investorIds) ? investorIds : (investorIds ? JSON.parse(investorIds) : [])
      for (const id of list) {
        const inv = await redis.get(`investor:${id}`)
        if (inv) {
          const data = typeof inv === 'string' ? JSON.parse(inv) : inv
          if (data.username.toLowerCase() === username.toLowerCase()) {
            return res.status(409).json({ error: 'Username already exists' })
          }
        }
      }

      const id = `inv_${Date.now()}`
      const passwordHash = await bcrypt.hash(password, 10)
      const investor = {
        id, name, username, passwordHash,
        sharePercent: parseFloat(sharePercent) || 30,
        email: email || '',
        notes: notes || '',
        createdAt: new Date().toISOString(),
      }

      await redis.set(`investor:${id}`, JSON.stringify(investor))
      list.push(id)
      await redis.set('investors:list', JSON.stringify(list))

      const { passwordHash: _, ...safe } = investor
      return res.status(201).json(safe)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

import bcrypt from 'bcryptjs'
import redis from '../../../../lib/redis'
import { requireAdmin } from '../../../../lib/auth'

async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const inv = await redis.get(`investor:${id}`)
      if (!inv) return res.status(404).json({ error: 'Investor not found' })
      const existing = typeof inv === 'string' ? JSON.parse(inv) : inv

      const { name, username, password, sharePercent, email, notes } = req.body
      const updated = {
        ...existing,
        name: name || existing.name,
        username: username || existing.username,
        sharePercent: sharePercent !== undefined ? parseFloat(sharePercent) : existing.sharePercent,
        email: email !== undefined ? email : existing.email,
        notes: notes !== undefined ? notes : existing.notes,
      }

      if (password) {
        updated.passwordHash = await bcrypt.hash(password, 10)
      }

      await redis.set(`investor:${id}`, JSON.stringify(updated))
      const { passwordHash, ...safe } = updated
      return res.status(200).json(safe)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await redis.del(`investor:${id}`)
      const investorIds = await redis.get('investors:list')
      const list = Array.isArray(investorIds) ? investorIds : (investorIds ? JSON.parse(investorIds) : [])
      const updated = list.filter(i => i !== id)
      await redis.set('investors:list', JSON.stringify(updated))
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

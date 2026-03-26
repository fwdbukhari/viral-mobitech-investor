import bcrypt from 'bcryptjs'
import redis from '../../../lib/redis'
import { requireAdmin } from '../../../lib/auth'
import { SEED_MONTHS } from '../../../lib/seedData'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    let seeded = 0
    const monthIds = []

    for (const m of SEED_MONTHS) {
      const key = `month:${m.id}`
      await redis.set(key, JSON.stringify(m))
      monthIds.push(m.id)
      seeded++
    }

    monthIds.sort()
    await redis.set('months:list', JSON.stringify(monthIds))

    return res.status(200).json({ ok: true, seeded, message: `Seeded ${seeded} months successfully` })
  } catch (err) {
    console.error('Seed error:', err)
    return res.status(500).json({ error: 'Seed failed: ' + err.message })
  }
}

export default requireAdmin(handler)

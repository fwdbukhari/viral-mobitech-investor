import redis from '../../../lib/redis'
import { requireInvestor } from '../../../lib/auth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const monthIds = await redis.get('months:list')
    const list = Array.isArray(monthIds) ? monthIds : (monthIds ? JSON.parse(monthIds) : [])
    list.sort()

    const months = []
    for (const id of list) {
      const m = await redis.get(`month:${id}`)
      if (m) months.push(typeof m === 'string' ? JSON.parse(m) : m)
    }

    // Get investor's share percent
    const user = req.user
    let sharePercent = 30
    if (user.role === 'investor') {
      const inv = await redis.get(`investor:${user.id}`)
      if (inv) {
        const data = typeof inv === 'string' ? JSON.parse(inv) : inv
        sharePercent = data.sharePercent || 30
      }
    }

    // Adjust investor share if different from 30%
    const adjusted = months.map(m => ({
      ...m,
      investorShare: parseFloat((m.balance * (sharePercent / 100)).toFixed(2)),
      investorSharePKR: Math.round(m.balance * (sharePercent / 100) * m.pkrRate),
      sharePercent,
    }))

    return res.status(200).json(adjusted)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export default requireInvestor(handler)

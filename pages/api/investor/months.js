import { readData } from '../../../lib/github-storage'
import { verifyAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  const user = await verifyAuth(req)
  if (!user || user.role !== 'investor') return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    try {
      const { data } = await readData()
      // Apply investor's share percent to each month
      const sharePercent = user.sharePercent || 30
      const months = data.months.map(m => ({
        ...m,
        investorShare: parseFloat((m.balance * sharePercent / 100).toFixed(2)),
        investorSharePKR: Math.round(m.balance * sharePercent / 100 * m.pkrRate),
        sharePercent,
      }))
      return res.status(200).json(months)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.status(405).end()
}

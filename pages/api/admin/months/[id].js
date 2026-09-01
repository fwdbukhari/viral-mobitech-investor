import { readData, writeData } from '../../../../lib/github-storage'
import { verifyAuth } from '../../../../lib/auth'

export default async function handler(req, res) {
  const user = await verifyAuth(req)
  if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const d = req.body
      const adsRevenue = parseFloat(d.adsRevenue) || 0
      const subscriptions = parseFloat(d.subscriptions) || 0
      const adjInvalidTraffic = parseFloat(d.adjInvalidTraffic) || 0
      const adsSpend = parseFloat(d.adsSpend) || 0
      const taxes = parseFloat(d.taxes) || 0
      const pkrRate = parseFloat(d.pkrRate) || 283
      const totalIncome = adsRevenue + subscriptions - adjInvalidTraffic
      const totalMarketing = adsSpend + taxes
      const balance = totalIncome - totalMarketing
      const investorShare = parseFloat((balance * 0.3).toFixed(2))

      const { data, sha } = await readData()
      const idx = data.months.findIndex(m => m.id === id)
      if (idx === -1) return res.status(404).json({ error: 'Month not found' })

      data.months[idx] = {
        ...data.months[idx],
        adsRevenue, subscriptions, adjInvalidTraffic, adsSpend, taxes, pkrRate,
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalMarketing: parseFloat(totalMarketing.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
        investorShare,
        balancePKR: Math.round(balance * pkrRate),
        investorSharePKR: Math.round(investorShare * pkrRate),
        paymentStatus: d.paymentStatus || data.months[idx].paymentStatus,
        receiptUrl: d.receiptUrl ?? data.months[idx].receiptUrl,
      }
      await writeData(data, sha)
      return res.status(200).json(data.months[idx])
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { data, sha } = await readData()
      const before = data.months.length
      data.months = data.months.filter(m => m.id !== id)
      if (data.months.length === before) return res.status(404).json({ error: 'Month not found' })
      await writeData(data, sha)
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.status(405).end()
}

import { readData, writeData } from '../../../lib/github-storage'
import { verifyAuth } from '../../../lib/auth'

function getFiscalYear(id) {
  const [year, month] = id.split('-').map(Number)
  return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

export default async function handler(req, res) {
  const user = await verifyAuth(req)
  if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    try {
      const { data } = await readData()
      return res.status(200).json(data.months.sort((a, b) => a.id.localeCompare(b.id)))
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
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
      const balancePKR = Math.round(balance * pkrRate)
      const investorSharePKR = Math.round(investorShare * pkrRate)

      const newMonth = {
        id: d.id,
        month: d.month,
        fiscalYear: d.fiscalYear || getFiscalYear(d.id),
        adsRevenue, subscriptions, adjInvalidTraffic,
        aitInMarketing: false,
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        adsSpend, taxes,
        totalMarketing: parseFloat(totalMarketing.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
        investorShare, pkrRate, balancePKR, investorSharePKR,
        paymentStatus: d.paymentStatus || 'Pending',
        receiptUrl: d.receiptUrl || '',
      }

      const { data, sha } = await readData()
      const exists = data.months.find(m => m.id === newMonth.id)
      if (exists) return res.status(409).json({ error: 'Month already exists' })
      data.months.push(newMonth)
      data.months.sort((a, b) => a.id.localeCompare(b.id))
      await writeData(data, sha)
      return res.status(201).json(newMonth)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.status(405).end()
}

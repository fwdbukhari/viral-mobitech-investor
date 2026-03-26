import redis from '../../../lib/redis'
import { requireAdmin } from '../../../lib/auth'

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const monthIds = await redis.get('months:list')
      const list = Array.isArray(monthIds) ? monthIds : (monthIds ? JSON.parse(monthIds) : [])
      list.sort()

      const months = []
      for (const id of list) {
        const m = await redis.get(`month:${id}`)
        if (m) months.push(typeof m === 'string' ? JSON.parse(m) : m)
      }
      return res.status(200).json(months)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body
      if (!data.id || !data.month) return res.status(400).json({ error: 'id and month are required' })

      // Check if already exists
      const existing = await redis.get(`month:${data.id}`)
      if (existing) return res.status(409).json({ error: 'Month already exists' })

      // Compute derived fields
      const month = computeMonth(data)

      // Save month
      await redis.set(`month:${data.id}`, JSON.stringify(month))

      // Update list
      const monthIds = await redis.get('months:list')
      const list = Array.isArray(monthIds) ? monthIds : (monthIds ? JSON.parse(monthIds) : [])
      if (!list.includes(data.id)) {
        list.push(data.id)
        list.sort()
        await redis.set('months:list', JSON.stringify(list))
      }

      return res.status(201).json(month)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  return res.status(405).end()
}

function computeMonth(data) {
  const adsRevenue = parseFloat(data.adsRevenue) || 0
  const subscriptions = parseFloat(data.subscriptions) || 0
  const adjInvalidTraffic = parseFloat(data.adjInvalidTraffic) || 0
  const adsSpend = parseFloat(data.adsSpend) || 0
  const taxes = parseFloat(data.taxes) || 0
  const pkrRate = parseFloat(data.pkrRate) || 280
  const aitInMarketing = data.aitInMarketing === true || data.aitInMarketing === 'true'

  const totalIncome = aitInMarketing
    ? adsRevenue + subscriptions
    : adsRevenue + subscriptions - adjInvalidTraffic

  const totalMarketing = aitInMarketing
    ? adsSpend + taxes + adjInvalidTraffic
    : adsSpend + taxes

  const balance = totalIncome - totalMarketing
  const investorShare = parseFloat((balance * 0.30).toFixed(2))
  const balancePKR = Math.round(balance * pkrRate)
  const investorSharePKR = Math.round(investorShare * pkrRate)

  return {
    id: data.id,
    month: data.month,
    fiscalYear: data.fiscalYear || getFiscalYear(data.id),
    adsRevenue, subscriptions, adjInvalidTraffic, aitInMarketing,
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    adsSpend, taxes,
    totalMarketing: parseFloat(totalMarketing.toFixed(2)),
    balance: parseFloat(balance.toFixed(2)),
    investorShare,
    pkrRate,
    balancePKR,
    investorSharePKR,
    paymentStatus: data.paymentStatus || 'Pending',
    receiptUrl: data.receiptUrl || '',
  }
}

function getFiscalYear(id) {
  const [year, month] = id.split('-').map(Number)
  if (month >= 7) return `${year}-${year + 1}`
  return `${year - 1}-${year}`
}

export default requireAdmin(handler)

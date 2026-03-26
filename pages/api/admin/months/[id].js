import redis from '../../../../lib/redis'
import { requireAdmin } from '../../../../lib/auth'

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
    fiscalYear: data.fiscalYear,
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

async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const existing = await redis.get(`month:${id}`)
      if (!existing) return res.status(404).json({ error: 'Month not found' })
      const month = computeMonth({ ...req.body, id })
      await redis.set(`month:${id}`, JSON.stringify(month))
      return res.status(200).json(month)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await redis.del(`month:${id}`)
      const monthIds = await redis.get('months:list')
      const list = Array.isArray(monthIds) ? monthIds : (monthIds ? JSON.parse(monthIds) : [])
      const updated = list.filter(m => m !== id)
      await redis.set('months:list', JSON.stringify(updated))
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

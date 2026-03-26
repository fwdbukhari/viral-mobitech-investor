import { getSupabaseAdmin } from '../../../../lib/supabase'
import { requireAdmin } from '../../../../lib/auth'

function computeMonth(data) {
  const adsRevenue = parseFloat(data.adsRevenue) || 0
  const subscriptions = parseFloat(data.subscriptions) || 0
  const adjInvalidTraffic = parseFloat(data.adjInvalidTraffic) || 0
  const adsSpend = parseFloat(data.adsSpend) || 0
  const taxes = parseFloat(data.taxes) || 0
  const pkrRate = parseFloat(data.pkrRate) || 280
  const aitInMarketing = data.aitInMarketing === true || data.aitInMarketing === 'true'

  const totalIncome = aitInMarketing ? adsRevenue + subscriptions : adsRevenue + subscriptions - adjInvalidTraffic
  const totalMarketing = aitInMarketing ? adsSpend + taxes + adjInvalidTraffic : adsSpend + taxes
  const balance = totalIncome - totalMarketing
  const investorShare = parseFloat((balance * 0.30).toFixed(2))

  return {
    month: data.month, fiscal_year: data.fiscalYear,
    ads_revenue: adsRevenue, subscriptions, adj_invalid_traffic: adjInvalidTraffic,
    ait_in_marketing: aitInMarketing,
    total_income: parseFloat(totalIncome.toFixed(2)),
    ads_spend: adsSpend, taxes,
    total_marketing: parseFloat(totalMarketing.toFixed(2)),
    balance: parseFloat(balance.toFixed(2)),
    investor_share: investorShare,
    pkr_rate: pkrRate,
    balance_pkr: Math.round(balance * pkrRate),
    investor_share_pkr: Math.round(investorShare * pkrRate),
    payment_status: data.paymentStatus || 'Pending',
    receipt_url: data.receiptUrl || '',
  }
}

function toClient(m) {
  return {
    id: m.id, month: m.month, fiscalYear: m.fiscal_year,
    adsRevenue: m.ads_revenue, subscriptions: m.subscriptions,
    adjInvalidTraffic: m.adj_invalid_traffic, aitInMarketing: m.ait_in_marketing,
    totalIncome: m.total_income, adsSpend: m.ads_spend, taxes: m.taxes,
    totalMarketing: m.total_marketing, balance: m.balance,
    investorShare: m.investor_share, pkrRate: m.pkr_rate,
    balancePKR: m.balance_pkr, investorSharePKR: m.investor_share_pkr,
    paymentStatus: m.payment_status, receiptUrl: m.receipt_url,
  }
}

async function handler(req, res) {
  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'PUT') {
    const row = computeMonth({ ...req.body, id })
    const { data, error } = await supabase.from('months').update(row).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(toClient(data))
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('months').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

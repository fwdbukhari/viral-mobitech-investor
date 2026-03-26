import { getSupabaseAdmin } from '../../../lib/supabase'
import { requireInvestor } from '../../../lib/auth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const supabase = getSupabaseAdmin()
    const { data: months, error } = await supabase.from('months').select('*').order('id')
    if (error) throw error

    let sharePercent = 30
    if (req.user.role === 'investor') {
      const { data: inv } = await supabase.from('investors').select('share_percent').eq('id', req.user.id).single()
      if (inv) sharePercent = inv.share_percent || 30
    }

    const result = months.map(m => ({
      id: m.id, month: m.month, fiscalYear: m.fiscal_year,
      adsRevenue: m.ads_revenue, subscriptions: m.subscriptions,
      adjInvalidTraffic: m.adj_invalid_traffic, aitInMarketing: m.ait_in_marketing,
      totalIncome: m.total_income, adsSpend: m.ads_spend, taxes: m.taxes,
      totalMarketing: m.total_marketing, balance: m.balance,
      pkrRate: m.pkr_rate,
      investorShare: parseFloat((m.balance * sharePercent / 100).toFixed(2)),
      investorSharePKR: Math.round(m.balance * sharePercent / 100 * m.pkr_rate),
      balancePKR: m.balance_pkr,
      paymentStatus: m.payment_status, receiptUrl: m.receipt_url,
      sharePercent,
    }))

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export default requireInvestor(handler)

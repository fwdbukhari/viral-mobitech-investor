import { getSupabaseAdmin } from '../../../lib/supabase'
import { requireAdmin } from '../../../lib/auth'
import { SEED_MONTHS } from '../../../lib/seedData'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const supabase = getSupabaseAdmin()
    const rows = SEED_MONTHS.map(m => ({
      id: m.id, month: m.month, fiscal_year: m.fiscalYear,
      ads_revenue: m.adsRevenue, subscriptions: m.subscriptions,
      adj_invalid_traffic: m.adjInvalidTraffic, ait_in_marketing: m.aitInMarketing,
      total_income: m.totalIncome, ads_spend: m.adsSpend, taxes: m.taxes,
      total_marketing: m.totalMarketing, balance: m.balance,
      investor_share: m.investorShare, pkr_rate: m.pkrRate,
      balance_pkr: m.balancePKR, investor_share_pkr: m.investorSharePKR,
      payment_status: m.paymentStatus, receipt_url: m.receiptUrl || '',
    }))

    const { error } = await supabase.from('months').upsert(rows, { onConflict: 'id' })
    if (error) throw error

    return res.status(200).json({ ok: true, seeded: rows.length, message: `Seeded ${rows.length} months` })
  } catch (err) {
    console.error('Seed error:', err)
    return res.status(500).json({ error: 'Seed failed: ' + err.message })
  }
}

export default requireAdmin(handler)

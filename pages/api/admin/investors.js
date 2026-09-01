import { verifyAuth } from '../../../lib/auth'

// Investors are stored in INVESTORS_JSON env var
// Format: [{"name":"Jawad","username":"jawad","password":"Jawad168$38","sharePercent":30}]

function getInvestors() {
  try { return JSON.parse(process.env.INVESTORS_JSON || '[]') } catch { return [] }
}

export default async function handler(req, res) {
  const user = await verifyAuth(req)
  if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const investors = getInvestors().map((inv, i) => ({ ...inv, id: i + 1 }))
    return res.status(200).json(investors)
  }

  // For add/edit/delete — return instructions since env vars need manual update
  return res.status(200).json({
    ok: true,
    message: 'Investor management is via INVESTORS_JSON environment variable in Vercel.',
  })
}

import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../../../lib/supabase'
import { requireAdmin } from '../../../lib/auth'

function toClient(inv) {
  const { password_hash, ...safe } = inv
  return { ...safe, sharePercent: inv.share_percent, createdAt: inv.created_at, plainPassword: inv.plain_password }
}

async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('investors').select('*').order('created_at')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data.map(toClient))
  }

  if (req.method === 'POST') {
    const { name, username, password, sharePercent, email, notes } = req.body
    if (!name || !username || !password) return res.status(400).json({ error: 'name, username, and password required' })

    const passwordHash = await bcrypt.hash(password, 10)
    const { data, error } = await supabase.from('investors').insert({
      name, username: username.toLowerCase(),
      password_hash: passwordHash,
      plain_password: password,
      share_percent: parseFloat(sharePercent) || 30,
      email: email || '', notes: notes || '',
    }).select().single()

    if (error) return res.status(error.code === '23505' ? 409 : 500).json({ error: error.message })
    return res.status(201).json(toClient(data))
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

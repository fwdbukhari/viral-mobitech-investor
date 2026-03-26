import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../../../../lib/supabase'
import { requireAdmin } from '../../../../lib/auth'

function toClient(inv) {
  const { password_hash, ...safe } = inv
  return { ...safe, sharePercent: inv.share_percent, createdAt: inv.created_at, plainPassword: inv.plain_password }
}

async function handler(req, res) {
  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'PUT') {
    const { name, username, password, sharePercent, email, notes } = req.body
    const updates = {
      name, username: username?.toLowerCase(),
      share_percent: parseFloat(sharePercent) || 30,
      email: email || '', notes: notes || '',
    }
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 10)
      updates.plain_password = password
    }

    const { data, error } = await supabase.from('investors').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(toClient(data))
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('investors').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

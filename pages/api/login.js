import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../../lib/supabase'
import { createToken, setAuthCookie } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  try {
    const supabase = getSupabaseAdmin()

    // Check admin
    const { data: admin } = await supabase
      .from('admin_credentials')
      .select('*')
      .ilike('username', username)
      .single()

    if (admin) {
      const valid = await bcrypt.compare(password, admin.password_hash)
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
      const token = await createToken({ id: 'admin', role: 'admin', name: 'Admin' })
      setAuthCookie(res, token)
      return res.status(200).json({ role: 'admin', name: 'Admin' })
    }

    // Check investors
    const { data: investor } = await supabase
      .from('investors')
      .select('*')
      .ilike('username', username)
      .single()

    if (investor) {
      const valid = await bcrypt.compare(password, investor.password_hash)
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
      const token = await createToken({ id: investor.id, role: 'investor', name: investor.name })
      setAuthCookie(res, token)
      return res.status(200).json({ role: 'investor', name: investor.name })
    }

    return res.status(401).json({ error: 'Invalid credentials' })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

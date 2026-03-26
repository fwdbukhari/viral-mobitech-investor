import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  // Allow both GET and POST so admin can visit in browser
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).end()
  try {
    const supabase = getSupabaseAdmin()
    const { data: existing } = await supabase
      .from('admin_credentials')
      .select('id')
      .single()

    if (existing) {
      return res.status(200).json({ ok: true, message: 'Admin already set up. You can log in now.' })
    }

    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'VMAdmin@2025'
    const passwordHash = await bcrypt.hash(password, 10)

    const { error } = await supabase
      .from('admin_credentials')
      .insert({ username, password_hash: passwordHash })

    if (error) throw error
    return res.status(200).json({ ok: true, message: 'Admin account created! You can now log in.', username })
  } catch (err) {
    console.error('Setup error:', err)
    return res.status(500).json({ error: 'Setup failed: ' + err.message })
  }
}

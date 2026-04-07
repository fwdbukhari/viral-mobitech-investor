import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../../../lib/supabase'

// One-time endpoint to reset admin credentials from current env vars
// Visit: https://viral-mobitech-investor.vercel.app/api/admin/reset-credentials
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    const supabase = getSupabaseAdmin()

    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'VMAdmin@2025'
    const passwordHash = await bcrypt.hash(password, 10)

    // Delete existing admin credentials
    await supabase.from('admin_credentials').delete().neq('id', 0)

    // Insert fresh hashed credentials
    const { error } = await supabase
      .from('admin_credentials')
      .insert({ username, password_hash: passwordHash })

    if (error) throw error

    return res.status(200).json({
      ok: true,
      message: `Admin credentials reset successfully. You can now log in with username: "${username}"`,
    })
  } catch (err) {
    console.error('Reset error:', err)
    return res.status(500).json({ error: 'Reset failed: ' + err.message })
  }
}

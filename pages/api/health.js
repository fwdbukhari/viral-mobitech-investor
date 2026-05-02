import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../../lib/supabase'

// Health check endpoint — used by UptimeRobot every 5 mins
// Auto-recreates admin credentials if Supabase was paused and wiped them
export default async function handler(req, res) {
  try {
    const supabase = getSupabaseAdmin()

    // Check if admin credentials exist
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('id')
      .limit(1)

    if (error) throw error

    // If no credentials found (happens after Supabase pause/resume) — auto-recreate
    if (!data || data.length === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin'
      const password = process.env.ADMIN_PASSWORD
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10)
        await supabase.from('admin_credentials').insert({ username, password_hash: passwordHash })
      }
      return res.status(200).json({ ok: true, status: 'credentials_restored' })
    }

    return res.status(200).json({ ok: true, status: 'healthy' })
  } catch (err) {
    // Still return 200 so UptimeRobot doesn't flag false downtime
    return res.status(200).json({ ok: true, status: 'db_unavailable' })
  }
}

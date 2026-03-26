import bcrypt from 'bcryptjs'
import redis from '../../../lib/redis'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    // Only allow if admin not yet created
    const existing = await redis.get('admin:credentials')
    if (existing) {
      return res.status(409).json({ error: 'Admin already set up' })
    }

    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'VMAdmin@2025'
    const passwordHash = await bcrypt.hash(password, 10)

    await redis.set('admin:credentials', JSON.stringify({ username, passwordHash }))

    return res.status(200).json({ ok: true, message: 'Admin account created', username })
  } catch (err) {
    console.error('Setup error:', err)
    return res.status(500).json({ error: 'Setup failed: ' + err.message })
  }
}

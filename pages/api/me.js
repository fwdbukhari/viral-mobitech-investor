import { verifyAuth } from '../../lib/auth'

export default async function handler(req, res) {
  const user = await verifyAuth(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  return res.status(200).json({ username: user.username, role: user.role, name: user.name, sharePercent: user.sharePercent })
}

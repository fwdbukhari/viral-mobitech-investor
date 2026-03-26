import { getUserFromRequest } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  return res.status(200).json({ id: user.id, role: user.role, name: user.name })
}

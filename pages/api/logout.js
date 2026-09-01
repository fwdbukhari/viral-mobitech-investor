import { serialize } from 'cookie'

export default function handler(req, res) {
  res.setHeader('Set-Cookie', serialize('vm_investor_auth', '', { maxAge: 0, path: '/' }))
  return res.status(200).json({ ok: true })
}

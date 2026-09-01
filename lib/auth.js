import { jwtVerify } from 'jose'
import { parse } from 'cookie'

export async function verifyAuth(req) {
  try {
    const cookies = parse(req.headers.cookie || '')
    const token = cookies.vm_investor_auth
    if (!token) return null
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

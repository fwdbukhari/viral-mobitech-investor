import { SignJWT, jwtVerify } from 'jose'
import { serialize, parse } from 'cookie'

const COOKIE_NAME = 'vm_investor_auth'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}

export function setAuthCookie(res, token) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export function clearAuthCookie(res) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1,
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export function getTokenFromRequest(req) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
  return cookies[COOKIE_NAME] || null
}

export async function getUserFromRequest(req) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

export function requireAdmin(handler) {
  return async (req, res) => {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = user
    return handler(req, res)
  }
}

export function requireInvestor(handler) {
  return async (req, res) => {
    const user = await getUserFromRequest(req)
    if (!user || (user.role !== 'investor' && user.role !== 'admin')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = user
    return handler(req, res)
  }
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME

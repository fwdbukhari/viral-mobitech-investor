import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'vm_investor_auth'

function getSecret() {
  const s = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production'
  return new TextEncoder().encode(s)
}

async function getUser(req) {
  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie?.value) return null
  try {
    const { payload } = await jwtVerify(cookie.value, getSecret())
    return payload
  } catch {
    return null
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const user = await getUser(req)

  // Protect admin pages
  if (pathname.startsWith('/admin')) {
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Protect investor pages
  if (pathname.startsWith('/investor')) {
    if (!user || (user.role !== 'investor' && user.role !== 'admin')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Already logged in — redirect away from login
  if (pathname === '/login' && user) {
    if (user.role === 'admin') return NextResponse.redirect(new URL('/admin', req.url))
    if (user.role === 'investor') return NextResponse.redirect(new URL('/investor', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/investor/:path*', '/login'],
}

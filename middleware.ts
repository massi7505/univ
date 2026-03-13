import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'UnivBase_token'
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'UnivBase-jwt-secret-change-in-production-use-32-chars-min'
)

async function getSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = await getSession(req)

  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password']
  if (publicPaths.some(p => pathname.startsWith(p))) {
    if (session) {
      return NextResponse.redirect(new URL(session.role === 'ADMIN' ? '/admin' : '/student', req.url))
    }
    return NextResponse.next()
  }

  if (pathname === '/') {
    if (!session) return NextResponse.redirect(new URL('/auth/login', req.url))
    return NextResponse.redirect(new URL(session.role === 'ADMIN' ? '/admin' : '/student', req.url))
  }

  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/auth/login', req.url))
    if (session.role !== 'ADMIN') return NextResponse.redirect(new URL('/student', req.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/student')) {
    if (!session) return NextResponse.redirect(new URL('/auth/login', req.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/student/:path*', '/auth/:path*'],
}

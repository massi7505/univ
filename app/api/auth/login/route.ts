import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import { LoginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = LoginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    if (!user.active) return NextResponse.json({ error: 'Account is disabled' }, { status: 403 })

    const valid = await bcrypt.compare(data.password, user.password)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
    })
    return res
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


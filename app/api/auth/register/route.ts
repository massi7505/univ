import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { RegisterSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = RegisterSchema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const hashed = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'STUDENT',
      },
    })

    return NextResponse.json({ message: 'Account created', userId: user.id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


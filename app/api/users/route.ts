import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserCreateSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where = search
    ? { OR: [{ email: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }] }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, total, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const data = UserCreateSchema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const hashed = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}


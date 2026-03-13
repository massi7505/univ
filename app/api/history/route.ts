import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit
  const userId = searchParams.get('userId')

  // Students can only see their own history; admins can filter by userId
  const where =
    session.role === 'ADMIN'
      ? userId ? { userId } : {}
      : { userId: session.userId }

  const [history, total] = await Promise.all([
    prisma.productView.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, cas: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { viewedAt: 'desc' },
      skip, take: limit,
    }),
    prisma.productView.count({ where }),
  ])

  return NextResponse.json({ history, total, pages: Math.ceil(total / limit) })
}


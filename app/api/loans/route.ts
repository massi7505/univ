import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const loanInclude = {
  product: {
    include: {
      shelf: {
        include: {
          cabinet: {
            include: { room: { include: { building: true } } }
          }
        }
      }
    }
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)

  if (session.role === 'ADMIN') {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const filter = searchParams.get('filter') || 'active'
    const skip = (page - 1) * 20
    const where = filter === 'active' ? { returnedAt: null } : {}
    const [loans, total] = await Promise.all([
      prisma.productLoan.findMany({
        where,
        include: {
          ...loanInclude,
          user: { select: { id: true, firstName: true, lastName: true, email: true } }
        },
        orderBy: { takenAt: 'desc' },
        skip, take: 20,
      }),
      prisma.productLoan.count({ where })
    ])
    return NextResponse.json({ loans, total, page, pages: Math.ceil(total / 20) })
  }

  // Student: own active loans
  const loans = await prisma.productLoan.findMany({
    where: { userId: session.userId, returnedAt: null },
    include: loanInclude,
    orderBy: { takenAt: 'desc' },
  })
  return NextResponse.json(loans)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId requis' }, { status: 400 })

  const existing = await prisma.productLoan.findFirst({
    where: { userId: session.userId, productId, returnedAt: null }
  })
  if (existing) return NextResponse.json({ error: 'Produit déjà emprunté' }, { status: 409 })

  const loan = await prisma.productLoan.create({
    data: { userId: session.userId, productId },
    include: loanInclude,
  })
  return NextResponse.json(loan, { status: 201 })
}

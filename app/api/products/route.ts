import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ProductSchema } from '@/lib/validations'

const productInclude = {
  shelf: {
    include: {
      cabinet: {
        include: {
          room: {
            include: { building: true }
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
  const search = searchParams.get('search') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
  const active = searchParams.get('active')
  const shelfId = searchParams.get('shelfId')
  const skip = (page - 1) * limit

  const physicalState = searchParams.get('physicalState') || ''
  const toxic = searchParams.get('toxic')
  const cmr = searchParams.get('cmr')
  const flammable = searchParams.get('flammable')
  const corrosive = searchParams.get('corrosive')
  const building = searchParams.get('building') || ''

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { cas: { contains: search } },
      { brand: { contains: search } },
    ]
  }
  if (active !== null && active !== '') where.active = active === 'true'
  if (shelfId) where.shelfId = shelfId
  if (physicalState) where.physicalState = physicalState
  if (toxic === 'true') where.toxic = true
  if (cmr === 'true') where.cmr = true
  if (flammable === 'true') where.flammable = true
  if (corrosive === 'true') where.corrosive = true
  if (building) {
    where.shelf = {
      cabinet: { room: { building: { name: building } } }
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const data = ProductSchema.parse(body)
    const product = await prisma.product.create({ data, include: productInclude })
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}


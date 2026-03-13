import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { BuildingSchema, RoomSchema, CabinetSchema, ShelfSchema } from '@/lib/validations'

// Buildings
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'building'

  try {
    const body = await req.json()

    if (type === 'building') {
      const data = BuildingSchema.parse(body)
      const record = await prisma.building.create({ data })
      return NextResponse.json(record, { status: 201 })
    }
    if (type === 'room') {
      const data = RoomSchema.parse(body)
      const record = await prisma.room.create({ data })
      return NextResponse.json(record, { status: 201 })
    }
    if (type === 'cabinet') {
      const data = CabinetSchema.parse(body)
      const record = await prisma.cabinet.create({ data })
      return NextResponse.json(record, { status: 201 })
    }
    if (type === 'shelf') {
      const data = ShelfSchema.parse(body)
      const record = await prisma.shelf.create({ data })
      return NextResponse.json(record, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}


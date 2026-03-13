import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const buildings = await prisma.building.findMany({
    include: {
      rooms: {
        include: {
          cabinets: {
            include: { shelves: true }
          }
        }
      }
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(buildings)
}


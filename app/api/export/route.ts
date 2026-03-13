import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const products = await prisma.product.findMany({
    include: {
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
    },
    orderBy: { name: 'asc' },
  })

  const rows = products.map(p => ({
    CAS: p.cas || '',
    Name: p.name,
    'Molar Mass': p.molarMass || '',
    Stock: p.stock || '',
    Packaging: p.packagingValue ? `${p.packagingValue}${p.packagingUnit}` : '',
    Brand: p.brand || '',
    Toxic: p.toxic ? 'Oui' : 'Non',
    CMR: p.cmr ? 'Oui' : 'Non',
    'Purity %': p.purityPercent ? (p.purityPercent * 100).toFixed(1) + '%' : '',
    'Physical State': p.physicalState || '',
    Building: p.shelf.cabinet.room.building.name,
    Room: p.shelf.cabinet.room.name,
    Cabinet: p.shelf.cabinet.name,
    Shelf: p.shelf.name,
    Comment: p.comment || '',
    'Stock Type': p.globalStockType || '',
    Active: p.active ? 'Yes' : 'No',
    'Created At': p.createdAt.toISOString(),
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Products')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="UnivBase-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  })
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const loan = await prisma.productLoan.findUnique({ where: { id: params.id } })
  if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (loan.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (loan.returnedAt) return NextResponse.json({ error: 'Déjà retourné' }, { status: 409 })

  const updated = await prisma.productLoan.update({
    where: { id: params.id },
    data: { returnedAt: new Date() }
  })
  return NextResponse.json(updated)
}

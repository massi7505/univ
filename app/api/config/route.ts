import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const configs = await prisma.appConfig.findMany()
  const map = Object.fromEntries(configs.map(c => [c.key, c.value]))
  // Mask password
  if (map.smtp_password) map.smtp_password = '••••••••'
  return NextResponse.json(map)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== 'string') continue
    // Don't overwrite password if it's masked
    if (key === 'smtp_password' && value === '••••••••') continue
    await prisma.appConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  }

  return NextResponse.json({ message: 'Config saved' })
}


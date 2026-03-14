import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const configs = await prisma.appConfig.findMany({
    where: { key: { in: ['app_name', 'logo_url', 'favicon_url'] } },
  })
  return NextResponse.json(Object.fromEntries(configs.map(c => [c.key, c.value])))
}

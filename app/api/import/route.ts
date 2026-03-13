import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { importXlsFile } from '@/lib/import'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const result = await importXlsFile(buffer)

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: 'Import failed: ' + (err instanceof Error ? err.message : 'Unknown') }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { prisma } from '@/lib/prisma'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const slot = formData.get('slot') as string | null

  if (!file || !slot || !['logo', 'favicon'].includes(slot)) {
    return NextResponse.json({ error: 'Fichier ou slot invalide' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Seules les images sont acceptées' }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Taille maximale : 2 Mo' }, { status: 400 })
  }

  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `${slot}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // Utilise __dirname pour trouver le chemin absolu du projet
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Crée le dossier s'il n'existe pas
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    const url = `/uploads/${filename}`
    const configKey = slot === 'logo' ? 'logo_url' : 'favicon_url'

    // Sauvegarde directement en base, pas besoin de cliquer "Enregistrer"
    await prisma.appConfig.upsert({
      where: { key: configKey },
      create: { key: configKey, value: url },
      update: { value: url },
    })

    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: `Erreur serveur : ${err?.message || 'inconnue'}` }, { status: 500 })
  }
}

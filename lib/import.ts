import * as XLSX from 'xlsx'
import { prisma } from './prisma'
import { parsePackaging } from './utils'

interface ImportRow {
  CAS?: string
  Name?: string
  'Molar Mass'?: number | string
  Stock?: string
  Packaging?: string
  Brand?: string
  Toxic?: string | boolean
  CMR?: string | boolean
  'Pureté % '?: number | string
  'etat physique'?: string
  'Bâtiment'?: string
  Salle?: string
  Armoire?: string
  'Étagère'?: string
  [key: string]: unknown
}

export async function importXlsFile(buffer: Buffer): Promise<{ imported: number; errors: string[] }> {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet)

  let imported = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    try {
      const buildingName = String(row['Bâtiment'] || row['Batiment'] || row['batiment'] || '').trim()
      const roomName = String(row['Salle'] || row['salle'] || '').trim()
      const cabinetName = String(row['Armoire'] || row['armoire'] || '').trim()
      const shelfName = String(row['Étagère'] || row['Etagere'] || row['etagere'] || '').trim()
      const productName = String(row['Name'] || row['Nom'] || '').trim()

      if (!productName) { errors.push(`Row ${rowNum}: Missing product name`); continue }
      if (!buildingName || !roomName || !cabinetName || !shelfName) {
        errors.push(`Row ${rowNum}: Missing location info`); continue
      }

      // Upsert location hierarchy
      const building = await prisma.building.upsert({
        where: { name: buildingName },
        create: { name: buildingName },
        update: {},
      })

      const room = await prisma.room.upsert({
        where: { name_buildingId: { name: roomName, buildingId: building.id } },
        create: { name: roomName, buildingId: building.id },
        update: {},
      })

      const cabinet = await prisma.cabinet.upsert({
        where: { name_roomId: { name: cabinetName, roomId: room.id } },
        create: { name: cabinetName, roomId: room.id },
        update: {},
      })

      const shelf = await prisma.shelf.upsert({
        where: { name_cabinetId: { name: shelfName, cabinetId: cabinet.id } },
        create: { name: shelfName, cabinetId: cabinet.id },
        update: {},
      })

      const packagingRaw = String(row['Packaging'] || '')
      const { value: packagingValue, unit: packagingUnit } = parsePackaging(packagingRaw)

      const purity = row['Pureté % ']
      let purityPercent: number | null = null
      if (purity !== undefined && purity !== null && purity !== '') {
        const val = parseFloat(String(purity))
        purityPercent = isNaN(val) ? null : val > 1 ? val / 100 : val
      }

      const toxic = row['Toxic']
      const cmr = row['CMR']

      await prisma.product.create({
        data: {
          cas: String(row['CAS'] || '').trim() || null,
          name: productName,
          molarMass: row['Molar Mass'] ? parseFloat(String(row['Molar Mass'])) : null,
          stock: String(row['Stock'] || '').trim() || null,
          packagingValue,
          packagingUnit,
          brand: String(row['Brand'] || '').trim() || null,
          toxic: toxic === true || String(toxic).toLowerCase() === 'oui' || String(toxic).toLowerCase() === 'yes',
          cmr: cmr === true || String(cmr).toLowerCase() === 'oui' || String(cmr).toLowerCase() === 'yes',
          purityPercent,
          physicalState: String(row['etat physique'] || '').trim() || null,
          shelfId: shelf.id,
          active: true,
        },
      })

      imported++
    } catch (err) {
      errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return { imported, errors }
}


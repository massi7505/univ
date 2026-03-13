import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@UnivBase.local' },
    create: {
      email: 'admin@UnivBase.local',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'UnivBase',
      role: 'ADMIN',
      active: true,
    },
    update: {},
  })
  console.log('✅ Admin user:', admin.email, '/ password: admin123')

  // Create demo student
  const studentPassword = await bcrypt.hash('student123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@UnivBase.local' },
    create: {
      email: 'student@UnivBase.local',
      password: studentPassword,
      firstName: 'Marie',
      lastName: 'Curie',
      role: 'STUDENT',
      active: true,
    },
    update: {},
  })
  console.log('✅ Student user:', student.email, '/ password: student123')

  // Create default locations
  const buildingA = await prisma.building.upsert({
    where: { name: 'Building A' },
    create: { name: 'Building A' },
    update: {},
  })

  const roomC204 = await prisma.room.upsert({
    where: { name_buildingId: { name: 'Salle C204', buildingId: buildingA.id } },
    create: { name: 'Salle C204', buildingId: buildingA.id },
    update: {},
  })

  const cabinet1 = await prisma.cabinet.upsert({
    where: { name_roomId: { name: 'Armoire 1', roomId: roomC204.id } },
    create: { name: 'Armoire 1', roomId: roomC204.id },
    update: {},
  })

  const shelf = await prisma.shelf.upsert({
    where: { name_cabinetId: { name: '112-1-A', cabinetId: cabinet1.id } },
    create: { name: '112-1-A', cabinetId: cabinet1.id },
    update: {},
  })

  // Create demo products
  const products = [
    { cas: '7732-18-5', name: 'Water', molarMass: 18.02, packagingValue: 1, packagingUnit: 'L', brand: 'Sigma', physicalState: 'liquid', purityPercent: 1.0 },
    { cas: '64-17-5', name: 'Ethanol', molarMass: 46.07, packagingValue: 500, packagingUnit: 'mL', brand: 'Acros', physicalState: 'liquid', purityPercent: 0.995, toxic: true },
    { cas: '67-64-1', name: 'Acetone', molarMass: 58.08, packagingValue: 1, packagingUnit: 'L', brand: 'Sigma', physicalState: 'liquid', purityPercent: 0.99 },
    { cas: '56-45-1', name: 'L-Serine', molarMass: 105.09, packagingValue: 25, packagingUnit: 'g', brand: 'Sigma', physicalState: 'solid', purityPercent: 0.985 },
  ]

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { cas: p.cas } })
    if (!existing) {
      await prisma.product.create({ data: { ...p, shelfId: shelf.id, active: true } })
    }
  }
  console.log('✅ Demo products created')

  // Default app config
  await prisma.appConfig.upsert({ where: { key: 'otp_expiry_minutes' }, create: { key: 'otp_expiry_minutes', value: '10' }, update: {} })
  console.log('✅ Default config set')

  console.log('\n🎉 Seed complete!')
  console.log('   Admin:   admin@UnivBase.local / admin123')
  console.log('   Student: student@UnivBase.local / student123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())


import { PrismaClient } from '../node_modules/@prisma/client/default.js'
import bcrypt from '../node_modules/bcryptjs/index.js'

const prisma = new PrismaClient()

const hash = await bcrypt.hash('Vellie123!', 10)

const existing = await prisma.user.findUnique({ where: { email: 'velliewear@gmail.com' } })
if (existing) {
  await prisma.user.update({ where: { email: 'velliewear@gmail.com' }, data: { password: hash, needsPasswordSetup: false } })
  console.log('Updated existing user password')
} else {
  await prisma.user.create({
    data: {
      name: 'Vellie',
      email: 'velliewear@gmail.com',
      password: hash,
      tier: 'basic',
      role: 'student',
      needsPasswordSetup: false,
    }
  })
  console.log('Created new user')
}

await prisma.$disconnect()
console.log('Done')

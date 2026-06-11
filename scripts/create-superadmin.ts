import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const email = 'superadmin@boutiko.pro'
  const password = 'SuperAdmin123!'
  const name = 'Super Admin'

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await db.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role: 'SUPER_ADMIN',
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ SuperAdmin créé avec succès !')
  console.log(`   Email        : ${user.email}`)
  console.log(`   Mot de passe : ${password}`)
  console.log(`   Rôle         : ${user.role}`)
  console.log(`   ID           : ${user.id}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())

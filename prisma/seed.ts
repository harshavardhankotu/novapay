import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { seedDemoUser, DEMO_EMAIL, DEMO_PASSWORD } from "./seed-data"
import { APP_NAME } from "../src/lib/constants"

const adapter = new PrismaLibSql({ url: "file:dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  const result = await seedDemoUser(prisma as any)
  if (result.created) {
    console.log("")
    console.log(`🚀 ${APP_NAME} seed completed!`)
    console.log(`📧 Email: ${DEMO_EMAIL}`)
    console.log(`🔑 Password: ${DEMO_PASSWORD}`)
    console.log("📱 Phone: 9999999999")
  } else if (result.migrated) {
    console.log("")
    console.log(`🔄 ${APP_NAME} migrated legacy seed user!`)
    console.log(`📧 Email: ${DEMO_EMAIL}`)
    console.log(`🔑 Password: ${DEMO_PASSWORD}`)
    console.log("📱 Phone: 9999999999")
  } else {
    console.log("Seed user already exists")
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
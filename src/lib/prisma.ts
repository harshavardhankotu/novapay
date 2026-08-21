import { PrismaClient } from "@/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaLibSql({ url: `file:${process.env.DATABASE_URL?.replace("file:", "") || "dev.db"}` }),
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

import { PrismaClient } from "@/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "file:dev.db"

  // Remote libSQL (e.g. Turso free tier): libsql://xxx.turso.io + auth token
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    return new PrismaClient({
      adapter: new PrismaLibSql({
        url,
        authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
      }),
    })
  }

  // Local SQLite file (default dev mode)
  return new PrismaClient({
    adapter: new PrismaLibSql({ url: `file:${url.replace("file:", "")}` }),
  })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
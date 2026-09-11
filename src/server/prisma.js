import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("A variável DATABASE_URL não está definida.");
  }

  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl,
  });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__caldoVerdePrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__caldoVerdePrisma = prisma;
}

export default prisma;

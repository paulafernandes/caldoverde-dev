import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import prismaImport from "../src/server/prisma.js";

const prisma = prismaImport.default ?? prismaImport;

const BACKUP_PATH = path.resolve(
  process.cwd(),
  "..",
  "business-settings-backup.json"
);

async function main() {
  const contents = await readFile(BACKUP_PATH, "utf8");

  const backup = JSON.parse(contents);

  if (!backup.settings) {
    throw new Error("O ficheiro de backup não é válido.");
  }

  const { id, createdAt, updatedAt, ...settings } = backup.settings;

  if (id !== "business") {
    throw new Error(
      'O backup não pertence ao registo BusinessSettings "business".'
    );
  }

  await prisma.businessSettings.update({
    where: {
      id: "business",
    },
    data: settings,
  });

  console.log(`BusinessSettings restaurado a partir de: ${BACKUP_PATH}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

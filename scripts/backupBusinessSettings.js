import "dotenv/config";

import { access, writeFile } from "node:fs/promises";
import path from "node:path";

import prismaImport from "../src/server/prisma.js";

const prisma = prismaImport.default ?? prismaImport;

const BACKUP_PATH = path.resolve(
  process.cwd(),
  "..",
  "business-settings-backup.json"
);

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await fileExists(BACKUP_PATH)) {
    throw new Error(
      `Já existe um backup em ${BACKUP_PATH}. ` +
        "Restaura ou remove esse ficheiro antes de criar um novo."
    );
  }

  const settings = await prisma.businessSettings.findUnique({
    where: {
      id: "business",
    },
  });

  if (!settings) {
    throw new Error('Não foi encontrado BusinessSettings com id "business".');
  }

  await writeFile(
    BACKUP_PATH,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        settings,
      },
      null,
      2
    ),
    {
      encoding: "utf8",
      mode: 0o600,
    }
  );

  console.log(`Backup criado: ${BACKUP_PATH}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

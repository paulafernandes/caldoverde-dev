import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import menuCategories from "../src/data/menuCategories.js";

const languages = ["pt", "es", "en"] as const;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("A variável DATABASE_URL não está definida.");
}

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const existingCategoryCount =
    await prisma.menuCategory.count();

  if (existingCategoryCount > 0) {
    throw new Error(
      "Importação cancelada: a base de dados já contém categorias."
    );
  }

  await prisma.$transaction(
    menuCategories.map((category, categoryIndex) =>
      prisma.menuCategory.create({
        data: {
          slug: category.id,
          imagePath: category.image,
          position: categoryIndex + 1,
          isVisible: true,

          translations: {
            create: languages.map((language) => ({
              language,
              label: category.label[language],
              title: category.title[language],
            })),
          },

          items: {
            create: category.items.map(
              (item, itemIndex) => ({
                priceText:
                  item.price === null
                    ? null
                    : `${String(item.price).replace(".", ",")} €`,
                position: itemIndex + 1,
                isVisible: true,

                translations: {
                  create: languages.map((language) => ({
                    language,
                    name: item.name[language],
                    description: item.description[language],
                  })),
                },
              })
            ),
          },
        },
      })
    )
  );

  const [
    categoryCount,
    itemCount,
    categoryTranslationCount,
    itemTranslationCount,
  ] = await Promise.all([
    prisma.menuCategory.count(),
    prisma.menuItem.count(),
    prisma.menuCategoryTranslation.count(),
    prisma.menuItemTranslation.count(),
  ]);

  console.log("Importação concluída:");
  console.log(`- ${categoryCount} categorias`);
  console.log(`- ${itemCount} pratos`);
  console.log(
    `- ${categoryTranslationCount} traduções de categorias`
  );
  console.log(
    `- ${itemTranslationCount} traduções de pratos`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

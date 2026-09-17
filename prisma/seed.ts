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

async function seedBusinessSettings() {
  const settingsId = "business";

  await prisma.businessSettings.upsert({
    where: {
      id: settingsId,
    },
    update: {},
    create: {
      id: settingsId,
      name: "Caldo Verde",
      defaultLanguage: "es",
    },
  });

  const businessLanguages = [
    { language: "es", locale: "es_ES", position: 1 },
    { language: "pt", locale: "pt_PT", position: 2 },
    { language: "en", locale: "en_GB", position: 3 },
  ];

  const settingsTranslations = [
    {
      language: "es",
      seoTitle: "Caldo Verde | Restaurante portugués",
      seoDescription:
        "Descubre los sabores tradicionales de Portugal en el Restaurante Caldo Verde.",
    },
    {
      language: "pt",
      seoTitle: "Caldo Verde | Restaurante português",
      seoDescription:
        "Descubra os sabores tradicionais de Portugal no Restaurante Caldo Verde.",
    },
    {
      language: "en",
      seoTitle: "Caldo Verde | Portuguese restaurant",
      seoDescription:
        "Discover traditional Portuguese flavours at Caldo Verde Restaurant.",
    },
  ];

  for (const translation of settingsTranslations) {
    await prisma.businessSettingsTranslation.upsert({
      where: {
        settingsId_language: {
          settingsId,
          language: translation.language,
        },
      },
      update: {},
      create: {
        settingsId,
        language: translation.language,
        seoTitle: translation.seoTitle,
        seoDescription: translation.seoDescription,
      },
    });
  }

  for (const entry of businessLanguages) {
    await prisma.businessLanguage.upsert({
      where: {
        settingsId_language: {
          settingsId,
          language: entry.language,
        },
      },
      update: {},
      create: {
        settingsId,
        language: entry.language,
        locale: entry.locale,
        isEnabled: true,
        position: entry.position,
      },
    });
  }

  console.log("Configuração inicial do negócio concluída.");
}

async function seedMenu() {
  const existingCategoryCount = await prisma.menuCategory.count();

  if (existingCategoryCount > 0) {
    console.log(
      "Importação da ementa ignorada: a base de dados já contém categorias."
    );
    return;
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
            create: category.items.map((item, itemIndex) => ({
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
            })),
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

  console.log("Importação da ementa concluída:");
  console.log(`- ${categoryCount} categorias`);
  console.log(`- ${itemCount} pratos`);
  console.log(`- ${categoryTranslationCount} traduções de categorias`);
  console.log(`- ${itemTranslationCount} traduções de pratos`);
}

async function main() {
  await seedBusinessSettings();
  await seedMenu();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

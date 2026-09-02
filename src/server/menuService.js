import prisma from "./prisma";

const supportedLanguages = ["pt", "es", "en"];

function mapTranslations(translations, field) {
  const valuesByLanguage = Object.fromEntries(
    translations.map((translation) => [
      translation.language,
      translation[field],
    ])
  );

  const fallback =
    valuesByLanguage.es ??
    valuesByLanguage.pt ??
    valuesByLanguage.en ??
    "";

  return Object.fromEntries(
    supportedLanguages.map((language) => [
      language,
      valuesByLanguage[language] ?? fallback,
    ])
  );
}

export async function getPublicMenuCategories() {
  const categories = await prisma.menuCategory.findMany({
    where: {
      isVisible: true,
      imagePath: {
        not: null,
      },
      items: {
        some: {
          isVisible: true,
        },
      },
    },

    orderBy: [
      {
        position: "asc",
      },
      {
        id: "asc",
      },
    ],

    include: {
      translations: true,

      items: {
        where: {
          isVisible: true,
        },

        orderBy: [
          {
            position: "asc",
          },
          {
            id: "asc",
          },
        ],

        include: {
          translations: true,
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.slug,
    label: mapTranslations(
      category.translations,
      "label"
    ),
    title: mapTranslations(
      category.translations,
      "title"
    ),
    image: category.imagePath,

    items: category.items.map((item) => ({
      id: item.id,
      name: mapTranslations(item.translations, "name"),
      description: mapTranslations(
        item.translations,
        "description"
      ),
      price:
        item.priceCents === null
          ? null
          : item.priceCents / 100,
    })),
  }));
}
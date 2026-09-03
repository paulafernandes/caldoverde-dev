import prisma from "./prisma";

const supportedLanguages = ["pt", "es", "en"];

const defaultCategoryImage =
  "/assets/images/bg/azulejo_portugues.jpg";

function mapTranslations(translations, field) {
  const valuesByLanguage = Object.fromEntries(
    translations.map((translation) => [
      translation.language,
      translation[field],
    ])
  );

  const fallback =
    supportedLanguages
      .map((language) => valuesByLanguage[language])
      .find(
        (value) =>
          typeof value === "string" &&
          value.trim().length > 0
      ) ?? "";

  return Object.fromEntries(
    supportedLanguages.map((language) => {
      const value = valuesByLanguage[language];

      const translatedValue =
        typeof value === "string" &&
          value.trim().length > 0
          ? value
          : fallback;

      return [language, translatedValue];
    })
  );
}

export async function getPublicMenuCategories() {
  const categories = await prisma.menuCategory.findMany({
    where: {
      isVisible: true,
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
    image:
      category.imagePath || defaultCategoryImage,

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
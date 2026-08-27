import prisma from "./prisma";

const supportedLanguages = ["pt", "es", "en"];

function mapTranslationRecords(
  translations,
  fields
) {
  return Object.fromEntries(
    supportedLanguages.map((language) => {
      const translation = translations.find(
        (record) => record.language === language
      );

      const values = Object.fromEntries(
        fields.map((field) => [
          field,
          translation?.[field] ?? "",
        ])
      );

      return [language, values];
    })
  );
}

export async function getAdminMenuCategories() {
  const categories = await prisma.menuCategory.findMany({
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
    id: category.id,
    slug: category.slug,
    imagePath: category.imagePath,
    position: category.position,
    isVisible: category.isVisible,

    translations: mapTranslationRecords(
      category.translations,
      ["label", "title"]
    ),

    items: category.items.map((item) => ({
      id: item.id,
      priceCents: item.priceCents,
      position: item.position,
      isVisible: item.isVisible,

      translations: mapTranslationRecords(
        item.translations,
        ["name", "description"]
      ),
    })),
  }));
}

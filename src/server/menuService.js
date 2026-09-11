import prisma from "./prisma";

const supportedLanguages = ["pt", "es", "en"];

const defaultCategoryImage = "/assets/images/bg/azulejo_portugues.jpg";

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
      .find((value) => typeof value === "string" && value.trim().length > 0) ??
    "";

  return Object.fromEntries(
    supportedLanguages.map((language) => {
      const value = valuesByLanguage[language];

      const translatedValue =
        typeof value === "string" && value.trim().length > 0 ? value : fallback;

      return [language, translatedValue];
    })
  );
}

function mapOptionalTranslations(translations, field) {
  const valuesByLanguage = Object.fromEntries(
    translations.map((translation) => [
      translation.language,
      translation[field] ?? "",
    ])
  );

  return Object.fromEntries(
    supportedLanguages.map((language) => [
      language,
      valuesByLanguage[language] ?? "",
    ])
  );
}

function mapPublicItem(item) {
  return {
    id: item.id,

    name: mapTranslations(item.translations, "name"),

    description: mapTranslations(item.translations, "description"),

    price: item.priceText,
  };
}

export async function getPublicMenuCategories() {
  const categories = await prisma.menuCategory.findMany({
    where: {
      isVisible: true,
      items: {
        some: {
          isVisible: true,

          OR: [
            {
              subcategoryId: null,
            },
            {
              subcategory: {
                isVisible: true,
              },
            },
          ],
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
      subcategories: {
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
      },
      translations: true,

      items: {
        where: {
          isVisible: true,
          subcategoryId: null,
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

  return categories.map((category) => {
    const categoryTitle = mapTranslations(category.translations, "title");

    const sections = [
      ...(category.items.length > 0
        ? [
            {
              id: `category-${category.id}`,
              title: categoryTitle,
              items: category.items.map(mapPublicItem),
            },
          ]
        : []),

      ...category.subcategories
        .filter((subcategory) => subcategory.items.length > 0)
        .map((subcategory) => ({
          id: `subcategory-${subcategory.id}`,

          title: mapTranslations(subcategory.translations, "name"),

          items: subcategory.items.map(mapPublicItem),
        })),
    ];

    return {
      id: category.slug,

      label: mapTranslations(category.translations, "label"),

      title: categoryTitle,

      highlightText: mapOptionalTranslations(
        category.translations,
        "highlightText"
      ),

      image: category.imagePath || defaultCategoryImage,

      sections,
    };
  });
}

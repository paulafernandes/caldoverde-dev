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

export async function updateAdminMenuItem(
  itemId,
  input
) {
  return prisma.$transaction(async (transaction) => {
    const existingItem =
      await transaction.menuItem.findUnique({
        where: {
          id: itemId,
        },

        select: {
          id: true,
        },
      });

    if (!existingItem) {
      return null;
    }

    await transaction.menuItem.update({
      where: {
        id: itemId,
      },

      data: {
        priceCents: input.priceCents,
        isVisible: input.isVisible,
      },
    });

    for (const language of supportedLanguages) {
      const translation =
        input.translations[language];

      await transaction.menuItemTranslation.upsert({
        where: {
          itemId_language: {
            itemId,
            language,
          },
        },

        update: {
          name: translation.name,
          description: translation.description,
        },

        create: {
          itemId,
          language,
          name: translation.name,
          description: translation.description,
        },
      });
    }

    const updatedItem =
      await transaction.menuItem.findUnique({
        where: {
          id: itemId,
        },

        include: {
          translations: true,
        },
      });

    return {
      id: updatedItem.id,
      priceCents: updatedItem.priceCents,
      position: updatedItem.position,
      isVisible: updatedItem.isVisible,

      translations: mapTranslationRecords(
        updatedItem.translations,
        ["name", "description"]
      ),
    };
  });
}

export async function updateAdminMenuCategory(
  categoryId,
  input
) {
  return prisma.$transaction(async (transaction) => {
    const existingCategory =
      await transaction.menuCategory.findUnique({
        where: {
          id: categoryId,
        },

        select: {
          id: true,
        },
      });

    if (!existingCategory) {
      return null;
    }

    await transaction.menuCategory.update({
      where: {
        id: categoryId,
      },

      data: {
        imagePath: input.imagePath,
        isVisible: input.isVisible,
      },
    });

    for (const language of supportedLanguages) {
      const translation =
        input.translations[language];

      await transaction.menuCategoryTranslation.upsert({
        where: {
          categoryId_language: {
            categoryId,
            language,
          },
        },

        update: {
          label: translation.label,
          title: translation.title,
        },

        create: {
          categoryId,
          language,
          label: translation.label,
          title: translation.title,
        },
      });
    }

    const updatedCategory =
      await transaction.menuCategory.findUnique({
        where: {
          id: categoryId,
        },

        include: {
          translations: true,
        },
      });

    return {
      id: updatedCategory.id,
      slug: updatedCategory.slug,
      imagePath: updatedCategory.imagePath,
      position: updatedCategory.position,
      isVisible: updatedCategory.isVisible,

      translations: mapTranslationRecords(
        updatedCategory.translations,
        ["label", "title"]
      ),
    };
  });
}

export async function createAdminMenuItem(input) {
  return prisma.$transaction(async (transaction) => {
    const category =
      await transaction.menuCategory.findUnique({
        where: {
          id: input.categoryId,
        },

        select: {
          id: true,
        },
      });

    if (!category) {
      return null;
    }

    const positionResult =
      await transaction.menuItem.aggregate({
        where: {
          categoryId: input.categoryId,
        },

        _max: {
          position: true,
        },
      });

    const nextPosition =
      (positionResult._max.position ?? 0) + 1;

    const createdItem =
      await transaction.menuItem.create({
        data: {
          categoryId: input.categoryId,
          priceCents: input.priceCents,
          position: nextPosition,
          isVisible: input.isVisible,
        },
      });

    for (const language of supportedLanguages) {
      const translation =
        input.translations[language];

      await transaction.menuItemTranslation.create({
        data: {
          itemId: createdItem.id,
          language,
          name: translation.name,
          description: translation.description,
        },
      });
    }

    const item =
      await transaction.menuItem.findUnique({
        where: {
          id: createdItem.id,
        },

        include: {
          translations: true,
        },
      });

    return {
      id: item.id,
      categoryId: item.categoryId,
      priceCents: item.priceCents,
      position: item.position,
      isVisible: item.isVisible,

      translations: mapTranslationRecords(
        item.translations,
        ["name", "description"]
      ),
    };
  });
}

export async function deleteAdminMenuItem(itemId) {
  return prisma.$transaction(async (transaction) => {
    const existingItem =
      await transaction.menuItem.findUnique({
        where: {
          id: itemId,
        },

        select: {
          id: true,
          categoryId: true,
        },
      });

    if (!existingItem) {
      return false;
    }

    await transaction.menuItem.delete({
      where: {
        id: itemId,
      },
    });

    const remainingItems =
      await transaction.menuItem.findMany({
        where: {
          categoryId: existingItem.categoryId,
        },

        orderBy: [
          {
            position: "asc",
          },
          {
            id: "asc",
          },
        ],

        select: {
          id: true,
        },
      });

    for (
      let index = 0;
      index < remainingItems.length;
      index += 1
    ) {
      await transaction.menuItem.update({
        where: {
          id: remainingItems[index].id,
        },

        data: {
          position: index + 1,
        },
      });
    }

    return true;
  });
}
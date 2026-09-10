import prisma from "./prisma";

const supportedLanguages = ["pt", "es", "en"];

function createSlug(value) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "categoria";
}

async function createUniqueCategorySlug(
  transaction,
  label
) {
  const baseSlug = createSlug(label);

  let slug = baseSlug;
  let suffix = 2;

  while (
    await transaction.menuCategory.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
      },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

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

function mapAdminSubcategory(subcategory) {
  return {
    id: subcategory.id,
    categoryId: subcategory.categoryId,
    position: subcategory.position,
    isVisible: subcategory.isVisible,

    translations: mapTranslationRecords(
      subcategory.translations,
      ["name"]
    ),
  };
}

async function subcategoryBelongsToCategory(
  transaction,
  subcategoryId,
  categoryId
) {
  if (subcategoryId === null) {
    return true;
  }

  const subcategory =
    await transaction.menuSubcategory.findFirst({
      where: {
        id: subcategoryId,
        categoryId,
      },

      select: {
        id: true,
      },
    });

  return Boolean(subcategory);
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

      subcategories: {
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

    subcategories: category.subcategories.map(
      mapAdminSubcategory
    ),

    translations: mapTranslationRecords(
      category.translations,
      ["label", "title", "highlightText"]
    ),

    items: category.items.map((item) => ({
      id: item.id,
      subcategoryId: item.subcategoryId,
      imagePath: item.imagePath,
      priceText: item.priceText,
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
          categoryId: true,
        },
      });

    if (!existingItem) {
      return null;
    }

    const hasValidSubcategory =
      await subcategoryBelongsToCategory(
        transaction,
        input.subcategoryId,
        existingItem.categoryId
      );

    if (!hasValidSubcategory) {
      return false;
    }

    await transaction.menuItem.update({
      where: {
        id: itemId,
      },

      data: {
        imagePath: input.imagePath,
        priceText: input.priceText,
        isVisible: input.isVisible,
        subcategoryId: input.subcategoryId,
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
      subcategoryId: updatedItem.subcategoryId,
      imagePath: updatedItem.imagePath,
      priceText: updatedItem.priceText,
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
          highlightText:
            translation.highlightText || null,
        },

        create: {
          categoryId,
          language,
          label: translation.label,
          title: translation.title,
          highlightText:
            translation.highlightText || null,
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
        ["label", "title", "highlightText"]
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

    const hasValidSubcategory =
      await subcategoryBelongsToCategory(
        transaction,
        input.subcategoryId,
        input.categoryId
      );

    if (!hasValidSubcategory) {
      return false;
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
          subcategoryId: input.subcategoryId,
          imagePath: input.imagePath,
          priceText: input.priceText,
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
      subcategoryId: item.subcategoryId,
      imagePath: item.imagePath,
      priceText: item.priceText,
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

export async function moveAdminMenuItem(
  itemId,
  direction
) {
  return prisma.$transaction(async (transaction) => {
    const item =
      await transaction.menuItem.findUnique({
        where: {
          id: itemId,
        },

        select: {
          id: true,
          categoryId: true,
          subcategoryId: true,
          position: true,
        },
      });

    if (!item) {
      return null;
    }

    const adjacentItem =
      await transaction.menuItem.findFirst({
        where: {
          categoryId: item.categoryId,
          subcategoryId: item.subcategoryId,

          position:
            direction === "up"
              ? {
                lt: item.position,
              }
              : {
                gt: item.position,
              },
        },

        orderBy:
          direction === "up"
            ? [
              {
                position: "desc",
              },
              {
                id: "desc",
              },
            ]
            : [
              {
                position: "asc",
              },
              {
                id: "asc",
              },
            ],

        select: {
          id: true,
          position: true,
        },
      });

    if (!adjacentItem) {
      return {
        moved: false,
        position: item.position,
      };
    }

    await transaction.menuItem.update({
      where: {
        id: item.id,
      },

      data: {
        position: adjacentItem.position,
      },
    });

    await transaction.menuItem.update({
      where: {
        id: adjacentItem.id,
      },

      data: {
        position: item.position,
      },
    });

    return {
      moved: true,
      position: adjacentItem.position,
    };
  });
}

export async function moveAdminMenuCategory(
  categoryId,
  direction
) {
  return prisma.$transaction(async (transaction) => {
    const category =
      await transaction.menuCategory.findUnique({
        where: {
          id: categoryId,
        },

        select: {
          id: true,
          position: true,
        },
      });

    if (!category) {
      return null;
    }

    const adjacentCategory =
      await transaction.menuCategory.findFirst({
        where: {
          position:
            direction === "up"
              ? {
                lt: category.position,
              }
              : {
                gt: category.position,
              },
        },

        orderBy:
          direction === "up"
            ? [
              {
                position: "desc",
              },
              {
                id: "desc",
              },
            ]
            : [
              {
                position: "asc",
              },
              {
                id: "asc",
              },
            ],

        select: {
          id: true,
          position: true,
        },
      });

    if (!adjacentCategory) {
      return {
        moved: false,
        position: category.position,
      };
    }

    await transaction.menuCategory.update({
      where: {
        id: category.id,
      },

      data: {
        position: adjacentCategory.position,
      },
    });

    await transaction.menuCategory.update({
      where: {
        id: adjacentCategory.id,
      },

      data: {
        position: category.position,
      },
    });

    return {
      moved: true,
      position: adjacentCategory.position,
    };
  });
}

export async function createAdminMenuCategory(
  input
) {
  return prisma.$transaction(async (transaction) => {
    const slugSource =
      input.translations.pt.label ||
      input.translations.es.label ||
      input.translations.en.label;

    const slug =
      await createUniqueCategorySlug(
        transaction,
        slugSource
      );

    const positionResult =
      await transaction.menuCategory.aggregate({
        _max: {
          position: true,
        },
      });

    const nextPosition =
      (positionResult._max.position ?? 0) + 1;

    const createdCategory =
      await transaction.menuCategory.create({
        data: {
          slug,
          imagePath: input.imagePath,
          position: nextPosition,
          isVisible: input.isVisible,
        },
      });

    for (const language of supportedLanguages) {
      const translation =
        input.translations[language];

      await transaction.menuCategoryTranslation.create({
        data: {
          categoryId: createdCategory.id,
          language,
          label: translation.label,
          title: translation.title,
          highlightText:
            translation.highlightText || null,
        },
      });
    }

    const category =
      await transaction.menuCategory.findUnique({
        where: {
          id: createdCategory.id,
        },

        include: {
          translations: true,
        },
      });

    return {
      id: category.id,
      slug: category.slug,
      imagePath: category.imagePath,
      position: category.position,
      isVisible: category.isVisible,

      translations: mapTranslationRecords(
        category.translations,
        ["label", "title", "highlightText"]
      ),

      subcategories: [],
      items: [],
    };
  });
}

export async function deleteAdminMenuCategory(
  categoryId
) {
  return prisma.$transaction(async (transaction) => {
    const category =
      await transaction.menuCategory.findUnique({
        where: {
          id: categoryId,
        },

        select: {
          id: true,

          _count: {
            select: {
              items: true,
            },
          },
        },
      });

    if (!category) {
      return {
        status: "not-found",
      };
    }

    if (category._count.items > 0) {
      return {
        status: "not-empty",
        itemCount: category._count.items,
      };
    }

    await transaction.menuCategory.delete({
      where: {
        id: categoryId,
      },
    });

    const remainingCategories =
      await transaction.menuCategory.findMany({
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
      index < remainingCategories.length;
      index += 1
    ) {
      await transaction.menuCategory.update({
        where: {
          id: remainingCategories[index].id,
        },

        data: {
          position: index + 1,
        },
      });
    }

    return {
      status: "deleted",
    };
  });
}

export async function createAdminMenuSubcategory(
  input
) {
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
      await transaction.menuSubcategory.aggregate({
        where: {
          categoryId: input.categoryId,
        },

        _max: {
          position: true,
        },
      });

    const nextPosition =
      (positionResult._max.position ?? 0) + 1;

    const createdSubcategory =
      await transaction.menuSubcategory.create({
        data: {
          categoryId: input.categoryId,
          position: nextPosition,
          isVisible: input.isVisible,
        },
      });

    for (const language of supportedLanguages) {
      const translation =
        input.translations[language];

      await transaction.menuSubcategoryTranslation.create({
        data: {
          subcategoryId: createdSubcategory.id,
          language,
          name: translation.name,
        },
      });
    }

    const subcategory =
      await transaction.menuSubcategory.findUnique({
        where: {
          id: createdSubcategory.id,
        },

        include: {
          translations: true,
        },
      });

    return mapAdminSubcategory(subcategory);
  });
}

export async function updateAdminMenuSubcategory(
  subcategoryId,
  input
) {
  return prisma.$transaction(async (transaction) => {
    const existingSubcategory =
      await transaction.menuSubcategory.findUnique({
        where: {
          id: subcategoryId,
        },

        select: {
          id: true,
        },
      });

    if (!existingSubcategory) {
      return null;
    }

    await transaction.menuSubcategory.update({
      where: {
        id: subcategoryId,
      },

      data: {
        isVisible: input.isVisible,
      },
    });

    for (const language of supportedLanguages) {
      const translation =
        input.translations[language];

      await transaction.menuSubcategoryTranslation.upsert({
        where: {
          subcategoryId_language: {
            subcategoryId,
            language,
          },
        },

        update: {
          name: translation.name,
        },

        create: {
          subcategoryId,
          language,
          name: translation.name,
        },
      });
    }

    const updatedSubcategory =
      await transaction.menuSubcategory.findUnique({
        where: {
          id: subcategoryId,
        },

        include: {
          translations: true,
        },
      });

    return mapAdminSubcategory(
      updatedSubcategory
    );
  });
}

export async function deleteAdminMenuSubcategory(
  subcategoryId
) {
  return prisma.$transaction(async (transaction) => {
    const subcategory =
      await transaction.menuSubcategory.findUnique({
        where: {
          id: subcategoryId,
        },

        select: {
          id: true,
          categoryId: true,
        },
      });

    if (!subcategory) {
      return {
        status: "not-found",
      };
    }

    await transaction.menuSubcategory.delete({
      where: {
        id: subcategoryId,
      },
    });

    const remainingSubcategories =
      await transaction.menuSubcategory.findMany({
        where: {
          categoryId: subcategory.categoryId,
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
      index < remainingSubcategories.length;
      index += 1
    ) {
      await transaction.menuSubcategory.update({
        where: {
          id: remainingSubcategories[index].id,
        },

        data: {
          position: index + 1,
        },
      });
    }

    return {
      status: "deleted",
    };
  });
}

export async function moveAdminMenuSubcategory(
  subcategoryId,
  direction
) {
  return prisma.$transaction(async (transaction) => {
    const subcategory =
      await transaction.menuSubcategory.findUnique({
        where: {
          id: subcategoryId,
        },

        select: {
          id: true,
          categoryId: true,
          position: true,
        },
      });

    if (!subcategory) {
      return null;
    }

    const adjacentSubcategory =
      await transaction.menuSubcategory.findFirst({
        where: {
          categoryId: subcategory.categoryId,

          position:
            direction === "up"
              ? {
                lt: subcategory.position,
              }
              : {
                gt: subcategory.position,
              },
        },

        orderBy:
          direction === "up"
            ? [
              {
                position: "desc",
              },
              {
                id: "desc",
              },
            ]
            : [
              {
                position: "asc",
              },
              {
                id: "asc",
              },
            ],

        select: {
          id: true,
          position: true,
        },
      });

    if (!adjacentSubcategory) {
      return {
        moved: false,
        position: subcategory.position,
      };
    }

    await transaction.menuSubcategory.update({
      where: {
        id: subcategory.id,
      },

      data: {
        position: adjacentSubcategory.position,
      },
    });

    await transaction.menuSubcategory.update({
      where: {
        id: adjacentSubcategory.id,
      },

      data: {
        position: subcategory.position,
      },
    });

    return {
      moved: true,
      position: adjacentSubcategory.position,
    };
  });
}
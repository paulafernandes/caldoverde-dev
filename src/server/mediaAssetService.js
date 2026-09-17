import prisma from "./prisma";
import { deleteUploadedImage } from "./imageUploadService";

const BUSINESS_SETTINGS_ID = "business";

function mapTranslations(translations) {
  return Object.fromEntries(
    translations.map((translation) => [
      translation.language,
      {
        altText: translation.altText ?? "",
        caption: translation.caption ?? "",
      },
    ])
  );
}

export async function getMediaAssets() {
  const mediaAssets = await prisma.mediaAsset.findMany({
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
  });

  return mediaAssets.map((mediaAsset) => ({
    id: mediaAsset.id,
    imagePath: mediaAsset.imagePath,
    category: mediaAsset.category,
    position: mediaAsset.position,
    isVisible: mediaAsset.isVisible,

    translations: mapTranslations(mediaAsset.translations),
  }));
}

export async function createMediaAsset(input) {
  return prisma.$transaction(async (transaction) => {
    const languages = await transaction.businessLanguage.findMany({
      where: {
        settingsId: BUSINESS_SETTINGS_ID,
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
        language: true,
      },
    });

    const positionResult = await transaction.mediaAsset.aggregate({
      _max: {
        position: true,
      },
    });

    const nextPosition = (positionResult._max.position ?? 0) + 1;

    const createdMediaAsset = await transaction.mediaAsset.create({
      data: {
        imagePath: input.imagePath,
        category: input.category,
        position: nextPosition,
        isVisible: input.isVisible,
      },
    });

    for (const entry of languages) {
      const translation = input.translations?.[entry.language];

      await transaction.mediaAssetTranslation.create({
        data: {
          mediaId: createdMediaAsset.id,
          language: entry.language,
          altText: translation?.altText || null,
          caption: translation?.caption || null,
        },
      });
    }

    const mediaAsset = await transaction.mediaAsset.findUnique({
      where: {
        id: createdMediaAsset.id,
      },

      include: {
        translations: true,
      },
    });

    return {
      id: mediaAsset.id,
      imagePath: mediaAsset.imagePath,
      category: mediaAsset.category,
      position: mediaAsset.position,
      isVisible: mediaAsset.isVisible,

      translations: mapTranslations(mediaAsset.translations),
    };
  });
}

export async function updateMediaAsset(mediaAssetId, input) {
  return prisma.$transaction(async (transaction) => {
    const existingMediaAsset = await transaction.mediaAsset.findUnique({
      where: {
        id: mediaAssetId,
      },

      select: {
        id: true,
      },
    });

    if (!existingMediaAsset) {
      return null;
    }

    await transaction.mediaAsset.update({
      where: {
        id: mediaAssetId,
      },

      data: {
        imagePath: input.imagePath,
        category: input.category,
        isVisible: input.isVisible,
      },
    });

    const languages = await transaction.businessLanguage.findMany({
      where: {
        settingsId: BUSINESS_SETTINGS_ID,
      },

      select: {
        language: true,
      },
    });

    for (const entry of languages) {
      const translation = input.translations?.[entry.language];

      await transaction.mediaAssetTranslation.upsert({
        where: {
          mediaId_language: {
            mediaId: mediaAssetId,
            language: entry.language,
          },
        },

        update: {
          altText: translation?.altText || null,
          caption: translation?.caption || null,
        },

        create: {
          mediaId: mediaAssetId,
          language: entry.language,
          altText: translation?.altText || null,
          caption: translation?.caption || null,
        },
      });
    }

    const mediaAsset = await transaction.mediaAsset.findUnique({
      where: {
        id: mediaAssetId,
      },

      include: {
        translations: true,
      },
    });

    return {
      id: mediaAsset.id,
      imagePath: mediaAsset.imagePath,
      category: mediaAsset.category,
      position: mediaAsset.position,
      isVisible: mediaAsset.isVisible,

      translations: mapTranslations(mediaAsset.translations),
    };
  });
}

export async function deleteMediaAsset(mediaAssetId) {
  const result = await prisma.$transaction(async (transaction) => {
    const mediaAsset = await transaction.mediaAsset.findUnique({
      where: {
        id: mediaAssetId,
      },

      select: {
        id: true,
        imagePath: true,
      },
    });

    if (!mediaAsset) {
      return null;
    }

    await transaction.mediaAsset.delete({
      where: {
        id: mediaAssetId,
      },
    });

    const remainingMediaAssets = await transaction.mediaAsset.findMany({
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

    for (let index = 0; index < remainingMediaAssets.length; index += 1) {
      await transaction.mediaAsset.update({
        where: {
          id: remainingMediaAssets[index].id,
        },

        data: {
          position: index + 1,
        },
      });
    }

    return {
      imagePath: mediaAsset.imagePath,
    };
  });

  if (!result) {
    return null;
  }

  const imageDeleted = await deleteUploadedImage(result.imagePath);

  return {
    deleted: true,
    imageDeleted,
  };
}

export async function moveMediaAsset(mediaAssetId, direction) {
  return prisma.$transaction(async (transaction) => {
    const mediaAsset = await transaction.mediaAsset.findUnique({
      where: {
        id: mediaAssetId,
      },

      select: {
        id: true,
        position: true,
      },
    });

    if (!mediaAsset) {
      return null;
    }

    const adjacentMediaAsset = await transaction.mediaAsset.findFirst({
      where: {
        position:
          direction === "up"
            ? {
                lt: mediaAsset.position,
              }
            : {
                gt: mediaAsset.position,
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

    if (!adjacentMediaAsset) {
      return {
        moved: false,
        position: mediaAsset.position,
      };
    }

    await transaction.mediaAsset.update({
      where: {
        id: mediaAsset.id,
      },

      data: {
        position: adjacentMediaAsset.position,
      },
    });

    await transaction.mediaAsset.update({
      where: {
        id: adjacentMediaAsset.id,
      },

      data: {
        position: mediaAsset.position,
      },
    });

    return {
      moved: true,
      position: adjacentMediaAsset.position,
    };
  });
}

import prisma from "./prisma";

const BUSINESS_SETTINGS_ID = "business";

function mapTranslations(translations) {
  return Object.fromEntries(
    translations.map((translation) => [
      translation.language,
      {
        seoTitle: translation.seoTitle ?? "",
        seoDescription: translation.seoDescription ?? "",
      },
    ])
  );
}

export async function getBusinessSettings() {
  const settings = await prisma.businessSettings.findUnique({
    where: {
      id: BUSINESS_SETTINGS_ID,
    },

    include: {
      translations: true,

      languages: {
        orderBy: [
          {
            position: "asc",
          },
          {
            id: "asc",
          },
        ],
      },

      socialLinks: {
        orderBy: [
          {
            position: "asc",
          },
          {
            id: "asc",
          },
        ],
      },
    },
  });

  if (!settings) {
    return null;
  }

  return {
    id: settings.id,
    name: settings.name,
    logoPath: settings.logoPath,
    faviconPath: settings.faviconPath,
    email: settings.email,
    phone: settings.phone,
    mobilePhone: settings.mobilePhone,

    addressLine1: settings.addressLine1,
    addressLine2: settings.addressLine2,
    postalCode: settings.postalCode,
    city: settings.city,
    countryCode: settings.countryCode,
    administrativeAreaCode: settings.administrativeAreaCode,

    taxId: settings.taxId,
    fiscalAddressSameAsBusiness: settings.fiscalAddressSameAsBusiness,
    fiscalAddressLine1: settings.fiscalAddressLine1,
    fiscalAddressLine2: settings.fiscalAddressLine2,
    fiscalPostalCode: settings.fiscalPostalCode,
    fiscalCity: settings.fiscalCity,
    fiscalCountryCode: settings.fiscalCountryCode,
    fiscalAdministrativeAreaCode: settings.fiscalAdministrativeAreaCode,

    primaryActionUrl: settings.primaryActionUrl,
    defaultLanguage: settings.defaultLanguage,

    translations: mapTranslations(settings.translations),

    languages: settings.languages.map((language) => ({
      language: language.language,
      locale: language.locale,
      isEnabled: language.isEnabled,
      position: language.position,
    })),

    socialLinks: settings.socialLinks.map((socialLink) => ({
      id: socialLink.id,
      platform: socialLink.platform,
      url: socialLink.url,
      position: socialLink.position,
      isVisible: socialLink.isVisible,
    })),
  };
}

export async function updateBusinessSettings(input) {
  const existingSettings = await prisma.businessSettings.findUnique({
    where: {
      id: BUSINESS_SETTINGS_ID,
    },

    select: {
      id: true,
    },
  });

  if (!existingSettings) {
    return null;
  }

  await prisma.businessSettings.update({
    where: {
      id: BUSINESS_SETTINGS_ID,
    },

    data: {
      name: input.name,
      logoPath: input.logoPath,
      faviconPath: input.faviconPath,
      email: input.email,
      phone: input.phone,
      mobilePhone: input.mobilePhone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      postalCode: input.postalCode,
      city: input.city,
      countryCode: input.countryCode,
      administrativeAreaCode: input.administrativeAreaCode,
      taxId: input.taxId,
      fiscalAddressSameAsBusiness: input.fiscalAddressSameAsBusiness,
      fiscalAddressLine1: input.fiscalAddressLine1,
      fiscalAddressLine2: input.fiscalAddressLine2,
      fiscalPostalCode: input.fiscalPostalCode,
      fiscalCity: input.fiscalCity,
      fiscalCountryCode: input.fiscalCountryCode,
      fiscalAdministrativeAreaCode: input.fiscalAdministrativeAreaCode,
      primaryActionUrl: input.primaryActionUrl,
    },
  });

  return getBusinessSettings();
}

export async function updateBusinessDefaultLanguage(language) {
  const result = await prisma.$transaction(async (transaction) => {
    const settings = await transaction.businessSettings.findUnique({
      where: {
        id: BUSINESS_SETTINGS_ID,
      },

      select: {
        id: true,
      },
    });

    if (!settings) {
      return null;
    }

    const businessLanguage = await transaction.businessLanguage.findUnique({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language,
        },
      },

      select: {
        isEnabled: true,
      },
    });

    if (!businessLanguage?.isEnabled) {
      return false;
    }

    await transaction.businessSettings.update({
      where: {
        id: BUSINESS_SETTINGS_ID,
      },

      data: {
        defaultLanguage: language,
      },
    });

    return true;
  });

  if (result === null || result === false) {
    return result;
  }

  return getBusinessSettings();
}

export async function updateBusinessSettingsTranslation(language, input) {
  const result = await prisma.$transaction(async (transaction) => {
    const settings = await transaction.businessSettings.findUnique({
      where: {
        id: BUSINESS_SETTINGS_ID,
      },

      select: {
        id: true,
      },
    });

    if (!settings) {
      return null;
    }

    const businessLanguage = await transaction.businessLanguage.findUnique({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language,
        },
      },

      select: {
        id: true,
      },
    });

    if (!businessLanguage) {
      return false;
    }

    await transaction.businessSettingsTranslation.upsert({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language,
        },
      },

      update: {
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
      },

      create: {
        settingsId: BUSINESS_SETTINGS_ID,
        language,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
      },
    });

    return true;
  });

  if (result === null || result === false) {
    return result;
  }

  return getBusinessSettings();
}

export async function updateBusinessLanguage(language, input) {
  const result = await prisma.$transaction(async (transaction) => {
    const settings = await transaction.businessSettings.findUnique({
      where: {
        id: BUSINESS_SETTINGS_ID,
      },

      select: {
        id: true,
        defaultLanguage: true,
      },
    });

    if (!settings) {
      return null;
    }

    const existingLanguage = await transaction.businessLanguage.findUnique({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language,
        },
      },

      select: {
        id: true,
      },
    });

    if (!existingLanguage) {
      return false;
    }

    if (language === settings.defaultLanguage && input.isEnabled === false) {
      return false;
    }

    await transaction.businessLanguage.update({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language,
        },
      },

      data: {
        locale: input.locale,
        isEnabled: input.isEnabled,
      },
    });

    return true;
  });

  if (result === null || result === false) {
    return result;
  }

  return getBusinessSettings();
}

export async function createBusinessLanguage(input) {
  const result = await prisma.$transaction(async (transaction) => {
    const settings = await transaction.businessSettings.findUnique({
      where: {
        id: BUSINESS_SETTINGS_ID,
      },

      select: {
        id: true,
      },
    });

    if (!settings) {
      return null;
    }

    const existingLanguage = await transaction.businessLanguage.findUnique({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language: input.language,
        },
      },

      select: {
        id: true,
      },
    });

    if (existingLanguage) {
      return false;
    }

    const positionResult = await transaction.businessLanguage.aggregate({
      where: {
        settingsId: BUSINESS_SETTINGS_ID,
      },

      _max: {
        position: true,
      },
    });

    const nextPosition = (positionResult._max.position ?? 0) + 1;

    await transaction.businessLanguage.create({
      data: {
        settingsId: BUSINESS_SETTINGS_ID,
        language: input.language,
        locale: input.locale,
        isEnabled: input.isEnabled,
        position: nextPosition,
      },
    });

    await transaction.businessSettingsTranslation.create({
      data: {
        settingsId: BUSINESS_SETTINGS_ID,
        language: input.language,
        seoTitle: null,
        seoDescription: null,
      },
    });

    return true;
  });

  if (result === null || result === false) {
    return result;
  }

  return getBusinessSettings();
}

export async function deleteBusinessLanguage(language) {
  const result = await prisma.$transaction(async (transaction) => {
    const settings = await transaction.businessSettings.findUnique({
      where: {
        id: BUSINESS_SETTINGS_ID,
      },

      select: {
        id: true,
        defaultLanguage: true,
      },
    });

    if (!settings) {
      return null;
    }

    const existingLanguage = await transaction.businessLanguage.findUnique({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language,
        },
      },

      select: {
        id: true,
      },
    });

    if (!existingLanguage) {
      return false;
    }

    if (language === settings.defaultLanguage) {
      return false;
    }

    await transaction.businessSettingsTranslation.deleteMany({
      where: {
        settingsId: BUSINESS_SETTINGS_ID,
        language,
      },
    });

    await transaction.businessLanguage.delete({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language,
        },
      },
    });

    const remainingLanguages = await transaction.businessLanguage.findMany({
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
        id: true,
      },
    });

    for (let index = 0; index < remainingLanguages.length; index += 1) {
      await transaction.businessLanguage.update({
        where: {
          id: remainingLanguages[index].id,
        },

        data: {
          position: index + 1,
        },
      });
    }

    return true;
  });

  if (result === null || result === false) {
    return result;
  }

  return getBusinessSettings();
}

export async function moveBusinessLanguage(language, direction) {
  return prisma.$transaction(async (transaction) => {
    const businessLanguage = await transaction.businessLanguage.findUnique({
      where: {
        settingsId_language: {
          settingsId: BUSINESS_SETTINGS_ID,
          language,
        },
      },

      select: {
        id: true,
        position: true,
      },
    });

    if (!businessLanguage) {
      return null;
    }

    const adjacentLanguage = await transaction.businessLanguage.findFirst({
      where: {
        settingsId: BUSINESS_SETTINGS_ID,

        position:
          direction === "up"
            ? {
                lt: businessLanguage.position,
              }
            : {
                gt: businessLanguage.position,
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

    if (!adjacentLanguage) {
      return {
        moved: false,
        position: businessLanguage.position,
      };
    }

    await transaction.businessLanguage.update({
      where: {
        id: businessLanguage.id,
      },

      data: {
        position: adjacentLanguage.position,
      },
    });

    await transaction.businessLanguage.update({
      where: {
        id: adjacentLanguage.id,
      },

      data: {
        position: businessLanguage.position,
      },
    });

    return {
      moved: true,
      position: adjacentLanguage.position,
    };
  });
}

export async function createBusinessSocialLink(input) {
  const settings = await prisma.businessSettings.findUnique({
    where: {
      id: BUSINESS_SETTINGS_ID,
    },

    select: {
      id: true,
    },
  });

  if (!settings) {
    return null;
  }

  const positionResult = await prisma.businessSocialLink.aggregate({
    where: {
      settingsId: BUSINESS_SETTINGS_ID,
    },

    _max: {
      position: true,
    },
  });

  const nextPosition = (positionResult._max.position ?? 0) + 1;

  await prisma.businessSocialLink.create({
    data: {
      settingsId: BUSINESS_SETTINGS_ID,
      platform: input.platform,
      url: input.url,
      position: nextPosition,
      isVisible: input.isVisible,
    },
  });

  return getBusinessSettings();
}

export async function updateBusinessSocialLink(socialLinkId, input) {
  const existingSocialLink = await prisma.businessSocialLink.findFirst({
    where: {
      id: socialLinkId,
      settingsId: BUSINESS_SETTINGS_ID,
    },

    select: {
      id: true,
    },
  });

  if (!existingSocialLink) {
    return null;
  }

  await prisma.businessSocialLink.update({
    where: {
      id: socialLinkId,
    },

    data: {
      platform: input.platform,
      url: input.url,
      isVisible: input.isVisible,
    },
  });

  return getBusinessSettings();
}

export async function deleteBusinessSocialLink(socialLinkId) {
  const result = await prisma.$transaction(async (transaction) => {
    const existingSocialLink = await transaction.businessSocialLink.findFirst({
      where: {
        id: socialLinkId,
        settingsId: BUSINESS_SETTINGS_ID,
      },

      select: {
        id: true,
      },
    });

    if (!existingSocialLink) {
      return false;
    }

    await transaction.businessSocialLink.delete({
      where: {
        id: socialLinkId,
      },
    });

    const remainingSocialLinks = await transaction.businessSocialLink.findMany({
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
        id: true,
      },
    });

    for (let index = 0; index < remainingSocialLinks.length; index += 1) {
      await transaction.businessSocialLink.update({
        where: {
          id: remainingSocialLinks[index].id,
        },

        data: {
          position: index + 1,
        },
      });
    }

    return true;
  });

  if (result === false) {
    return false;
  }

  return getBusinessSettings();
}

export async function moveBusinessSocialLink(socialLinkId, direction) {
  return prisma.$transaction(async (transaction) => {
    const socialLink = await transaction.businessSocialLink.findFirst({
      where: {
        id: socialLinkId,
        settingsId: BUSINESS_SETTINGS_ID,
      },

      select: {
        id: true,
        position: true,
      },
    });

    if (!socialLink) {
      return null;
    }

    const adjacentSocialLink = await transaction.businessSocialLink.findFirst({
      where: {
        settingsId: BUSINESS_SETTINGS_ID,

        position:
          direction === "up"
            ? {
                lt: socialLink.position,
              }
            : {
                gt: socialLink.position,
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

    if (!adjacentSocialLink) {
      return {
        moved: false,
        position: socialLink.position,
      };
    }

    await transaction.businessSocialLink.update({
      where: {
        id: socialLink.id,
      },

      data: {
        position: adjacentSocialLink.position,
      },
    });

    await transaction.businessSocialLink.update({
      where: {
        id: adjacentSocialLink.id,
      },

      data: {
        position: socialLink.position,
      },
    });

    return {
      moved: true,
      position: adjacentSocialLink.position,
    };
  });
}

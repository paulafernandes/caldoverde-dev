import { z } from "zod";

const imagePathSchema = z
  .string()
  .trim()
  .min(1, "IMAGE_PATH_REQUIRED")
  .max(500, "IMAGE_PATH_TOO_LONG")
  .refine(
    (imagePath) =>
      imagePath.startsWith("/assets/") || imagePath.startsWith("/uploads/"),
    {
      message: "INVALID_IMAGE_PATH",
    }
  );

const optionalUrlSchema = z
  .string()
  .trim()
  .max(1000, "URL_TOO_LONG")
  .url("INVALID_URL")
  .nullable();

export const updateBusinessSettingsSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(1, "BUSINESS_NAME_REQUIRED")
      .max(160, "BUSINESS_NAME_TOO_LONG"),

    logoPath: imagePathSchema.nullable(),

    faviconPath: imagePathSchema.nullable(),

    email: z
      .string()
      .trim()
      .min(1, "EMAIL_REQUIRED")
      .max(254, "EMAIL_TOO_LONG")
      .email("INVALID_EMAIL"),

    phone: z.string().trim().min(1, "PHONE_REQUIRED").max(50, "PHONE_TOO_LONG"),

    addressLine1: z
      .string()
      .trim()
      .min(1, "ADDRESS_REQUIRED")
      .max(200, "ADDRESS_TOO_LONG"),

    addressLine2: z.string().trim().max(200, "ADDRESS_TOO_LONG").nullable(),

    postalCode: z
      .string()
      .trim()
      .min(1, "POSTAL_CODE_REQUIRED")
      .max(30, "POSTAL_CODE_TOO_LONG"),

    city: z.string().trim().min(1, "CITY_REQUIRED").max(120, "CITY_TOO_LONG"),

    countryCode: z
      .string()
      .trim()
      .min(1, "COUNTRY_REQUIRED")
      .length(2, "INVALID_COUNTRY_CODE")
      .transform((value) => value.toUpperCase()),

    taxId: z
      .string()
      .trim()
      .min(1, "TAX_ID_REQUIRED")
      .max(50, "TAX_ID_TOO_LONG"),

    fiscalAddressSameAsBusiness: z.boolean(),

    fiscalAddressLine1: z
      .string()
      .trim()
      .max(200, "FISCAL_ADDRESS_TOO_LONG")
      .nullable(),

    fiscalAddressLine2: z
      .string()
      .trim()
      .max(200, "FISCAL_ADDRESS_TOO_LONG")
      .nullable(),

    fiscalPostalCode: z
      .string()
      .trim()
      .max(30, "FISCAL_POSTAL_CODE_TOO_LONG")
      .nullable(),

    fiscalCity: z.string().trim().max(120, "FISCAL_CITY_TOO_LONG").nullable(),

    fiscalCountryCode: z
      .string()
      .trim()
      .length(2, "INVALID_FISCAL_COUNTRY_CODE")
      .transform((value) => value.toUpperCase())
      .nullable(),

    primaryActionUrl: optionalUrlSchema,
  })
  .superRefine((data, context) => {
    if (data.fiscalAddressSameAsBusiness) {
      return;
    }

    if (!data.fiscalAddressLine1?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["fiscalAddressLine1"],
        message: "FISCAL_ADDRESS_REQUIRED",
      });
    }

    if (!data.fiscalPostalCode?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["fiscalPostalCode"],
        message: "FISCAL_POSTAL_CODE_REQUIRED",
      });
    }

    if (!data.fiscalCity?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["fiscalCity"],
        message: "FISCAL_CITY_REQUIRED",
      });
    }

    if (!data.fiscalCountryCode?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["fiscalCountryCode"],
        message: "FISCAL_COUNTRY_REQUIRED",
      });
    }
  })
  .transform((data) => {
    if (!data.fiscalAddressSameAsBusiness) {
      return data;
    }

    return {
      ...data,
      fiscalAddressLine1: null,
      fiscalAddressLine2: null,
      fiscalPostalCode: null,
      fiscalCity: null,
      fiscalCountryCode: null,
    };
  });

export const updateBusinessDefaultLanguageSchema = z.strictObject({
  language: z
    .string()
    .trim()
    .min(1, "LANGUAGE_REQUIRED")
    .max(20, "INVALID_LANGUAGE"),
});

export const createBusinessLanguageSchema = z.strictObject({
  language: z
    .string()
    .trim()
    .min(2, "INVALID_LANGUAGE")
    .max(20, "INVALID_LANGUAGE")
    .regex(/^[a-zA-Z0-9-]+$/, "INVALID_LANGUAGE")
    .transform((value) => value.toLowerCase()),

  locale: z
    .string()
    .trim()
    .min(2, "INVALID_LOCALE")
    .max(35, "INVALID_LOCALE")
    .regex(/^[a-zA-Z0-9_-]+$/, "INVALID_LOCALE"),

  isEnabled: z.boolean(),
});

export const updateBusinessLanguageSchema = z.strictObject({
  locale: z
    .string()
    .trim()
    .min(2, "INVALID_LOCALE")
    .max(35, "INVALID_LOCALE")
    .regex(/^[a-zA-Z0-9_-]+$/, "INVALID_LOCALE"),

  isEnabled: z.boolean(),
});

export const moveBusinessLanguageSchema = z.strictObject({
  language: z
    .string()
    .trim()
    .min(2, "INVALID_LANGUAGE")
    .max(20, "INVALID_LANGUAGE")
    .regex(/^[a-zA-Z0-9-]+$/, "INVALID_LANGUAGE")
    .transform((value) => value.toLowerCase()),

  direction: z.enum(["up", "down"], {
    error: "INVALID_DIRECTION",
  }),
});

export const updateBusinessSettingsTranslationSchema = z.strictObject({
  seoTitle: z.string().trim().max(200, "SEO_TITLE_TOO_LONG"),

  seoDescription: z.string().trim().max(500, "SEO_DESCRIPTION_TOO_LONG"),
});

export const createBusinessSocialLinkSchema = z.strictObject({
  platform: z
    .string()
    .trim()
    .min(1, "SOCIAL_PLATFORM_REQUIRED")
    .max(50, "SOCIAL_PLATFORM_TOO_LONG")
    .transform((value) => value.toLowerCase()),

  url: z.string().trim().max(1000, "URL_TOO_LONG").url("INVALID_URL"),

  isVisible: z.boolean(),
});

export const updateBusinessSocialLinkSchema = createBusinessSocialLinkSchema;

export const moveBusinessSocialLinkSchema = z.strictObject({
  socialLinkId: z
    .number()
    .int("INVALID_SOCIAL_LINK_ID")
    .positive("INVALID_SOCIAL_LINK_ID"),

  direction: z.enum(["up", "down"], {
    error: "INVALID_DIRECTION",
  }),
});

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

export const updateBusinessSettingsSchema = z.strictObject({
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
    .max(254, "EMAIL_TOO_LONG")
    .email("INVALID_EMAIL")
    .nullable(),

  phone: z.string().trim().max(50, "PHONE_TOO_LONG").nullable(),

  addressLine1: z.string().trim().max(200, "ADDRESS_TOO_LONG").nullable(),

  addressLine2: z.string().trim().max(200, "ADDRESS_TOO_LONG").nullable(),

  postalCode: z.string().trim().max(30, "POSTAL_CODE_TOO_LONG").nullable(),

  city: z.string().trim().max(120, "CITY_TOO_LONG").nullable(),

  countryCode: z
    .string()
    .trim()
    .length(2, "INVALID_COUNTRY_CODE")
    .transform((value) => value.toUpperCase())
    .nullable(),

  primaryActionUrl: optionalUrlSchema,
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

import { z } from "zod";
import {
  getAdministrativeAreaConfig,
  isValidAdministrativeAreaCode,
} from "../data/administrativeAreas";
import {
  isValidPostalCode,
  normalizePostalCode,
} from "../utils/postalCodeValidation";
import { isValidTaxId, normalizeTaxId } from "../utils/taxIdValidation";
import { isValidE164PhoneNumber } from "../utils/phoneValidation";

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

    phone: z
      .string()
      .trim()
      .max(16, "PHONE_TOO_LONG")
      .refine(
        (value) => value === "" || isValidE164PhoneNumber(value),
        "INVALID_PHONE_NUMBER"
      )
      .nullable(),

    mobilePhone: z
      .string()
      .trim()
      .max(16, "MOBILE_PHONE_TOO_LONG")
      .refine(
        (value) => value === "" || isValidE164PhoneNumber(value),
        "INVALID_MOBILE_PHONE_NUMBER"
      )
      .nullable(),

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

    administrativeAreaCode: z
      .string()
      .trim()
      .max(50, "ADMINISTRATIVE_AREA_CODE_TOO_LONG")
      .nullable(),

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

    fiscalAdministrativeAreaCode: z
      .string()
      .trim()
      .max(50, "FISCAL_ADMINISTRATIVE_AREA_CODE_TOO_LONG")
      .nullable(),

    primaryActionUrl: optionalUrlSchema,
  })
  .superRefine((data, context) => {
    if (!data.phone?.trim() && !data.mobilePhone?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "PHONE_CONTACT_REQUIRED",
      });
    }

    const administrativeAreaConfig = getAdministrativeAreaConfig(
      data.countryCode
    );

    if (administrativeAreaConfig) {
      if (!data.administrativeAreaCode?.trim()) {
        context.addIssue({
          code: "custom",
          path: ["administrativeAreaCode"],
          message: "ADMINISTRATIVE_AREA_REQUIRED",
        });
      } else if (
        !isValidAdministrativeAreaCode(
          data.countryCode,
          data.administrativeAreaCode
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["administrativeAreaCode"],
          message: "INVALID_ADMINISTRATIVE_AREA",
        });
      }
    }

    const normalizedPostalCode = normalizePostalCode(
      data.countryCode,
      data.postalCode
    );

    if (
      data.postalCode &&
      !isValidPostalCode(data.countryCode, normalizedPostalCode)
    ) {
      context.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: "INVALID_POSTAL_CODE",
      });
    }

    if (data.taxId && !isValidTaxId(data.countryCode, data.taxId)) {
      context.addIssue({
        code: "custom",
        path: ["taxId"],
        message: "INVALID_TAX_ID",
      });
    }

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

    const normalizedFiscalPostalCode =
      data.fiscalPostalCode && data.fiscalCountryCode
        ? normalizePostalCode(data.fiscalCountryCode, data.fiscalPostalCode)
        : null;

    if (
      normalizedFiscalPostalCode &&
      data.fiscalCountryCode &&
      !isValidPostalCode(data.fiscalCountryCode, normalizedFiscalPostalCode)
    ) {
      context.addIssue({
        code: "custom",
        path: ["fiscalPostalCode"],
        message: "INVALID_FISCAL_POSTAL_CODE",
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

    const fiscalAdministrativeAreaConfig = getAdministrativeAreaConfig(
      data.fiscalCountryCode
    );

    if (fiscalAdministrativeAreaConfig) {
      if (!data.fiscalAdministrativeAreaCode?.trim()) {
        context.addIssue({
          code: "custom",
          path: ["fiscalAdministrativeAreaCode"],
          message: "FISCAL_ADMINISTRATIVE_AREA_REQUIRED",
        });
      } else if (
        !isValidAdministrativeAreaCode(
          data.fiscalCountryCode,
          data.fiscalAdministrativeAreaCode
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["fiscalAdministrativeAreaCode"],
          message: "INVALID_FISCAL_ADMINISTRATIVE_AREA",
        });
      }
    }
  })
  .transform((data) => {
    const postalCode = normalizePostalCode(data.countryCode, data.postalCode);

    const taxId = normalizeTaxId(data.countryCode, data.taxId);

    if (!data.fiscalAddressSameAsBusiness) {
      return {
        ...data,
        postalCode,
        taxId,
        fiscalPostalCode: data.fiscalPostalCode
          ? normalizePostalCode(data.fiscalCountryCode, data.fiscalPostalCode)
          : null,
      };
    }

    return {
      ...data,
      postalCode,
      fiscalAddressLine1: null,
      fiscalAddressLine2: null,
      taxId,
      fiscalPostalCode: null,
      fiscalCity: null,
      fiscalCountryCode: null,
      fiscalAdministrativeAreaCode: null,
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

import { z } from "zod";

const menuItemTranslationSchema = z
  .strictObject({
    name: z.string().trim().max(120, "ITEM_NAME_TOO_LONG"),

    description: z.string().trim().max(500, "ITEM_DESCRIPTION_TOO_LONG"),
  })
  .superRefine((translation, context) => {
    const hasName = translation.name.length > 0;
    const hasDescription = translation.description.length > 0;

    if (hasName && !hasDescription) {
      context.addIssue({
        code: "custom",
        path: ["description"],
        message: "ITEM_DESCRIPTION_REQUIRED",
      });
    }

    if (!hasName && hasDescription) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "ITEM_NAME_REQUIRED",
      });
    }
  });

const menuItemTranslationsSchema = z
  .record(
    z
      .string()
      .min(2)
      .max(20)
      .regex(/^[a-z0-9-]+$/, "INVALID_LANGUAGE"),
    menuItemTranslationSchema
  )
  .refine(
    (translations) =>
      Object.values(translations).some(
        (translation) =>
          translation.name.length > 0 && translation.description.length > 0
      ),
    {
      message: "ITEM_TRANSLATION_REQUIRED",
    }
  );

const menuImagePathSchema = z
  .string()
  .trim()
  .min(1, "IMAGE_PATH_REQUIRED")
  .max(500, "IMAGE_PATH_TOO_LONG")
  .refine(
    (imagePath) =>
      imagePath.startsWith("/assets/images/") ||
      imagePath.startsWith("/uploads/"),
    {
      message: "INVALID_IMAGE_PATH",
    }
  );

export const updateMenuItemSchema = z.strictObject({
  subcategoryId: z
    .number()
    .int("INVALID_SUBCATEGORY_ID")
    .positive("INVALID_SUBCATEGORY_ID")
    .nullable(),
  priceText: z.string().trim().max(200, "ITEM_PRICE_TOO_LONG").nullable(),
  imagePath: menuImagePathSchema.nullable(),

  isVisible: z.boolean(),

  translations: menuItemTranslationsSchema,
});

const menuCategoryTranslationSchema = z
  .strictObject({
    label: z.string().trim().max(120, "CATEGORY_LABEL_TOO_LONG"),

    title: z.string().trim().max(120, "CATEGORY_TITLE_TOO_LONG"),

    highlightText: z.string().trim().max(300, "CATEGORY_HIGHLIGHT_TOO_LONG"),
  })
  .superRefine((translation, context) => {
    const hasLabel = translation.label.length > 0;
    const hasTitle = translation.title.length > 0;

    if (hasLabel && !hasTitle) {
      context.addIssue({
        code: "custom",
        path: ["title"],
        message: "CATEGORY_TITLE_REQUIRED",
      });
    }

    if (!hasLabel && hasTitle) {
      context.addIssue({
        code: "custom",
        path: ["label"],
        message: "CATEGORY_LABEL_REQUIRED",
      });
    }
  });

const menuCategoryTranslationsSchema = z
  .record(
    z
      .string()
      .min(2)
      .max(20)
      .regex(/^[a-z0-9-]+$/, "INVALID_LANGUAGE"),
    menuCategoryTranslationSchema
  )
  .refine(
    (translations) =>
      Object.values(translations).some(
        (translation) =>
          translation.label.length > 0 && translation.title.length > 0
      ),
    {
      message: "CATEGORY_TRANSLATION_REQUIRED",
    }
  );

const menuSubcategoryTranslationSchema = z.strictObject({
  name: z.string().trim().max(120, "SUBCATEGORY_NAME_TOO_LONG"),
});

const menuSubcategoryTranslationsSchema = z
  .record(
    z
      .string()
      .min(2)
      .max(20)
      .regex(/^[a-z0-9-]+$/, "INVALID_LANGUAGE"),
    menuSubcategoryTranslationSchema
  )
  .refine(
    (translations) =>
      Object.values(translations).some(
        (translation) => translation.name.length > 0
      ),
    {
      message: "SUBCATEGORY_NAME_REQUIRED",
    }
  );

export const updateMenuSubcategorySchema = z.strictObject({
  isVisible: z.boolean(),

  translations: menuSubcategoryTranslationsSchema,
});

export const createMenuSubcategorySchema = updateMenuSubcategorySchema.extend({
  categoryId: z
    .number()
    .int("INVALID_CATEGORY_ID")
    .positive("INVALID_CATEGORY_ID"),
});

export const moveMenuSubcategorySchema = z.strictObject({
  subcategoryId: z.number().int("INVALID_ITEM_ID").positive("INVALID_ITEM_ID"),

  direction: z.enum(["up", "down"], {
    error: "INVALID_DIRECTION",
  }),
});

export const updateMenuCategorySchema = z.strictObject({
  imagePath: menuImagePathSchema.nullable(),

  isVisible: z.boolean(),

  translations: menuCategoryTranslationsSchema,
});

export const createMenuItemSchema = updateMenuItemSchema.extend({
  categoryId: z.number().int("INVALID_ITEM_ID").positive("INVALID_ITEM_ID"),
});

export const moveMenuItemSchema = z.strictObject({
  itemId: z.number().int("INVALID_ITEM_ID").positive("INVALID_ITEM_ID"),

  direction: z.enum(["up", "down"], {
    error: "INVALID_DIRECTION",
  }),
});

export const moveMenuCategorySchema = z.strictObject({
  categoryId: z.number().int("INVALID_ITEM_ID").positive("INVALID_ITEM_ID"),

  direction: z.enum(["up", "down"], {
    error: "INVALID_DIRECTION",
  }),
});

export const createMenuCategorySchema = updateMenuCategorySchema;

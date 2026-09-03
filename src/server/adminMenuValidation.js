import { z } from "zod";

const menuItemTranslationSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .max(
        120,
        "O nome não pode ultrapassar 120 caracteres."
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        "A descrição não pode ultrapassar 500 caracteres."
      ),
  })
  .superRefine((translation, context) => {
    const hasName = translation.name.length > 0;
    const hasDescription =
      translation.description.length > 0;

    if (hasName && !hasDescription) {
      context.addIssue({
        code: "custom",
        path: ["description"],
        message:
          "Preenche a descrição neste idioma.",
      });
    }

    if (!hasName && hasDescription) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message:
          "Preenche o nome do prato neste idioma.",
      });
    }
  });

const menuItemTranslationsSchema = z
  .strictObject({
    pt: menuItemTranslationSchema,
    es: menuItemTranslationSchema,
    en: menuItemTranslationSchema,
  })
  .refine(
    (translations) =>
      Object.values(translations).some(
        (translation) =>
          translation.name.length > 0 &&
          translation.description.length > 0
      ),
    {
      message:
        "Preenche o nome e a descrição em pelo menos um idioma.",
    }
  );

const menuImagePathSchema = z
  .string()
  .trim()
  .min(1, "O caminho da imagem não pode estar vazio.")
  .max(
    500,
    "O caminho da imagem não pode ultrapassar 500 caracteres."
  )
  .refine(
    (imagePath) =>
      imagePath.startsWith("/assets/images/") ||
      imagePath.startsWith("/uploads/"),
    {
      message:
        "A imagem deve estar em /assets/images/ ou /uploads/.",
    }
  );


export const updateMenuItemSchema = z.strictObject({
  subcategoryId: z
  .number()
  .int(
    "O identificador da subcategoria tem de ser inteiro."
  )
  .positive(
    "O identificador da subcategoria é inválido."
  )
  .nullable(),
  priceCents: z
    .number()
    .int("O preço tem de ser um número inteiro de cêntimos.")
    .min(0, "O preço não pode ser negativo.")
    .max(
      1000000,
      "O preço não pode ultrapassar 10 000 euros."
    )
    .nullable(),
  imagePath: menuImagePathSchema.nullable(),

  isVisible: z.boolean(),

  translations: menuItemTranslationsSchema,
});

const menuCategoryTranslationSchema = z
  .strictObject({
    label: z
      .string()
      .trim()
      .max(
        120,
        "O nome do separador não pode ultrapassar 120 caracteres."
      ),

    title: z
      .string()
      .trim()
      .max(
        120,
        "O título não pode ultrapassar 120 caracteres."
      ),
  })
  .superRefine((translation, context) => {
    const hasLabel = translation.label.length > 0;
    const hasTitle = translation.title.length > 0;

    if (hasLabel && !hasTitle) {
      context.addIssue({
        code: "custom",
        path: ["title"],
        message:
          "Preenche o título da categoria neste idioma.",
      });
    }

    if (!hasLabel && hasTitle) {
      context.addIssue({
        code: "custom",
        path: ["label"],
        message:
          "Preenche o nome do separador neste idioma.",
      });
    }
  });

const menuCategoryTranslationsSchema = z
  .strictObject({
    pt: menuCategoryTranslationSchema,
    es: menuCategoryTranslationSchema,
    en: menuCategoryTranslationSchema,
  })
  .refine(
    (translations) =>
      Object.values(translations).some(
        (translation) =>
          translation.label.length > 0 &&
          translation.title.length > 0
      ),
    {
      message:
        "Preenche o nome do separador e o título da categoria em pelo menos um idioma.",
    }
  );

const menuSubcategoryTranslationSchema =
  z.strictObject({
    name: z
      .string()
      .trim()
      .max(
        120,
        "O nome da subcategoria não pode ultrapassar 120 caracteres."
      ),
  });

const menuSubcategoryTranslationsSchema =
  z
    .strictObject({
      pt: menuSubcategoryTranslationSchema,
      es: menuSubcategoryTranslationSchema,
      en: menuSubcategoryTranslationSchema,
    })
    .refine(
      (translations) =>
        Object.values(translations).some(
          (translation) =>
            translation.name.length > 0
        ),
      {
        message:
          "Preenche o nome da subcategoria em pelo menos um idioma.",
      }
    );

export const updateMenuSubcategorySchema =
  z.strictObject({
    isVisible: z.boolean(),

    translations:
      menuSubcategoryTranslationsSchema,
  });

export const createMenuSubcategorySchema =
  updateMenuSubcategorySchema.extend({
    categoryId: z
      .number()
      .int(
        "O identificador da categoria tem de ser inteiro."
      )
      .positive(
        "O identificador da categoria é inválido."
      ),
  });

export const moveMenuSubcategorySchema =
  z.strictObject({
    subcategoryId: z
      .number()
      .int(
        "O identificador da subcategoria tem de ser inteiro."
      )
      .positive(
        "O identificador da subcategoria é inválido."
      ),

    direction: z.enum(["up", "down"]),
  });

export const updateMenuCategorySchema =
  z.strictObject({
    imagePath: menuImagePathSchema.nullable(),

    isVisible: z.boolean(),

    translations: menuCategoryTranslationsSchema,
  });

export const createMenuItemSchema =
  updateMenuItemSchema.extend({
    categoryId: z
      .number()
      .int(
        "O identificador da categoria tem de ser inteiro."
      )
      .positive(
        "O identificador da categoria é inválido."
      ),
  });

export const moveMenuItemSchema = z.strictObject({
  itemId: z
    .number()
    .int(
      "O identificador do prato tem de ser inteiro."
    )
    .positive(
      "O identificador do prato é inválido."
    ),

  direction: z.enum(["up", "down"]),
});

export const moveMenuCategorySchema =
  z.strictObject({
    categoryId: z
      .number()
      .int(
        "O identificador da categoria tem de ser inteiro."
      )
      .positive(
        "O identificador da categoria é inválido."
      ),

    direction: z.enum(["up", "down"]),
  });

export const createMenuCategorySchema = updateMenuCategorySchema;
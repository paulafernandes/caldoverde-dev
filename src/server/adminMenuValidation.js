import { z } from "zod";

const menuItemTranslationSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório.")
    .max(120, "O nome não pode ultrapassar 120 caracteres."),

  description: z
    .string()
    .trim()
    .min(1, "A descrição é obrigatória.")
    .max(
      500,
      "A descrição não pode ultrapassar 500 caracteres."
    ),
});

export const updateMenuItemSchema = z.strictObject({
  priceCents: z
    .number()
    .int("O preço tem de ser um número inteiro de cêntimos.")
    .min(0, "O preço não pode ser negativo.")
    .max(
      1000000,
      "O preço não pode ultrapassar 10 000 euros."
    )
    .nullable(),

  isVisible: z.boolean(),

  translations: z.strictObject({
    pt: menuItemTranslationSchema,
    es: menuItemTranslationSchema,
    en: menuItemTranslationSchema,
  }),
});

const menuCategoryTranslationSchema =
  z.strictObject({
    label: z
      .string()
      .trim()
      .min(1, "O nome do separador é obrigatório.")
      .max(
        120,
        "O nome do separador não pode ultrapassar 120 caracteres."
      ),

    title: z
      .string()
      .trim()
      .min(1, "O título da categoria é obrigatório.")
      .max(
        120,
        "O título não pode ultrapassar 120 caracteres."
      ),
  });

const categoryImagePathSchema = z
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

export const updateMenuCategorySchema =
  z.strictObject({
    imagePath: categoryImagePathSchema,

    isVisible: z.boolean(),

    translations: z.strictObject({
      pt: menuCategoryTranslationSchema,
      es: menuCategoryTranslationSchema,
      en: menuCategoryTranslationSchema,
    }),
  });
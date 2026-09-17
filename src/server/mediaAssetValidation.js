import { z } from "zod";

const mediaImagePathSchema = z
  .string()
  .trim()
  .min(1, "IMAGE_PATH_REQUIRED")
  .max(500, "IMAGE_PATH_TOO_LONG")
  .refine((imagePath) => imagePath.startsWith("/uploads/media/"), {
    message: "INVALID_MEDIA_IMAGE_PATH",
  });

const mediaTranslationSchema = z.strictObject({
  altText: z.string().trim().max(300, "MEDIA_ALT_TEXT_TOO_LONG"),

  caption: z.string().trim().max(500, "MEDIA_CAPTION_TOO_LONG"),
});

export const createMediaAssetSchema = z.strictObject({
  imagePath: mediaImagePathSchema,

  category: z
    .string()
    .trim()
    .max(80, "MEDIA_CATEGORY_TOO_LONG")
    .nullable(),

  isVisible: z.boolean(),

  translations: z.record(z.string(), mediaTranslationSchema),
});

export const updateMediaAssetSchema = createMediaAssetSchema;

export const moveMediaAssetSchema = z.strictObject({
  mediaAssetId: z
    .number()
    .int("INVALID_MEDIA_ASSET_ID")
    .positive("INVALID_MEDIA_ASSET_ID"),

  direction: z.enum(["up", "down"], {
    error: "INVALID_DIRECTION",
  }),
});

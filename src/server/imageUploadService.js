import { randomUUID } from "node:crypto";
import { copyFile, mkdir, open, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import formidable from "formidable";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ImageUploadError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ImageUploadError";
    this.statusCode = statusCode;
  }
}

function getFirstFile(fileValue) {
  if (Array.isArray(fileValue)) {
    return fileValue[0];
  }

  return fileValue;
}

async function detectImageExtension(filepath) {
  const fileHandle = await open(filepath, "r");
  const signature = Buffer.alloc(12);

  try {
    await fileHandle.read(signature, 0, signature.length, 0);
  } finally {
    await fileHandle.close();
  }

  const isPng = signature
    .subarray(0, 8)
    .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

  if (isPng) {
    return "png";
  }

  const isJpeg =
    signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;

  if (isJpeg) {
    return "jpg";
  }

  const isWebp =
    signature.toString("ascii", 0, 4) === "RIFF" &&
    signature.toString("ascii", 8, 12) === "WEBP";

  if (isWebp) {
    return "webp";
  }

  return null;
}

export async function saveUploadedImage(request) {
  const form = formidable({
    uploadDir: os.tmpdir(),
    allowEmptyFiles: false,
    minFileSize: 1,
    maxFileSize: MAX_IMAGE_SIZE,
    maxTotalFileSize: MAX_IMAGE_SIZE,
    maxFiles: 1,
    multiples: false,

    filter: ({ name, mimetype }) =>
      name === "image" && allowedMimeTypes.has(mimetype),
  });

  let files;

  try {
    [, files] = await form.parse(request);
  } catch (error) {
    const isTooLarge = error.httpCode === 413;

    throw new ImageUploadError(
      isTooLarge
        ? "A imagem não pode ultrapassar 5 MB."
        : "Não foi possível processar a imagem.",
      isTooLarge ? 413 : 400
    );
  }

  const image = getFirstFile(files.image);

  if (!image) {
    throw new ImageUploadError("Seleciona uma imagem PNG, JPEG ou WebP.");
  }

  const temporaryPath = image.filepath;

  try {
    const extension = await detectImageExtension(temporaryPath);

    if (!extension) {
      throw new ImageUploadError(
        "O conteúdo do ficheiro não corresponde a uma imagem válida."
      );
    }

    const configuredUploadsDir = process.env.UPLOADS_DIR;

    if (!configuredUploadsDir) {
      throw new ImageUploadError(
        "A pasta de uploads não está configurada.",
        500
      );
    }

    const uploadsDir = path.resolve(
      /* turbopackIgnore: true */
      process.cwd(),
      configuredUploadsDir
    );

    await mkdir(uploadsDir, {
      recursive: true,
    });

    const filename = `${randomUUID()}.${extension}`;

    const finalPath = path.join(uploadsDir, filename);

    await copyFile(temporaryPath, finalPath);

    return {
      imagePath: `/uploads/${filename}`,
    };
  } finally {
    await unlink(temporaryPath).catch(() => undefined);
  }
}

import { randomUUID } from "node:crypto";
import { copyFile, mkdir, open, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import formidable from "formidable";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ImageUploadError extends Error {
  constructor(code, statusCode = 400) {
    super(code);
    this.name = "ImageUploadError";
    this.code = code;
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

export async function saveUploadedImage(request, folder = null) {
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
      isTooLarge ? "IMAGE_TOO_LARGE" : "IMAGE_PROCESSING_FAILED",
      isTooLarge ? 413 : 400
    );
  }

  const image = getFirstFile(files.image);

  if (!image) {
    throw new ImageUploadError("INVALID_IMAGE_TYPE");
  }

  const temporaryPath = image.filepath;

  try {
    const extension = await detectImageExtension(temporaryPath);

    if (!extension) {
      throw new ImageUploadError("INVALID_IMAGE_CONTENT");
    }

    const configuredUploadsDir = process.env.UPLOADS_DIR;

    if (!configuredUploadsDir) {
      throw new ImageUploadError("UPLOADS_DIR_NOT_CONFIGURED", 500);
    }

    const uploadsDir = path.resolve(
      /* turbopackIgnore: true */
      process.cwd(),
      configuredUploadsDir
    );

    const targetDir = folder ? path.join(uploadsDir, folder) : uploadsDir;

    await mkdir(targetDir, {
      recursive: true,
    });

    const filename = `${randomUUID()}.${extension}`;

    const finalPath = path.join(targetDir, filename);

    await copyFile(temporaryPath, finalPath);

    return {
      imagePath: folder
        ? `/uploads/${folder}/${filename}`
        : `/uploads/${filename}`,
    };
  } finally {
    await unlink(temporaryPath).catch(() => undefined);
  }
}

export async function deleteUploadedImage(imagePath) {
  if (typeof imagePath !== "string" || !imagePath.startsWith("/uploads/")) {
    throw new Error("INVALID_UPLOAD_PATH");
  }

  const configuredUploadsDir = process.env.UPLOADS_DIR;

  if (!configuredUploadsDir) {
    throw new Error("UPLOADS_DIR_NOT_CONFIGURED");
  }

  const uploadsDir = path.resolve(
    /* turbopackIgnore: true */
    process.cwd(),
    configuredUploadsDir
  );

  const relativePath = imagePath.slice("/uploads/".length);

  if (!relativePath) {
    throw new Error("INVALID_UPLOAD_PATH");
  }

  const finalPath = path.resolve(uploadsDir, relativePath);
  const uploadsPrefix = `${uploadsDir}${path.sep}`;

  if (!finalPath.startsWith(uploadsPrefix)) {
    throw new Error("INVALID_UPLOAD_PATH");
  }

  try {
    await unlink(finalPath);

    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

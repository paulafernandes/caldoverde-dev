import {
  ImageUploadError,
  saveUploadedImage,
} from "../../../../server/imageUploadService";
import { getAdminSession } from "../../../../server/getAdminSession";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");

    return response.status(405).json({
      error: "METHOD_NOT_ALLOWED",
    });
  }

  const session = await getAdminSession(request);

  if (!session) {
    return response.status(401).json({
      error: "ADMIN_SESSION_REQUIRED",
    });
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return response.status(415).json({
      error: "MULTIPART_REQUIRED",
    });
  }

  try {
    const result = await saveUploadedImage(request, "media");

    return response.status(201).json(result);
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return response.status(error.statusCode).json({
        error: error.code,
      });
    }

    return response.status(500).json({
      error: "IMAGE_UPLOAD_FAILED",
    });
  }
}

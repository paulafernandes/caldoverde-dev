import {
  createMediaAsset,
  getMediaAssets,
} from "../../../../server/mediaAssetService";
import { createMediaAssetSchema } from "../../../../server/mediaAssetValidation";
import { getAdminSession } from "../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.message,
  }));
}

export default async function handler(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    response.setHeader("Allow", allowedMethods.join(", "));

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

  if (request.method === "GET") {
    try {
      const mediaAssets = await getMediaAssets();

      return response.status(200).json({
        mediaAssets,
      });
    } catch (error) {
      return response.status(500).json({
        error: "MEDIA_ASSETS_READ_FAILED",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = createMediaAssetSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_MEDIA_ASSET_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const mediaAsset = await createMediaAsset(validation.data);

    return response.status(201).json({
      mediaAsset,
    });
  } catch (error) {
    return response.status(500).json({
      error: "MEDIA_ASSET_CREATE_FAILED",
    });
  }
}

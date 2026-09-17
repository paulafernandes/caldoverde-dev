import {
  deleteMediaAsset,
  updateMediaAsset,
} from "../../../../server/mediaAssetService";
import { updateMediaAssetSchema } from "../../../../server/mediaAssetValidation";
import { getAdminSession } from "../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.message,
  }));
}

export default async function handler(request, response) {
  const allowedMethods = ["PATCH", "DELETE"];

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

  const rawMediaAssetId = Array.isArray(request.query.id)
    ? request.query.id[0]
    : request.query.id;

  const mediaAssetId = Number(rawMediaAssetId);

  if (!Number.isInteger(mediaAssetId) || mediaAssetId <= 0) {
    return response.status(400).json({
      error: "INVALID_MEDIA_ASSET_ID",
    });
  }

  if (request.method === "DELETE") {
    try {
      const result = await deleteMediaAsset(mediaAssetId);

      if (!result) {
        return response.status(404).json({
          error: "MEDIA_ASSET_NOT_FOUND",
        });
      }

      return response.status(200).json({
        result,
      });
    } catch (error) {
      return response.status(500).json({
        error: "MEDIA_ASSET_DELETE_FAILED",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = updateMediaAssetSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_MEDIA_ASSET_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const mediaAsset = await updateMediaAsset(
      mediaAssetId,
      validation.data
    );

    if (!mediaAsset) {
      return response.status(404).json({
        error: "MEDIA_ASSET_NOT_FOUND",
      });
    }

    return response.status(200).json({
      mediaAsset,
    });
  } catch (error) {
    return response.status(500).json({
      error: "MEDIA_ASSET_UPDATE_FAILED",
    });
  }
}

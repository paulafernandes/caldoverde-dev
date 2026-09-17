import {
  getBusinessSettings,
  updateBusinessSettings,
} from "../../../../server/businessSettingsService";
import { updateBusinessSettingsSchema } from "../../../../server/businessSettingsValidation";
import { getAdminSession } from "../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.message,
  }));
}

export default async function handler(request, response) {
  const allowedMethods = ["GET", "PATCH"];

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
      const settings = await getBusinessSettings();

      if (!settings) {
        return response.status(404).json({
          error: "BUSINESS_SETTINGS_NOT_FOUND",
        });
      }

      return response.status(200).json({
        settings,
      });
    } catch (error) {
      return response.status(500).json({
        error: "BUSINESS_SETTINGS_READ_FAILED",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = updateBusinessSettingsSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_BUSINESS_SETTINGS_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const settings = await updateBusinessSettings(validation.data);

    if (!settings) {
      return response.status(404).json({
        error: "BUSINESS_SETTINGS_NOT_FOUND",
      });
    }

    return response.status(200).json({
      settings,
    });
  } catch (error) {
    return response.status(500).json({
      error: "BUSINESS_SETTINGS_UPDATE_FAILED",
    });
  }
}

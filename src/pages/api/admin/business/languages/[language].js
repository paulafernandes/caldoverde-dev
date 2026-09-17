import {
  deleteBusinessLanguage,
  updateBusinessLanguage,
} from "../../../../../server/businessSettingsService";
import { updateBusinessLanguageSchema } from "../../../../../server/businessSettingsValidation";
import { getAdminSession } from "../../../../../server/getAdminSession";

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

  const rawLanguage = Array.isArray(request.query.language)
    ? request.query.language[0]
    : request.query.language;

  const language =
    typeof rawLanguage === "string"
      ? rawLanguage.trim().toLowerCase()
      : "";

  if (!language) {
    return response.status(400).json({
      error: "INVALID_LANGUAGE",
    });
  }

  if (request.method === "DELETE") {
    try {
      const settings = await deleteBusinessLanguage(language);

      if (settings === null) {
        return response.status(404).json({
          error: "BUSINESS_SETTINGS_NOT_FOUND",
        });
      }

      if (settings === false) {
        return response.status(409).json({
          error: "BUSINESS_LANGUAGE_DELETE_NOT_ALLOWED",
        });
      }

      return response.status(200).json({
        settings,
      });
    } catch (error) {
      return response.status(500).json({
        error: "BUSINESS_LANGUAGE_DELETE_FAILED",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = updateBusinessLanguageSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_BUSINESS_LANGUAGE_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const settings = await updateBusinessLanguage(
      language,
      validation.data
    );

    if (settings === null) {
      return response.status(404).json({
        error: "BUSINESS_SETTINGS_NOT_FOUND",
      });
    }

    if (settings === false) {
      return response.status(409).json({
        error: "BUSINESS_LANGUAGE_UPDATE_NOT_ALLOWED",
      });
    }

    return response.status(200).json({
      settings,
    });
  } catch (error) {
    return response.status(500).json({
      error: "BUSINESS_LANGUAGE_UPDATE_FAILED",
    });
  }
}

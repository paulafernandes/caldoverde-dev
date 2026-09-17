import { createBusinessLanguage } from "../../../../../server/businessSettingsService";
import { createBusinessLanguageSchema } from "../../../../../server/businessSettingsValidation";
import { getAdminSession } from "../../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.message,
  }));
}

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

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = createBusinessLanguageSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_BUSINESS_LANGUAGE_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const settings = await createBusinessLanguage(validation.data);

    if (settings === null) {
      return response.status(404).json({
        error: "BUSINESS_SETTINGS_NOT_FOUND",
      });
    }

    if (settings === false) {
      return response.status(409).json({
        error: "BUSINESS_LANGUAGE_ALREADY_EXISTS",
      });
    }

    return response.status(201).json({
      settings,
    });
  } catch (error) {
    return response.status(500).json({
      error: "BUSINESS_LANGUAGE_CREATE_FAILED",
    });
  }
}

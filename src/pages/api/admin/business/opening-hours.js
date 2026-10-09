import { replaceBusinessOpeningHours } from "../../../../server/businessSettingsService";
import { replaceBusinessOpeningHoursSchema } from "../../../../server/businessSettingsValidation";
import { getAdminSession } from "../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.message,
  }));
}

export default async function handler(request, response) {
  if (request.method !== "PUT") {
    response.setHeader("Allow", "PUT");

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

  const validation = replaceBusinessOpeningHoursSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_OPENING_HOURS_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const settings = await replaceBusinessOpeningHours(
      validation.data.openingHours
    );

    if (!settings) {
      return response.status(404).json({
        error: "BUSINESS_SETTINGS_NOT_FOUND",
      });
    }

    return response.status(200).json({
      settings,
    });
  } catch (error) {
    console.error("OPENING_HOURS_UPDATE_FAILED:", error);

    return response.status(500).json({
      error: "OPENING_HOURS_UPDATE_FAILED",
    });
  }
}

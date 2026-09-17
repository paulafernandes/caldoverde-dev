import { moveBusinessSocialLink } from "../../../../../server/businessSettingsService";
import { moveBusinessSocialLinkSchema } from "../../../../../server/businessSettingsValidation";
import { getAdminSession } from "../../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.message,
  }));
}

export default async function handler(request, response) {
  if (request.method !== "PATCH") {
    response.setHeader("Allow", "PATCH");

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

  const validation = moveBusinessSocialLinkSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_BUSINESS_SOCIAL_LINK_ORDER_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const result = await moveBusinessSocialLink(
      validation.data.socialLinkId,
      validation.data.direction
    );

    if (!result) {
      return response.status(404).json({
        error: "BUSINESS_SOCIAL_LINK_NOT_FOUND",
      });
    }

    return response.status(200).json({
      result,
    });
  } catch (error) {
    return response.status(500).json({
      error: "BUSINESS_SOCIAL_LINK_ORDER_FAILED",
    });
  }
}

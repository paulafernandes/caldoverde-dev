import {
  deleteBusinessSocialLink,
  updateBusinessSocialLink,
} from "../../../../../server/businessSettingsService";
import { updateBusinessSocialLinkSchema } from "../../../../../server/businessSettingsValidation";
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

  const rawSocialLinkId = Array.isArray(request.query.id)
    ? request.query.id[0]
    : request.query.id;

  const socialLinkId = Number(rawSocialLinkId);

  if (!Number.isInteger(socialLinkId) || socialLinkId <= 0) {
    return response.status(400).json({
      error: "INVALID_SOCIAL_LINK_ID",
    });
  }

  if (request.method === "DELETE") {
    try {
      const settings = await deleteBusinessSocialLink(socialLinkId);

      if (settings === false) {
        return response.status(404).json({
          error: "BUSINESS_SOCIAL_LINK_NOT_FOUND",
        });
      }

      return response.status(200).json({
        settings,
      });
    } catch (error) {
      return response.status(500).json({
        error: "BUSINESS_SOCIAL_LINK_DELETE_FAILED",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = updateBusinessSocialLinkSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_BUSINESS_SOCIAL_LINK_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const settings = await updateBusinessSocialLink(
      socialLinkId,
      validation.data
    );

    if (!settings) {
      return response.status(404).json({
        error: "BUSINESS_SOCIAL_LINK_NOT_FOUND",
      });
    }

    return response.status(200).json({
      settings,
    });
  } catch (error) {
    return response.status(500).json({
      error: "BUSINESS_SOCIAL_LINK_UPDATE_FAILED",
    });
  }
}

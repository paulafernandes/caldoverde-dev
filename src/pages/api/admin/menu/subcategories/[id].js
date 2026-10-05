import {
  deleteAdminMenuSubcategory,
  updateAdminMenuSubcategory,
} from "../../../../../server/adminMenuService";
import { updateMenuSubcategorySchema } from "../../../../../server/adminMenuValidation";
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
      error: "SUBCATEGORY_CREATE_FAILED",
    });
  }

  const session = await getAdminSession(request);

  if (!session) {
    return response.status(401).json({
      error: "ADMIN_SESSION_REQUIRED",
    });
  }

  const rawSubcategoryId = Array.isArray(request.query.id)
    ? request.query.id[0]
    : request.query.id;

  const subcategoryId = Number(rawSubcategoryId);

  if (!Number.isInteger(subcategoryId) || subcategoryId <= 0) {
    return response.status(400).json({
      error: "INVALID_SUBCATEGORY_ID",
    });
  }

  if (request.method === "DELETE") {
    try {
      const result = await deleteAdminMenuSubcategory(subcategoryId);

      if (result.status === "not-found") {
        return response.status(404).json({
          error: "SUBCATEGORY_NOT_FOUND",
        });
      }

      return response.status(200).json({
        success: true,
      });
    } catch (error) {
      return response.status(500).json({
        error: "SUBCATEGORY_DELETE_FAILED",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = updateMenuSubcategorySchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_SUBCATEGORY_DATA",

      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const subcategory = await updateAdminMenuSubcategory(
      subcategoryId,
      validation.data
    );

    if (!subcategory) {
      return response.status(404).json({
        error: "SUBCATEGORY_NOT_FOUND",
      });
    }

    return response.status(200).json({
      subcategory,
    });
  } catch (error) {
    if (error.code === "INVALID_MENU_LANGUAGE") {
      return response.status(400).json({
        error: "INVALID_SUBCATEGORY_DATA",
        details: [
          {
            field: `translations.${error.language}`,
            code: "INVALID_LANGUAGE",
          },
        ],
      });
    }
    return response.status(500).json({
      error: "SUBCATEGORY_UPDATE_FAILED",
    });
  }
}

import {
  deleteAdminMenuCategory,
  updateAdminMenuCategory,
} from "../../../../../server/adminMenuService";
import { updateMenuCategorySchema } from "../../../../../server/adminMenuValidation";
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

  const rawCategoryId = Array.isArray(request.query.id)
    ? request.query.id[0]
    : request.query.id;

  const categoryId = Number(rawCategoryId);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return response.status(400).json({
      error: "INVALID_CATEGORY_ID",
    });
  }

  if (request.method === "DELETE") {
    try {
      const result = await deleteAdminMenuCategory(categoryId);

      if (result.status === "not-found") {
        return response.status(404).json({
          error: "CATEGORY_NOT_FOUND",
        });
      }

      if (result.status === "not-empty") {
        return response.status(409).json({
          error: "CATEGORY_NOT_EMPTY",
          meta: {
            itemCount: result.itemCount,
          },
        });
      }

      return response.status(200).json({
        success: true,
      });
    } catch (error) {
      return response.status(500).json({
        error: "CATEGORY_DELETE_FAILED",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = updateMenuCategorySchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_CATEGORY_DATA",

      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const updatedCategory = await updateAdminMenuCategory(
      categoryId,
      validation.data
    );

    if (!updatedCategory) {
      return response.status(404).json({
        error: "CATEGORY_NOT_FOUND",
      });
    }

    return response.status(200).json({
      category: updatedCategory,
    });
  } catch (error) {
    return response.status(500).json({
      error: "CATEGORY_UPDATE_FAILED",
    });
  }
}

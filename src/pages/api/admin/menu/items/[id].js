import {
  deleteAdminMenuItem,
  updateAdminMenuItem,
} from "../../../../../server/adminMenuService";
import { updateMenuItemSchema } from "../../../../../server/adminMenuValidation";
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

  const rawItemId = Array.isArray(request.query.id)
    ? request.query.id[0]
    : request.query.id;

  const itemId = Number(rawItemId);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return response.status(400).json({
      error: "INVALID_ITEM_ID",
    });
  }

  if (request.method === "DELETE") {
    try {
      const wasDeleted = await deleteAdminMenuItem(itemId);

      if (!wasDeleted) {
        return response.status(404).json({
          error: "ITEM_NOT_FOUND",
        });
      }

      return response.status(200).json({
        success: true,
      });
    } catch (error) {
      return response.status(500).json({
        error: "ITEM_DELETE_FAILED",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "JSON_REQUIRED",
    });
  }

  const validation = updateMenuItemSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_ITEM_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const updatedItem = await updateAdminMenuItem(itemId, validation.data);

    if (updatedItem === null) {
      return response.status(404).json({
        error: "ITEM_NOT_FOUND",
      });
    }

    if (updatedItem === false) {
      return response.status(400).json({
        error: "SUBCATEGORY_CATEGORY_MISMATCH",
      });
    }

    return response.status(200).json({
      item: updatedItem,
    });
  } catch (error) {
    if (error.code === "INVALID_MENU_LANGUAGE") {
      return response.status(400).json({
        error: "INVALID_ITEM_DATA",
        details: [
          {
            field: `translations.${error.language}`,
            code: "INVALID_LANGUAGE",
          },
        ],
      });
    }
    return response.status(500).json({
      error: "ITEM_UPDATE_FAILED",
    });
  }
}

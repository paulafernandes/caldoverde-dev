import { createAdminMenuItem } from "../../../../../server/adminMenuService";
import { createMenuItemSchema } from "../../../../../server/adminMenuValidation";
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

  const validation = createMenuItemSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_ITEM_DATA",

      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const createdItem = await createAdminMenuItem(validation.data);

    if (createdItem === null) {
      return response.status(404).json({
        error: "CATEGORY_NOT_FOUND",
      });
    }

    if (createdItem === false) {
      return response.status(400).json({
        error: "SUBCATEGORY_CATEGORY_MISMATCH",
      });
    }

    return response.status(201).json({
      item: createdItem,
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
      error: "ITEM_CREATE_FAILED",
    });
  }
}

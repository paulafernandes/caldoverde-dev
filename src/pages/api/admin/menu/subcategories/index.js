import { createAdminMenuSubcategory } from "../../../../../server/adminMenuService";
import { createMenuSubcategorySchema } from "../../../../../server/adminMenuValidation";
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

  const validation = createMenuSubcategorySchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_SUBCATEGORY_DATA",

      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const subcategory = await createAdminMenuSubcategory(validation.data);

    if (!subcategory) {
      return response.status(404).json({
        error: "INVALID_SUBCATEGORY_DATA",
      });
    }

    return response.status(201).json({
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
      error: "SUBCATEGORY_CREATE_FAILED",
    });
  }
}

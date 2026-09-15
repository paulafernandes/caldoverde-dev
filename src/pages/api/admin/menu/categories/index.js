import { createAdminMenuCategory } from "../../../../../server/adminMenuService";
import { createMenuCategorySchema } from "../../../../../server/adminMenuValidation";
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

  const validation = createMenuCategorySchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "INVALID_CATEGORY_DATA",
      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const category = await createAdminMenuCategory(validation.data);

    return response.status(201).json({
      category,
    });
  } catch (error) {
    return response.status(500).json({
      error: "CATEGORY_CREATE_FAILED",
    });
  }
}

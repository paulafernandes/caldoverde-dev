import {
  updateAdminMenuCategory,
} from "../../../../../server/adminMenuService";
import {
  updateMenuCategorySchema,
} from "../../../../../server/adminMenuValidation";
import {
  getAdminSession,
} from "../../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export default async function handler(
  request,
  response
) {
  if (request.method !== "PATCH") {
    response.setHeader("Allow", "PATCH");

    return response.status(405).json({
      error: "Método não permitido.",
    });
  }

  const session = await getAdminSession(request);

  if (!session) {
    return response.status(401).json({
      error: "Sessão de administradora necessária.",
    });
  }

  const contentType =
    request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "O pedido deve utilizar JSON.",
    });
  }

  const rawCategoryId = Array.isArray(
    request.query.id
  )
    ? request.query.id[0]
    : request.query.id;

  const categoryId = Number(rawCategoryId);

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    return response.status(400).json({
      error: "Identificador da categoria inválido.",
    });
  }

  const validation =
    updateMenuCategorySchema.safeParse(
      request.body
    );

  if (!validation.success) {
    return response.status(400).json({
      error:
        "Os dados da categoria são inválidos.",

      details: formatValidationErrors(
        validation.error
      ),
    });
  }

  try {
    const updatedCategory =
      await updateAdminMenuCategory(
        categoryId,
        validation.data
      );

    if (!updatedCategory) {
      return response.status(404).json({
        error: "Categoria não encontrada.",
      });
    }

    return response.status(200).json({
      category: updatedCategory,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar a categoria:",
      error
    );

    return response.status(500).json({
      error:
        "Não foi possível atualizar a categoria.",
    });
  }
}

import {
  deleteAdminMenuCategory,
  updateAdminMenuCategory,
} from "../../../../../server/adminMenuService";
import { updateMenuCategorySchema } from "../../../../../server/adminMenuValidation";
import { getAdminSession } from "../../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export default async function handler(request, response) {
  const allowedMethods = ["PATCH", "DELETE"];

  if (!allowedMethods.includes(request.method)) {
    response.setHeader("Allow", allowedMethods.join(", "));

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

  const rawCategoryId = Array.isArray(request.query.id)
    ? request.query.id[0]
    : request.query.id;

  const categoryId = Number(rawCategoryId);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return response.status(400).json({
      error: "Identificador da categoria inválido.",
    });
  }

  if (request.method === "DELETE") {
    try {
      const result = await deleteAdminMenuCategory(categoryId);

      if (result.status === "not-found") {
        return response.status(404).json({
          error: "Categoria não encontrada.",
        });
      }

      if (result.status === "not-empty") {
        const itemLabel = result.itemCount === 1 ? "prato" : "pratos";

        return response.status(409).json({
          error:
            `A categoria contém ${result.itemCount} ${itemLabel}. ` +
            "Remove-os antes de eliminar a categoria.",
        });
      }

      return response.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error("Erro ao eliminar a categoria:", error);

      return response.status(500).json({
        error: "Não foi possível eliminar a categoria.",
      });
    }
  }

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "O pedido deve utilizar JSON.",
    });
  }

  const validation = updateMenuCategorySchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "Os dados da categoria são inválidos.",

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
        error: "Categoria não encontrada.",
      });
    }

    return response.status(200).json({
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Erro ao atualizar a categoria:", error);

    return response.status(500).json({
      error: "Não foi possível atualizar a categoria.",
    });
  }
}

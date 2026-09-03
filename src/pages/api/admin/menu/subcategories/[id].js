import {
  deleteAdminMenuSubcategory,
  updateAdminMenuSubcategory,
} from "../../../../../server/adminMenuService";
import {
  updateMenuSubcategorySchema,
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
  const allowedMethods = ["PATCH", "DELETE"];

  if (!allowedMethods.includes(request.method)) {
    response.setHeader(
      "Allow",
      allowedMethods.join(", ")
    );

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

  const rawSubcategoryId = Array.isArray(
    request.query.id
  )
    ? request.query.id[0]
    : request.query.id;

  const subcategoryId = Number(rawSubcategoryId);

  if (
    !Number.isInteger(subcategoryId) ||
    subcategoryId <= 0
  ) {
    return response.status(400).json({
      error:
        "Identificador da subcategoria inválido.",
    });
  }

  if (request.method === "DELETE") {
    try {
      const result =
        await deleteAdminMenuSubcategory(
          subcategoryId
        );

      if (result.status === "not-found") {
        return response.status(404).json({
          error: "Subcategoria não encontrada.",
        });
      }

      return response.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error(
        "Erro ao eliminar a subcategoria:",
        error
      );

      return response.status(500).json({
        error:
          "Não foi possível eliminar a subcategoria.",
      });
    }
  }

  const contentType =
    request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "O pedido deve utilizar JSON.",
    });
  }

  const validation =
    updateMenuSubcategorySchema.safeParse(
      request.body
    );

  if (!validation.success) {
    return response.status(400).json({
      error:
        "Os dados da subcategoria são inválidos.",

      details: formatValidationErrors(
        validation.error
      ),
    });
  }

  try {
    const subcategory =
      await updateAdminMenuSubcategory(
        subcategoryId,
        validation.data
      );

    if (!subcategory) {
      return response.status(404).json({
        error: "Subcategoria não encontrada.",
      });
    }

    return response.status(200).json({
      subcategory,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar a subcategoria:",
      error
    );

    return response.status(500).json({
      error:
        "Não foi possível atualizar a subcategoria.",
    });
  }
}

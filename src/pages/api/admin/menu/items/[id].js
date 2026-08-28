import {
  deleteAdminMenuItem,
  updateAdminMenuItem,
} from "../../../../../server/adminMenuService";
import {
  updateMenuItemSchema,
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

  const rawItemId = Array.isArray(request.query.id)
    ? request.query.id[0]
    : request.query.id;

  const itemId = Number(rawItemId);

  if (
    !Number.isInteger(itemId) ||
    itemId <= 0
  ) {
    return response.status(400).json({
      error: "Identificador do prato inválido.",
    });
  }

  if (request.method === "DELETE") {
    try {
      const wasDeleted =
        await deleteAdminMenuItem(itemId);

      if (!wasDeleted) {
        return response.status(404).json({
          error: "Prato não encontrado.",
        });
      }

      return response.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error(
        "Erro ao eliminar o prato:",
        error
      );

      return response.status(500).json({
        error:
          "Não foi possível eliminar o prato.",
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
    updateMenuItemSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "Os dados do prato são inválidos.",
      details: formatValidationErrors(
        validation.error
      ),
    });
  }

  try {
    const updatedItem =
      await updateAdminMenuItem(
        itemId,
        validation.data
      );

    if (!updatedItem) {
      return response.status(404).json({
        error: "Prato não encontrado.",
      });
    }

    return response.status(200).json({
      item: updatedItem,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar o prato:",
      error
    );

    return response.status(500).json({
      error: "Não foi possível atualizar o prato.",
    });
  }
}
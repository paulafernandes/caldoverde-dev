import {
  moveAdminMenuItem,
} from "../../../../../server/adminMenuService";
import {
  moveMenuItemSchema,
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

  const validation =
    moveMenuItemSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error:
        "Os dados da ordenação são inválidos.",

      details: formatValidationErrors(
        validation.error
      ),
    });
  }

  try {
    const result = await moveAdminMenuItem(
      validation.data.itemId,
      validation.data.direction
    );

    if (!result) {
      return response.status(404).json({
        error: "Prato não encontrado.",
      });
    }

    return response.status(200).json(result);
  } catch (error) {
    console.error(
      "Erro ao ordenar o prato:",
      error
    );

    return response.status(500).json({
      error:
        "Não foi possível alterar a ordem do prato.",
    });
  }
}

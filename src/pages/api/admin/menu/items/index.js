import { createAdminMenuItem } from "../../../../../server/adminMenuService";
import { createMenuItemSchema } from "../../../../../server/adminMenuValidation";
import { getAdminSession } from "../../../../../server/getAdminSession";

function formatValidationErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");

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

  const contentType = request.headers["content-type"] ?? "";

  if (!contentType.includes("application/json")) {
    return response.status(415).json({
      error: "O pedido deve utilizar JSON.",
    });
  }

  const validation = createMenuItemSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "Os dados do prato são inválidos.",

      details: formatValidationErrors(validation.error),
    });
  }

  try {
    const createdItem = await createAdminMenuItem(validation.data);

    if (createdItem === null) {
      return response.status(404).json({
        error: "Categoria não encontrada.",
      });
    }

    if (createdItem === false) {
      return response.status(400).json({
        error: "A subcategoria selecionada não pertence a esta categoria.",
      });
    }

    if (createdItem === false) {
      return response.status(400).json({
        error: "A subcategoria não pertence à categoria selecionada.",
      });
    }

    return response.status(201).json({
      item: createdItem,
    });
  } catch (error) {
    console.error("Erro ao criar o prato:", error);

    return response.status(500).json({
      error: "Não foi possível criar o prato.",
    });
  }
}

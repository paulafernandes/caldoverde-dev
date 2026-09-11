import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../../../server/auth";
import { getAdminSession } from "../../../../server/getAdminSession";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);

    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  const session = await getAdminSession(req);

  if (!session) {
    return res.status(401).json({
      error: "Sessão de administradora necessária.",
    });
  }

  const userId = req.query.id;
  const name = req.body?.name?.trim();

  if (!userId || !name) {
    return res.status(400).json({
      error: "Utilizador e nome são obrigatórios.",
    });
  }

  try {
    const result = await auth.api.adminUpdateUser({
      headers: fromNodeHeaders(req.headers),
      body: {
        userId,
        data: {
          name,
        },
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "Erro ao atualizar utilizador:",
      error
    );

    return res.status(400).json({
      error: "Não foi possível atualizar o utilizador.",
    });
  }
}

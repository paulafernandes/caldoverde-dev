import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../../../../server/auth";
import { getAdminSession } from "../../../../../server/getAdminSession";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

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

  if (!userId) {
    return res.status(400).json({
      error: "Utilizador obrigatório.",
    });
  }

  try {
    const result = await auth.api.unbanUser({
      headers: fromNodeHeaders(req.headers),
      body: {
        userId,
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "Erro ao reativar utilizador:",
      error
    );

    return res.status(400).json({
      error: "Não foi possível reativar o utilizador.",
    });
  }
}

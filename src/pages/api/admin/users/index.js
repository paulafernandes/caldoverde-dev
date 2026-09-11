import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../../../server/auth";
import { getAdminSession } from "../../../../server/getAdminSession";

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", ["GET", "POST"]);

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

  if (req.method === "GET") {
    try {
      const result = await auth.api.listUsers({
        headers: fromNodeHeaders(req.headers),
        query: {
          limit: 100,
          offset: 0,
          sortBy: "name",
          sortDirection: "asc",
        },
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao listar utilizadores:", error);

      return res.status(500).json({
        error: "Não foi possível carregar os utilizadores.",
      });
    }
  }

  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Nome, email e palavra-passe são obrigatórios.",
    });
  }

  try {
    const result = await auth.api.createUser({
      headers: fromNodeHeaders(req.headers),
      body: {
        name,
        email,
        password,
        role: "admin",
      },
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar utilizador:", error);

    return res.status(400).json({
      error: "Não foi possível criar o utilizador.",
    });
  }
}

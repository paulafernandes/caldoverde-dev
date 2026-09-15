import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../../../server/auth";
import { getAdminSession } from "../../../../server/getAdminSession";

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", ["GET", "POST"]);

    return res.status(405).json({
      error: "METHOD_NOT_ALLOWED",
    });
  }

  const session = await getAdminSession(req);

  if (!session) {
    return res.status(401).json({
      error: "ADMIN_SESSION_REQUIRED",
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
      return res.status(500).json({
        error: "USER_LIST_FAILED",
      });
    }
  }

  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "INVALID_USER_DATA",
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
    return res.status(400).json({
      error: "USER_CREATE_FAILED",
    });
  }
}

import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../../../server/auth";
import { getAdminSession } from "../../../../server/getAdminSession";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);

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

  const userId = req.query.id;
  const name = req.body?.name?.trim();

  if (!userId || !name) {
    return res.status(400).json({
      error: "INVALID_USER_DATA",
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
    return res.status(400).json({
      error: "USER_UPDATE_FAILED",
    });
  }
}

import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../../../../server/auth";
import { getAdminSession } from "../../../../../server/getAdminSession";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

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

  if (!userId) {
    return res.status(400).json({
      error: "INVALID_USER_ID",
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
    return res.status(400).json({
      error: "USER_ACTIVATE_FAILED",
    });
  }
}

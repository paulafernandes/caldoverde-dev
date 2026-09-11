import { fromNodeHeaders } from "better-auth/node";

import { auth } from "./auth";

export async function getAdminSession(request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return session;
}

export async function adminFetch(input, init) {
  const response = await fetch(input, init);

  if (
    response.status === 401 &&
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(
      new CustomEvent("admin-session-expired")
    );
  }

  return response;
}

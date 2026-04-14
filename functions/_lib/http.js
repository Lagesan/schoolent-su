export function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

export function errorJson(message, status = 400, extra = {}) {
  return json(
    {
      ok: false,
      error: message,
      ...extra
    },
    { status }
  );
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid JSON payload.");
  }
}

export function getCookie(cookieHeader, name) {
  if (!cookieHeader) {
    return "";
  }

  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const prefix = `${name}=`;
  const match = cookies.find((item) => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : "";
}

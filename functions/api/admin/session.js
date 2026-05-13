import { clearSessionCookie, isAuthenticated } from "../../_lib/auth.js";
import { errorJson, json } from "../../_lib/http.js";
import { assertSameOrigin } from "../../_lib/security.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await isAuthenticated(request, env);
  return json({ ok: true, authenticated });
}

export async function onRequestDelete({ request }) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    return errorJson(error.message, 403);
  }

  const headers = new Headers();
  headers.append("Set-Cookie", clearSessionCookie());
  return json({ ok: true }, { headers });
}

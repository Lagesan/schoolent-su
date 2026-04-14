import { clearSessionCookie, isAuthenticated } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await isAuthenticated(request, env);
  return json({ ok: true, authenticated });
}

export async function onRequestDelete() {
  const headers = new Headers();
  headers.append("Set-Cookie", clearSessionCookie());
  return json({ ok: true }, { headers });
}

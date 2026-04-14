import { createSessionCookie, validatePassword } from "../../_lib/auth.js";
import { errorJson, json, readJson } from "../../_lib/http.js";

export async function onRequestPost({ request, env }) {
  try {
    const body = await readJson(request);
    const password = String(body.password || "");
    const valid = await validatePassword(password, env);

    if (!valid) {
      return errorJson("Invalid admin password.", 401);
    }

    const headers = new Headers();
    headers.append("Set-Cookie", await createSessionCookie(env));
    return json({ ok: true }, { headers });
  } catch (error) {
    return errorJson(error.message || "Login failed.", 500);
  }
}

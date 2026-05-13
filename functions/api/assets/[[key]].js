import { decodeAssetKey, hasBucket } from "../../_lib/r2.js";
import { attachmentDisposition, isSafeInlineType, securityHeaders } from "../../_lib/security.js";

export async function onRequestGet({ env, params }) {
  if (!hasBucket(env)) {
    return new Response("R2 binding is not configured.", { status: 500 });
  }

  const rawKey = Array.isArray(params.key) ? params.key.join("/") : params.key;
  const key = decodeAssetKey(rawKey || "");
  if (!key) {
    return new Response("Missing asset key.", { status: 400 });
  }

  const object = await env.R2.get(key);
  if (!object) {
    return new Response("Asset not found.", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  const contentType = headers.get("Content-Type") || "application/octet-stream";
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  if (!isSafeInlineType(contentType)) {
    headers.set("Content-Disposition", attachmentDisposition(key.split("/").at(-1)));
  }
  Object.entries(securityHeaders()).forEach(([name, value]) => headers.set(name, value));
  return new Response(object.body, { headers });
}

import { hasBucket } from "../../_lib/r2.js";
import { attachmentDisposition, securityHeaders } from "../../_lib/security.js";

const DEFAULT_R2_KEY = "releases/schoolent-android.apk";
const DOWNLOAD_FILENAME = "Schoolent-Android-v1.0.apk";

export async function onRequestGet({ env }) {
  const externalUrl = String(env?.ANDROID_APK_URL || "").trim();
  if (externalUrl) {
    try {
      const url = new URL(externalUrl);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return Response.redirect(url.toString(), 302);
      }
    } catch (error) {
      return textResponse("ANDROID_APK_URL is not a valid URL.", 500);
    }
  }

  const r2Key = String(env?.ANDROID_APK_R2_KEY || DEFAULT_R2_KEY).trim();
  if (r2Key && hasBucket(env)) {
    const object = await env.R2.get(r2Key);
    if (object) {
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Content-Type", headers.get("Content-Type") || "application/vnd.android.package-archive");
      headers.set("Content-Disposition", attachmentDisposition(DOWNLOAD_FILENAME));
      headers.set("Cache-Control", "public, max-age=300");
      headers.set("X-Content-Type-Options", "nosniff");
      if (typeof object.size === "number") {
        headers.set("Content-Length", String(object.size));
      }
      Object.entries(securityHeaders()).forEach(([name, value]) => headers.set(name, value));
      return new Response(object.body, { headers });
    }
  }

  return textResponse("Android package is not configured.", 404);
}

function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...securityHeaders()
    }
  });
}

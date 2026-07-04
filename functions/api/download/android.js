import { hasBucket } from "../../_lib/r2.js";
import { attachmentDisposition, securityHeaders } from "../../_lib/security.js";

const DOWNLOAD_FILENAME = "Schoolent-Android-v1.4.apk";
const RELEASE_DOWNLOADS = [
  `https://github.com/Lagesan/schoolent-su-mobile/releases/latest/download/${DOWNLOAD_FILENAME}`
];

export async function onRequest({ env, request }) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return textResponse("Method not allowed.", 405);
  }
  return handleDownload(env);
}

async function handleDownload(env) {
  const externalUrl = String(env?.ANDROID_APK_URL || "").trim();
  if (externalUrl) {
    try {
      const url = new URL(externalUrl);
      if (url.protocol === "https:" || url.protocol === "http:") {
        if (await isReachableApkUrl(url.toString())) {
          return Response.redirect(url.toString(), 302);
        }
      }
    } catch (error) {
      return textResponse("ANDROID_APK_URL is not a valid URL.", 500);
    }
  }

  const releaseUrl = await pickReachableReleaseUrl();
  if (releaseUrl) {
    return Response.redirect(releaseUrl, 302);
  }

  const r2Key = String(env?.ANDROID_APK_R2_KEY || "").trim();
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

async function isReachableApkUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok && isApkLikeResponse(response);
  } catch (error) {
    return false;
  }
}

async function pickReachableReleaseUrl() {
  const checks = RELEASE_DOWNLOADS.map(async (url) => {
    try {
      if (await isReachableApkUrl(url)) {
        return url;
      }
    } catch (error) {
      return null;
    }
    return null;
  });

  try {
    return await Promise.any(
      checks.map((check) =>
        check.then((url) => {
          if (!url) throw new Error("release url unavailable");
          return url;
        })
      )
    );
  } catch (error) {
    return null;
  }
}

function isApkLikeResponse(response) {
  const finalUrl = String(response.url || "");
  const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
  const contentDisposition = String(response.headers.get("Content-Disposition") || "").toLowerCase();
  if (contentType.includes("text/html")) {
    return false;
  }
  if (finalUrl && !finalUrl.includes(".apk") && !contentDisposition.includes(".apk")) {
    return false;
  }
  return contentDisposition.includes(".apk") ||
    contentType.includes("android.package-archive") ||
    contentType.includes("application/octet-stream") ||
    contentType.includes("binary/octet-stream");
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

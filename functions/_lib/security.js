const SAFE_INLINE_TYPES = [
  "image/",
  "video/",
  "audio/",
  "application/pdf",
  "text/plain"
];

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

export function isAllowedUploadType(type = "") {
  return ALLOWED_UPLOAD_TYPES.includes(String(type || "").toLowerCase());
}

export function isSafeInlineType(type = "") {
  const normalized = String(type || "").toLowerCase();
  return SAFE_INLINE_TYPES.some((allowed) => normalized === allowed || normalized.startsWith(allowed));
}

export function securityHeaders(extra = {}) {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    ...extra
  };
}

export function assertSameOrigin(request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return;
  }

  const origin = request.headers.get("Origin");
  if (!origin) {
    return;
  }

  const requestOrigin = new URL(request.url).origin;
  if (origin !== requestOrigin) {
    throw new Error("Cross-origin admin request blocked.");
  }
}

export function attachmentDisposition(filename = "download") {
  const safeName = String(filename || "download").replace(/[\\"]/g, "-");
  return `attachment; filename="${safeName}"`;
}

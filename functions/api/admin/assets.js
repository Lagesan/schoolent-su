import { isAuthenticated } from "../../_lib/auth.js";
import { errorJson, json } from "../../_lib/http.js";
import { createObjectKey, hasBucket, objectUrl } from "../../_lib/r2.js";
import { assertSameOrigin, isAllowedUploadType } from "../../_lib/security.js";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    return errorJson(error.message, 403);
  }

  const authenticated = await isAuthenticated(request, env);
  if (!authenticated) {
    return errorJson("Unauthorized.", 401);
  }

  if (!hasBucket(env)) {
    return errorJson("R2 binding `R2` is not configured.", 500);
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return errorJson("Missing file.", 400);
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return errorJson("File is too large. Maximum size is 25 MB.", 413);
    }

    const contentType = file.type || "application/octet-stream";
    if (!isAllowedUploadType(contentType)) {
      return errorJson("This file type is not allowed.", 415);
    }

    const key = createObjectKey(file.name);
    await env.R2.put(key, file.stream(), {
      httpMetadata: {
        contentType
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    return json({
      ok: true,
      asset: {
        label: {
          zh: file.name,
          en: file.name
        },
        url: objectUrl(key),
        key,
        name: file.name,
        type: contentType,
        size: file.size
      }
    });
  } catch (error) {
    return errorJson(error.message || "Unable to upload asset.", 500);
  }
}

import { isAuthenticated } from "../../_lib/auth.js";
import { getContentRecord, saveContentRecord } from "../../_lib/db.js";
import { errorJson, json, readJson } from "../../_lib/http.js";
import { assertSameOrigin } from "../../_lib/security.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await isAuthenticated(request, env);
  if (!authenticated) {
    return errorJson("Unauthorized.", 401);
  }

  try {
    const record = await getContentRecord(env);
    const migrated = record.migrationNeeded ? await saveContentRecord(env, record.content) : null;
    const activeRecord = migrated
      ? { content: migrated.content, updatedAt: migrated.updatedAt, storage: "d1" }
      : record;

    return json({
      ok: true,
      content: activeRecord.content,
      meta: {
        updatedAt: activeRecord.updatedAt,
        storage: activeRecord.storage,
        migrated: Boolean(migrated)
      }
    });
  } catch (error) {
    return errorJson(error.message || "Unable to load content.", 500);
  }
}

export async function onRequestPut({ request, env }) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    return errorJson(error.message, 403);
  }

  const authenticated = await isAuthenticated(request, env);
  if (!authenticated) {
    return errorJson("Unauthorized.", 401);
  }

  try {
    const body = await readJson(request);
    const result = await saveContentRecord(env, body.content);
    return json({
      ok: true,
      content: result.content,
      meta: {
        updatedAt: result.updatedAt,
        storage: "d1"
      }
    });
  } catch (error) {
    return errorJson(error.message || "Unable to save content.", 500);
  }
}

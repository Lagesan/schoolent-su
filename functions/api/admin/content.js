import { isAuthenticated } from "../../_lib/auth.js";
import {
  CONTENT_CONFLICT_CODE,
  getContentRecord,
  saveContentRecord
} from "../../_lib/db.js";
import { errorJson, json, readJson } from "../../_lib/http.js";
import { assertSameOrigin } from "../../_lib/security.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await isAuthenticated(request, env);
  if (!authenticated) {
    return errorJson("Unauthorized.", 401);
  }

  try {
    const record = await getContentRecord(env);
    let migrated = null;
    let activeRecord = record;
    if (record.migrationNeeded) {
      try {
        migrated = await saveContentRecord(env, record.content, {
          expectedUpdatedAt: record.updatedAt
        });
        activeRecord = {
          content: migrated.content,
          updatedAt: migrated.updatedAt,
          storage: "d1"
        };
      } catch (error) {
        if (error.code !== CONTENT_CONFLICT_CODE) {
          throw error;
        }
        activeRecord = await getContentRecord(env);
      }
    }

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
    const expectedUpdatedAt = typeof body.expectedUpdatedAt === "string"
      ? body.expectedUpdatedAt.trim()
      : "";
    if (!expectedUpdatedAt) {
      return errorJson("Reload the editor before saving.", 428, {
        code: "CONTENT_VERSION_REQUIRED"
      });
    }

    const result = await saveContentRecord(env, body.content, { expectedUpdatedAt });
    return json({
      ok: true,
      content: result.content,
      meta: {
        updatedAt: result.updatedAt,
        storage: "d1"
      }
    });
  } catch (error) {
    if (error.code === CONTENT_CONFLICT_CODE) {
      let updatedAt = null;
      try {
        updatedAt = (await getContentRecord(env)).updatedAt;
      } catch {
        // The conflict response remains actionable even if metadata refresh fails.
      }
      return errorJson("Content was published from another editor session.", 409, {
        code: CONTENT_CONFLICT_CODE,
        meta: { updatedAt }
      });
    }
    return errorJson(error.message || "Unable to save content.", 500);
  }
}

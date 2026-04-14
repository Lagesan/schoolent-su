import { getContentRecord } from "../_lib/db.js";
import { errorJson, json } from "../_lib/http.js";

export async function onRequestGet(context) {
  try {
    const record = await getContentRecord(context.env);
    return json({
      ok: true,
      content: record.content,
      meta: {
        updatedAt: record.updatedAt,
        storage: record.storage
      }
    });
  } catch (error) {
    return errorJson(error.message || "Unable to load portal content.", 500);
  }
}

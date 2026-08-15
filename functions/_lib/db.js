import { createDefaultContent, normalizeContent } from "./default-content.js";
import {
  deleteLongTextRevision,
  dehydrateLongTextFields,
  hydrateLongTextFields,
  needsContentStorageMigration
} from "./content-storage.js";

const RECORD_ID = "portal";
export const CONTENT_CONFLICT_CODE = "CONTENT_CONFLICT";
const SCHEMA =
  "CREATE TABLE IF NOT EXISTS content_store (id TEXT PRIMARY KEY, content_json TEXT NOT NULL, updated_at TEXT NOT NULL);";

function hasDatabase(env) {
  return Boolean(env?.DB && typeof env.DB.prepare === "function");
}

export async function getContentRecord(env) {
  if (!hasDatabase(env)) {
    return {
      content: normalizeContent(createDefaultContent()),
      updatedAt: null,
      storage: "fallback"
    };
  }

  await ensureDatabase(env);
  const row = await env.DB.prepare(
    "SELECT content_json, updated_at FROM content_store WHERE id = ?1"
  )
    .bind(RECORD_ID)
    .first();

  if (!row) {
    const seeded = await initializeContentRecord(env);
    return {
      content: seeded.content,
      updatedAt: seeded.updatedAt,
      storage: "d1"
    };
  }

  let parsed;
  try {
    parsed = row.content_json ? JSON.parse(row.content_json) : createDefaultContent();
  } catch {
    const seeded = await initializeContentRecord(env);
    return {
      content: seeded.content,
      updatedAt: seeded.updatedAt,
      storage: "d1"
    };
  }

  const migrationNeeded = await needsContentStorageMigration(env, parsed);
  const hydrated = await hydrateLongTextFields(env, parsed);

  return {
    content: normalizeContent(hydrated),
    updatedAt: row.updated_at,
    storage: "d1",
    migrationNeeded
  };
}

export async function saveContentRecord(env, content, { expectedUpdatedAt = "" } = {}) {
  if (!hasDatabase(env)) {
    throw new Error("D1 binding `DB` is not configured.");
  }

  await ensureDatabase(env);

  const normalized = normalizeContent(content);
  const storageRevision = crypto.randomUUID();
  const stored = await dehydrateLongTextFields(env, normalized, { storageRevision });
  const updatedAt = nextUpdatedAt(expectedUpdatedAt);
  if (expectedUpdatedAt) {
    const result = await env.DB.prepare(
      `
        UPDATE content_store
        SET content_json = ?2, updated_at = ?3
        WHERE id = ?1 AND updated_at = ?4
      `
    )
      .bind(RECORD_ID, JSON.stringify(stored), updatedAt, expectedUpdatedAt)
      .run();

    if (Number(result?.meta?.changes || 0) !== 1) {
      await discardUncommittedRevision(env, storageRevision);
      const error = new Error("Content changed after this editor session loaded.");
      error.code = CONTENT_CONFLICT_CODE;
      throw error;
    }
  } else {
    await env.DB.prepare(
      `
        INSERT INTO content_store (id, content_json, updated_at)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(id) DO UPDATE SET
          content_json = excluded.content_json,
          updated_at = excluded.updated_at
      `
    )
      .bind(RECORD_ID, JSON.stringify(stored), updatedAt)
      .run();
  }

  // Keep committed R2 objects immutable. Deleting older text revisions or
  // unreferenced attachments here can race active readers, concurrent saves,
  // and uploads from another admin tab. A retention-aware maintenance job can
  // collect confirmed orphans later without putting published content at risk.

  return {
    content: normalized,
    updatedAt
  };
}

async function ensureDatabase(env) {
  await env.DB.prepare(SCHEMA).run();
}

async function initializeContentRecord(env) {
  const seeded = normalizeContent(createDefaultContent());
  const storageRevision = crypto.randomUUID();
  const stored = await dehydrateLongTextFields(env, seeded, { storageRevision });
  const updatedAt = new Date().toISOString();

  await env.DB.prepare(
    `
      INSERT INTO content_store (id, content_json, updated_at)
      VALUES (?1, ?2, ?3)
      ON CONFLICT(id) DO UPDATE SET
        content_json = excluded.content_json,
        updated_at = excluded.updated_at
    `
  )
    .bind(RECORD_ID, JSON.stringify(stored), updatedAt)
    .run();

  return {
    content: seeded,
    updatedAt
  };
}

async function discardUncommittedRevision(env, storageRevision) {
  try {
    await deleteLongTextRevision(env, storageRevision);
  } catch (error) {
    console.warn("Unable to discard an uncommitted content revision", error);
  }
}

function nextUpdatedAt(previousValue = "") {
  const previousTime = Date.parse(previousValue);
  const nextTime = Number.isFinite(previousTime)
    ? Math.max(Date.now(), previousTime + 1)
    : Date.now();
  return new Date(nextTime).toISOString();
}

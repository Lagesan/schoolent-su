import { createDefaultContent, normalizeContent } from "./default-content.js";

const RECORD_ID = "portal";
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
    return {
      content: normalizeContent(createDefaultContent()),
      updatedAt: null,
      storage: "fallback"
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(row.content_json);
  } catch {
    parsed = createDefaultContent();
  }

  return {
    content: normalizeContent(parsed),
    updatedAt: row.updated_at,
    storage: "d1"
  };
}

export async function saveContentRecord(env, content) {
  if (!hasDatabase(env)) {
    throw new Error("D1 binding `DB` is not configured.");
  }

  await ensureDatabase(env);

  const normalized = normalizeContent(content);
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
    .bind(RECORD_ID, JSON.stringify(normalized), updatedAt)
    .run();

  return {
    content: normalized,
    updatedAt
  };
}

async function ensureDatabase(env) {
  await env.DB.prepare(SCHEMA).run();

  const existing = await env.DB.prepare("SELECT id FROM content_store WHERE id = ?1")
    .bind(RECORD_ID)
    .first();

  if (existing) {
    return;
  }

  const seeded = normalizeContent(createDefaultContent());
  const updatedAt = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO content_store (id, content_json, updated_at) VALUES (?1, ?2, ?3)"
  )
    .bind(RECORD_ID, JSON.stringify(seeded), updatedAt)
    .run();
}

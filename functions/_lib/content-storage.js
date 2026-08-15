import { hasBucket, objectUrl, safeObjectName } from "./r2.js";

const TEXT_MARKER = "__schoolentR2Text";
const R2_OPERATION_CONCURRENCY = 8;

const LONG_TEXT_FIELDS = [
  ["hero", "subtitle"],
  ["hero", "promise"],
  ["notices", "*", "message"],
  ["organization", "intro"],
  ["organization", "leadership", "scope"],
  ["organization", "monthlyPresident", "note"],
  ["organization", "presidentRotation", "note"],
  ["organization", "presidentRotation", "members", "*", "note"],
  ["organization", "people", "*", "note"],
  ["organization", "people", "*", "rotation", "note"],
  ["organization", "people", "*", "roles", "*", "scope"],
  ["organization", "departments", "*", "scope"],
  ["activities", "intro"],
  ["activities", "items", "*", "summary"],
  ["updates", "intro"],
  ["updates", "items", "*", "summary"],
  ["updates", "items", "*", "body"],
  ["finance", "intro"],
  ["finance", "summary"],
  ["finance", "manualNote"],
  ["finance", "hiddenFlowReason"],
  ["finance", "categories", "*", "note"],
  ["initiatives", "intro"],
  ["initiatives", "items", "*", "summary"],
  ["publications", "intro"],
  ["publications", "items", "*", "summary"],
  ["footer", "statement"]
];

export async function hydrateLongTextFields(env, content) {
  const copy = clone(content);
  const fields = [];
  await visitLongTextFields(copy, (holder, key) => {
    fields.push({ holder, key, value: holder[key] });
  });

  const descriptors = fields
    .filter(({ value }) => isTextMarker(value))
    .flatMap(({ value }) => [value.zh, value.en]);
  const hydratedText = await readTextObjects(env, descriptors);

  for (const { holder, key, value } of fields) {
    holder[key] = hydrateLocalizedText(value, hydratedText);
  }

  return copy;
}

export async function dehydrateLongTextFields(env, content, { storageRevision = crypto.randomUUID() } = {}) {
  const copy = clone(content);
  if (!hasBucket(env)) {
    return copy;
  }

  const usedKeys = new Set();
  const fields = [];
  await visitLongTextFields(copy, (holder, key, path) => {
    fields.push({ holder, key, path, value: holder[key] });
  });
  let dehydratedValues;
  try {
    dehydratedValues = await mapWithConcurrency(
      fields,
      R2_OPERATION_CONCURRENCY,
      ({ path, value }) => dehydrateLocalizedText(env, value, path, usedKeys, storageRevision)
    );
  } catch (error) {
    await deleteKeysBestEffort(env, usedKeys);
    throw error;
  }
  fields.forEach(({ holder, key }, index) => {
    holder[key] = dehydratedValues[index];
  });

  return copy;
}

export async function deleteStaleLongTextObjects(env, storedContent) {
  if (!hasBucket(env) || typeof env.R2.list !== "function" || typeof env.R2.delete !== "function") {
    return;
  }

  const usedKeys = new Set();
  await visitLongTextFields(storedContent, (holder, key) => {
    if (isTextMarker(holder[key])) {
      markUsed(holder[key], usedKeys);
    }
  });
  await deleteStaleObjects(env, "content/", usedKeys);
}

export async function deleteLongTextRevision(env, storageRevision) {
  if (!storageRevision || !hasBucket(env) || typeof env.R2.list !== "function" || typeof env.R2.delete !== "function") {
    return;
  }

  await deleteStaleObjects(env, `content/${safeObjectName(storageRevision)}/`, new Set());
}

export async function deleteStaleUpdateAttachments(env, content) {
  if (!hasBucket(env) || typeof env.R2.list !== "function" || typeof env.R2.delete !== "function") {
    return;
  }

  const usedKeys = new Set();
  const updates = Array.isArray(content?.updates?.items) ? content.updates.items : [];
  for (const update of updates) {
    const attachments = Array.isArray(update?.attachments) ? update.attachments : [];
    for (const attachment of attachments) {
      if (attachment?.key) {
        usedKeys.add(attachment.key);
      }
    }
  }

  await deleteStaleObjects(env, "updates/", usedKeys);
}

export async function needsContentStorageMigration(env, content) {
  if (!hasBucket(env)) {
    return false;
  }

  let hasInlineLongText = false;
  await visitLongTextFields(content, async (holder, key) => {
    const value = holder[key];
    if (isInlineLocalizedText(value)) {
      hasInlineLongText = true;
    }
  });

  return hasInlineLongText;
}

function hydrateLocalizedText(value, hydratedText) {
  if (!isTextMarker(value)) {
    return value;
  }

  return {
    zh: hydratedText.get(value.zh?.key) || "",
    en: hydratedText.get(value.en?.key) || ""
  };
}

async function readTextObjects(env, descriptors) {
  const keys = [
    ...new Set(
      descriptors
        .map((descriptor) => descriptor?.key)
        .filter(Boolean)
    )
  ];
  const values = await mapWithConcurrency(keys, R2_OPERATION_CONCURRENCY, (key) =>
    readTextObject(env, { key })
  );

  return new Map(keys.map((key, index) => [key, values[index]]));
}

async function dehydrateLocalizedText(env, value, path, usedKeys, storageRevision) {
  if (isTextMarker(value)) {
    markUsed(value, usedKeys);
    return value;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const zh = await writeTextObject(env, storageRevision, path, "zh", value.zh, usedKeys);
  const en = await writeTextObject(env, storageRevision, path, "en", value.en, usedKeys);

  if (!zh && !en) {
    return { zh: "", en: "" };
  }

  return {
    [TEXT_MARKER]: true,
    zh,
    en
  };
}

function markUsed(value, usedKeys) {
  for (const descriptor of [value.zh, value.en]) {
    if (descriptor?.key) {
      usedKeys.add(descriptor.key);
    }
  }
}

async function readTextObject(env, descriptor) {
  if (!descriptor?.key || !hasBucket(env)) {
    return "";
  }

  const object = await env.R2.get(descriptor.key);
  if (!object) {
    return "";
  }

  return object.text();
}

async function mapWithConcurrency(items, limit, mapper) {
  if (!items.length) {
    return [];
  }

  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );
  const settlements = await Promise.allSettled(workers);
  const failure = settlements.find((result) => result.status === "rejected");
  if (failure) {
    throw failure.reason;
  }
  return results;
}

async function writeTextObject(env, storageRevision, path, lang, value, usedKeys) {
  const text = typeof value === "string" ? value : "";
  const rich = path.includes(".body");
  const extension = rich ? "html" : "txt";
  const contentType = rich ? "text/html; charset=utf-8" : "text/plain; charset=utf-8";
  const key = `content/${safeObjectName(storageRevision)}/${safeObjectName(path)}/${lang}.${extension}`;

  if (!text.trim()) {
    return null;
  }

  await env.R2.put(key, text, {
    httpMetadata: {
      contentType
    },
    customMetadata: {
      source: "schoolent-content",
      revision: storageRevision,
      path,
      lang
    }
  });
  usedKeys.add(key);

  return {
    key,
    url: objectUrl(key),
    type: contentType
  };
}

async function deleteStaleObjects(env, prefix, usedKeys) {
  let cursor;
  do {
    const page = await env.R2.list({
      prefix,
      cursor
    });
    const staleKeys = (page.objects || [])
      .map((item) => item.key)
      .filter((key) => !usedKeys.has(key));

    await mapWithConcurrency(staleKeys, R2_OPERATION_CONCURRENCY, (key) =>
      deleteObject(env, key)
    );
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}

async function deleteKeysBestEffort(env, keys) {
  await mapWithConcurrency([...keys], R2_OPERATION_CONCURRENCY, async (key) => {
    try {
      await deleteObject(env, key);
    } catch {
      // A later successful save also removes abandoned revision objects.
    }
  });
}

async function deleteObject(env, key) {
  if (typeof env.R2.delete === "function") {
    await env.R2.delete(key);
  }
}

async function visitLongTextFields(root, callback) {
  for (const path of LONG_TEXT_FIELDS) {
    await visitPath(root, path, [], callback);
  }
}

async function visitPath(current, segments, actualPath, callback) {
  if (!current || typeof current !== "object") {
    return;
  }

  const [segment, ...rest] = segments;
  if (segment === undefined) {
    return;
  }

  if (segment === "*") {
    if (!Array.isArray(current)) {
      return;
    }
    for (let index = 0; index < current.length; index += 1) {
      await visitPath(current[index], rest, actualPath.concat(index), callback);
    }
    return;
  }

  if (rest.length === 0) {
    if (Object.prototype.hasOwnProperty.call(current, segment)) {
      await callback(current, segment, actualPath.concat(segment).join("."));
    }
    return;
  }

  await visitPath(current[segment], rest, actualPath.concat(segment), callback);
}

function isTextMarker(value) {
  return Boolean(value && typeof value === "object" && value[TEXT_MARKER]);
}

function isInlineLocalizedText(value) {
  if (!value || typeof value !== "object" || isTextMarker(value)) {
    return false;
  }

  return ["zh", "en"].some((lang) => typeof value[lang] === "string" && value[lang].trim());
}

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

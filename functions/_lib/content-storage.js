import { hasBucket, objectUrl, safeObjectName } from "./r2.js";

const TEXT_MARKER = "__schoolentR2Text";

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
  await visitLongTextFields(copy, async (holder, key, path) => {
    holder[key] = await hydrateLocalizedText(env, holder[key], path);
  });
  return copy;
}

export async function dehydrateLongTextFields(env, content) {
  const copy = clone(content);
  if (!hasBucket(env)) {
    return copy;
  }

  const usedKeys = new Set();
  await visitLongTextFields(copy, async (holder, key, path) => {
    holder[key] = await dehydrateLocalizedText(env, holder[key], path, usedKeys);
  });
  await deleteStaleTextObjects(env, usedKeys);
  return copy;
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
  if (Array.isArray(content?.notices) && content.notices.length) {
    return true;
  }

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

async function hydrateLocalizedText(env, value, path) {
  if (!isTextMarker(value)) {
    return value;
  }

  return {
    zh: await readTextObject(env, value.zh),
    en: await readTextObject(env, value.en)
  };
}

async function dehydrateLocalizedText(env, value, path, usedKeys) {
  if (isTextMarker(value)) {
    markUsed(value, usedKeys);
    return value;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const zh = await writeTextObject(env, path, "zh", value.zh, usedKeys);
  const en = await writeTextObject(env, path, "en", value.en, usedKeys);

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

async function writeTextObject(env, path, lang, value, usedKeys) {
  const text = typeof value === "string" ? value : "";
  const rich = path.includes(".body");
  const extension = rich ? "html" : "txt";
  const contentType = rich ? "text/html; charset=utf-8" : "text/plain; charset=utf-8";
  const key = `content/${safeObjectName(path)}/${lang}.${extension}`;

  if (!text.trim()) {
    await deleteObject(env, key);
    return null;
  }

  await env.R2.put(key, text, {
    httpMetadata: {
      contentType
    },
    customMetadata: {
      source: "schoolent-content",
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

async function deleteStaleTextObjects(env, usedKeys) {
  if (typeof env.R2.list !== "function" || typeof env.R2.delete !== "function") {
    return;
  }

  await deleteStaleObjects(env, "content/", usedKeys);
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

    await Promise.all(staleKeys.map((key) => deleteObject(env, key)));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
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

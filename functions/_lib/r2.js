export function hasBucket(env) {
  return Boolean(env?.R2 && typeof env.R2.get === "function" && typeof env.R2.put === "function");
}

export function safeObjectName(name = "file") {
  return String(name)
    .replace(/[\\/:*?"<>|#%{}^~[\]`]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120) || "file";
}

export function createObjectKey(filename) {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  return `updates/${year}/${month}/${id}-${safeObjectName(filename)}`;
}

export function objectUrl(key) {
  return `/api/assets/${encodeURIComponent(key).replaceAll("%2F", "/")}`;
}

export function decodeAssetKey(value = "") {
  return String(value)
    .split("/")
    .map((part) => decodeURIComponent(part))
    .join("/");
}

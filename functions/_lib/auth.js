import { getCookie } from "./http.js";

const SESSION_COOKIE = "su_portal_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function validatePassword(password, env) {
  if (!env.ADMIN_PASSWORD) {
    throw new Error("Secret `ADMIN_PASSWORD` is not configured.");
  }

  return secureCompare(String(password || ""), String(env.ADMIN_PASSWORD));
}

export async function createSessionCookie(env) {
  if (!env.SESSION_SECRET) {
    throw new Error("Secret `SESSION_SECRET` is not configured.");
  }

  const payload = {
    exp: Date.now() + SESSION_MAX_AGE * 1000,
    nonce: crypto.randomUUID()
  };
  const payloadPart = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await signPayload(payloadPart, env.SESSION_SECRET);

  return `${SESSION_COOKIE}=${encodeURIComponent(`${payloadPart}.${signature}`)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function isAuthenticated(request, env) {
  if (!env.SESSION_SECRET) {
    return false;
  }

  const token = getCookie(request.headers.get("Cookie"), SESSION_COOKIE);
  if (!token) {
    return false;
  }

  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) {
    return false;
  }

  const expected = await signPayload(payloadPart, env.SESSION_SECRET);
  if (!secureCompare(signature, expected)) {
    return false;
  }

  let payload;
  try {
    payload = JSON.parse(decoder.decode(base64UrlDecode(payloadPart)));
  } catch {
    return false;
  }

  return typeof payload.exp === "number" && payload.exp > Date.now();
}

function secureCompare(a, b) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (left[index] || 0) ^ (right[index] || 0);
  }

  return mismatch === 0;
}

async function signPayload(payloadPart, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadPart));
  return base64UrlEncode(new Uint8Array(signature));
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

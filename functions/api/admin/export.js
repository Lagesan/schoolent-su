import { isAuthenticated } from "../../_lib/auth.js";
import { getContentRecord } from "../../_lib/db.js";
import { hasBucket } from "../../_lib/r2.js";
import { securityHeaders } from "../../_lib/security.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await isAuthenticated(request, env);
  if (!authenticated) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const record = await getContentRecord(env);
  const exportedAt = new Date().toISOString();
  const content = structuredClone(record.content);
  await embedR2Assets(env, content);

  const html = buildArchiveHtml(content, {
    exportedAt,
    updatedAt: record.updatedAt,
    storage: record.storage
  });

  const filename = `schoolent-portal-export-${exportedAt.slice(0, 10)}.html`;
  return new Response(html, {
    headers: {
      ...securityHeaders(),
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}

async function embedR2Assets(env, content) {
  const updates = Array.isArray(content.updates?.items) ? content.updates.items : [];
  if (!hasBucket(env)) {
    return;
  }

  for (const update of updates) {
    const attachments = Array.isArray(update.attachments) ? update.attachments : [];
    for (const attachment of attachments) {
      if (!attachment.key) {
        continue;
      }

      const object = await env.R2.get(attachment.key);
      if (!object) {
        continue;
      }

      const type = object.httpMetadata?.contentType || attachment.type || "application/octet-stream";
      const buffer = await object.arrayBuffer();
      attachment.dataUrl = `data:${type};base64,${arrayBufferToBase64(buffer)}`;
    }
  }
}

function buildArchiveHtml(content, meta) {
  const updates = Array.isArray(content.updates?.items) ? content.updates.items : [];
  const notices = Array.isArray(content.notices) ? content.notices : [];
  const activities = Array.isArray(content.activities?.items) ? content.activities.items : [];
  const publications = Array.isArray(content.publications?.items) ? content.publications.items : [];
  const finance = content.finance || {};
  const organization = content.organization || {};

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pick(content.site?.shortName) || "Schoolent")} Export</title>
  <style>
    body{margin:0;background:#000;color:#fff;font-family:Arial,"PingFang SC",sans-serif;line-height:1.65}
    main{width:min(1120px,calc(100vw - 32px));margin:0 auto;padding:32px 0 64px}
    section{border-top:1px solid rgba(255,255,255,.18);padding:28px 0}
    h1,h2,h3{font-family:Georgia,"Times New Roman",serif;font-weight:400}
    h1{font-size:42px} h2{font-size:28px} h3{font-size:20px}
    .meta,.tag,p,td,th{color:rgba(255,255,255,.72)} .tag{display:inline-block;border:1px solid rgba(255,255,255,.35);padding:4px 8px;font-size:12px;text-transform:uppercase}
    article{border:1px solid rgba(255,255,255,.18);padding:18px;margin:14px 0;background:#050505}
    table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid rgba(255,255,255,.18);padding:10px;text-align:left}
    a{color:#fff}.rich img,.rich video{max-width:100%;height:auto;border:1px solid rgba(255,255,255,.18)}
    pre{white-space:pre-wrap;overflow:auto;background:#050505;border:1px solid rgba(255,255,255,.18);padding:16px}
  </style>
</head>
<body>
  <main>
    <header>
      <p class="tag">Schoolent Portal Export</p>
      <h1>${escapeHtml(pick(content.site?.name) || "Student Council Portal")}</h1>
      <p class="meta">Exported: ${escapeHtml(meta.exportedAt)} / Source updated: ${escapeHtml(meta.updatedAt || "N/A")}</p>
    </header>
    <section>
      <h2>Updates</h2>
      ${updates.map(renderUpdateArchive).join("") || emptyArchive()}
    </section>
    <section>
      <h2>Notifications</h2>
      ${notices.map((item) => `<article><p class="tag">${escapeHtml(pick(item.label))}</p><p>${escapeHtml(pick(item.message))}</p></article>`).join("") || emptyArchive()}
    </section>
    <section>
      <h2>Activities</h2>
      ${activities.map((item) => `<article><p class="tag">${escapeHtml(item.status || "")}</p><h3>${escapeHtml(pick(item.title))}</h3><p>${escapeHtml(formatDate(item.date))} ${escapeHtml(pick(item.location))}</p><p>${escapeHtml(pick(item.summary))}</p></article>`).join("") || emptyArchive()}
    </section>
    <section>
      <h2>Finance</h2>
      <p>${escapeHtml(pick(finance.summary))}</p>
      <table><tbody>
        <tr><th>Budget</th><td>${escapeHtml(String(finance.totals?.budget ?? 0))}</td></tr>
        <tr><th>Available</th><td>${escapeHtml(String(finance.totals?.available ?? 0))}</td></tr>
        <tr><th>Reserve</th><td>${escapeHtml(String(finance.totals?.reserve ?? 0))}</td></tr>
      </tbody></table>
      <h3>Categories</h3>
      <table><tbody>${(finance.categories || []).map((item) => `<tr><td>${escapeHtml(pick(item.label))}</td><td>${escapeHtml(String(item.amount || 0))}</td><td>${escapeHtml(pick(item.note))}</td></tr>`).join("")}</tbody></table>
    </section>
    <section>
      <h2>Organization</h2>
      <pre>${escapeHtml(JSON.stringify(organization, null, 2))}</pre>
    </section>
    <section>
      <h2>Public Notes</h2>
      ${publications.map((item) => `<article><p class="tag">${escapeHtml(item.tag || "")}</p><h3>${escapeHtml(pick(item.title))}</h3><p>${escapeHtml(formatDate(item.date))}</p><p>${escapeHtml(pick(item.summary))}</p></article>`).join("") || emptyArchive()}
    </section>
    <section>
      <h2>Raw Data</h2>
      <pre>${escapeHtml(JSON.stringify({ content, meta }, null, 2))}</pre>
    </section>
  </main>
</body>
</html>`;
}

function renderUpdateArchive(item) {
  const attachments = Array.isArray(item.attachments) ? item.attachments : [];
  return `<article>
    <p class="tag">${escapeHtml(item.tag || "UPDATE")}</p>
    <h3>${escapeHtml(pick(item.title))}</h3>
    <p>${escapeHtml(formatDate(item.date))}</p>
    <p>${escapeHtml(pick(item.summary))}</p>
    <div class="rich">${pick(item.body) || ""}</div>
    ${attachments.map((attachment) => `<p><a href="${escapeAttribute(attachment.dataUrl || attachment.url)}" download="${escapeAttribute(attachment.name || "attachment")}">${escapeHtml(pick(attachment.label) || attachment.name || "Attachment")}</a></p>`).join("")}
  </article>`;
}

function pick(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.zh || value.en || "";
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value || "" : date.toLocaleString("zh-CN");
}

function emptyArchive() {
  return `<article><p>No data.</p></article>`;
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

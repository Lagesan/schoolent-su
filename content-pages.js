const pageType = document.body.dataset.pageType || "updates";

const state = {
  lang: localStorage.getItem("portal-lang") || detectPreferredLanguage(),
  content: null,
  meta: null,
  isAppShell: detectAppShell()
};

const ui = {
  zh: {
    common: {
      loading: "正在加载内容…",
      error: "内容暂时加载失败，请稍后刷新。",
      noItems: "暂时还没有已发布内容。",
      emptyHint: "这个页面已经准备好，等待后续发布内容。",
      backHome: "返回首页",
      updatedAt: "内容更新时间",
      updates: "动态更新",
      proposals: "提案追踪",
      updatesBadge: "UPDATES / FEED",
      proposalsBadge: "PROPOSALS / TRACKER",
      openInApp: "App 模式"
    },
    updates: {
      title: "更新流",
      subtitle: "把通知、活动和公开纪要集中到一个移动端更好读的时间流里。",
      sections: {
        notices: "通知",
        activities: "活动",
        publications: "公开纪要"
      },
      labels: {
        update: "Update",
        notice: "通知",
        activity: "活动",
        publication: "纪要",
        read: "阅读正文"
      }
    },
    proposals: {
      title: "提案页",
      subtitle: "单独查看提案状态、负责人和摘要，适合在 App 中作为独立导航页。",
      owner: "负责人"
    }
  },
  en: {
    common: {
      loading: "Loading content...",
      error: "Content is temporarily unavailable. Please refresh later.",
      noItems: "No published items yet.",
      emptyHint: "This page is ready for future updates.",
      backHome: "Back Home",
      updatedAt: "Updated",
      updates: "Updates",
      proposals: "Proposals",
      updatesBadge: "UPDATES / FEED",
      proposalsBadge: "PROPOSALS / TRACKER",
      openInApp: "App Mode"
    },
    updates: {
      title: "Updates Feed",
      subtitle: "A single stream for notices, activities, and public notes that reads better inside the app shell.",
      sections: {
        notices: "Notices",
        activities: "Activities",
        publications: "Public Notes"
      },
      labels: {
        update: "Update",
        notice: "Notice",
        activity: "Activity",
        publication: "Note",
        read: "Read"
      }
    },
    proposals: {
      title: "Proposal Page",
      subtitle: "A dedicated view for proposal status, owner, and summary, suitable as a standalone app tab.",
      owner: "Owner"
    }
  }
};

const dom = {
  brandName: document.querySelector("#brandName"),
  badge: document.querySelector("#pageBadge"),
  title: document.querySelector("#pageTitle"),
  subtitle: document.querySelector("#pageSubtitle"),
  updatedAt: document.querySelector("#pageUpdatedAt"),
  stream: document.querySelector("#pageStream")
};

document.querySelectorAll("[data-lang-trigger]").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.langTrigger;
    localStorage.setItem("portal-lang", state.lang);
    renderLanguageSwitch();
    render();
  });
});

init();

async function init() {
  document.body.classList.toggle("is-app-shell", state.isAppShell);
  renderLanguageSwitch();

  if (dom.title) {
    dom.title.textContent = ui[state.lang].common.loading;
  }

  try {
    const response = await fetch("/api/content");
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }

    const payload = await response.json();
    state.content = payload.content;
    state.meta = payload.meta;
    render();
  } catch (error) {
    console.error(error);
    if (dom.title) {
      dom.title.textContent = ui[state.lang].common.error;
    }
    if (dom.subtitle) {
      dom.subtitle.textContent = "";
    }
    if (dom.stream) {
      dom.stream.innerHTML = emptyState();
    }
  }
}

function render() {
  if (!state.content) {
    return;
  }

  const lang = ui[state.lang];
  const content = state.content;
  const pageUi = lang[pageType];
  const shortName = pick(content.site?.shortName) || "Schoolent";

  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = `${shortName} | ${pageType === "proposals" ? lang.common.proposals : lang.common.updates}`;

  setText(dom.brandName, shortName);
  setText(dom.updatedAt, `${lang.common.updatedAt}: ${formatDate(state.meta?.updatedAt, true)}`);

  if (pageType === "proposals") {
    setText(dom.badge, lang.common.proposalsBadge);
    setText(dom.title, pageUi.title);
    setText(dom.subtitle, pageUi.subtitle);
    renderProposals(content.initiatives?.items, pageUi, lang);
  } else if (pageType === "update-detail") {
    renderDetailPage(content, lang.updates, lang);
  } else {
    setText(dom.badge, lang.common.updatesBadge);
    setText(dom.title, pageUi.title);
    setText(dom.subtitle, pageUi.subtitle);
    renderUpdates(content, pageUi, lang);
  }
}

function renderUpdates(content, pageUi, lang) {
  const blocks = toArray(content.updates?.items)
    .filter((item) => item.published)
    .map((item, index) => ({
      date: item.date,
      html: renderUpdateStreamCard(item, pageUi, index)
    }))
    .concat(
      toArray(content.activities?.items)
        .filter((item) => item.published)
        .map((item) => ({
          date: item.date,
          html: renderSimpleStreamCard({
            label: pageUi.labels.activity,
            date: item.date,
            title: item.title,
            summary: item.summary,
            extra: pick(item.location),
            href: detailHref("activity", item.id)
          })
        }))
    )
    .concat(
      toArray(content.publications?.items)
        .map((item) => ({
          date: item.date,
          html: renderSimpleStreamCard({
            label: pageUi.labels.publication,
            date: item.date,
            title: item.title,
            summary: item.summary,
            extra: item.tag || ""
          })
        }))
    )
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .map((item) => item.html);

  dom.stream.innerHTML = blocks.length ? blocks.join("") : emptyState(lang.common.noItems);
}

function renderUpdateStreamCard(item, pageUi, index) {
  const attachments = toArray(item.attachments).filter((attachment) => attachment.url);
  const tag = String(item.tag || pageUi.labels.update).toUpperCase();
  const className = tag === "NOTICE" ? "stream-card stream-card-rich stream-card-notice stream-list-link" : "stream-card stream-card-rich stream-list-link";

  return `
    <a class="${className}" id="update-${index}" href="${escapeAttribute(detailHref("update", item.id))}">
      <span class="stream-summary">
        <span class="stream-summary-main">
          <span class="stream-meta">
            <span class="tag">${escapeHtml(tag === "NOTICE" ? pageUi.labels.notice : item.tag || pageUi.labels.update)}</span>
            <span>${escapeHtml(formatDate(item.date))}</span>
          </span>
          <span class="stream-title">${escapeHtml(pick(item.title))}</span>
          ${pick(item.summary) ? `<span class="stream-copy">${escapeHtml(pick(item.summary))}</span>` : ""}
        </span>
        <span class="stream-open-label">${escapeHtml(pageUi.labels.read)}</span>
      </span>
      ${attachments.length ? `<span class="stream-attachment-count">${escapeHtml(String(attachments.length))} attachment(s)</span>` : ""}
    </a>
  `;
}

function renderSimpleStreamCard({ label, date, title, summary, extra, href = "" }) {
  const tagName = href ? "a" : "article";
  const hrefAttribute = href ? ` href="${escapeAttribute(href)}"` : "";
  return `
    <${tagName} class="stream-card stream-list-link"${hrefAttribute}>
      <div class="stream-meta">
        <span class="tag">${escapeHtml(label)}</span>
        <span>${escapeHtml(formatDate(date))}</span>
        ${extra ? `<span>${escapeHtml(extra)}</span>` : ""}
      </div>
      <h3>${escapeHtml(pick(title))}</h3>
      <p class="stream-copy">${escapeHtml(pick(summary))}</p>
    </${tagName}>
  `;
}

function renderDetailPage(content, pageUi, lang) {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "update";
  const id = params.get("id") || "";
  const item = type === "activity"
    ? toArray(content.activities?.items).find((entry) => entry.id === id)
    : toArray(content.updates?.items).find((entry) => entry.id === id);

  if (!item || (type === "update" && !item.published) || (type === "activity" && !item.published)) {
    setText(dom.badge, pageUi.title.toUpperCase());
    setText(dom.title, lang.common.noItems);
    setText(dom.subtitle, lang.common.emptyHint);
    dom.stream.innerHTML = emptyState(lang.common.noItems);
    return;
  }

  const label = type === "activity" ? pageUi.labels.activity : String(item.tag || pageUi.labels.update).toUpperCase();
  setText(dom.badge, label);
  setText(dom.title, pick(item.title));
  setText(dom.subtitle, type === "activity" ? pick(item.summary) : pick(item.summary) || stripHtml(pick(item.body)));

  dom.stream.innerHTML = type === "activity" ? renderActivityDetail(item, pageUi) : renderUpdateDetail(item, pageUi);
}

function renderUpdateDetail(item, pageUi) {
  const attachments = toArray(item.attachments).filter((attachment) => attachment.url);
  return `
    <article class="stream-card detail-card">
      <div class="stream-meta">
        <span class="tag">${escapeHtml(item.tag || pageUi.labels.update)}</span>
        <span>${escapeHtml(formatDate(item.date, true))}</span>
      </div>
      <div class="stream-rich detail-rich">${sanitizeRichHtml(pick(item.body) || escapeHtml(pick(item.summary)))}</div>
      ${attachments.length ? renderAttachments(attachments) : ""}
    </article>
  `;
}

function renderActivityDetail(item, pageUi) {
  return `
    <article class="stream-card detail-card">
      <div class="stream-meta">
        <span class="tag">${escapeHtml(pageUi.labels.activity)}</span>
        <span>${escapeHtml(formatDate(item.date, true))}</span>
        ${pick(item.location) ? `<span>${escapeHtml(pick(item.location))}</span>` : ""}
        ${item.status ? `<span>${escapeHtml(item.status)}</span>` : ""}
      </div>
      <p class="stream-copy detail-copy">${escapeHtml(pick(item.summary))}</p>
    </article>
  `;
}

function renderAttachments(attachments) {
  return `
    <section class="attachment-gallery" aria-label="Attachments">
      <h3>Attachments</h3>
      ${attachments.map(renderAttachment).join("")}
    </section>
  `;
}

function renderAttachment(attachment) {
  const label = pick(attachment.label) || attachment.name || "Attachment";
  const url = safeAttachmentUrl(attachment.url);
  if (!url) {
    return "";
  }

  const type = String(attachment.type || "").toLowerCase();
  const preview = renderAttachmentPreview(url, type, label);
  return `
    <article class="attachment-card">
      ${preview}
      <div class="attachment-copy">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(type || "file")}${attachment.size ? ` / ${escapeHtml(formatBytes(attachment.size))}` : ""}</span>
        <a class="attachment-open" href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">Open file</a>
      </div>
    </article>
  `;
}

function renderAttachmentPreview(url, type, label) {
  if (type.startsWith("image/")) {
    return `<img class="attachment-preview" src="${escapeAttribute(url)}" alt="${escapeAttribute(label)}" loading="lazy" />`;
  }
  if (type.startsWith("video/")) {
    return `<video class="attachment-preview" src="${escapeAttribute(url)}" controls preload="metadata"></video>`;
  }
  if (type.startsWith("audio/")) {
    return `<div class="attachment-audio"><audio src="${escapeAttribute(url)}" controls preload="metadata"></audio></div>`;
  }
  return `<div class="attachment-file-icon" aria-hidden="true">FILE</div>`;
}

function renderProposals(items, pageUi, lang) {
  const proposals = toArray(items);
  if (!proposals.length) {
    dom.stream.innerHTML = emptyState(lang.common.noItems);
    return;
  }

  dom.stream.innerHTML = proposals
    .map(
      (item) => `
        <article class="stream-card">
          <div class="stream-meta">
            <span class="tag">${escapeHtml(item.stage || "QUEUE")}</span>
            <span>${escapeHtml(pageUi.owner)}</span>
            <span>${escapeHtml(pick(item.owner))}</span>
          </div>
          <h3>${escapeHtml(pick(item.title))}</h3>
          <p class="stream-copy">${escapeHtml(pick(item.summary))}</p>
        </article>
      `
    )
    .join("");
}

function renderLanguageSwitch() {
  document.querySelectorAll("[data-lang-trigger]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langTrigger === state.lang);
  });
}

function detectPreferredLanguage() {
  const preferred = typeof navigator !== "undefined" ? navigator.language || navigator.languages?.[0] || "" : "";
  return preferred.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function detectAppShell() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("app") === "1" || params.get("mode") === "app" || typeof window.Android !== "undefined";
}

function detailHref(type, id) {
  const params = new URLSearchParams({
    type,
    id: String(id || "")
  });
  if (state.isAppShell) {
    params.set("app", "1");
  }
  return `/updates/item/?${params.toString()}`;
}

function safeAttachmentUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  if (raw.startsWith("/api/assets/")) {
    return raw;
  }

  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin === window.location.origin && url.pathname.startsWith("/api/assets/")) {
      return `${url.pathname}${url.search}`;
    }
    if (url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return "";
  }

  return "";
}

function setText(node, value) {
  if (node) {
    node.textContent = String(value || "");
  }
}

function pick(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return state.lang === "zh" ? value.zh || value.en || "" : value.en || value.zh || "";
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatDate(value, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "";
  }

  const locale = state.lang === "zh" ? "zh-CN" : "en-US";
  const options = includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" };
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function formatBytes(value) {
  const size = Number(value || 0);
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function stripHtml(value) {
  const element = document.createElement("div");
  element.innerHTML = String(value || "");
  return element.textContent || element.innerText || "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function sanitizeRichHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = String(value || "");
  template.content.querySelectorAll("script,style,iframe,object,embed,form,input,button,textarea,select").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || ((name === "href" || name === "src") && value.startsWith("javascript:"))) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return template.innerHTML;
}

function emptyState(message) {
  const text = message || ui[state.lang].common.noItems;
  return `
    <div class="empty-state">
      <p class="empty-title">${escapeHtml(text)}</p>
      <p class="empty-copy">${escapeHtml(ui[state.lang].common.emptyHint)}</p>
    </div>
  `;
}

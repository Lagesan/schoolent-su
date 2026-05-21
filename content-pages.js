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
  stream: document.querySelector("#pageStream"),
  footer: document.querySelector("#detailFooter")
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
  renderDetailFooter(content, lang);

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
  setupMediaControls(dom.stream);
}

function renderUpdateDetail(item, pageUi) {
  const attachments = toArray(item.attachments).filter((attachment) => attachment.url);
  const body = pick(item.body) || escapeHtml(pick(item.summary));
  return `
    <article class="detail-document">
      <aside class="detail-document-rail" aria-label="Article metadata">
        <span class="tag">${escapeHtml(item.tag || pageUi.labels.update)}</span>
        <span>${escapeHtml(formatDate(item.date, true))}</span>
      </aside>
      <div class="detail-document-body">
        ${renderReadableBody(body)}
      </div>
      ${attachments.length ? renderAttachments(attachments) : ""}
    </article>
  `;
}

function renderActivityDetail(item, pageUi) {
  return `
    <article class="detail-document">
      <aside class="detail-document-rail" aria-label="Activity metadata">
        <span class="tag">${escapeHtml(pageUi.labels.activity)}</span>
        <span>${escapeHtml(formatDate(item.date, true))}</span>
        ${pick(item.location) ? `<span>${escapeHtml(pick(item.location))}</span>` : ""}
        ${item.status ? `<span>${escapeHtml(item.status)}</span>` : ""}
      </aside>
      <div class="detail-document-body">
        ${renderReadableBody(pick(item.summary))}
      </div>
    </article>
  `;
}

function renderReadableBody(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return `<p class="detail-empty-copy">No body content.</p>`;
  }

  if (looksLikeHtml(raw)) {
    return `<div class="stream-rich detail-rich">${sanitizeRichHtml(raw)}</div>`;
  }

  return renderPlainTextBody(raw);
}

function renderPlainTextBody(value) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return `<p class="detail-empty-copy">No body content.</p>`;
  }

  const [lead, ...rest] = lines;
  const rows = rest
    .map((line) => {
      const match = line.match(/^([^:：]{1,24})[:：]\s*(.+)$/);
      if (!match) {
        return "";
      }
      return `
        <div class="detail-fact-row">
          <dt>${escapeHtml(match[1])}</dt>
          <dd>${escapeHtml(match[2])}</dd>
        </div>
      `;
    })
    .filter(Boolean);

  if (rows.length >= Math.max(2, rest.length - 1)) {
    return `
      <section class="detail-fact-sheet">
        <p class="detail-kicker">${escapeHtml(lead)}</p>
        <dl>${rows.join("")}</dl>
      </section>
    `;
  }

  return `
    <div class="detail-prose">
      ${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    </div>
  `;
}

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
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
    return `
      <figure class="attachment-image-frame">
        <img class="attachment-preview" src="${escapeAttribute(url)}" alt="${escapeAttribute(label)}" loading="lazy" />
      </figure>
    `;
  }
  if (type.startsWith("video/")) {
    return `
      <div class="media-shell media-shell-video" data-media-shell>
        <video class="attachment-preview media-target" src="${escapeAttribute(url)}" preload="metadata" playsinline></video>
        <div class="media-controls" aria-label="Video controls">
          <button class="media-play" type="button" data-media-play>Play</button>
          <input class="media-range" type="range" min="0" max="1000" value="0" data-media-range aria-label="Seek video" />
          <span class="media-time" data-media-time>0:00</span>
        </div>
      </div>
    `;
  }
  if (type.startsWith("audio/")) {
    return `
      <div class="media-shell media-shell-audio" data-media-shell>
        <div class="media-audio-mark" aria-hidden="true">AUDIO</div>
        <audio class="media-target" src="${escapeAttribute(url)}" preload="metadata"></audio>
        <div class="media-controls" aria-label="Audio controls">
          <button class="media-play" type="button" data-media-play>Play</button>
          <input class="media-range" type="range" min="0" max="1000" value="0" data-media-range aria-label="Seek audio" />
          <span class="media-time" data-media-time>0:00</span>
        </div>
      </div>
    `;
  }
  return `<div class="attachment-file-icon" aria-hidden="true">FILE</div>`;
}

function setupMediaControls(root) {
  root.querySelectorAll("[data-media-shell]").forEach((shell) => {
    const media = shell.querySelector(".media-target");
    const play = shell.querySelector("[data-media-play]");
    const range = shell.querySelector("[data-media-range]");
    const time = shell.querySelector("[data-media-time]");
    if (!media || !play || !range || !time) {
      return;
    }

    const sync = () => {
      const duration = Number.isFinite(media.duration) ? media.duration : 0;
      const current = Number.isFinite(media.currentTime) ? media.currentTime : 0;
      range.value = duration ? String(Math.round((current / duration) * 1000)) : "0";
      time.textContent = `${formatDuration(current)}${duration ? ` / ${formatDuration(duration)}` : ""}`;
      play.textContent = media.paused ? "Play" : "Pause";
      shell.classList.toggle("is-playing", !media.paused);
    };

    play.addEventListener("click", () => {
      if (media.paused) {
        media.play().catch(() => { });
      } else {
        media.pause();
      }
      sync();
    });

    range.addEventListener("input", () => {
      if (Number.isFinite(media.duration) && media.duration > 0) {
        media.currentTime = (Number(range.value) / 1000) * media.duration;
      }
      sync();
    });

    media.addEventListener("loadedmetadata", sync);
    media.addEventListener("timeupdate", sync);
    media.addEventListener("play", sync);
    media.addEventListener("pause", sync);
    media.addEventListener("ended", sync);
    sync();
  });
}

function renderDetailFooter(content, lang) {
  if (!dom.footer) {
    return;
  }

  const updated = state.meta?.updatedAt ? formatDate(state.meta.updatedAt, true) : "N/A";
  const email = content.footer?.presidentEmail || "";
  dom.footer.innerHTML = `
    <button class="detail-schoolent-button" type="button" data-schoolent-declaration aria-label="Show Schoolent declaration">
      <span class="detail-schoolent-orb">
        <img src="/assets/schoolent-icon.png" alt="Schoolent" />
        <span class="footer-brand-glow" aria-hidden="true"></span>
      </span>
      <span class="detail-schoolent-copy">
        <strong>Schoolent</strong>
        <span>${escapeHtml(lang.common.updatedAt)}: ${escapeHtml(updated)}</span>
        ${email ? `<span>${escapeHtml(email)}</span>` : ""}
      </span>
    </button>
  `;

  dom.footer.querySelector("[data-schoolent-declaration]")?.addEventListener("click", showSchoolentDeclaration);
}

function showSchoolentDeclaration(event) {
  event?.currentTarget?.classList.add("is-pressed");
  window.setTimeout(() => event?.currentTarget?.classList.remove("is-pressed"), 360);

  const existing = document.querySelector(".declaration-popover");
  existing?.remove();

  const popover = document.createElement("div");
  popover.className = "declaration-popover";
  popover.innerHTML = `
    <div class="declaration-card" role="dialog" aria-modal="true" aria-label="Schoolent declaration">
      <button class="declaration-close" type="button" aria-label="Close">×</button>
      <p class="section-label">SCHOOLENT DECLARATION</p>
      <h3>Schoolent</h3>
      <p style="white-space: normal; word-break: break-word; overflow-wrap: break-word;">Schoolent 是由KZID的Schoolent开发组创立和运维的标识，旨在为同学们提供学习资源分享、社交交流和项目实践的平台，与KSC完全独立，门户网站的活动和管理与本标识无关。</p>
    </div>
  `;
  document.body.append(popover);
  requestAnimationFrame(() => popover.classList.add("is-visible"));

  const close = () => {
    popover.classList.remove("is-visible");
    window.setTimeout(() => popover.remove(), 220);
  };
  popover.addEventListener("click", (clickEvent) => {
    if (clickEvent.target === popover || clickEvent.target.closest(".declaration-close")) {
      close();
    }
  });
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

function formatDuration(value) {
  const total = Math.max(0, Math.floor(Number(value || 0)));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
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

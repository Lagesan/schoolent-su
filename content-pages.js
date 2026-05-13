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
        publication: "纪要"
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
        publication: "Note"
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
  setText(dom.badge, pageType === "proposals" ? lang.common.proposalsBadge : lang.common.updatesBadge);
  setText(dom.title, pageUi.title);
  setText(dom.subtitle, pageUi.subtitle);
  setText(dom.updatedAt, `${lang.common.updatedAt}: ${formatDate(state.meta?.updatedAt, true)}`);

  if (pageType === "proposals") {
    renderProposals(content.initiatives?.items, pageUi, lang);
  } else {
    renderUpdates(content, pageUi, lang);
  }
}

function renderUpdates(content, pageUi, lang) {
  const blocks = [];
  const richUpdates = toArray(content.updates?.items).filter((item) => item.published);
  const notices = toArray(content.notices).filter((item) => item.active);
  const activities = toArray(content.activities?.items).filter((item) => item.published);
  const publications = toArray(content.publications?.items);

  richUpdates
    .slice()
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .forEach((item) => {
      const attachments = toArray(item.attachments).filter((attachment) => attachment.url);
      blocks.push(`
        <article class="stream-card stream-card-rich">
          <div class="stream-meta">
            <span class="tag">${escapeHtml(item.tag || pageUi.labels.update)}</span>
            <span>${escapeHtml(formatDate(item.date))}</span>
          </div>
          <h3>${escapeHtml(pick(item.title))}</h3>
          ${pick(item.summary) ? `<p class="stream-copy">${escapeHtml(pick(item.summary))}</p>` : ""}
          <div class="stream-rich">${sanitizeRichHtml(pick(item.body))}</div>
          ${attachments.length ? `
            <div class="stream-attachments">
              ${attachments
                .map(
                  (attachment) => `
                    <a href="${escapeAttribute(attachment.url)}" target="_blank" rel="noreferrer">
                      ${escapeHtml(pick(attachment.label) || attachment.name || "Attachment")}
                    </a>
                  `
                )
                .join("")}
            </div>
          ` : ""}
        </article>
      `);
    });

  notices.forEach((item) => {
    blocks.push(`
      <article class="stream-card stream-card-notice">
        <div class="stream-meta">
          <span class="tag">${escapeHtml(pageUi.labels.notice)}</span>
          <span>${escapeHtml(pageUi.sections.notices)}</span>
        </div>
        <h3>${escapeHtml(pick(item.label))}</h3>
        <p class="stream-copy">${escapeHtml(pick(item.message))}</p>
      </article>
    `);
  });

  activities
    .slice()
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .forEach((item) => {
      blocks.push(`
        <article class="stream-card">
          <div class="stream-meta">
            <span class="tag">${escapeHtml(pageUi.labels.activity)}</span>
            <span>${escapeHtml(formatDate(item.date))}</span>
            <span>${escapeHtml(pick(item.location))}</span>
          </div>
          <h3>${escapeHtml(pick(item.title))}</h3>
          <p class="stream-copy">${escapeHtml(pick(item.summary))}</p>
        </article>
      `);
    });

  publications
    .slice()
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .forEach((item) => {
      blocks.push(`
        <article class="stream-card">
          <div class="stream-meta">
            <span class="tag">${escapeHtml(pageUi.labels.publication)}</span>
            <span>${escapeHtml(formatDate(item.date))}</span>
            <span>${escapeHtml(item.tag || "")}</span>
          </div>
          <h3>${escapeHtml(pick(item.title))}</h3>
          <p class="stream-copy">${escapeHtml(pick(item.summary))}</p>
        </article>
      `);
    });

  dom.stream.innerHTML = blocks.length ? blocks.join("") : emptyState(lang.common.noItems);
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

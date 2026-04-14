const state = {
  lang: localStorage.getItem("portal-lang") || "zh",
  content: null,
  meta: null
};

const ui = {
  zh: {
    nav: {
      organization: "架构",
      activities: "活动",
      finance: "数据",
      initiatives: "提案",
      publications: "纪要"
    },
    labels: {
      organization: "组织关系",
      activities: "近期活动",
      finance: "透明数据",
      initiatives: "提案追踪",
      publications: "公开纪要"
    },
    metrics: {
      teams: "部门节点",
      activities: "已发布活动",
      finance: "财务状态",
      ai: "AI 接口预留"
    },
    finance: {
      budget: "年度预算",
      available: "当前可用",
      reserve: "缓冲预留",
      category: "项目",
      amount: "金额",
      note: "备注",
      lastUpdated: "最后更新",
      published: "已公开",
      hidden: "暂未公开",
      hiddenTitle: "财务模块当前暂未公开",
      hiddenCopy: "可以先公开总量或说明，等适合时再开放更细的流向数据。",
      disclaimerTitle: "人工修正说明"
    },
    common: {
      loading: "正在加载内容…",
      error: "内容暂时加载失败，请稍后刷新。",
      noItems: "暂时还没有已发布内容。",
      footerPrefix: "会长邮箱",
      updatedAt: "内容更新时间",
      aiReady: "已预留 AI / API 接口扩展位",
      fallback: "当前显示的是默认样板数据。",
      connect: "连接部门"
    }
  },
  en: {
    nav: {
      organization: "Structure",
      activities: "Activity",
      finance: "Data",
      initiatives: "Proposals",
      publications: "Notes"
    },
    labels: {
      organization: "Organization Map",
      activities: "Recent Activity",
      finance: "Transparency Data",
      initiatives: "Proposal Tracker",
      publications: "Public Notes"
    },
    metrics: {
      teams: "Department Nodes",
      activities: "Published Updates",
      finance: "Finance Status",
      ai: "AI-Ready API"
    },
    finance: {
      budget: "Annual Budget",
      available: "Available Funds",
      reserve: "Reserve Buffer",
      category: "Category",
      amount: "Amount",
      note: "Notes",
      lastUpdated: "Last Updated",
      published: "Published",
      hidden: "Private",
      hiddenTitle: "Finance disclosure is temporarily paused",
      hiddenCopy: "You can keep the section online with a high-level note and switch detailed flows back on later.",
      disclaimerTitle: "Manual override note"
    },
    common: {
      loading: "Loading portal content...",
      error: "Portal data is temporarily unavailable. Please refresh later.",
      noItems: "No published items yet.",
      footerPrefix: "President Email",
      updatedAt: "Updated",
      aiReady: "API surface is ready for future AI integrations",
      fallback: "The site is currently showing seeded sample data.",
      connect: "Connects with"
    }
  }
};

const socialIcons = {
  globe: "GL",
  instagram: "IG",
  xiaohongshu: "RED",
  wechat: "WX",
  bilibili: "B",
  github: "GH",
  email: "@",
  default: "•"
};

const dom = {
  brandName: document.querySelector("#brandName"),
  heroBadge: document.querySelector("#heroBadge"),
  heroTitle: document.querySelector("#heroTitle"),
  heroSubtitle: document.querySelector("#heroSubtitle"),
  heroPromise: document.querySelector("#heroPromise"),
  primaryAction: document.querySelector("#primaryAction"),
  secondaryAction: document.querySelector("#secondaryAction"),
  siteTagline: document.querySelector("#siteTagline"),
  metricGrid: document.querySelector("#metricGrid"),
  noticeStrip: document.querySelector("#noticeStrip"),
  organizationLabel: document.querySelector("#organizationLabel"),
  organizationHeading: document.querySelector("#organizationHeading"),
  organizationIntro: document.querySelector("#organizationIntro"),
  organizationChart: document.querySelector("#organizationChart"),
  activitiesLabel: document.querySelector("#activitiesLabel"),
  activitiesHeading: document.querySelector("#activitiesHeading"),
  activitiesIntro: document.querySelector("#activitiesIntro"),
  activitiesList: document.querySelector("#activitiesList"),
  financeLabel: document.querySelector("#financeLabel"),
  financeHeading: document.querySelector("#financeHeading"),
  financeIntro: document.querySelector("#financeIntro"),
  financeContainer: document.querySelector("#financeContainer"),
  initiativesLabel: document.querySelector("#initiativesLabel"),
  initiativesHeading: document.querySelector("#initiativesHeading"),
  initiativesIntro: document.querySelector("#initiativesIntro"),
  initiativesGrid: document.querySelector("#initiativesGrid"),
  publicationsLabel: document.querySelector("#publicationsLabel"),
  publicationsHeading: document.querySelector("#publicationsHeading"),
  publicationsIntro: document.querySelector("#publicationsIntro"),
  publicationsGrid: document.querySelector("#publicationsGrid"),
  siteFooter: document.querySelector("#siteFooter")
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
  renderLanguageSwitch();
  dom.heroTitle.textContent = ui[state.lang].common.loading;

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
    dom.heroTitle.textContent = ui[state.lang].common.error;
    dom.heroSubtitle.textContent = "";
    dom.heroPromise.textContent = "";
  }
}

function render() {
  if (!state.content) {
    return;
  }

  const language = ui[state.lang];
  const { content, meta } = state;

  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = `${pick(content.site.shortName)} | ${pick(content.site.tagline)}`;

  dom.brandName.textContent = pick(content.site.shortName);
  dom.heroBadge.textContent = pick(content.hero.badge);
  dom.heroTitle.textContent = pick(content.hero.title);
  setOptionalText(dom.heroSubtitle, pick(content.hero.subtitle));
  setOptionalText(dom.heroPromise, pick(content.hero.promise));
  dom.primaryAction.textContent = pick(content.hero.ctaPrimary);
  dom.secondaryAction.textContent = pick(content.hero.ctaSecondary);
  dom.siteTagline.textContent = pick(content.site.tagline);

  document.querySelectorAll("[data-nav]").forEach((item) => {
    item.textContent = language.nav[item.dataset.nav];
  });

  dom.organizationLabel.textContent = language.labels.organization.toUpperCase();
  dom.activitiesLabel.textContent = language.labels.activities.toUpperCase();
  dom.financeLabel.textContent = language.labels.finance.toUpperCase();
  dom.initiativesLabel.textContent = language.labels.initiatives.toUpperCase();
  dom.publicationsLabel.textContent = language.labels.publications.toUpperCase();

  dom.organizationHeading.textContent = pick(content.organization.heading);
  setOptionalText(dom.organizationIntro, pick(content.organization.intro));
  dom.activitiesHeading.textContent = pick(content.activities.heading);
  setOptionalText(dom.activitiesIntro, pick(content.activities.intro));
  dom.financeHeading.textContent = pick(content.finance.heading);
  setOptionalText(dom.financeIntro, pick(content.finance.intro));
  dom.initiativesHeading.textContent = pick(content.initiatives.heading);
  setOptionalText(dom.initiativesIntro, pick(content.initiatives.intro));
  dom.publicationsHeading.textContent = pick(content.publications.heading);
  setOptionalText(dom.publicationsIntro, pick(content.publications.intro));

  renderMetrics(content, language);
  renderNotices(content.notices);
  renderOrganization(content.organization, language);
  renderActivities(content.activities.items);
  renderFinance(content.finance, language);
  renderInitiatives(content.initiatives.items);
  renderPublications(content.publications.items);
  renderFooter(content, meta, language);
}

function renderLanguageSwitch() {
  document.querySelectorAll("[data-lang-trigger]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langTrigger === state.lang);
  });
}

function renderMetrics(content, language) {
  const publishedActivities = content.activities.items.filter((item) => item.published).length;
  const metrics = [
    { label: language.metrics.teams, value: content.organization.departments.length + 1 },
    { label: language.metrics.activities, value: publishedActivities },
    {
      label: language.metrics.finance,
      value: content.finance.published ? language.finance.published : language.finance.hidden
    },
    {
      label: language.metrics.ai,
      value: content.settings.aiReady ? "READY" : "PENDING"
    }
  ];

  dom.metricGrid.innerHTML = metrics
    .map(
      (metric) => `
        <div class="metric-item">
          <dt>${escapeHtml(String(metric.label))}</dt>
          <dd>${escapeHtml(String(metric.value))}</dd>
        </div>
      `
    )
    .join("");
}

function renderNotices(notices) {
  const activeNotices = notices.filter((notice) => notice.active);
  if (!activeNotices.length) {
    dom.noticeStrip.hidden = true;
    dom.noticeStrip.innerHTML = "";
    return;
  }

  dom.noticeStrip.hidden = false;
  dom.noticeStrip.innerHTML = activeNotices
    .map(
      (notice) => `
        <span class="notice-label">${escapeHtml(pick(notice.label))}</span>
        <span>${escapeHtml(pick(notice.message))}</span>
      `
    )
    .join("");
}

function renderOrganization(organization, language) {
  const root = organization.leadership;
  const departments = organization.departments || [];

  if (!root || !departments.length) {
    dom.organizationChart.innerHTML = emptyState();
    return;
  }

  dom.organizationChart.innerHTML = `
    <article class="org-map">
      <div class="org-root">
        <p class="tag">${escapeHtml(root.status)}</p>
        <h4>${escapeHtml(pick(root.title))}</h4>
        <p class="org-lead">${escapeHtml(pick(root.lead))}</p>
        <p class="org-copy">${escapeHtml(pick(root.scope))}</p>
      </div>
      <div class="org-rail" aria-hidden="true"></div>
      <div class="org-grid">
        ${departments
          .map(
            (department) => `
              <article class="org-node">
                <div class="org-link-label">${escapeHtml(language.common.connect)}</div>
                <p class="tag">${escapeHtml(department.status)}</p>
                <h4>${escapeHtml(pick(department.title))}</h4>
                <p class="org-lead">${escapeHtml(pick(department.lead))}</p>
                <p class="org-copy">${escapeHtml(pick(department.scope))}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderActivities(items) {
  const published = items.filter((item) => item.published);
  if (!published.length) {
    dom.activitiesList.innerHTML = emptyState();
    return;
  }

  dom.activitiesList.innerHTML = published
    .map(
      (item) => `
        <article class="timeline-item">
          <div class="timeline-meta">
            <span>${escapeHtml(formatDate(item.date))}</span>
            <span>${escapeHtml(pick(item.location))}</span>
            <span>${escapeHtml(item.status)}</span>
          </div>
          <h4 class="timeline-title">${escapeHtml(pick(item.title))}</h4>
          <p class="timeline-copy">${escapeHtml(pick(item.summary))}</p>
        </article>
      `
    )
    .join("");
}

function renderFinance(finance, language) {
  if (!finance.published) {
    dom.financeContainer.innerHTML = `
      <article class="finance-panel">
        <div class="finance-headline">
          <div>
            <p class="tag">${escapeHtml(language.finance.hidden)}</p>
            <h4>${escapeHtml(language.finance.hiddenTitle)}</h4>
          </div>
        </div>
        <p class="finance-copy">${escapeHtml(pick(finance.summary))}</p>
        <p class="finance-copy">${escapeHtml(pick(finance.hiddenFlowReason) || language.finance.hiddenCopy)}</p>
      </article>
    `;
    return;
  }

  dom.financeContainer.innerHTML = `
    <article class="finance-panel">
      <div class="finance-headline">
        <div>
          <p class="tag">${escapeHtml(language.finance.published)}</p>
          <div class="finance-meta">
            <span>${escapeHtml(language.finance.lastUpdated)}: ${escapeHtml(formatDate(finance.lastUpdated, true))}</span>
          </div>
        </div>
      </div>
      <p class="finance-copy">${escapeHtml(pick(finance.summary))}</p>
      <div class="finance-number-grid">
        <div class="finance-number">
          <span>${escapeHtml(language.finance.budget)}</span>
          <strong>${escapeHtml(formatCurrency(finance.totals.budget))}</strong>
        </div>
        <div class="finance-number">
          <span>${escapeHtml(language.finance.available)}</span>
          <strong>${escapeHtml(formatCurrency(finance.totals.available))}</strong>
        </div>
        <div class="finance-number">
          <span>${escapeHtml(language.finance.reserve)}</span>
          <strong>${escapeHtml(formatCurrency(finance.totals.reserve))}</strong>
        </div>
      </div>
      <table class="finance-table">
        <thead>
          <tr>
            <th>${escapeHtml(language.finance.category)}</th>
            <th>${escapeHtml(language.finance.amount)}</th>
            <th>${escapeHtml(language.finance.note)}</th>
          </tr>
        </thead>
        <tbody>
          ${finance.categories
            .map(
              (item) => `
                <tr>
                  <td>${escapeHtml(pick(item.label))}</td>
                  <td>${escapeHtml(formatCurrency(item.amount))}</td>
                  <td>${escapeHtml(pick(item.note))}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
      <p class="finance-disclaimer">
        ${escapeHtml(language.finance.disclaimerTitle)}: ${escapeHtml(pick(finance.manualNote))}
      </p>
    </article>
  `;
}

function renderInitiatives(items) {
  if (!items.length) {
    dom.initiativesGrid.innerHTML = emptyState();
    return;
  }

  dom.initiativesGrid.innerHTML = items
    .map(
      (item) => `
        <article class="proposal-card">
          <p class="tag">${escapeHtml(item.stage)}</p>
          <h4>${escapeHtml(pick(item.title))}</h4>
          <div class="proposal-meta">
            <span>${escapeHtml(pick(item.owner))}</span>
          </div>
          <p class="proposal-summary">${escapeHtml(pick(item.summary))}</p>
        </article>
      `
    )
    .join("");
}

function renderPublications(items) {
  if (!items.length) {
    dom.publicationsGrid.innerHTML = emptyState();
    return;
  }

  dom.publicationsGrid.innerHTML = items
    .map(
      (item) => `
        <article class="publication-card">
          <p class="tag">${escapeHtml(item.tag)}</p>
          <h4>${escapeHtml(pick(item.title))}</h4>
          <div class="publication-meta">
            <span>${escapeHtml(formatDate(item.date))}</span>
          </div>
          <p class="publication-summary">${escapeHtml(pick(item.summary))}</p>
        </article>
      `
    )
    .join("");
}

function renderFooter(content, meta, language) {
  const statement = pick(content.footer.statement);
  const updated = meta?.updatedAt ? formatDate(meta.updatedAt, true) : "N/A";
  const badges = [];
  const links = (content.footer.socialLinks || []).filter((item) => item.url);

  if (content.settings.aiReady) {
    badges.push(language.common.aiReady);
  }

  if (meta && meta.storage === "fallback") {
    badges.push(language.common.fallback);
  }

  dom.siteFooter.innerHTML = `
    <div class="footer-brand">
      <div class="footer-brand-tile">
        <img class="footer-brand-image" src="/assets/schoolent-icon.png" alt="Schoolent" />
      </div>
      <div class="footer-brand-copy">
        <p>${escapeHtml(statement)}</p>
        <p>${escapeHtml(language.common.footerPrefix)}: ${escapeHtml(content.footer.presidentEmail)}</p>
        <p>${escapeHtml(language.common.updatedAt)}: ${escapeHtml(updated)}</p>
        <div class="footer-socials">
          ${links
            .map(
              (link) => `
                <a class="social-link" href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">
                  <span class="social-icon" aria-hidden="true">${escapeHtml(resolveSocialIcon(link.icon))}</span>
                  <span>${escapeHtml(pick(link.label))}</span>
                </a>
              `
            )
            .join("")}
        </div>
        <div class="footer-badges">
          ${badges.map((badge) => `<p class="tag">${escapeHtml(badge)}</p>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function resolveSocialIcon(icon) {
  return socialIcons[icon] || socialIcons.default;
}

function setOptionalText(node, value) {
  const text = String(value || "").trim();
  node.textContent = text;
  node.hidden = text.length === 0;
}

function emptyState() {
  const template = document.querySelector("#emptyStateTemplate");
  return template ? template.innerHTML : `<div class="empty-state">${escapeHtml(ui[state.lang].common.noItems)}</div>`;
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

function formatCurrency(amount) {
  const locale = state.lang === "zh" ? "zh-CN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

function formatDate(value, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "";
  }

  const locale = state.lang === "zh" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(locale, includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
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

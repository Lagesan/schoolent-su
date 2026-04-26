const state = {
  lang: localStorage.getItem("portal-lang") || detectPreferredLanguage(),
  content: null,
  meta: null,
  isAppShell: detectAppShell()
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
    },
    app: {
      badge: "APP MODE / SCHOOLENT.CN",
      heading: "移动端门户",
      summary: "这个模式把门户压成更适合手机的摘要、快捷入口和操作卡片，而不是把桌面首页原样塞进 App。",
      quickActions: "快捷操作",
      overview: "一眼概览",
      spotlight: "最新焦点",
      openActivities: "查看更新",
      openFinance: "财务摘要",
      openProposals: "提案页面",
      contactPresident: "联系会长",
      sharePortal: "分享门户",
      noBridge: "当前是在浏览器中预览 App 模式，原生能力会在安卓容器里启用。",
      nextActivity: "下一项活动",
      latestProposal: "最近提案",
      noticeCount: "有效通知",
      noSpotlight: "发布第一条活动、提案或通知后，这里会自动变成移动端首页的焦点卡片。"
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
    },
    app: {
      badge: "APP MODE / SCHOOLENT.CN",
      heading: "Mobile Portal",
      summary: "This mode compresses the portal into quick actions, summaries, and spotlight cards instead of mirroring the desktop homepage.",
      quickActions: "Quick Actions",
      overview: "Overview",
      spotlight: "Spotlight",
      openActivities: "Open Updates",
      openFinance: "Finance Snapshot",
      openProposals: "Proposal Page",
      contactPresident: "Contact President",
      sharePortal: "Share Portal",
      noBridge: "You are previewing app mode in a browser. Native capabilities will be available inside the Android container.",
      nextActivity: "Next Activity",
      latestProposal: "Latest Proposal",
      noticeCount: "Active Notices",
      noSpotlight: "Once you publish an activity, proposal, or notice, this block becomes the mobile home spotlight."
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
  appModeHub: document.querySelector("#appModeHub"),
  noticeStrip: document.querySelector("#noticeStrip"),
  organizationLabel: document.querySelector("#organizationLabel"),
  organizationHeading: document.querySelector("#organizationHeading"),
  organizationChart: document.querySelector("#organizationChart"),
  activitiesLabel: document.querySelector("#activitiesLabel"),
  activitiesHeading: document.querySelector("#activitiesHeading"),
  activitiesList: document.querySelector("#activitiesList"),
  financeLabel: document.querySelector("#financeLabel"),
  financeHeading: document.querySelector("#financeHeading"),
  financeContainer: document.querySelector("#financeContainer"),
  initiativesLabel: document.querySelector("#initiativesLabel"),
  initiativesHeading: document.querySelector("#initiativesHeading"),
  initiativesGrid: document.querySelector("#initiativesGrid"),
  publicationsLabel: document.querySelector("#publicationsLabel"),
  publicationsHeading: document.querySelector("#publicationsHeading"),
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
  document.body.classList.toggle("is-app-shell", state.isAppShell);
  renderLanguageSwitch();
  setupAppModeActions();

  if (dom.heroTitle) {
    dom.heroTitle.textContent = ui[state.lang].common.loading;
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
    if (dom.heroTitle) {
      dom.heroTitle.textContent = ui[state.lang].common.error;
    }
    if (dom.heroSubtitle) {
      dom.heroSubtitle.textContent = "";
    }
    if (dom.heroPromise) {
      dom.heroPromise.textContent = "";
    }
    if (dom.appModeHub && state.isAppShell) {
      dom.appModeHub.hidden = false;
      dom.appModeHub.innerHTML = `
        <article class="app-surface app-surface-primary">
          <p class="section-label">${escapeHtml(ui[state.lang].app.badge)}</p>
          <h3>${escapeHtml(ui[state.lang].common.error)}</h3>
          <p class="app-surface-copy">${escapeHtml(ui[state.lang].app.noBridge)}</p>
        </article>
      `;
    }
  }
}

function render() {
  if (!state.content) {
    return;
  }

  const language = ui[state.lang];
  const { content, meta } = state;

  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  const shortName = pick(content.site?.shortName) || "Student Council Portal";
  const tagline = pick(content.site?.tagline);
  document.title = tagline ? `${shortName} | ${tagline}` : shortName;

  setText(dom.brandName, shortName);
  setText(dom.heroBadge, pick(content.hero?.badge));
  setText(dom.heroTitle, pick(content.hero?.title));
  setOptionalText(dom.heroSubtitle, pick(content.hero?.subtitle));
  setOptionalText(dom.heroPromise, pick(content.hero?.promise));
  setText(dom.primaryAction, pick(content.hero?.ctaPrimary));
  setText(dom.secondaryAction, pick(content.hero?.ctaSecondary));
  setText(dom.siteTagline, pick(content.site?.tagline));

  document.querySelectorAll("[data-nav]").forEach((item) => {
    item.textContent = language.nav[item.dataset.nav];
  });

  setText(dom.organizationLabel, language.labels.organization.toUpperCase());
  setText(dom.activitiesLabel, language.labels.activities.toUpperCase());
  setText(dom.financeLabel, language.labels.finance.toUpperCase());
  setText(dom.initiativesLabel, language.labels.initiatives.toUpperCase());
  setText(dom.publicationsLabel, language.labels.publications.toUpperCase());

  setText(dom.organizationHeading, pick(content.organization?.heading));
  setText(dom.activitiesHeading, pick(content.activities?.heading));
  setText(dom.financeHeading, pick(content.finance?.heading));
  setText(dom.initiativesHeading, pick(content.initiatives?.heading));
  setText(dom.publicationsHeading, pick(content.publications?.heading));

  renderAppModeHub(content, language, meta);
  renderMetrics(content, language);
  renderNotices(content.notices);
  renderOrganization(content.organization, language);
  renderActivities(content.activities?.items);
  renderFinance(content.finance, language);
  renderInitiatives(content.initiatives?.items);
  renderPublications(content.publications?.items);
  renderFooter(content, meta, language);
}

function renderLanguageSwitch() {
  document.querySelectorAll("[data-lang-trigger]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langTrigger === state.lang);
  });
}

function renderAppModeHub(content, language, meta) {
  if (!dom.appModeHub) {
    return;
  }

  if (!state.isAppShell) {
    dom.appModeHub.hidden = true;
    dom.appModeHub.innerHTML = "";
    return;
  }

  const publishedActivities = toArray(content.activities?.items).filter((item) => item.published);
  const initiatives = toArray(content.initiatives?.items);
  const activeNotices = toArray(content.notices).filter((notice) => notice.active);
  const nextActivity = publishedActivities
    .slice()
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())[0];
  const latestProposal = initiatives[0];
  const email = content.footer?.presidentEmail || "";
  const hasBridge = hasNativeBridge();
  const appVersion = readAppVersion();
  const spotlightTitle = pick(nextActivity?.title) || pick(latestProposal?.title) || "";
  const spotlightMeta = nextActivity
    ? `${language.app.nextActivity} · ${formatDate(nextActivity.date)}`
    : latestProposal
      ? `${language.app.latestProposal} · ${pick(latestProposal.owner)}`
      : "";
  const spotlightCopy = nextActivity
    ? pick(nextActivity.summary)
    : latestProposal
      ? pick(latestProposal.summary)
      : language.app.noSpotlight;
  const summaryCards = [
    {
      label: language.app.noticeCount,
      value: String(activeNotices.length)
    },
    {
      label: language.metrics.activities,
      value: String(publishedActivities.length)
    },
    {
      label: language.metrics.finance,
      value: content.finance?.published ? language.finance.published : language.finance.hidden
    },
    {
      label: language.metrics.ai,
      value: content.settings?.aiReady ? "READY" : "PENDING"
    }
  ];
  const actionItems = [
    {
      type: "link",
      href: state.isAppShell ? "/updates/?app=1" : "/updates/",
      label: language.app.openActivities
    },
    {
      type: "link",
      href: "#finance",
      label: language.app.openFinance
    },
    {
      type: "link",
      href: state.isAppShell ? "/proposals/?app=1" : "/proposals/",
      label: language.app.openProposals
    },
    {
      type: "mail",
      href: email ? `mailto:${email}` : "#",
      label: language.app.contactPresident,
      disabled: !email
    },
    {
      type: "button",
      action: "share",
      label: language.app.sharePortal
    }
  ];

  dom.appModeHub.hidden = false;
  dom.appModeHub.innerHTML = `
    <article class="app-surface app-surface-primary">
      <div class="app-surface-head">
        <p class="section-label">${escapeHtml(language.app.badge)}</p>
        <h3>${escapeHtml(pick(content.site?.shortName) || language.app.heading)}</h3>
      </div>
      <p class="app-surface-copy">${escapeHtml(pick(content.site?.campaignNote) || pick(content.hero?.subtitle) || language.app.summary)}</p>
      <div class="app-inline-meta">
        <span class="tag">schoolent.cn</span>
        ${appVersion ? `<span class="tag">APP ${escapeHtml(appVersion)}</span>` : ""}
        ${meta?.updatedAt ? `<span class="tag">${escapeHtml(formatDate(meta.updatedAt, true))}</span>` : ""}
      </div>
      <p class="app-bridge-note"${hasBridge ? " hidden" : ""}>${escapeHtml(language.app.noBridge)}</p>
    </article>

    <section class="app-surface">
      <div class="app-surface-head">
        <p class="section-label">${escapeHtml(language.app.overview.toUpperCase())}</p>
        <h3>${escapeHtml(language.app.overview)}</h3>
      </div>
      <div class="app-summary-grid">
        ${summaryCards
          .map(
            (card) => `
              <article class="app-summary-card">
                <p>${escapeHtml(card.label)}</p>
                <strong>${escapeHtml(card.value)}</strong>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="app-surface">
      <div class="app-surface-head">
        <p class="section-label">${escapeHtml(language.app.quickActions.toUpperCase())}</p>
        <h3>${escapeHtml(language.app.quickActions)}</h3>
      </div>
      <div class="app-action-grid">
        ${actionItems
          .map((item) => {
            if (item.type === "link") {
              return `<a class="app-action-chip" href="${escapeAttribute(item.href)}">${escapeHtml(item.label)}</a>`;
            }

            if (item.type === "mail") {
              const disabled = item.disabled ? ' aria-disabled="true" tabindex="-1"' : "";
              const className = item.disabled ? "app-action-chip is-disabled" : "app-action-chip";
              return `<a class="${className}" href="${escapeAttribute(item.href)}"${disabled}>${escapeHtml(item.label)}</a>`;
            }

            const disabled = item.disabled ? " disabled" : "";
            return `<button class="app-action-chip" type="button" data-app-action="${escapeAttribute(item.action)}"${disabled}>${escapeHtml(item.label)}</button>`;
          })
          .join("")}
      </div>
    </section>

    <section class="app-surface">
      <div class="app-surface-head">
        <p class="section-label">${escapeHtml(language.app.spotlight.toUpperCase())}</p>
        <h3>${escapeHtml(language.app.spotlight)}</h3>
      </div>
      ${spotlightMeta ? `<p class="app-spotlight-meta">${escapeHtml(spotlightMeta)}</p>` : ""}
      ${spotlightTitle ? `<h4 class="app-spotlight-title">${escapeHtml(spotlightTitle)}</h4>` : ""}
      <p class="app-surface-copy">${escapeHtml(spotlightCopy)}</p>
    </section>
  `;
}

function renderMetrics(content, language) {
  const activityItems = toArray(content.activities?.items);
  const departmentItems = toArray(content.organization?.departments);
  const hasLeadership = Boolean(pick(content.organization?.leadership?.title) || pick(content.organization?.leadership?.lead));
  const aiReady = Boolean(content.settings?.aiReady);
  const publishedActivities = activityItems.filter((item) => item.published).length;
  const metrics = [
    {
      label: language.metrics.teams,
      value: departmentItems.length + (hasLeadership ? 1 : 0)
    },
    {
      label: language.metrics.activities,
      value: publishedActivities
    },
    {
      label: language.metrics.finance,
      value: content.finance?.published ? language.finance.published : language.finance.hidden
    },
    {
      label: language.metrics.ai,
      value: aiReady ? "READY" : "PENDING"
    }
  ];

  if (!dom.metricGrid) {
    return;
  }

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
  if (!dom.noticeStrip) {
    return;
  }

  const activeNotices = toArray(notices).filter((notice) => notice.active);
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
  if (!dom.organizationChart) {
    return;
  }

  const root = organization?.leadership || {};
  const departments = toArray(organization?.departments);
  const hasRootContent = Boolean(pick(root.title) || pick(root.lead) || pick(root.scope));

  if (!hasRootContent && !departments.length) {
    dom.organizationChart.innerHTML = emptyState();
    return;
  }

  dom.organizationChart.innerHTML = `
    <article class="org-map">
      ${hasRootContent ? `
        <div class="org-root">
          <p class="tag">${escapeHtml(root.status || "CORE")}</p>
          <h4>${escapeHtml(pick(root.title))}</h4>
          ${renderOptionalParagraph("org-lead", pick(root.lead))}
          ${renderOptionalParagraph("org-copy", pick(root.scope))}
        </div>
        <div class="org-rail" aria-hidden="true"></div>
      ` : ""}
      <div class="org-grid">
        ${departments
          .map(
            (department) => `
              <article class="org-node">
                <div class="org-link-label">${escapeHtml(language.common.connect)}</div>
                <p class="tag">${escapeHtml(department.status || "ACTIVE")}</p>
                <h4>${escapeHtml(pick(department.title))}</h4>
                ${renderOptionalParagraph("org-lead", pick(department.lead))}
                ${renderOptionalParagraph("org-copy", pick(department.scope))}
              </article>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderActivities(items) {
  if (!dom.activitiesList) {
    return;
  }

  const published = toArray(items).filter((item) => item.published);
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
            <span>${escapeHtml(item.status || "")}</span>
          </div>
          <h4 class="timeline-title">${escapeHtml(pick(item.title))}</h4>
          <p class="timeline-copy">${escapeHtml(pick(item.summary))}</p>
        </article>
      `
    )
    .join("");
}

function renderFinance(finance, language) {
  if (!dom.financeContainer) {
    return;
  }

  if (!finance) {
    dom.financeContainer.innerHTML = emptyState();
    return;
  }

  const categories = toArray(finance.categories);
  const totals = finance.totals || {};

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
          <strong>${escapeHtml(formatCurrency(totals.budget))}</strong>
        </div>
        <div class="finance-number">
          <span>${escapeHtml(language.finance.available)}</span>
          <strong>${escapeHtml(formatCurrency(totals.available))}</strong>
        </div>
        <div class="finance-number">
          <span>${escapeHtml(language.finance.reserve)}</span>
          <strong>${escapeHtml(formatCurrency(totals.reserve))}</strong>
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
          ${categories
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
  if (!dom.initiativesGrid) {
    return;
  }

  const safeItems = toArray(items);
  if (!safeItems.length) {
    dom.initiativesGrid.innerHTML = emptyState();
    return;
  }

  dom.initiativesGrid.innerHTML = safeItems
    .map(
      (item) => `
        <article class="proposal-card">
          <p class="tag">${escapeHtml(item.stage || "QUEUE")}</p>
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
  if (!dom.publicationsGrid) {
    return;
  }

  const safeItems = toArray(items);
  if (!safeItems.length) {
    dom.publicationsGrid.innerHTML = emptyState();
    return;
  }

  dom.publicationsGrid.innerHTML = safeItems
    .map(
      (item) => `
        <article class="publication-card">
          <p class="tag">${escapeHtml(item.tag || "UPDATE")}</p>
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
  if (!dom.siteFooter) {
    return;
  }

  const statement = pick(content.footer?.statement);
  const updated = meta?.updatedAt ? formatDate(meta.updatedAt, true) : "N/A";
  const badges = [];
  const links = toArray(content.footer?.socialLinks).filter((item) => item.url);
  const email = content.footer?.presidentEmail || "";

  if (content.settings?.aiReady) {
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
        ${statement ? `<p>${escapeHtml(statement)}</p>` : ""}
        ${email ? `<p>${escapeHtml(language.common.footerPrefix)}: ${escapeHtml(email)}</p>` : ""}
        <p>${escapeHtml(language.common.updatedAt)}: ${escapeHtml(updated)}</p>
        <div class="footer-socials" ${links.length ? "" : "hidden"}>
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
        <div class="footer-badges" ${badges.length ? "" : "hidden"}>
          ${badges.map((badge) => `<p class="tag">${escapeHtml(badge)}</p>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function resolveSocialIcon(icon) {
  return socialIcons[icon] || socialIcons.default;
}

function setupAppModeActions() {
  if (!dom.appModeHub) {
    return;
  }

  dom.appModeHub.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-app-action]") : null;
    if (!target) {
      return;
    }

    const action = target.dataset.appAction;
    if (action === "share") {
      event.preventDefault();
      sharePortal();
    }
  });
}

function sharePortal() {
  const url = "https://schoolent.cn/?app=1";
  const title = pick(state.content?.site?.name) || pick(state.content?.hero?.title) || "Schoolent Portal";
  const text = pick(state.content?.hero?.subtitle) || pick(state.content?.site?.tagline) || title;

  if (hasNativeBridge() && typeof window.Android.share === "function") {
    window.Android.share(text, url);
    return;
  }

  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
    return;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).catch(() => {});
  }
}

function hasNativeBridge() {
  return typeof window !== "undefined" && typeof window.Android !== "undefined";
}

function readAppVersion() {
  if (!hasNativeBridge() || typeof window.Android.getAppVersion !== "function") {
    return "";
  }

  try {
    return String(window.Android.getAppVersion() || "").trim();
  } catch (error) {
    console.warn("Failed to read Android app version", error);
    return "";
  }
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
  return params.get("app") === "1" || params.get("mode") === "app" || hasNativeBridge();
}

function setText(node, value) {
  if (!node) {
    return;
  }

  node.textContent = String(value || "");
}

function setOptionalText(node, value) {
  if (!node) {
    return;
  }

  const text = String(value || "").trim();
  node.textContent = text;
  node.hidden = text.length === 0;
}

function renderOptionalParagraph(className, value) {
  const text = String(value || "").trim();
  return text ? `<p class="${className}">${escapeHtml(text)}</p>` : "";
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

function toArray(value) {
  return Array.isArray(value) ? value : [];
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

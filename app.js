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
      activities: "更新",
      finance: "数据",
      initiatives: "提案",
      publications: "纪要",
      download: "App 更新"
    },
    labels: {
      organization: "组织关系",
      activities: "公告 / 更新",
      finance: "透明数据",
      initiatives: "提案追踪",
      publications: "公开纪要"
    },
    organization: {
      rotationTitle: "会长轮换顺序",
      rotationCurrent: "当前轮值",
      rotationOrder: "轮换顺位",
      monthlyTitle: "当月轮值主席",
      peopleTitle: "社员常务架构",
      roleLabel: "职位"
    },
    metrics: {
      teams: "人员节点",
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
      footerPrefix: "问题上报邮箱",
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
      contactPresident: "问题上报",
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
      activities: "Updates",
      finance: "Data",
      initiatives: "Proposals",
      publications: "Notes",
      download: "App Update"
    },
    labels: {
      organization: "Organization Map",
      activities: "Updates",
      finance: "Transparency Data",
      initiatives: "Proposal Tracker",
      publications: "Public Notes"
    },
    organization: {
      rotationTitle: "President Rotation",
      rotationCurrent: "Current Rotation",
      rotationOrder: "Rotation Order",
      monthlyTitle: "Monthly President",
      peopleTitle: "Member Structure",
      roleLabel: "Role"
    },
    metrics: {
      teams: "People Nodes",
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
      footerPrefix: "Issue Report Email",
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
      contactPresident: "Report Issue",
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

const schoolentDeclarationText = "Schoolent 是由KZID的Schoolent开发组创立和运维的标识，旨在为同学们提供学习资源分享、社交交流和项目实践的平台，与KSC完全独立，门户网站的活动和管理与本标识无关。";

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
  setupSchoolentDeclarationActions();

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
  setText(dom.activitiesHeading, pick(content.updates?.heading) || pick(content.activities?.heading));
  setText(dom.financeHeading, pick(content.finance?.heading));
  setText(dom.initiativesHeading, pick(content.initiatives?.heading));
  setText(dom.publicationsHeading, pick(content.publications?.heading));

  renderAppModeHub(content, language, meta);
  renderMetrics(content, language);
  renderNotices(content.updates?.items);
  renderOrganization(content.organization, language);
  renderActivities(content);
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
  const richUpdates = toArray(content.updates?.items).filter((item) => item.published);
  const initiatives = toArray(content.initiatives?.items);
  const activeNotices = richUpdates.filter((item) => String(item.tag || "").toUpperCase() === "NOTICE");
  const nextActivity = publishedActivities
    .slice()
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())[0];
  const latestProposal = initiatives[0];
  const latestUpdate = richUpdates
    .slice()
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())[0];
  const email = content.footer?.presidentEmail || "";
  const hasBridge = hasNativeBridge();
  const appVersion = readAppVersion();
  const spotlightTitle = pick(latestUpdate?.title) || pick(nextActivity?.title) || pick(latestProposal?.title) || "";
  const spotlightMeta = latestUpdate ? `Update · ${formatDate(latestUpdate.date)}` : nextActivity
    ? `${language.app.nextActivity} · ${formatDate(nextActivity.date)}`
    : latestProposal
      ? `${language.app.latestProposal} · ${pick(latestProposal.owner)}`
      : "";
  const spotlightCopy = latestUpdate ? pick(latestUpdate.summary) : nextActivity
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
      value: String(publishedActivities.length + richUpdates.length)
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
  const peopleItems = toArray(content.organization?.people);
  const aiReady = Boolean(content.settings?.aiReady);
  const publishedUpdates = toArray(content.updates?.items).filter((item) => item.published).length;
  const publishedActivities = activityItems.filter((item) => item.published).length;
  const metrics = [
    {
      label: language.metrics.teams,
      value: peopleItems.length
    },
    {
      label: language.metrics.activities,
      value: publishedUpdates + publishedActivities
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

function renderNotices(items) {
  if (!dom.noticeStrip) {
    return;
  }

  const activeNotices = toArray(items).filter((item) => item.published && String(item.tag || "").toUpperCase() === "NOTICE");
  if (!activeNotices.length) {
    dom.noticeStrip.hidden = true;
    dom.noticeStrip.innerHTML = "";
    return;
  }

  dom.noticeStrip.hidden = false;
  dom.noticeStrip.innerHTML = activeNotices
    .map(
      (notice) => `
        <a class="notice-link" href="/updates/${state.isAppShell ? "?app=1" : ""}">
          <span class="notice-label">${escapeHtml(pick(notice.title) || "NOTICE")}</span>
          <span>${escapeHtml(pick(notice.summary) || stripHtml(pick(notice.body)))}</span>
        </a>
      `
    )
    .join("");
}

function renderOrganization(organization, language) {
  if (!dom.organizationChart) {
    return;
  }

  const monthlyPresident = organization?.monthlyPresident || {};
  const presidentRotation = organization?.presidentRotation || {};
  const people = toArray(organization?.people);
  const rotationMembers = people
    .filter((person) => person.rotation?.enabled)
    .slice()
    .sort((left, right) => Number(left.rotation?.order || 0) - Number(right.rotation?.order || 0));
  const currentRotationPerson = rotationMembers.find((person) => String(person.rotation?.status || "").toUpperCase() === "CURRENT");
  const hasMonthlyContent = Boolean(currentRotationPerson || pick(monthlyPresident.person) || pick(monthlyPresident.period) || pick(monthlyPresident.note));
  const hasRotationContent = Boolean(
    pick(presidentRotation.heading) ||
    pick(presidentRotation.currentPeriod) ||
    pick(presidentRotation.note) ||
    rotationMembers.length
  );

  if (!hasMonthlyContent && !hasRotationContent && !people.length) {
    dom.organizationChart.innerHTML = emptyState();
    return;
  }

  const monthlyName = currentRotationPerson ? pick(currentRotationPerson.name) : pick(monthlyPresident.person);
  const monthlyPeriod = currentRotationPerson ? pick(currentRotationPerson.rotation?.period) || pick(presidentRotation.currentPeriod) || pick(monthlyPresident.period) : pick(monthlyPresident.period);
  const monthlyNote = currentRotationPerson ? pick(currentRotationPerson.rotation?.note) || pick(monthlyPresident.note) : pick(monthlyPresident.note);

  dom.organizationChart.innerHTML = `
    <article class="org-map">
      ${hasMonthlyContent ? `
        <section class="org-monthly-panel">
          <p class="section-label">${escapeHtml(language.organization.monthlyTitle.toUpperCase())}</p>
          <h4>${escapeHtml(monthlyName || language.organization.rotationTitle)}</h4>
          ${monthlyPeriod ? `<p class="tag">${escapeHtml(monthlyPeriod)}</p>` : ""}
          ${renderOptionalParagraph("org-copy", monthlyNote)}
        </section>
      ` : ""}
      ${hasRotationContent ? `
        <section class="org-rotation-panel">
          <div class="section-header org-subheader">
            <p class="section-label">${escapeHtml((pick(presidentRotation.heading) || language.organization.rotationTitle).toUpperCase())}</p>
            <h4>${escapeHtml(monthlyName || language.organization.rotationTitle)}</h4>
          </div>
          <div class="org-rotation-head">
            ${(monthlyPeriod || pick(presidentRotation.currentPeriod)) ? `<p class="tag">${escapeHtml(language.organization.rotationCurrent)}: ${escapeHtml(monthlyPeriod || pick(presidentRotation.currentPeriod))}</p>` : ""}
            ${pick(presidentRotation.note) ? `<p class="org-copy">${escapeHtml(pick(presidentRotation.note))}</p>` : ""}
          </div>
          <div class="org-rotation-list">
            ${rotationMembers.length
        ? rotationMembers
          .map(
            (item) => `
                    <article class="org-rotation-card${String(item.rotation?.status || "").toUpperCase() === "CURRENT" ? " is-current" : ""}">
                      <div class="timeline-meta">
                        <span>${escapeHtml(language.organization.rotationOrder)} #${escapeHtml(String(item.rotation?.order || ""))}</span>
                        <span>${escapeHtml(item.rotation?.status || "UPCOMING")}</span>
                      </div>
                      <h4>${escapeHtml(pick(item.name))}</h4>
                      ${renderOptionalParagraph("org-lead", pick(toArray(item.roles)[0]?.title))}
                      ${renderOptionalParagraph("org-copy", pick(item.rotation?.note))}
                    </article>
                  `
          )
          .join("")
        : `<div class="empty-state"><p class="empty-title">${escapeHtml(language.common.noItems)}</p></div>`
      }
          </div>
        </section>
      ` : ""}
      ${people.length ? `
        <section class="org-people-panel">
          <p class="section-label">${escapeHtml(language.organization.peopleTitle.toUpperCase())}</p>
          <div class="org-people-grid">
            ${people
        .map(
          (person) => `
                  <article class="org-person-card">
                    <div class="timeline-meta">
                      <span>${escapeHtml(person.status || "ACTIVE")}</span>
                      <span>${escapeHtml(String(toArray(person.roles).length))} ${escapeHtml(language.organization.roleLabel)}</span>
                    </div>
                    <h4>${escapeHtml(pick(person.name))}</h4>
                    ${person.rotation?.enabled ? `<p class="tag">${escapeHtml(language.organization.rotationOrder)} #${escapeHtml(String(person.rotation.order || ""))}</p>` : ""}
                    <div class="org-role-stack">
                      ${toArray(person.roles)
              .map(
                (role) => `
                            <div class="org-role-chip">
                              <strong>${escapeHtml(pick(role.title))}</strong>
                              <span>${escapeHtml(role.status || "ACTIVE")}</span>
                              ${renderOptionalParagraph("org-copy", pick(role.scope))}
                            </div>
                          `
              )
              .join("")}
                    </div>
                    ${renderOptionalParagraph("org-copy", pick(person.note))}
                  </article>
                `
        )
        .join("")}
          </div>
        </section>
      ` : ""}
    </article>
  `;
}

function renderActivities(content) {
  if (!dom.activitiesList) {
    return;
  }

  const updateItems = toArray(content?.updates?.items)
    .filter((item) => item.published)
    .map((item) => ({
      type: String(item.tag || "UPDATE").toUpperCase(),
      date: item.date,
      title: item.title,
      meta: item.tag || "UPDATE",
      summary: item.summary,
      href: detailHref("update", item.id)
    }));
  const activityItems = toArray(content?.activities?.items)
    .filter((item) => item.published)
    .map((item) => ({
      type: "ACTIVITY",
      date: item.date,
      title: item.title,
      meta: [pick(item.location), item.status].filter(Boolean).join(" / "),
      summary: item.summary,
      href: detailHref("activity", item.id)
    }));
  const published = updateItems
    .concat(activityItems)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 6);

  if (!published.length) {
    dom.activitiesList.innerHTML = emptyState();
    return;
  }

  dom.activitiesList.innerHTML = published
    .map(
      (item) => `
        <a class="timeline-item timeline-link" href="${escapeAttribute(item.href)}">
          <div class="timeline-meta">
            <span>${escapeHtml(formatDate(item.date))}</span>
            <span>${escapeHtml(item.type)}</span>
            <span>${escapeHtml(item.meta || "")}</span>
          </div>
          <h4 class="timeline-title">${escapeHtml(pick(item.title))}</h4>
          <p class="timeline-copy">${escapeHtml(pick(item.summary))}</p>
        </a>
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
        <button class="footer-brand-button" type="button" data-schoolent-declaration aria-label="Show Schoolent declaration">
          <img class="footer-brand-image" src="/assets/schoolent-icon.png" alt="Schoolent" />
          <span class="footer-brand-glow" aria-hidden="true"></span>
        </button>
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

function setupSchoolentDeclarationActions() {
  document.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-schoolent-declaration]") : null;
    if (!trigger) {
      return;
    }

    event.preventDefault();
    showSchoolentDeclaration({ currentTarget: trigger });
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
    navigator.share({ title, text, url }).catch(() => { });
    return;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).catch(() => { });
  }
}

function showSchoolentDeclaration(event) {
  event?.currentTarget?.classList.add("is-pressed");
  window.setTimeout(() => event?.currentTarget?.classList.remove("is-pressed"), 360);

  const existing = document.querySelector(".declaration-popover");
  existing?.remove();

  const popover = document.createElement("div");
  popover.className = "declaration-popover";
  popover.setAttribute("style", "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,0);opacity:0;pointer-events:none;overflow-y:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;");

  const card = document.createElement("div");
  card.className = "declaration-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-label", "Schoolent declaration");
  card.setAttribute("style", "position:relative;width:min(520px,100%);max-height:calc(100vh - 96px);overflow-y:auto;box-sizing:border-box;padding:32px;border:1px solid rgba(255,255,255,.42);background:#050505;color:#f7f7f7;display:block;");

  const closeButton = document.createElement("button");
  closeButton.className = "declaration-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close");
  closeButton.setAttribute("style", "position:absolute;top:12px;right:12px;width:36px;height:36px;border:1px solid rgba(255,255,255,.28);background:#050505;color:#fff;cursor:pointer;");
  closeButton.textContent = "×";

  const label = document.createElement("p");
  label.className = "section-label";
  label.setAttribute("style", "margin:0 42px 12px 0;color:#f7f7f7;display:block;");
  label.textContent = "SCHOOLENT DECLARATION";

  const heading = document.createElement("h3");
  heading.setAttribute("style", "margin:0 0 14px;font-family:var(--font-serif, serif);font-size:2rem;font-weight:400;color:#fff;display:block;");
  heading.textContent = "Schoolent";

  const copy = document.createElement("p");
  copy.className = "declaration-copy";
  copy.setAttribute("style", "margin:0;color:#d6d6d6;line-height:1.8;font-size:1rem;display:block;white-space:normal;");
  copy.textContent = schoolentDeclarationText;

  card.append(closeButton, label, heading, copy);
  popover.append(card);
  document.body.append(popover);
  requestAnimationFrame(() => {
    popover.classList.add("is-visible");
    popover.style.opacity = "1";
    popover.style.pointerEvents = "auto";
    popover.style.background = "rgba(0,0,0,.76)";
    if (state.isAppShell) {
      window.setTimeout(() => {
        const visibleHeight = copy.getBoundingClientRect().height;
        if (visibleHeight < 24) {
          window.alert(`Schoolent Declaration\n\n${schoolentDeclarationText}`);
        }
      }, 160);
    }
  });

  const close = () => {
    popover.classList.remove("is-visible");
    popover.style.opacity = "0";
    popover.style.pointerEvents = "none";
    window.setTimeout(() => popover.remove(), 220);
  };
  popover.addEventListener("click", (event) => {
    if (event.target === popover || event.target.closest(".declaration-close")) {
      close();
    }
  });
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

function stripHtml(value) {
  const element = document.createElement("div");
  element.innerHTML = String(value || "");
  return element.textContent || element.innerText || "";
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

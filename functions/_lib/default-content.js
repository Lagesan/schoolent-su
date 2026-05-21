function localized(zh, en) {
  return { zh, en };
}

function departmentTemplate() {
  return {
    title: localized("", ""),
    scope: localized("", ""),
    status: "ACTIVE"
  };
}

function activityTemplate() {
  return {
    id: "",
    title: localized("", ""),
    date: new Date().toISOString(),
    location: localized("", ""),
    status: "PLANNED",
    summary: localized("", ""),
    published: true
  };
}

function updateAttachmentTemplate() {
  return {
    label: localized("", ""),
    url: "",
    key: "",
    name: "",
    type: "",
    size: 0
  };
}

function updateTemplate() {
  return {
    id: "",
    title: localized("", ""),
    date: new Date().toISOString(),
    tag: "UPDATE",
    summary: localized("", ""),
    body: localized("", ""),
    attachments: [],
    published: true
  };
}

function noticeToUpdateTemplate(notice) {
  return {
    title: notice?.label || localized("", ""),
    date: normalizeString(notice?.date, "1970-01-01T00:00:00.000Z"),
    tag: "NOTICE",
    summary: notice?.message || localized("", ""),
    body: notice?.message || localized("", ""),
    attachments: [],
    published: normalizeBoolean(notice?.active, true)
  };
}

function financeCategoryTemplate() {
  return {
    label: localized("", ""),
    amount: 0,
    note: localized("", "")
  };
}

function initiativeTemplate() {
  return {
    title: localized("", ""),
    stage: "QUEUE",
    owner: localized("", ""),
    summary: localized("", "")
  };
}

function publicationTemplate() {
  return {
    title: localized("", ""),
    date: new Date().toISOString(),
    tag: "UPDATE",
    summary: localized("", "")
  };
}

function noticeTemplate() {
  return {
    active: true,
    label: localized("", ""),
    message: localized("", "")
  };
}

function socialLinkTemplate() {
  return {
    label: localized("", ""),
    icon: "globe",
    url: ""
  };
}

function leadershipTemplate() {
  return {
    title: localized("", ""),
    scope: localized("", ""),
    status: "CORE"
  };
}

function personRoleTemplate() {
  return {
    title: localized("", ""),
    scope: localized("", ""),
    status: "ACTIVE"
  };
}

function personTemplate() {
  return {
    name: localized("", ""),
    roles: [],
    status: "ACTIVE",
    note: localized("", "")
  };
}

function monthlyPresidentTemplate() {
  return {
    person: localized("", ""),
    period: localized("", ""),
    note: localized("", "")
  };
}

function presidentRotationMemberTemplate() {
  return {
    person: localized("", ""),
    baseRole: localized("", ""),
    order: 1,
    status: "UPCOMING",
    note: localized("", "")
  };
}

function presidentRotationTemplate() {
  return {
    heading: localized("会长轮换顺序", "President rotation order"),
    currentPeriod: localized("", ""),
    currentPresident: localized("", ""),
    note: localized("", ""),
    members: []
  };
}

export function createDefaultContent() {
  return {
    site: {
      name: localized("昆中国际部学生会", "KZID Student Council"),
      shortName: localized("KSU", "Council Transparency Portal"),
      tagline: localized("把组织运作放到阳光下。", "Put student governance in the open."),
      domain: "council.example.edu",
      campaignNote: localized(
        "竞选中，等待最新信息",
        "Electing, waiting for the latest info."
      )
    },
    hero: {
      badge: localized("竞选主张 / 透明门户", "Campaign platform / transparency portal"),
      title: localized("让学生会每一步都可被看见", "Make each student-council decision visible"),
      subtitle: localized(
        "组织结构、近期活动、提案进度和公开数据集中展示，让学生知道资源去了哪里，项目推进到了哪一步。",
        "Show structure, activities, proposal status, and public-facing data in one place so students can see where resources go and how work moves."
      ),
      promise: localized("", ""),
      ctaPrimary: localized("查看透明数据", "View transparency data"),
      ctaSecondary: localized("跟进提案状态", "Track proposals")
    },
    notices: [

    ],
    organization: {
      heading: localized("学生会组织关系图", "Student council relationship map"),
      intro: localized("", ""),
      leadership: leadershipTemplate(),
      monthlyPresident: monthlyPresidentTemplate(),
      presidentRotation: presidentRotationTemplate(),
      people: [],
      departments: []
    },
    activities: {
      heading: localized("近期活动看板", "Recent activity board"),
      intro: localized("", ""),
      items: []
    },
    updates: {
      heading: localized("动态更新", "Updates"),
      intro: localized("", ""),
      items: []
    },
    finance: {
      heading: localized("财务与资源公开", "Finance and resource disclosure"),
      intro: localized("", ""),
      published: true,
      lastUpdated: "2026-04-14T11:45:00+08:00",
      summary: localized(
        "这里展示的是可对外公开的总量与分类数据，不包含所有临时调拨记录。",
        "This block shows totals and categories that are suitable for public release, not every temporary transfer."
      ),
      manualNote: localized(
        "因临时调拨、紧急垫付或上级统一安排，个别流向可能只做人工汇总，不逐条展示。",
        "Some transfers may be manually summarized rather than itemized because of emergency allocations or upstream arrangements."
      ),
      hiddenFlowReason: localized(
        "当前阶段如果不适合公开详细流向，也可以保留这个说明模块继续对外说明原因。",
        "If detailed flows cannot be shown for a period, this module can stay online with a public explanation instead."
      ),
      totals: {
        budget: 72000,
        available: 28600,
        reserve: 9500
      },
      categories: []
    },
    initiatives: {
      heading: localized("提案追踪台", "Proposal tracker"),
      intro: localized("", ""),
      items: []
    },
    publications: {
      heading: localized("公开纪要与说明", "Public notes and updates"),
      intro: localized("", ""),
      items: []
    },
    footer: {
      presidentEmail: "president@example.edu",
      statement: localized(
        "透明不是一次性动作，而是一套持续发布、持续回应的工作机制。",
        "Transparency is not a one-off announcement. It is a repeatable publishing and response system."
      ),
      socialLinks: []
    },
    settings: {
      aiReady: true
    }
  };
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function createContentId(prefix, value, index = 0) {
  const existing = normalizeString(value?.id, "");
  if (existing) {
    return safeId(existing);
  }

  const seed = [
    prefix,
    normalizeString(value?.date, ""),
    normalizeString(value?.tag || value?.status, ""),
    normalizeString(value?.title?.zh || value?.title?.en || value?.label?.zh || value?.label?.en, ""),
    index
  ].join("|");

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return `${prefix}-${hash.toString(36)}`;
}

function safeId(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "item";
}

function normalizeLocalized(value, fallback) {
  return {
    zh: normalizeString(value?.zh, fallback.zh),
    en: normalizeString(value?.en, fallback.en)
  };
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeNotice(value, fallback) {
  return {
    active: normalizeBoolean(value?.active, fallback.active),
    label: normalizeLocalized(value?.label, fallback.label),
    message: normalizeLocalized(value?.message, fallback.message)
  };
}

function normalizeDepartment(value, fallback) {
  return {
    title: normalizeLocalized(value?.title, fallback.title),
    scope: normalizeLocalized(value?.scope, fallback.scope),
    status: normalizeString(value?.status, fallback.status)
  };
}

function normalizeActivity(value, fallback, index = 0) {
  return {
    id: createContentId("activity", value, index),
    title: normalizeLocalized(value?.title, fallback.title),
    date: normalizeString(value?.date, fallback.date),
    location: normalizeLocalized(value?.location, fallback.location),
    status: normalizeString(value?.status, fallback.status),
    summary: normalizeLocalized(value?.summary, fallback.summary),
    published: normalizeBoolean(value?.published, fallback.published)
  };
}

function sanitizeRichText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|input|button|textarea|select)[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, "");
}

function normalizeRichLocalized(value, fallback) {
  return {
    zh: sanitizeRichText(normalizeString(value?.zh, fallback.zh)),
    en: sanitizeRichText(normalizeString(value?.en, fallback.en))
  };
}

function normalizeUpdateAttachment(value, fallback) {
  return {
    label: normalizeLocalized(value?.label, fallback.label),
    url: normalizeString(value?.url, fallback.url),
    key: normalizeString(value?.key, fallback.key),
    name: normalizeString(value?.name, fallback.name),
    type: normalizeString(value?.type, fallback.type),
    size: normalizeNumber(value?.size, fallback.size)
  };
}

function normalizeUpdate(value, fallback, index = 0) {
  return {
    id: createContentId("update", value, index),
    title: normalizeLocalized(value?.title, fallback.title),
    date: normalizeString(value?.date, fallback.date),
    tag: normalizeString(value?.tag, fallback.tag),
    summary: normalizeLocalized(value?.summary, fallback.summary),
    body: normalizeRichLocalized(value?.body, fallback.body),
    attachments: Array.isArray(value?.attachments)
      ? value.attachments.map((item) => normalizeUpdateAttachment(item, updateAttachmentTemplate()))
      : fallback.attachments.map((item) => normalizeUpdateAttachment(item, updateAttachmentTemplate())),
    published: normalizeBoolean(value?.published, fallback.published)
  };
}

function normalizeMergedUpdates(value, fallback) {
  const updateItems = Array.isArray(value.updates?.items)
    ? value.updates.items
    : fallback.updates.items;
  const legacyNotices = Array.isArray(value.notices) ? value.notices : [];
  const migratedNotices = legacyNotices.map((item) => noticeToUpdateTemplate(normalizeNotice(item, noticeTemplate())));

  return updateItems
    .concat(migratedNotices)
    .map((item, index) => normalizeUpdate(item, updateTemplate(), index));
}

function normalizePersonRole(value, fallback) {
  return {
    title: normalizeLocalized(value?.title, fallback.title),
    scope: normalizeLocalized(value?.scope, fallback.scope),
    status: normalizeString(value?.status, fallback.status)
  };
}

function normalizePerson(value, fallback) {
  return {
    name: normalizeLocalized(value?.name || value?.person, fallback.name),
    roles: Array.isArray(value?.roles)
      ? value.roles.map((item) => normalizePersonRole(item, personRoleTemplate()))
      : fallback.roles.map((item) => normalizePersonRole(item, personRoleTemplate())),
    status: normalizeString(value?.status, fallback.status),
    note: normalizeLocalized(value?.note, fallback.note)
  };
}

function normalizeMonthlyPresident(value, fallback) {
  return {
    person: normalizeLocalized(value?.person, fallback.person),
    period: normalizeLocalized(value?.period, fallback.period),
    note: normalizeLocalized(value?.note, fallback.note)
  };
}

function normalizePresidentRotationMember(value, fallback) {
  return {
    person: normalizeLocalized(value?.person, fallback.person),
    baseRole: normalizeLocalized(value?.baseRole, fallback.baseRole),
    order: normalizeNumber(value?.order, fallback.order),
    status: normalizeString(value?.status, fallback.status),
    note: normalizeLocalized(value?.note, fallback.note)
  };
}

function normalizePresidentRotation(value, fallback) {
  return {
    heading: normalizeLocalized(value?.heading, fallback.heading),
    currentPeriod: normalizeLocalized(value?.currentPeriod, fallback.currentPeriod),
    currentPresident: normalizeLocalized(value?.currentPresident, fallback.currentPresident),
    note: normalizeLocalized(value?.note, fallback.note),
    members: Array.isArray(value?.members)
      ? value.members.map((item) => normalizePresidentRotationMember(item, presidentRotationMemberTemplate()))
      : fallback.members.map((item) => normalizePresidentRotationMember(item, presidentRotationMemberTemplate()))
  };
}

function normalizeFinanceCategory(value, fallback) {
  return {
    label: normalizeLocalized(value?.label, fallback.label),
    amount: normalizeNumber(value?.amount, fallback.amount),
    note: normalizeLocalized(value?.note, fallback.note)
  };
}

function normalizeInitiative(value, fallback) {
  return {
    title: normalizeLocalized(value?.title, fallback.title),
    stage: normalizeString(value?.stage, fallback.stage),
    owner: normalizeLocalized(value?.owner, fallback.owner),
    summary: normalizeLocalized(value?.summary, fallback.summary)
  };
}

function normalizePublication(value, fallback) {
  return {
    title: normalizeLocalized(value?.title, fallback.title),
    date: normalizeString(value?.date, fallback.date),
    tag: normalizeString(value?.tag, fallback.tag),
    summary: normalizeLocalized(value?.summary, fallback.summary)
  };
}

function normalizeSocialLink(value, fallback) {
  return {
    label: normalizeLocalized(value?.label, fallback.label),
    icon: normalizeString(value?.icon, fallback.icon),
    url: normalizeString(value?.url, fallback.url)
  };
}

export function normalizeContent(value = {}) {
  const fallback = createDefaultContent();
  const legacyTeams = Array.isArray(value.organization?.teams) ? value.organization.teams : [];
  const departmentSeed = Array.isArray(value.organization?.departments)
    ? value.organization.departments
    : legacyTeams;

  return {
    site: {
      name: normalizeLocalized(value.site?.name, fallback.site.name),
      shortName: normalizeLocalized(value.site?.shortName, fallback.site.shortName),
      tagline: normalizeLocalized(value.site?.tagline, fallback.site.tagline),
      domain: normalizeString(value.site?.domain, fallback.site.domain),
      campaignNote: normalizeLocalized(value.site?.campaignNote, fallback.site.campaignNote)
    },
    hero: {
      badge: normalizeLocalized(value.hero?.badge, fallback.hero.badge),
      title: normalizeLocalized(value.hero?.title, fallback.hero.title),
      subtitle: normalizeLocalized(value.hero?.subtitle, fallback.hero.subtitle),
      promise: normalizeLocalized(value.hero?.promise, fallback.hero.promise),
      ctaPrimary: normalizeLocalized(value.hero?.ctaPrimary, fallback.hero.ctaPrimary),
      ctaSecondary: normalizeLocalized(value.hero?.ctaSecondary, fallback.hero.ctaSecondary)
    },
    notices: [],
    organization: {
      heading: normalizeLocalized(value.organization?.heading, fallback.organization.heading),
      intro: normalizeLocalized(value.organization?.intro, fallback.organization.intro),
      leadership: normalizeDepartment(
        value.organization?.leadership || legacyTeams[0],
        fallback.organization.leadership
      ),
      monthlyPresident: normalizeMonthlyPresident(
        value.organization?.monthlyPresident || {
          person: value.organization?.presidentRotation?.currentPresident,
          period: value.organization?.presidentRotation?.currentPeriod,
          note: value.organization?.presidentRotation?.note
        },
        fallback.organization.monthlyPresident
      ),
      presidentRotation: normalizePresidentRotation(
        value.organization?.presidentRotation,
        fallback.organization.presidentRotation
      ),
      people: Array.isArray(value.organization?.people)
        ? value.organization.people.map((item) => normalizePerson(item, personTemplate()))
        : fallback.organization.people.map((item) => normalizePerson(item, personTemplate())),
      departments: Array.isArray(departmentSeed)
        ? departmentSeed.map((item) => normalizeDepartment(item, departmentTemplate()))
        : fallback.organization.departments.map((item) => normalizeDepartment(item, departmentTemplate()))
    },
    activities: {
      heading: normalizeLocalized(value.activities?.heading, fallback.activities.heading),
      intro: normalizeLocalized(value.activities?.intro, fallback.activities.intro),
      items: Array.isArray(value.activities?.items)
        ? value.activities.items.map((item, index) => normalizeActivity(item, activityTemplate(), index))
        : fallback.activities.items.map((item, index) => normalizeActivity(item, activityTemplate(), index))
    },
    updates: {
      heading: normalizeLocalized(value.updates?.heading, fallback.updates.heading),
      intro: normalizeLocalized(value.updates?.intro, fallback.updates.intro),
      items: normalizeMergedUpdates(value, fallback)
    },
    finance: {
      heading: normalizeLocalized(value.finance?.heading, fallback.finance.heading),
      intro: normalizeLocalized(value.finance?.intro, fallback.finance.intro),
      published: normalizeBoolean(value.finance?.published, fallback.finance.published),
      lastUpdated: normalizeString(value.finance?.lastUpdated, fallback.finance.lastUpdated),
      summary: normalizeLocalized(value.finance?.summary, fallback.finance.summary),
      manualNote: normalizeLocalized(value.finance?.manualNote, fallback.finance.manualNote),
      hiddenFlowReason: normalizeLocalized(value.finance?.hiddenFlowReason, fallback.finance.hiddenFlowReason),
      totals: {
        budget: normalizeNumber(value.finance?.totals?.budget, fallback.finance.totals.budget),
        available: normalizeNumber(value.finance?.totals?.available, fallback.finance.totals.available),
        reserve: normalizeNumber(value.finance?.totals?.reserve, fallback.finance.totals.reserve)
      },
      categories: Array.isArray(value.finance?.categories)
        ? value.finance.categories.map((item) => normalizeFinanceCategory(item, financeCategoryTemplate()))
        : fallback.finance.categories.map((item) => normalizeFinanceCategory(item, financeCategoryTemplate()))
    },
    initiatives: {
      heading: normalizeLocalized(value.initiatives?.heading, fallback.initiatives.heading),
      intro: normalizeLocalized(value.initiatives?.intro, fallback.initiatives.intro),
      items: Array.isArray(value.initiatives?.items)
        ? value.initiatives.items.map((item) => normalizeInitiative(item, initiativeTemplate()))
        : fallback.initiatives.items.map((item) => normalizeInitiative(item, initiativeTemplate()))
    },
    publications: {
      heading: normalizeLocalized(value.publications?.heading, fallback.publications.heading),
      intro: normalizeLocalized(value.publications?.intro, fallback.publications.intro),
      items: Array.isArray(value.publications?.items)
        ? value.publications.items.map((item) => normalizePublication(item, publicationTemplate()))
        : fallback.publications.items.map((item) => normalizePublication(item, publicationTemplate()))
    },
    footer: {
      presidentEmail: normalizeString(value.footer?.presidentEmail || value.footer?.contactEmail, fallback.footer.presidentEmail),
      statement: normalizeLocalized(value.footer?.statement, fallback.footer.statement),
      socialLinks: Array.isArray(value.footer?.socialLinks)
        ? value.footer.socialLinks.map((item) => normalizeSocialLink(item, socialLinkTemplate()))
        : fallback.footer.socialLinks.map((item) => normalizeSocialLink(item, socialLinkTemplate()))
    },
    settings: {
      aiReady: normalizeBoolean(value.settings?.aiReady, fallback.settings.aiReady)
    }
  };
}

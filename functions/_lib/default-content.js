function localized(zh, en) {
  return { zh, en };
}

function departmentTemplate() {
  return {
    title: localized("新部门", "New department"),
    lead: localized("负责人", "Lead"),
    scope: localized("负责范围", "Describe responsibilities."),
    status: "ACTIVE"
  };
}

function activityTemplate() {
  return {
    title: localized("活动名称", "Activity title"),
    date: new Date().toISOString(),
    location: localized("地点", "Location"),
    status: "PLANNED",
    summary: localized("活动简介", "Activity summary"),
    published: true
  };
}

function financeCategoryTemplate() {
  return {
    label: localized("分类", "Category"),
    amount: 0,
    note: localized("备注", "Notes")
  };
}

function initiativeTemplate() {
  return {
    title: localized("提案名称", "Proposal title"),
    stage: "QUEUE",
    owner: localized("负责人", "Owner"),
    summary: localized("提案说明", "Proposal summary")
  };
}

function publicationTemplate() {
  return {
    title: localized("纪要标题", "Note title"),
    date: new Date().toISOString(),
    tag: "UPDATE",
    summary: localized("纪要摘要", "Note summary")
  };
}

function noticeTemplate() {
  return {
    active: true,
    label: localized("公告", "Notice"),
    message: localized("填写公告内容。", "Add your notice here.")
  };
}

function socialLinkTemplate() {
  return {
    label: localized("新社媒", "New social"),
    icon: "globe",
    url: ""
  };
}

function leadershipTemplate() {
  return {
    title: localized("学生会主席团", "Student Union Leadership"),
    lead: localized("会长 / 主席团", "President / Executive Board"),
    scope: localized("负责总体战略、资源统筹、公开承诺兑现与跨部门协调。", "Own strategy, resource allocation, public commitments, and coordination across departments."),
    status: "CORE"
  };
}

export function createDefaultContent() {
  return {
    site: {
      name: localized("昆仲学生会透明门户", "Kunzhong Student Union Transparency Portal"),
      shortName: localized("学生会透明门户", "Union Transparency Portal"),
      tagline: localized("把组织运作放到阳光下。", "Put student governance in the open."),
      domain: "union.example.edu",
      campaignNote: localized(
        "这是一个适合竞选展示、后续也能直接转入真实运营的透明门户样板。",
        "This starter works both as a campaign demo and as a real operations portal."
      )
    },
    hero: {
      badge: localized("竞选主张 / 透明门户", "Campaign platform / transparency portal"),
      title: localized("让学生会每一步都可被看见", "Make each student-union decision visible"),
      subtitle: localized(
        "组织结构、近期活动、提案进度和公开数据集中展示，让学生知道资源去了哪里，项目推进到了哪一步。",
        "Show structure, activities, proposal status, and public-facing data in one place so students can see where resources go and how work moves."
      ),
      promise: localized(
        "平台默认支持双语、后台发布和手动财务修正字段，也为后续接 AI 总结、答疑或自动周报保留了接口位置。",
        "The portal ships with bilingual pages, admin publishing, manual finance overrides, and an API surface ready for future AI summaries or assistant features."
      ),
      ctaPrimary: localized("查看透明数据", "View transparency data"),
      ctaSecondary: localized("跟进提案状态", "Track proposals")
    },
    notices: [
      {
        active: true,
        label: localized("竞选样站", "Campaign demo"),
        message: localized(
          "当前数据为样板内容，可在后台替换成你自己的竞选承诺、活动和实际公开数据。",
          "The current records are sample content and can be replaced from the admin console."
        )
      },
      {
        active: true,
        label: localized("财务说明", "Finance note"),
        message: localized(
          "财务流向支持手动修正；如涉及临时调拨或不便公开事项，可整体切换为“暂未公开”。",
          "Finance disclosures support manual overrides, and detailed flow can be hidden when records are temporarily not publishable."
        )
      }
    ],
    organization: {
      heading: localized("学生会组织关系图", "Student union relationship map"),
      intro: localized(
        "用关系图而不是平铺卡片，直接展示会长与各部门之间的协作连接，便于同学理解职责和汇报链路。",
        "Use a relationship map instead of flat cards so students can quickly read responsibilities and reporting lines."
      ),
      leadership: leadershipTemplate(),
      departments: [
        {
          title: localized("秘书处", "Secretariat"),
          lead: localized("秘书长", "Secretary General"),
          scope: localized("统筹会议节奏、项目跟进与跨部门协同。", "Coordinate meetings, follow-ups, and cross-team operations."),
          status: "ACTIVE"
        },
        {
          title: localized("活动与项目部", "Programs & Events"),
          lead: localized("活动负责人", "Programs lead"),
          scope: localized("策划近期活动、管理报名流程和现场执行。", "Own event planning, sign-up logistics, and on-site delivery."),
          status: "OPEN"
        },
        {
          title: localized("财务与资源部", "Finance & Resources"),
          lead: localized("财务负责人", "Finance lead"),
          scope: localized("管理预算、可用资金、物资申请与资金公开。", "Manage budget, available funds, resources, and finance disclosures."),
          status: "PUBLIC"
        },
        {
          title: localized("宣传与媒体部", "Communications"),
          lead: localized("宣传负责人", "Comms lead"),
          scope: localized("负责公告发布、双语更新和社媒协同。", "Publish notices, maintain bilingual updates, and coordinate media."),
          status: "ACTIVE"
        }
      ]
    },
    activities: {
      heading: localized("近期活动看板", "Recent activity board"),
      intro: localized(
        "让学生看到学生会最近正在做什么，而不是只在活动结束后才知道。",
        "Show what the union is actively working on instead of only posting after events finish."
      ),
      items: [
        {
          title: localized("透明预算说明会", "Budget transparency town hall"),
          date: "2026-04-20T18:30:00+08:00",
          location: localized("学生活动中心 201", "Student Center Room 201"),
          status: "OPEN",
          summary: localized(
            "集中说明本学期活动经费安排、公开规则和同学反馈渠道。",
            "Walk through this term's spending plan, disclosure rules, and student feedback channels."
          ),
          published: true
        },
        {
          title: localized("志愿者招募与培训", "Volunteer recruitment and onboarding"),
          date: "2026-04-24T16:00:00+08:00",
          location: localized("报告厅 B", "Lecture Hall B"),
          status: "RECRUITING",
          summary: localized(
            "公开招募活动志愿者，并同步介绍学生会内部协作流程。",
            "Recruit volunteers and introduce the union's operating workflow in one session."
          ),
          published: true
        },
        {
          title: localized("主席团月度答疑", "Monthly executive Q&A"),
          date: "2026-04-28T19:30:00+08:00",
          location: localized("线上直播", "Live stream"),
          status: "SCHEDULED",
          summary: localized(
            "回答同学关心的问题，并对上月提案处理状态做公开反馈。",
            "Answer student questions and publicly report progress on the previous month's proposals."
          ),
          published: true
        }
      ]
    },
    finance: {
      heading: localized("财务与资源公开", "Finance and resource disclosure"),
      intro: localized(
        "公开总体预算、当前可用资金和分类流向；如遇特殊情况，可在后台先切换为暂未公开。",
        "Publish the overall budget, available funds, and category-level flows; hide details temporarily when needed."
      ),
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
      categories: [
        {
          label: localized("活动执行", "Program delivery"),
          amount: 24800,
          note: localized("场地、物资与现场支持。", "Venue, materials, and delivery support.")
        },
        {
          label: localized("宣传制作", "Communications"),
          amount: 6800,
          note: localized("海报、摄影、线上发布素材。", "Posters, photography, and digital assets.")
        },
        {
          label: localized("学生福利", "Student welfare"),
          amount: 12100,
          note: localized("奖品、补助和专项支持。", "Prizes, subsidies, and special support.")
        }
      ]
    },
    initiatives: {
      heading: localized("提案追踪台", "Proposal tracker"),
      intro: localized(
        "除了活动和财务，学生更关心意见有没有被处理。这个模块可以展示提案状态、负责人和下一步。",
        "Students also care whether feedback is being processed. This module tracks proposal status, owner, and next step."
      ),
      items: [
        {
          title: localized("建立提案响应 SLA", "Set a proposal response SLA"),
          stage: "IN PROGRESS",
          owner: localized("秘书处", "Secretariat"),
          summary: localized("承诺学生提交建议后 5 个工作日内给出受理状态。", "Respond with intake status within 5 working days after a student proposal is submitted.")
        },
        {
          title: localized("活动预算公开模板", "Budget disclosure template"),
          stage: "DESIGN",
          owner: localized("财务与资源部", "Finance & Resources"),
          summary: localized("每个活动结束后发布统一格式的预算摘要和去向说明。", "Publish a standard budget digest after each event.")
        },
        {
          title: localized("会议纪要周更", "Weekly public notes"),
          stage: "READY",
          owner: localized("宣传与媒体部", "Communications"),
          summary: localized("用短格式纪要说明本周决议、风险点和下周动作。", "Ship concise weekly notes on decisions, risks, and next actions.")
        }
      ]
    },
    publications: {
      heading: localized("公开纪要与说明", "Public notes and updates"),
      intro: localized(
        "适合放会议纪要、工作周报、规则说明和公开声明，形成持续的透明记录。",
        "Use this section for meeting notes, weekly briefs, policy explainers, and public statements."
      ),
      items: [
        {
          title: localized("透明门户上线说明", "Portal launch note"),
          date: "2026-04-14T12:00:00+08:00",
          tag: "LAUNCH",
          summary: localized("说明为什么要做这个平台、公开到什么程度、哪些内容仍需人工判断。", "Explain why the platform exists, what gets published, and what still requires manual review.")
        },
        {
          title: localized("第一周工作简报", "Week-one operating brief"),
          date: "2026-04-21T18:00:00+08:00",
          tag: "WEEKLY",
          summary: localized("发布本周完成事项、延期项目和需要学生配合的事项。", "Summarize completed work, delayed items, and calls for student participation.")
        },
        {
          title: localized("财务公开规则说明", "Finance disclosure rules"),
          date: "2026-04-18T17:00:00+08:00",
          tag: "POLICY",
          summary: localized("解释为什么有些记录只展示汇总、不展示单笔流水。", "Clarify why some records are shown as aggregates rather than line items.")
        }
      ]
    },
    footer: {
      presidentEmail: "president@example.edu",
      statement: localized(
        "透明不是一次性动作，而是一套持续发布、持续回应的工作机制。",
        "Transparency is not a one-off announcement. It is a repeatable publishing and response system."
      ),
      socialLinks: [
        {
          label: localized("学生会主页", "Union homepage"),
          icon: "globe",
          url: "https://example.edu/union"
        },
        {
          label: localized("微信公众号", "WeChat"),
          icon: "wechat",
          url: "https://example.edu/wechat"
        },
        {
          label: localized("Instagram", "Instagram"),
          icon: "instagram",
          url: "https://instagram.com/example"
        }
      ]
    },
    settings: {
      aiReady: true
    }
  };
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
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
    lead: normalizeLocalized(value?.lead, fallback.lead),
    scope: normalizeLocalized(value?.scope, fallback.scope),
    status: normalizeString(value?.status, fallback.status)
  };
}

function normalizeActivity(value, fallback) {
  return {
    title: normalizeLocalized(value?.title, fallback.title),
    date: normalizeString(value?.date, fallback.date),
    location: normalizeLocalized(value?.location, fallback.location),
    status: normalizeString(value?.status, fallback.status),
    summary: normalizeLocalized(value?.summary, fallback.summary),
    published: normalizeBoolean(value?.published, fallback.published)
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
  const departmentSeed = Array.isArray(value.organization?.departments) && value.organization.departments.length
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
    notices: Array.isArray(value.notices) && value.notices.length
      ? value.notices.map((item) => normalizeNotice(item, noticeTemplate()))
      : fallback.notices.map((item) => normalizeNotice(item, noticeTemplate())),
    organization: {
      heading: normalizeLocalized(value.organization?.heading, fallback.organization.heading),
      intro: normalizeLocalized(value.organization?.intro, fallback.organization.intro),
      leadership: normalizeDepartment(
        value.organization?.leadership || legacyTeams[0],
        fallback.organization.leadership
      ),
      departments: departmentSeed.length
        ? departmentSeed.map((item) => normalizeDepartment(item, departmentTemplate()))
        : fallback.organization.departments.map((item) => normalizeDepartment(item, departmentTemplate()))
    },
    activities: {
      heading: normalizeLocalized(value.activities?.heading, fallback.activities.heading),
      intro: normalizeLocalized(value.activities?.intro, fallback.activities.intro),
      items: Array.isArray(value.activities?.items) && value.activities.items.length
        ? value.activities.items.map((item) => normalizeActivity(item, activityTemplate()))
        : fallback.activities.items.map((item) => normalizeActivity(item, activityTemplate()))
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
      categories: Array.isArray(value.finance?.categories) && value.finance.categories.length
        ? value.finance.categories.map((item) => normalizeFinanceCategory(item, financeCategoryTemplate()))
        : fallback.finance.categories.map((item) => normalizeFinanceCategory(item, financeCategoryTemplate()))
    },
    initiatives: {
      heading: normalizeLocalized(value.initiatives?.heading, fallback.initiatives.heading),
      intro: normalizeLocalized(value.initiatives?.intro, fallback.initiatives.intro),
      items: Array.isArray(value.initiatives?.items) && value.initiatives.items.length
        ? value.initiatives.items.map((item) => normalizeInitiative(item, initiativeTemplate()))
        : fallback.initiatives.items.map((item) => normalizeInitiative(item, initiativeTemplate()))
    },
    publications: {
      heading: normalizeLocalized(value.publications?.heading, fallback.publications.heading),
      intro: normalizeLocalized(value.publications?.intro, fallback.publications.intro),
      items: Array.isArray(value.publications?.items) && value.publications.items.length
        ? value.publications.items.map((item) => normalizePublication(item, publicationTemplate()))
        : fallback.publications.items.map((item) => normalizePublication(item, publicationTemplate()))
    },
    footer: {
      presidentEmail: normalizeString(value.footer?.presidentEmail || value.footer?.contactEmail, fallback.footer.presidentEmail),
      statement: normalizeLocalized(value.footer?.statement, fallback.footer.statement),
      socialLinks: Array.isArray(value.footer?.socialLinks) && value.footer.socialLinks.length
        ? value.footer.socialLinks.map((item) => normalizeSocialLink(item, socialLinkTemplate()))
        : fallback.footer.socialLinks.map((item) => normalizeSocialLink(item, socialLinkTemplate()))
    },
    settings: {
      aiReady: normalizeBoolean(value.settings?.aiReady, fallback.settings.aiReady)
    }
  };
}

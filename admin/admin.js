const state = {
  content: null,
  meta: null,
  authenticated: false
};

const dom = {
  status: document.querySelector("#adminStatus"),
  loginPanel: document.querySelector("#loginPanel"),
  editorPanel: document.querySelector("#editorPanel")
};

const socialIconOptions = [
  ["globe", "GL / 站点"],
  ["wechat", "WX / WeChat"],
  ["instagram", "IG / Instagram"],
  ["xiaohongshu", "RED / Xiaohongshu"],
  ["bilibili", "B / Bilibili"],
  ["github", "GH / GitHub"],
  ["email", "@ / Email"]
];

const factories = {
  notices: () => ({
    active: true,
    label: { zh: "新公告", en: "New notice" },
    message: { zh: "填写新的公告内容。", en: "Add a new public notice." }
  }),
  "organization.departments": () => ({
    title: { zh: "新部门", en: "New department" },
    lead: { zh: "负责人", en: "Lead" },
    scope: { zh: "负责范围", en: "Describe responsibilities." },
    status: "ACTIVE"
  }),
  "activities.items": () => ({
    title: { zh: "新活动", en: "New activity" },
    date: new Date().toISOString(),
    location: { zh: "地点待定", en: "Location TBD" },
    status: "PLANNED",
    summary: { zh: "填写活动说明。", en: "Add an activity summary." },
    published: true
  }),
  "finance.categories": () => ({
    label: { zh: "新项目", en: "New category" },
    amount: 0,
    note: { zh: "备注", en: "Notes" }
  }),
  "initiatives.items": () => ({
    title: { zh: "新提案", en: "New proposal" },
    stage: "QUEUE",
    owner: { zh: "负责人", en: "Owner" },
    summary: { zh: "填写提案概述。", en: "Add proposal summary." }
  }),
  "publications.items": () => ({
    title: { zh: "新纪要", en: "New note" },
    date: new Date().toISOString(),
    tag: "UPDATE",
    summary: { zh: "填写纪要内容。", en: "Add a public note." }
  }),
  "footer.socialLinks": () => ({
    label: { zh: "新社媒", en: "New social" },
    icon: "globe",
    url: ""
  })
};

dom.loginPanel.addEventListener("submit", handleLoginSubmit);
dom.editorPanel.addEventListener("input", handleFieldInput);
dom.editorPanel.addEventListener("change", handleFieldInput);
dom.editorPanel.addEventListener("click", handleEditorClick);

init();

async function init() {
  setStatus("Checking session...", "warn");

  try {
    const response = await fetch("/api/admin/session");
    if (!response.ok) {
      throw new Error("Session check failed");
    }

    const payload = await response.json();
    state.authenticated = payload.authenticated;

    if (state.authenticated) {
      await loadEditor();
    } else {
      renderLogin();
      setStatus("请输入后台密码后继续。", "warn");
    }
  } catch (error) {
    console.error(error);
    renderLogin();
    setStatus("会话检查失败，请重新登录。", "error");
  }
}

function renderLogin() {
  dom.editorPanel.hidden = true;
  dom.loginPanel.hidden = false;
  dom.loginPanel.innerHTML = `
    <form class="admin-form">
      <label class="field">
        <span>后台密码</span>
        <input type="password" name="password" autocomplete="current-password" placeholder="Enter admin password" required />
      </label>
      <div class="button-row">
        <button class="button button-primary" type="submit">登录</button>
      </div>
    </form>
  `;
}

async function loadEditor() {
  setStatus("Loading editable content...", "warn");

  try {
    const response = await fetch("/api/admin/content");
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Failed to load content.");
    }

    state.content = payload.content;
    state.meta = payload.meta;
    renderEditor();
    setStatus("后台已连接，可以编辑并发布。", "ok");
  } catch (error) {
    console.error(error);
    renderLogin();
    setStatus(error.message || "后台内容加载失败。", "error");
  }
}

function renderEditor() {
  dom.loginPanel.hidden = true;
  dom.editorPanel.hidden = false;

  const leadership = state.content.organization.leadership;
  const departments = state.content.organization.departments;

  dom.editorPanel.innerHTML = `
    <div class="editor-layout">
      <div class="editor-toolbar">
        <button class="button button-primary" type="button" data-action="save">保存并发布</button>
        <a class="button button-secondary" href="/" target="_blank" rel="noreferrer">打开前台</a>
        <button class="button button-plain" type="button" data-action="logout">退出登录</button>
      </div>
      <p class="admin-meta">最近发布时间：${escapeHtml(formatDate(state.meta?.updatedAt))}</p>

      <section class="editor-section">
        <h3>站点信息</h3>
        <div class="editor-grid">
          ${localizedFields("站点名称", "site.name", state.content.site.name)}
          ${localizedFields("站点简称", "site.shortName", state.content.site.shortName)}
          ${localizedFields("站点标语", "site.tagline", state.content.site.tagline)}
          ${inputField("域名", "site.domain", state.content.site.domain)}
          ${localizedFields("竞选备注", "site.campaignNote", state.content.site.campaignNote, true)}
        </div>
      </section>

      <section class="editor-section">
        <h3>首页 Hero</h3>
        <div class="editor-grid">
          ${localizedFields("眉标", "hero.badge", state.content.hero.badge)}
          ${localizedFields("主标题", "hero.title", state.content.hero.title, true)}
          ${localizedFields("副标题", "hero.subtitle", state.content.hero.subtitle, true)}
          ${localizedFields("承诺文案", "hero.promise", state.content.hero.promise, true)}
          ${localizedFields("主按钮", "hero.ctaPrimary", state.content.hero.ctaPrimary)}
          ${localizedFields("次按钮", "hero.ctaSecondary", state.content.hero.ctaSecondary)}
        </div>
      </section>

      <section class="editor-section">
        <h3>顶部公告</h3>
        <p class="help-copy">每一项像列表一样展开编辑，常用操作会更顺手。</p>
        <div class="stack-list">
          ${state.content.notices
            .map((notice, index) =>
              listItem({
                title: pickLocal(notice.label),
                meta: notice.active ? "已显示" : "已隐藏",
                body: `
                  <div class="checkbox-row">
                    <input id="notice-active-${index}" type="checkbox" data-path="notices[${index}].active" ${notice.active ? "checked" : ""} />
                    <label for="notice-active-${index}">启用这条公告</label>
                  </div>
                  <div class="list-body">
                    <div class="editor-grid">
                      ${localizedFields("标签", `notices[${index}].label`, notice.label)}
                      ${localizedFields("内容", `notices[${index}].message`, notice.message, true)}
                    </div>
                    <div class="row-actions">
                      <button class="button button-danger" type="button" data-action="remove" data-array-path="notices" data-index="${index}">删除公告</button>
                    </div>
                  </div>
                `
              })
            )
            .join("")}
        </div>
        <div class="row-actions">
          <button class="button button-secondary" type="button" data-action="add" data-array-path="notices">新增公告</button>
        </div>
      </section>

      <section class="editor-section">
        <h3>组织关系图</h3>
        <div class="editor-grid">
          ${localizedFields("模块标题", "organization.heading", state.content.organization.heading)}
          ${localizedFields("模块说明", "organization.intro", state.content.organization.intro, true)}
        </div>

        <div class="editor-card">
          <h4>核心节点</h4>
          <div class="editor-grid">
            ${localizedFields("核心节点名称", "organization.leadership.title", leadership.title)}
            ${localizedFields("负责人", "organization.leadership.lead", leadership.lead)}
            ${localizedFields("负责范围", "organization.leadership.scope", leadership.scope, true)}
            ${inputField("状态标签", "organization.leadership.status", leadership.status)}
          </div>
        </div>

        <div class="editor-card">
          <h4>关系图预览</h4>
          <div class="preview-grid">
            <div class="preview-node">
              <strong>${escapeHtml(pickLocal(leadership.title))}</strong>
              <span>${escapeHtml(pickLocal(leadership.lead))}</span>
            </div>
            ${departments
              .map(
                (department) => `
                  <div class="preview-node">
                    <strong>${escapeHtml(pickLocal(department.title))}</strong>
                    <span>${escapeHtml(pickLocal(department.lead))}</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="stack-list">
          ${departments
            .map((department, index) =>
              listItem({
                title: pickLocal(department.title),
                meta: department.status,
                body: `
                  <div class="list-body">
                    <div class="editor-grid">
                      ${localizedFields("部门名称", `organization.departments[${index}].title`, department.title)}
                      ${localizedFields("负责人", `organization.departments[${index}].lead`, department.lead)}
                      ${localizedFields("负责范围", `organization.departments[${index}].scope`, department.scope, true)}
                      ${inputField("状态标签", `organization.departments[${index}].status`, department.status)}
                    </div>
                    <div class="row-actions">
                      <button class="button button-danger" type="button" data-action="remove" data-array-path="organization.departments" data-index="${index}">删除部门</button>
                    </div>
                  </div>
                `
              })
            )
            .join("")}
        </div>
        <div class="row-actions">
          <button class="button button-secondary" type="button" data-action="add" data-array-path="organization.departments">新增部门节点</button>
        </div>
      </section>

      <section class="editor-section">
        <h3>近期活动</h3>
        <div class="editor-grid">
          ${localizedFields("模块标题", "activities.heading", state.content.activities.heading)}
          ${localizedFields("模块说明", "activities.intro", state.content.activities.intro, true)}
        </div>
        <div class="stack-list">
          ${state.content.activities.items
            .map((item, index) =>
              listItem({
                title: pickLocal(item.title),
                meta: `${item.status} / ${item.published ? "已公开" : "未公开"}`,
                body: `
                  <div class="checkbox-row">
                    <input id="activity-published-${index}" type="checkbox" data-path="activities.items[${index}].published" ${item.published ? "checked" : ""} />
                    <label for="activity-published-${index}">前台公开显示</label>
                  </div>
                  <div class="list-body">
                    <div class="editor-grid">
                      ${localizedFields("活动名称", `activities.items[${index}].title`, item.title)}
                      ${inputField("日期时间", `activities.items[${index}].date`, item.date)}
                      ${localizedFields("地点", `activities.items[${index}].location`, item.location)}
                      ${inputField("状态标签", `activities.items[${index}].status`, item.status)}
                      ${localizedFields("活动简介", `activities.items[${index}].summary`, item.summary, true)}
                    </div>
                    <div class="row-actions">
                      <button class="button button-danger" type="button" data-action="remove" data-array-path="activities.items" data-index="${index}">删除活动</button>
                    </div>
                  </div>
                `
              })
            )
            .join("")}
        </div>
        <div class="row-actions">
          <button class="button button-secondary" type="button" data-action="add" data-array-path="activities.items">新增活动</button>
        </div>
      </section>

      <section class="editor-section">
        <h3>财务公开</h3>
        <div class="editor-grid">
          ${localizedFields("模块标题", "finance.heading", state.content.finance.heading)}
          ${localizedFields("模块说明", "finance.intro", state.content.finance.intro, true)}
          ${localizedFields("公开摘要", "finance.summary", state.content.finance.summary, true)}
          ${localizedFields("人工修正说明", "finance.manualNote", state.content.finance.manualNote, true)}
          ${localizedFields("隐藏原因说明", "finance.hiddenFlowReason", state.content.finance.hiddenFlowReason, true)}
          ${inputField("最后更新时间", "finance.lastUpdated", state.content.finance.lastUpdated)}
          ${numberField("年度预算", "finance.totals.budget", state.content.finance.totals.budget)}
          ${numberField("当前可用", "finance.totals.available", state.content.finance.totals.available)}
          ${numberField("缓冲预留", "finance.totals.reserve", state.content.finance.totals.reserve)}
        </div>
        <div class="checkbox-row">
          <input id="finance-published" type="checkbox" data-path="finance.published" ${state.content.finance.published ? "checked" : ""} />
          <label for="finance-published">前台显示详细财务数据</label>
        </div>
        <div class="stack-list">
          ${state.content.finance.categories
            .map((item, index) =>
              listItem({
                title: pickLocal(item.label),
                meta: String(item.amount),
                body: `
                  <div class="list-body">
                    <div class="editor-grid">
                      ${localizedFields("分类名称", `finance.categories[${index}].label`, item.label)}
                      ${numberField("金额", `finance.categories[${index}].amount`, item.amount)}
                      ${localizedFields("备注", `finance.categories[${index}].note`, item.note, true)}
                    </div>
                    <div class="row-actions">
                      <button class="button button-danger" type="button" data-action="remove" data-array-path="finance.categories" data-index="${index}">删除分类</button>
                    </div>
                  </div>
                `
              })
            )
            .join("")}
        </div>
        <div class="row-actions">
          <button class="button button-secondary" type="button" data-action="add" data-array-path="finance.categories">新增财务分类</button>
        </div>
      </section>

      <section class="editor-section">
        <h3>提案追踪</h3>
        <div class="editor-grid">
          ${localizedFields("模块标题", "initiatives.heading", state.content.initiatives.heading)}
          ${localizedFields("模块说明", "initiatives.intro", state.content.initiatives.intro, true)}
        </div>
        <div class="stack-list">
          ${state.content.initiatives.items
            .map((item, index) =>
              listItem({
                title: pickLocal(item.title),
                meta: item.stage,
                body: `
                  <div class="list-body">
                    <div class="editor-grid">
                      ${localizedFields("提案名称", `initiatives.items[${index}].title`, item.title)}
                      ${inputField("阶段标签", `initiatives.items[${index}].stage`, item.stage)}
                      ${localizedFields("责任人", `initiatives.items[${index}].owner`, item.owner)}
                      ${localizedFields("提案说明", `initiatives.items[${index}].summary`, item.summary, true)}
                    </div>
                    <div class="row-actions">
                      <button class="button button-danger" type="button" data-action="remove" data-array-path="initiatives.items" data-index="${index}">删除提案</button>
                    </div>
                  </div>
                `
              })
            )
            .join("")}
        </div>
        <div class="row-actions">
          <button class="button button-secondary" type="button" data-action="add" data-array-path="initiatives.items">新增提案</button>
        </div>
      </section>

      <section class="editor-section">
        <h3>公开纪要</h3>
        <div class="editor-grid">
          ${localizedFields("模块标题", "publications.heading", state.content.publications.heading)}
          ${localizedFields("模块说明", "publications.intro", state.content.publications.intro, true)}
        </div>
        <div class="stack-list">
          ${state.content.publications.items
            .map((item, index) =>
              listItem({
                title: pickLocal(item.title),
                meta: item.tag,
                body: `
                  <div class="list-body">
                    <div class="editor-grid">
                      ${localizedFields("纪要标题", `publications.items[${index}].title`, item.title)}
                      ${inputField("日期时间", `publications.items[${index}].date`, item.date)}
                      ${inputField("标签", `publications.items[${index}].tag`, item.tag)}
                      ${localizedFields("摘要", `publications.items[${index}].summary`, item.summary, true)}
                    </div>
                    <div class="row-actions">
                      <button class="button button-danger" type="button" data-action="remove" data-array-path="publications.items" data-index="${index}">删除纪要</button>
                    </div>
                  </div>
                `
              })
            )
            .join("")}
        </div>
        <div class="row-actions">
          <button class="button button-secondary" type="button" data-action="add" data-array-path="publications.items">新增纪要</button>
        </div>
      </section>

      <section class="editor-section">
        <h3>底部与社媒</h3>
        <div class="editor-grid">
          ${inputField("会长邮箱", "footer.presidentEmail", state.content.footer.presidentEmail)}
          ${localizedFields("底部声明", "footer.statement", state.content.footer.statement, true)}
        </div>
        <div class="stack-list">
          ${state.content.footer.socialLinks
            .map((item, index) =>
              listItem({
                title: pickLocal(item.label),
                meta: item.icon,
                body: `
                  <div class="list-body">
                    <div class="editor-grid">
                      ${localizedFields("平台名称", `footer.socialLinks[${index}].label`, item.label)}
                      ${selectField("图标", `footer.socialLinks[${index}].icon`, item.icon, socialIconOptions)}
                      ${inputField("链接 URL", `footer.socialLinks[${index}].url`, item.url)}
                      <div class="field">
                        <span>图标预览</span>
                        <div class="icon-chip">${escapeHtml(item.icon)} / ${escapeHtml(resolveIconPreview(item.icon))}</div>
                      </div>
                    </div>
                    <div class="row-actions">
                      <button class="button button-danger" type="button" data-action="remove" data-array-path="footer.socialLinks" data-index="${index}">删除社媒</button>
                    </div>
                  </div>
                `
              })
            )
            .join("")}
        </div>
        <div class="row-actions">
          <button class="button button-secondary" type="button" data-action="add" data-array-path="footer.socialLinks">新增社媒链接</button>
        </div>
        <div class="checkbox-row">
          <input id="setting-ai-ready" type="checkbox" data-path="settings.aiReady" ${state.content.settings.aiReady ? "checked" : ""} />
          <label for="setting-ai-ready">显示“AI / API 预留接口”状态</label>
        </div>
      </section>
    </div>
  `;
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const form = new FormData(event.target);
  const password = String(form.get("password") || "");
  setStatus("正在登录...", "warn");

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "登录失败");
    }

    state.authenticated = true;
    await loadEditor();
  } catch (error) {
    console.error(error);
    setStatus(error.message || "登录失败", "error");
  }
}

function handleFieldInput(event) {
  const target = event.target;
  const path = target.dataset.path;
  if (!path || !state.content) {
    return;
  }

  const value = target.type === "checkbox" ? target.checked : target.type === "number" ? Number(target.value || 0) : target.value;
  setByPath(state.content, path, value);
}

async function handleEditorClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button || !state.content) {
    return;
  }

  const { action } = button.dataset;

  if (action === "add") {
    const path = button.dataset.arrayPath;
    const array = getByPath(state.content, path);
    array.push(factories[path]());
    renderEditor();
    return;
  }

  if (action === "remove") {
    const path = button.dataset.arrayPath;
    const index = Number(button.dataset.index);
    const array = getByPath(state.content, path);
    array.splice(index, 1);
    renderEditor();
    return;
  }

  if (action === "save") {
    await saveContent();
    return;
  }

  if (action === "logout") {
    await logout();
  }
}

async function saveContent() {
  setStatus("正在保存并发布...", "warn");

  try {
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: state.content })
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "保存失败");
    }

    state.content = payload.content;
    state.meta = payload.meta;
    renderEditor();
    setStatus("内容已发布到前台。", "ok");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "保存失败", "error");
  }
}

async function logout() {
  try {
    await fetch("/api/admin/session", {
      method: "DELETE"
    });
  } finally {
    state.authenticated = false;
    state.content = null;
    state.meta = null;
    renderLogin();
    setStatus("已退出登录。", "warn");
  }
}

function listItem({ title, meta, body }) {
  return `
    <details class="list-item">
      <summary>
        <span class="summary-title">${escapeHtml(title || "未命名")}</span>
        <span class="summary-meta">${escapeHtml(meta || "")}</span>
      </summary>
      ${body}
    </details>
  `;
}

function localizedFields(label, path, value, multiline = false) {
  const safeValue = value || { zh: "", en: "" };
  return `
    ${multiline ? textareaField(`${label}（中文）`, `${path}.zh`, safeValue.zh) : inputField(`${label}（中文）`, `${path}.zh`, safeValue.zh)}
    ${multiline ? textareaField(`${label}（English）`, `${path}.en`, safeValue.en) : inputField(`${label}（English）`, `${path}.en`, safeValue.en)}
  `;
}

function inputField(label, path, value) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <input type="text" data-path="${escapeHtml(path)}" value="${escapeHtml(value || "")}" />
    </label>
  `;
}

function textareaField(label, path, value) {
  return `
    <label class="field field--compact">
      <span>${escapeHtml(label)}</span>
      <textarea data-path="${escapeHtml(path)}">${escapeHtml(value || "")}</textarea>
    </label>
  `;
}

function numberField(label, path, value) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <input type="number" data-path="${escapeHtml(path)}" value="${escapeHtml(String(value || 0))}" />
    </label>
  `;
}

function selectField(label, path, value, options) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <select data-path="${escapeHtml(path)}">
        ${options
          .map(
            ([optionValue, optionLabel]) => `
              <option value="${escapeHtml(optionValue)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(optionLabel)}</option>
            `
          )
          .join("")}
      </select>
    </label>
  `;
}

function resolveIconPreview(icon) {
  const map = {
    globe: "GL",
    wechat: "WX",
    instagram: "IG",
    xiaohongshu: "RED",
    bilibili: "B",
    github: "GH",
    email: "@"
  };
  return map[icon] || "•";
}

function pickLocal(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return value.zh || value.en || "";
}

function setStatus(message, tone = "warn") {
  dom.status.dataset.tone = tone;
  dom.status.textContent = message;
}

function getByPath(object, path) {
  return parsePath(path).reduce((current, segment) => current[segment], object);
}

function setByPath(object, path, value) {
  const segments = parsePath(path);
  const last = segments.pop();
  const target = segments.reduce((current, segment) => current[segment], object);
  target[last] = value;
}

function parsePath(path) {
  const result = [];
  const matcher = /([^[.\]]+)|\[(\d+)\]/g;
  let match;

  while ((match = matcher.exec(path))) {
    if (match[1]) {
      result.push(match[1]);
    } else if (match[2]) {
      result.push(Number(match[2]));
    }
  }

  return result;
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

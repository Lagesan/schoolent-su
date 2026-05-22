const state = {
  content: null,
  meta: null,
  authenticated: false,
  view: "editor",
  dirty: false
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
    label: { zh: "", en: "" },
    message: { zh: "", en: "" }
  }),
  "organization.departments": () => ({
    title: { zh: "", en: "" },
    scope: { zh: "", en: "" },
    status: "ACTIVE"
  }),
  "organization.people": () => ({
    name: { zh: "", en: "" },
    roles: [],
    status: "ACTIVE",
    note: { zh: "", en: "" }
  }),
  "person.roles": () => ({
    title: { zh: "", en: "" },
    scope: { zh: "", en: "" },
    status: "ACTIVE"
  }),
  "organization.presidentRotation.members": () => ({
    person: { zh: "", en: "" },
    baseRole: { zh: "", en: "" },
    order: 1,
    status: "UPCOMING",
    note: { zh: "", en: "" }
  }),
  "activities.items": () => ({
    title: { zh: "", en: "" },
    date: new Date().toISOString(),
    location: { zh: "", en: "" },
    status: "PLANNED",
    summary: { zh: "", en: "" },
    published: true
  }),
  "updates.items": () => ({
    title: { zh: "", en: "" },
    date: new Date().toISOString(),
    tag: "UPDATE",
    summary: { zh: "", en: "" },
    body: { zh: "", en: "" },
    attachments: [],
    published: true
  }),
  "finance.categories": () => ({
    label: { zh: "", en: "" },
    amount: 0,
    note: { zh: "", en: "" }
  }),
  "initiatives.items": () => ({
    title: { zh: "", en: "" },
    stage: "QUEUE",
    owner: { zh: "", en: "" },
    summary: { zh: "", en: "" }
  }),
  "publications.items": () => ({
    title: { zh: "", en: "" },
    date: new Date().toISOString(),
    tag: "UPDATE",
    summary: { zh: "", en: "" }
  }),
  "footer.socialLinks": () => ({
    label: { zh: "", en: "" },
    icon: "globe",
    url: ""
  })
};

dom.loginPanel.addEventListener("submit", handleLoginSubmit);
dom.editorPanel.addEventListener("input", handleFieldInput);
dom.editorPanel.addEventListener("change", handleFieldInput);
dom.editorPanel.addEventListener("click", handleEditorClick);
dom.editorPanel.addEventListener("mousedown", handleEditorMouseDown);
window.addEventListener("beforeunload", handleBeforeUnload);

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
    state.dirty = false;
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
  const presidentRotation = state.content.organization.presidentRotation || {
    heading: { zh: "", en: "" },
    currentPeriod: { zh: "", en: "" },
    currentPresident: { zh: "", en: "" },
    note: { zh: "", en: "" },
    members: []
  };
  const monthlyPresident = state.content.organization.monthlyPresident || {
    person: { zh: "", en: "" },
    period: { zh: "", en: "" },
    note: { zh: "", en: "" }
  };
  const rotationMembers = presidentRotation.members || [];
  const concurrentRoles = [];
  const people = state.content.organization.people || [];
  const departments = state.content.organization.departments;

  dom.editorPanel.innerHTML = `
    <div class="editor-layout">
      <div class="editor-toolbar">
        <button class="button ${state.view === "editor" ? "button-primary" : "button-secondary"}" type="button" data-action="switch-view" data-view="editor">编辑内容</button>
        <button class="button ${state.view === "docs" ? "button-primary" : "button-secondary"}" type="button" data-action="switch-view" data-view="docs">操作文档</button>
        <button class="button button-primary" type="button" data-action="save">保存并发布</button>
        <button class="button button-secondary" type="button" data-action="export">导出离线包</button>
        <a class="button button-secondary" href="/" target="_blank" rel="noreferrer">打开前台</a>
        <button class="button button-plain" type="button" data-action="logout">退出登录</button>
      </div>
      <p class="admin-meta">最近发布时间：${escapeHtml(formatDate(state.meta?.updatedAt))} · <span data-dirty-state>${state.dirty ? "有未保存更改" : "当前无未保存更改"}</span></p>

      ${state.view === "docs" ? renderAdminDocs() : `
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
        </div>

        <div class="editor-card">
          <h4>核心节点</h4>
          <div class="editor-grid">
            ${localizedFields("核心节点名称", "organization.leadership.title", leadership.title)}
            ${localizedFields("负责范围", "organization.leadership.scope", leadership.scope, true)}
            ${inputField("状态标签", "organization.leadership.status", leadership.status)}
          </div>
        </div>

        <div class="editor-card">
          <h4>当月轮值主席</h4>
          <p class="help-copy">这里展示当前月份实际由谁轮值担任会长；后续月份变化时，只改这一块即可。</p>
          <div class="editor-grid">
            ${localizedFields("轮值主席姓名", "organization.monthlyPresident.person", monthlyPresident.person)}
            ${localizedFields("轮值周期", "organization.monthlyPresident.period", monthlyPresident.period)}
            ${localizedFields("补充说明", "organization.monthlyPresident.note", monthlyPresident.note, true)}
          </div>
        </div>

        <div class="editor-card">
          <h4>人员与职位</h4>
          <p class="help-copy">以人为本：先添加人员，再给这个人分配一个或多个职位。固定岗位定义仍在下方维护。</p>
          <div class="stack-list">
            ${people
              .map((person, personIndex) =>
                listItem({
                  title: pickLocal(person.name),
                  meta: `${person.status} / ${person.roles?.length || 0} role(s)`,
                  body: `
                    <div class="list-body">
                      <div class="editor-grid">
                        ${localizedFields("人员姓名", `organization.people[${personIndex}].name`, person.name)}
                        ${inputField("人员状态", `organization.people[${personIndex}].status`, person.status)}
                        ${localizedFields("人员说明", `organization.people[${personIndex}].note`, person.note, true)}
                      </div>
                      <div class="stack-list">
                        ${(person.roles || [])
                          .map((role, roleIndex) => `
                            <div class="editor-card">
                              <div class="editor-grid">
                                ${localizedFields("职位名称", `organization.people[${personIndex}].roles[${roleIndex}].title`, role.title)}
                                ${localizedFields("职位范围", `organization.people[${personIndex}].roles[${roleIndex}].scope`, role.scope, true)}
                                ${inputField("职位状态", `organization.people[${personIndex}].roles[${roleIndex}].status`, role.status)}
                              </div>
                              <div class="row-actions">
                                <button class="button button-danger" type="button" data-action="remove-person-role" data-person-index="${personIndex}" data-role-index="${roleIndex}">删除这个职位</button>
                              </div>
                            </div>
                          `)
                          .join("")}
                      </div>
                      <div class="row-actions">
                        <button class="button button-secondary" type="button" data-action="add-person-role" data-person-index="${personIndex}">给此人新增职位</button>
                        <button class="button button-danger" type="button" data-action="remove" data-array-path="organization.people" data-index="${personIndex}">删除此人</button>
                      </div>
                    </div>
                  `
                })
              )
              .join("")}
          </div>
          <div class="row-actions">
            <button class="button button-secondary" type="button" data-action="add" data-array-path="organization.people">新增人员</button>
          </div>
        </div>

        <div class="editor-card">
          <h4>会长轮换顺序</h4>
          <p class="help-copy">固定岗位继续在部门节点里维护；这里专门展示“会长由谁按顺序轮换”。你可以标记当前轮值人，也可以提前排好顺序。</p>
          <div class="editor-grid">
            ${localizedFields("轮换区标题", "organization.presidentRotation.heading", presidentRotation.heading)}
            ${localizedFields("当前轮值周期", "organization.presidentRotation.currentPeriod", presidentRotation.currentPeriod)}
            ${localizedFields("当前轮值会长", "organization.presidentRotation.currentPresident", presidentRotation.currentPresident)}
            ${localizedFields("轮换说明", "organization.presidentRotation.note", presidentRotation.note, true)}
          </div>
          <div class="stack-list">
            ${rotationMembers
              .map((item, index) =>
                listItem({
                  title: `${pickLocal(item.person) || "未命名"} / #${Number(item.order || 0)}`,
                  meta: `${item.status} / ${pickLocal(item.baseRole) || "未填写固定岗位"}`,
                  body: `
                    <div class="list-body">
                      <div class="editor-grid">
                        ${localizedFields("人员姓名", `organization.presidentRotation.members[${index}].person`, item.person)}
                        ${localizedFields("固定岗位", `organization.presidentRotation.members[${index}].baseRole`, item.baseRole)}
                        ${numberField("轮换顺位", `organization.presidentRotation.members[${index}].order`, item.order)}
                        ${inputField("状态标签", `organization.presidentRotation.members[${index}].status`, item.status)}
                        ${localizedFields("补充说明", `organization.presidentRotation.members[${index}].note`, item.note, true)}
                      </div>
                      <div class="row-actions">
                        <button class="button button-danger" type="button" data-action="remove" data-array-path="organization.presidentRotation.members" data-index="${index}">删除轮换成员</button>
                      </div>
                    </div>
                  `
                })
              )
              .join("")}
          </div>
          <div class="row-actions">
            <button class="button button-secondary" type="button" data-action="add" data-array-path="organization.presidentRotation.members">新增轮换成员</button>
          </div>
        </div>

        <div class="editor-card">
          <h4>兼任与临时安排</h4>
          <p class="help-copy">这是旧规则的兼容区。若仍有“某人短期兼任某部长”之类安排，继续放这里；如果主要是会长轮换，请优先维护上面的轮换顺序。</p>
          <div class="stack-list">
            ${concurrentRoles
              .map((item, index) =>
                listItem({
                  title: `${pickLocal(item.person) || "未命名"} / ${pickLocal(item.concurrentRole) || "未填写兼任职务"}`,
                  meta: `${pickLocal(item.period) || "未填写周期"} / ${item.status}`,
                  body: `
                    <div class="list-body">
                      <div class="editor-grid">
                        ${localizedFields("人员姓名", `organization.concurrentRoles[${index}].person`, item.person)}
                        ${localizedFields("原本职务", `organization.concurrentRoles[${index}].primaryRole`, item.primaryRole)}
                        ${localizedFields("兼任职务", `organization.concurrentRoles[${index}].concurrentRole`, item.concurrentRole)}
                        ${localizedFields("适用周期", `organization.concurrentRoles[${index}].period`, item.period)}
                        ${inputField("状态标签", `organization.concurrentRoles[${index}].status`, item.status)}
                        ${localizedFields("补充说明", `organization.concurrentRoles[${index}].note`, item.note, true)}
                      </div>
                      <div class="row-actions">
                        <button class="button button-danger" type="button" data-action="remove" data-array-path="organization.concurrentRoles" data-index="${index}">删除这条安排</button>
                      </div>
                    </div>
                  `
                })
              )
              .join("")}
          </div>
          <div class="row-actions">
            <button class="button button-secondary" type="button" data-action="add" data-array-path="organization.concurrentRoles">新增兼任安排</button>
          </div>
        </div>

        <div class="editor-card">
          <h4>关系图预览</h4>
          <div class="preview-grid">
            <div class="preview-node">
              <strong>${escapeHtml(pickLocal(leadership.title))}</strong>
              <span>${escapeHtml(pickLocal(leadership.scope))}</span>
            </div>
            ${departments
              .map(
                (department) => `
                  <div class="preview-node">
                    <strong>${escapeHtml(pickLocal(department.title))}</strong>
                    <span>${escapeHtml(pickLocal(department.scope))}</span>
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
        <h3>公告 / Updates 富文本发布</h3>
        <p class="help-copy">公告和 Updates 现在使用同一个发布列表；需要置顶通知感的内容，把标签写成 NOTICE。正文会进入 R2，附件也会上传到 R2。</p>
        <div class="editor-grid">
          ${localizedFields("模块标题", "updates.heading", state.content.updates.heading)}
        </div>
        <div class="stack-list">
          ${state.content.updates.items
            .map((item, index) =>
              listItem({
                title: pickLocal(item.title),
                meta: `${item.tag} / ${item.published ? "已公开" : "未公开"}`,
                body: `
                  <div class="checkbox-row">
                    <input id="update-published-${index}" type="checkbox" data-path="updates.items[${index}].published" ${item.published ? "checked" : ""} />
                    <label for="update-published-${index}">前台公开显示</label>
                  </div>
                  <div class="list-body">
                    <div class="editor-grid">
                      ${localizedFields("标题", `updates.items[${index}].title`, item.title)}
                      ${inputField("日期时间", `updates.items[${index}].date`, item.date)}
                      ${inputField("标签（公告可填 NOTICE）", `updates.items[${index}].tag`, item.tag)}
                      ${localizedFields("摘要", `updates.items[${index}].summary`, item.summary, true)}
                    </div>
                    ${richTextFields("正文", `updates.items[${index}].body`, item.body)}
                    ${attachmentEditor(index, item.attachments || [])}
                    <div class="row-actions">
                      <button class="button button-danger" type="button" data-action="remove" data-array-path="updates.items" data-index="${index}">删除 Update</button>
                    </div>
                  </div>
                `
              })
            )
            .join("")}
        </div>
        <div class="row-actions">
          <button class="button button-secondary" type="button" data-action="add" data-array-path="updates.items">新增公告 / Update</button>
        </div>
      </section>

      <section class="editor-section">
        <h3>财务公开</h3>
        <div class="editor-grid">
          ${localizedFields("模块标题", "finance.heading", state.content.finance.heading)}
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
      `}
    </div>
  `;

  dom.editorPanel
    .querySelectorAll('[data-array-path="notices"]')
    .forEach((node) => node.closest(".editor-section")?.remove());

  dom.editorPanel
    .querySelectorAll('[data-array-path="organization.concurrentRoles"]')
    .forEach((node) => node.closest(".editor-card")?.remove());
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
  if (target.matches("[data-upload-input]") && target.files?.length) {
    uploadAttachment(Number(target.dataset.uploadInput), target.files[0]);
    target.value = "";
    return;
  }

  const richPath = target.dataset.richPath;
  if (richPath && state.content) {
    setByPath(state.content, richPath, target.innerHTML);
    markDirty();
    return;
  }

  const path = target.dataset.path;
  if (!path || !state.content) {
    return;
  }

  const value = target.type === "checkbox" ? target.checked : target.type === "number" ? Number(target.value || 0) : target.value;
  setByPath(state.content, path, value);
  markDirty();
}

async function handleEditorClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button || !state.content) {
    return;
  }

  const { action } = button.dataset;

  if (action === "switch-view") {
    state.view = button.dataset.view || "editor";
    renderEditor();
    return;
  }

  if (action === "add") {
    const path = button.dataset.arrayPath;
    const array = getByPath(state.content, path);
    array.push(factories[path]());
    markDirty();
    renderEditor();
    return;
  }

  if (action === "remove") {
    if (!confirmDestructive("确定删除这一项吗？删除后需要保存并发布才会影响前台。")) {
      return;
    }
    const path = button.dataset.arrayPath;
    const index = Number(button.dataset.index);
    const array = getByPath(state.content, path);
    array.splice(index, 1);
    markDirty();
    renderEditor();
    return;
  }

  if (action === "add-person-role") {
    const personIndex = Number(button.dataset.personIndex);
    state.content.organization.people[personIndex].roles ||= [];
    state.content.organization.people[personIndex].roles.push(factories["person.roles"]());
    markDirty();
    renderEditor();
    return;
  }

  if (action === "remove-person-role") {
    if (!confirmDestructive("确定删除这个职位吗？删除后需要保存并发布才会影响前台。")) {
      return;
    }
    const personIndex = Number(button.dataset.personIndex);
    const roleIndex = Number(button.dataset.roleIndex);
    state.content.organization.people[personIndex].roles.splice(roleIndex, 1);
    markDirty();
    renderEditor();
    return;
  }

  if (action === "remove-attachment") {
    if (!confirmDestructive("确定移除这个附件吗？保存并发布后前台将不再显示它。")) {
      return;
    }
    const updateIndex = Number(button.dataset.updateIndex);
    const attachmentIndex = Number(button.dataset.attachmentIndex);
    state.content.updates.items[updateIndex].attachments.splice(attachmentIndex, 1);
    markDirty();
    renderEditor();
    return;
  }

  if (action === "upload-attachment") {
    const updateIndex = Number(button.dataset.updateIndex);
    const input = dom.editorPanel.querySelector(`[data-upload-input="${updateIndex}"]`);
    input?.click();
    return;
  }

  if (action === "rich-command") {
    applyRichCommand(button);
    return;
  }

  if (action === "export") {
    window.location.href = "/api/admin/export";
    return;
  }

  if (action === "save") {
    await saveContent();
    return;
  }

  if (action === "logout") {
    if (state.dirty && !confirmDestructive("当前有未保存更改，确定退出登录吗？")) {
      return;
    }
    await logout();
  }
}

function handleEditorMouseDown(event) {
  if (event.target.closest('[data-action="rich-command"]')) {
    event.preventDefault();
  }
}

function handleBeforeUnload(event) {
  if (!state.dirty) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
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
    state.dirty = false;
    renderEditor();
    setStatus("内容已发布到前台。", "ok");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "保存失败", "error");
  }
}

function applyRichCommand(button) {
  const command = button.dataset.command;
  const value = button.dataset.value || null;
  if (command === "createLink") {
    const url = window.prompt("输入链接 URL");
    if (!url) {
      return;
    }
    document.execCommand(command, false, url);
    return;
  }

  document.execCommand(command, false, value);
}

async function uploadAttachment(updateIndex, file) {
  if (!file) {
    return;
  }

  setStatus("正在上传附件到 R2...", "warn");
  const form = new FormData();
  form.append("file", file);

  try {
    const response = await fetch("/api/admin/assets", {
      method: "POST",
      body: form
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "附件上传失败");
    }

    state.content.updates.items[updateIndex].attachments.push(payload.asset);
    markDirty();
    renderEditor();
    setStatus("附件已上传并加入当前 Update。", "ok");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "附件上传失败", "error");
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
    state.dirty = false;
    renderLogin();
    setStatus("已退出登录。", "warn");
  }
}

function renderAdminDocs() {
  return `
    <section class="editor-section admin-docs">
      <div class="doc-hero">
        <p class="section-label">ADMIN DOC</p>
        <h3>后台操作文档</h3>
        <p>这份文档给第一次接手后台的人使用。原则很简单：先改内容，再保存并发布，最后打开前台确认效果。</p>
      </div>

      <div class="doc-grid">
        <article class="doc-card">
          <h4>最快发布流程</h4>
          <ol>
            <li>点“编辑内容”，找到要修改的模块。</li>
            <li>展开对应条目，中文和英文都尽量填完整。</li>
            <li>勾选“前台公开显示”后，点击“保存并发布”。</li>
            <li>点“打开前台”检查首页、Updates 或详情页显示是否正确。</li>
          </ol>
        </article>

        <article class="doc-card">
          <h4>双语字段怎么填</h4>
          <p>后台里的“中文”和“English”会跟随前台语言切换展示。只填中文也能显示，但英文模式可能出现空内容，所以正式发布前建议两边都补齐。</p>
        </article>

        <article class="doc-card">
          <h4>公告 / Updates</h4>
          <p>适合发布通知、活动复盘、正式说明和附件。标题、日期、标签、摘要会出现在列表页，正文会进入详情页。标签可以写 NOTICE、UPDATE、ACTIVITY 等短词。</p>
          <p>附件上传后会先加入当前 Update，仍然需要点击“保存并发布”才会出现在前台。</p>
        </article>

        <article class="doc-card">
          <h4>近期活动</h4>
          <p>用于首页的活动卡片。日期时间建议写成 ISO 格式，例如 2026-05-22T19:30:00+08:00；状态可以用 PLANNED、FINISHED、LIVE 等短标签。</p>
        </article>

        <article class="doc-card">
          <h4>组织关系图</h4>
          <p>“人员与职位”用于维护人和岗位；“当月轮值主席”用于当前展示；“会长轮换顺序”用于说明轮换规则。一般只需要改这三块。</p>
        </article>

        <article class="doc-card">
          <h4>财务公开</h4>
          <p>关闭“前台显示详细财务数据”时，前台只显示说明，不展示明细。金额字段只填数字，不要带货币符号。</p>
        </article>

        <article class="doc-card">
          <h4>提案与纪要</h4>
          <p>提案追踪适合展示正在推进或排队的事项；公开纪要适合发布已经整理好的会议记录、说明或简短结论。</p>
        </article>

        <article class="doc-card">
          <h4>页尾与社媒</h4>
          <p>会长邮箱、底部声明和社媒链接会同步到首页、Updates、详情页和提案页。链接 URL 必须包含 https:// 或 mailto:。</p>
        </article>

        <article class="doc-card">
          <h4>安全操作习惯</h4>
          <ul>
            <li>删除条目前先确认是否只是想隐藏，能取消公开就别急着删。</li>
            <li>长正文先在本地备份一份，再粘贴进富文本编辑器。</li>
            <li>看到“有未保存更改”时，不要直接关闭页面。</li>
            <li>保存后一定打开前台检查移动端宽度下是否好读。</li>
          </ul>
        </article>

        <article class="doc-card">
          <h4>导出离线包</h4>
          <p>“导出离线包”会下载当前内容的静态备份，适合在大改之前留档，或给不能登录后台的人审阅。</p>
        </article>
      </div>
    </section>
  `;
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

function richTextFields(label, path, value) {
  const safeValue = value || { zh: "", en: "" };
  return `
    <div class="rich-grid">
      ${richTextField(`${label}（中文）`, `${path}.zh`, safeValue.zh)}
      ${richTextField(`${label}（English）`, `${path}.en`, safeValue.en)}
    </div>
  `;
}

function richTextField(label, path, value) {
  return `
    <section class="rich-field">
      <div class="rich-head">
        <span>${escapeHtml(label)}</span>
        <div class="rich-toolbar">
          <button type="button" data-action="rich-command" data-command="formatBlock" data-value="h3">H</button>
          <button type="button" data-action="rich-command" data-command="bold">B</button>
          <button type="button" data-action="rich-command" data-command="italic">I</button>
          <button type="button" data-action="rich-command" data-command="insertUnorderedList">UL</button>
          <button type="button" data-action="rich-command" data-command="createLink">Link</button>
        </div>
      </div>
      <div class="rich-editor" contenteditable="true" data-rich-path="${escapeHtml(path)}">${value || ""}</div>
    </section>
  `;
}

function attachmentEditor(updateIndex, attachments) {
  return `
    <section class="attachment-editor">
      <div class="list-header">
        <strong>附件 / R2 对象</strong>
        <button class="button button-secondary" type="button" data-action="upload-attachment" data-update-index="${updateIndex}">上传附件</button>
        <input type="file" data-upload-input="${updateIndex}" hidden />
      </div>
      <div class="stack-list">
        ${attachments.length
          ? attachments
            .map(
              (item, attachmentIndex) => `
                <div class="attachment-row">
                  <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(pickLocal(item.label) || item.name || item.key || "附件")}</a>
                  <span>${escapeHtml(item.type || "")} ${item.size ? ` / ${formatBytes(item.size)}` : ""}</span>
                  <button class="button button-danger" type="button" data-action="remove-attachment" data-update-index="${updateIndex}" data-attachment-index="${attachmentIndex}">移除</button>
                </div>
              `
            )
            .join("")
          : `<p class="help-copy">暂无附件。</p>`}
      </div>
    </section>
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

function markDirty() {
  state.dirty = true;
  dom.editorPanel.querySelector("[data-dirty-state]")?.replaceChildren("有未保存更改");
}

function confirmDestructive(message) {
  return window.confirm(message);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

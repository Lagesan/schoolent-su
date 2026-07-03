# Student Council Transparency Portal

面向学生会竞选与后续实际运营的双语透明门户，适配 Cloudflare Pages + Functions + D1 免费方案。

## 你现在拿到的东西

- 黑底白字、偏 `doge.gov` 的极简公开门户
- 中文 / English 切换
- 学生会架构、近期活动、财务公开、提案追踪、公开纪要五大模块
- 后台登录页 `/admin/`，可修改并发布上述内容
- 财务模块支持手动修正，也支持整体切换成“暂未公开”
- 后端是 Cloudflare Functions，后续要加 AI API 时可以直接在 `/api/*` 扩展

## 技术方案

- 前台：纯静态 HTML + CSS + 原生 JS
- 后台：原生 JS 管理台
- API：Cloudflare Pages Functions
- 存储：Cloudflare D1
- 部署：Cloudflare Pages 免费方案

这样做的好处是：

- 免费
- 足够轻量
- 国内通常比很多海外全栈平台更容易访问
- 后续加 Cloudflare AI Gateway、Workers AI、第三方模型 API 都方便

## Cloudflare 部署步骤

1. 新建一个 Cloudflare Pages 项目，直接连接这个仓库。
2. Build command 留空，Output directory 设为项目根目录 `.`。
3. 在 Pages 项目的 Settings -> Functions 里绑定 D1 数据库，绑定名必须是 `DB`。
4. 在 Settings -> Environment variables / Secrets 中添加：
   - `ADMIN_PASSWORD`：后台登录密码
   - `SESSION_SECRET`：一段足够长的随机字符串
5. 绑定你的自定义域名。

## 初始化数据库

Pages Functions 会在第一次访问时自动执行最小建表和默认内容初始化。

如果你想手动建表，也可以使用：

```bash
npx wrangler d1 execute <your-db-name> --file=schema.sql
```

## 本地调试

先安装依赖：

```bash
npm install
```

本地运行：

```bash
npx wrangler pages dev . --d1 DB=<your-db-name>
```

如果只是检查前端 JS 语法：

```bash
npm run check:js
```

## Android APK update

The public homepage uses a small App update entry, and `/download/` contains the standalone update/download page for Android packages. Inside the Android app, this should be treated as an update path, not a first-time download prompt. The primary button calls:

```text
/api/download/android
```

Do not place the current APK in the Pages static directory: `schoolent-su-mobile/app/build/outputs/apk/release/app-release.apk` is about 46.7 MB, while Cloudflare Pages has a 25 MB per-file asset limit. Use one of these deployment options instead:

- Upload the APK and `schoolent-update.json` to both GitHub Releases and Gitee Releases.
- `/api/app-update` exposes a lightweight fallback manifest for the app updater.
- `/api/download/android` now redirects to the first reachable GitHub/Gitee Release asset by default.
- R2 is no longer the default APK source. Only set `ANDROID_APK_R2_KEY` if you intentionally need a temporary fallback.

## 后续可扩展

- 增加“反馈箱 / 提案提交”表单
- 增加会议纪要上传
- 接入 AI 总结活动、生成周报、答疑机器人
- 把活动发布流改成审核制
- 接短信 / 邮件通知

## 说明

仓库里当前的内容是一个可直接演示的样板数据，你可以在 `/admin/` 里继续改成自己的竞选方案文案。

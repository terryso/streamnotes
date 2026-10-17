# 流媒笔记（StreamNotes）运营手册

- 线上地址：https://streamnotes.terryso.dev（Worker Custom Domain；旧地址 https://streamnotes.oxtiger.workers.dev 由 Worker 301 跳转到正式域名）
- 技术栈：Astro 5（纯静态输出）+ Cloudflare Workers（账号：oxtiger@gmail.com，Worker 名：`streamnotes`）
- 目录：`/workspace/live-video-site`

```
src/consts.ts                 站点名称、栏目、站内选型清单链接（CHECKLIST_URL）、GA4/GSC 变量
src/content/articles/*.md     文章（一篇一个 Markdown 文件，文件名即 URL slug）
src/layouts/Base.astro        <head>（meta / canonical / hreflang / OG / JSON-LD / GA4 / GSC）、页头页脚
src/components/Cta.astro      文末中立 CTA（选型清单 / 方案选型栏目 / RSS）
src/components/Sidebar.astro  侧边栏（选型清单 / RSS、目录、热门文章、标签）
src/pages/                    首页、栏目页、文章页、about、404、rss.xml、robots.txt、llms.txt、llms-full.txt
scripts/assets-deploy.py        当前部署方式：Workers 静态资源直传（session / upload / finalize）
scripts/add-article-images.py   为文章生成封面 / 插图 / og 图，并写入 src/data/images.json
src/data/images.json            全站图片元数据（尺寸、alt、图注、作者与许可）
src/plugins/remark-enhance.mjs  构建时插入文内插图和文中 CTA
scripts/gen-embedded-worker.py  旧部署方式（单脚本打包，已停用）
wrangler.jsonc                用 wrangler CLI 部署时的配置
```

## 1. 新增一篇文章

1. 在 `src/content/articles/` 新建 `<slug>.md`，slug 用英文小写加连字符（例：`webrtc-sfu-basics.md`），它会成为 URL `/articles/<slug>/`。
2. 按第 2.5 节准备配图（封面 + 1~2 张插图），然后按下面的 frontmatter 模板填写（字段由 `src/content.config.ts` 校验，缺失必填项会导致构建失败）：

```yaml
---
title: "标题（建议 25~35 字，包含核心关键词）"
description: "摘要（80~150 字，用于 meta description、OG、RSS、llms.txt）"
pubDate: 2026-10-20
updatedDate: 2026-10-25        # 可选
category: tutorial             # tutorial 技术教程 | selection 方案选型 | industry 行业应用 | news 行业动态
tags: [关键词1, 关键词2]
tldr:                          # 必填，3~4 条要点，供读者和 AI 引擎快速摘要
  - "要点一"
faq:                           # 建议 3~4 条，会输出 FAQPage JSON-LD
  - q: "问题？"
    a: "回答。"
sources:                       # 参考资料（官方标准、规范、权威文档；不使用单一厂商的营销页面）
  - title: "资料名称"
    url: https://example.com/
related: [other-slug]          # 可选，手动指定相关阅读；不足 4 篇会自动补同栏目文章
---
```

3. 正文用 Markdown，从 `##` 二级标题开始（页面 H1 自动取 title），可使用表格、代码块。
4. YAML 值里含英文冒号 `: ` 时必须加双引号。
5. 内容规范：1200~2000 字；不写无法核实的统计数字；不贬低具名厂商。**保持中立**：本站不接受赞助、不发布任何厂商（包括保利威）的软广或推广文章，不写“由某厂商支持/合作推荐”之类的说明，不放厂商注册/咨询链接或 UTM 跟踪链接；如确需提及具体厂商，只能作为多家厂商并列对比中的一员，语气客观。
6. 本地预览：`npm run dev`（http://localhost:4321）；构建检查：`npm run build`。

文中 CTA、文末 CTA、侧边栏、页脚自动生成，均为站内中立链接（选型清单、方案选型栏目、RSS），无需手动添加。修改选型清单链接请改 `src/consts.ts` 里的 `CHECKLIST_URL`。

## 2. 部署（当前：Workers Static Assets 直传）

注意：本机器不要使用任何 HTTP/HTTPS 代理（不要设置 http_proxy/https_proxy），直接连接。

改版后站点含配图，约 3 MB / 60+ 个文件，超过"打包进单个 Worker 脚本"方案的体积上限，所以改用 **Workers 静态资源**（官方直传流程 https://developers.cloudflare.com/workers/static-assets/direct-upload/）。Worker `streamnotes` 挂载 ASSETS，并带一段很小的路由脚本：

- 把 `*.workers.dev` 的请求 301 到 `https://streamnotes.terryso.dev`；
- 没有扩展名、也不以 `/` 结尾的路径，301 到带斜杠的地址；
- 其余请求交给静态资源（`html_handling: auto-trailing-slash`、`not_found_handling: 404-page`，`public/_headers` 里的缓存头会生效：`/images/*` 缓存 30 天）。

完整步骤（账号 API 调用都走 Cloudflare MCP 连接器）：

```bash
cd /workspace/live-video-site
set -a; source .env; set +a          # 包含 PUBLIC_GA4_ID=G-TD51SPC7RZ
npm run build
python3 scripts/assets-deploy.py session > /workspace/agent-tools/assets-session.js
```
1. MCP `user-Cloudflare` → `execute`，`code="$file:/workspace/agent-tools/assets-session.js"`，`account_id=e81e236cdb3646d4fe1cf15bcd834cff`（建议加 `write_to_file`），把返回的 JSON（`jwt`、`buckets`）保存为 `/workspace/agent-tools/assets-session.json`。
2. `python3 scripts/assets-deploy.py upload` —— 在本机用上传会话签发的临时上传 JWT 上传需要更新的文件（未改动的文件不会重复上传）。这一步在 MCP 沙箱里做不了：沙箱的 `cloudflare.request()` 不能自定义 Authorization 头。
3. `python3 scripts/assets-deploy.py finalize > /workspace/agent-tools/assets-finalize.js`，再用 MCP `execute` 执行它：发布 Worker（资源和路由脚本），并保持 workers.dev 开启（会 301 跳到正式域名）。Custom Domain 绑定不受影响。

上传会话 JWT 大约 1 小时内有效，三步要连续执行。

### 备选：wrangler CLI
需要 Cloudflare API Token（权限：Workers Scripts: Edit）或 `npx wrangler login`：
```bash
export CLOUDFLARE_ACCOUNT_ID=e81e236cdb3646d4fe1cf15bcd834cff CLOUDFLARE_API_TOKEN=<token>
npm run deploy
```
`wrangler.jsonc` 需要先补上 `"routes": [{ "pattern": "streamnotes.terryso.dev", "custom_domain": true }]`。注意：wrangler 部署的是纯静态资源，不含上面的 workers.dev 跳转脚本；如需保留跳转，在 wrangler.jsonc 里加 `main`、指向同样的路由脚本，并设置 `assets.binding` 和 `run_worker_first: true`。

### 旧方案（已停用）
`scripts/gen-embedded-worker.py` 会把 dist 打包进单个 Worker 脚本。只适合不到约 1 MB 的纯文字站点，保留仅供参考。

## 2.5 设计与配图

- 设计：首页依次为头图（暗色摄影背景 + 浏览文章 / 选型清单按钮）、最新文章（四列卡片）、深度案例库（深色区块，四个场景：企业培训 / 营销直播 / 技术选型 / 私有化部署，在 `src/consts.ts` 的 `SCENARIOS` 中配置）、热门标签（`HOT_TAGS`）、中立 CTA 区块（选型清单、方案选型栏目和 RSS 订阅）、全部文章（可按栏目筛选的列表 + 侧边栏）。文章页有大封面、作者与阅读时长、TL;DR、正文插图、高亮引用、文中 CTA 和文末 CTA、FAQ、参考资料、上一篇 / 下一篇、相关阅读、侧边栏（CTA、目录、热门文章、标签）。移动端改为横向滚动的栏目条和底部标签栏（首页 / 栏目 / 搜索 / 订阅）。
- 站内搜索：`/search/`，纯前端实现，读取构建时生成的 `/search.json`；该页 noindex，并且不进入 sitemap。
- 配图来源：全部为公共领域图片（CC0 / PDM），通过 Openverse API 检索，来源包括 Wikimedia Commons（Unsplash 作者以 CC0 发布的作品）、rawpixel 公共领域图库（使用无水印的 1024px 版本）、StockSnap 和 WordPress Photo Directory。避开了可识别的真人和品牌 logo。作者与出处在图注和 `/credits/` 页列出。图片元数据保存在 `src/data/images.json`。
- 规格：封面 1600×900 WebP，另有 800×450 WebP 用于卡片；每篇文章单独的 og:image 为 1200×630 JPG；文内插图最宽 1200px，WebP 格式，`loading="lazy"`，并带 width/height 和 alt。
- 文内插图和中立的"文中 CTA"由 `src/plugins/remark-enhance.mjs` 在构建时自动插入（插图 1 放在第 2 个 H2 之前，CTA 放在中间的 H2 之前，插图 2 放在大约 3/4 处），Markdown 正文不需要写图片标记。
- 给新文章配图：准备一张封面和 1~2 张插图（必须有使用权），编写 spec.json，然后运行 `python3 scripts/add-article-images.py <slug> spec.json`（格式见脚本头部注释），最后重新构建并部署。缺少图片的文章也能正常构建，只是没有封面。`npm run build` 每次会先清理 Astro 内容缓存，确保修改 images.json 后插图、图注会重新生成。

## 3. SEO / GEO 已实现内容

- 语义化 HTML（header/nav/main/article/aside/footer、面包屑），每页唯一 title/description、canonical、`hreflang="zh-CN"` 与 `x-default`。
- JSON-LD：全站 Organization + WebSite；文章页 Article（含 citation）+ BreadcrumbList + FAQPage；栏目页 BreadcrumbList + CollectionPage。
- OpenGraph / Twitter Card（默认分享图 `public/og-default.png`，1200×630）。
- `sitemap-index.xml`、`sitemap-0.xml`、`sitemap.xml`（副本）、`rss.xml`、`robots.txt`（明确允许 GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、Claude-Web、PerplexityBot、Google-Extended、Googlebot、Bingbot）。
- `/llms.txt`（站点结构与文章索引）、`/llms-full.txt`（全部文章全文 + TL;DR + FAQ + 参考资料），构建时自动生成。
- 每篇文章：TL;DR 要点、清晰的 H2/H3 结构、FAQ、参考资料、相关阅读（内链）。
- 性能：CSS 内联、无外部字体；只有首页筛选和搜索页用到少量内联 JS；首屏图片 preload + fetchpriority=high，其余图片懒加载，并都设置了 width/height，避免布局抖动（CLS）。

## 4. Google Analytics 4 与 Search Console（待用户登录 Google 后配置）

不需要改代码，只需在构建时设置环境变量（参考 `.env.example`；可写入 `.env`，该文件已加入 .gitignore）：

| 变量 | 用途 | 未设置时 |
|---|---|---|
| `PUBLIC_GA4_ID` | GA4 衡量 ID，例如 `G-XXXXXXXXXX` | 页面不插入任何 gtag 代码 |
| `PUBLIC_GSC_VERIFICATION` | Search Console "HTML 标记"验证方式中 `content="..."` 的值 | 不输出验证 meta |

步骤：
1. 用户在 analytics.google.com 创建 GA4 媒体资源和 Web 数据流（网址填线上地址），复制衡量 ID。
2. 在 search.google.com/search-console 添加"网址前缀"资源，选择"HTML 标记"验证，复制 content 值。
3. `PUBLIC_GA4_ID=G-xxx PUBLIC_GSC_VERIFICATION=xxx npm run build`，再按第 2 节部署；回到 Search Console 点击"验证"，然后提交 `sitemap-index.xml`。

## 5. CTA 规则（保持中立）

- 全站 CTA（页头“订阅”、头图、文中、文末、侧边栏、线索区块、页脚、移动端标签栏）只指向站内页面：选型清单（`CHECKLIST_URL`）、`/category/selection/`、`/rss.xml`。
- 不得加入任何厂商的注册、试用、咨询链接、电话或 UTM 跟踪参数；不得出现“由某厂商支持 / 赞助 / 合作推荐”的表述。

## 6. 未来 4 周选题日历（12 篇，每周 3 篇，全部为中立内容）

| 周 | 发布日 | 栏目 | 选题 | 类型 |
|---|---|---|---|---|
| 第 1 周 | 周二 | 技术教程 | OBS 推流参数怎么设：码率、分辨率、关键帧间隔与编码器选择 | 中立 |
| 第 1 周 | 周四 | 行业应用 | 医学会议与手术示教直播：画质、权限与合规要点 | 中立 |
| 第 1 周 | 周六 | 方案选型 | 企业直播 aPaaS 是什么？低代码搭建自有直播间的思路与评估要点 | 中立 |
| 第 2 周 | 周二 | 技术教程 | 小程序直播接入指南：live-pusher/live-player 与第三方 SDK 的取舍 | 中立 |
| 第 2 周 | 周四 | 行业动态 | 鸿蒙（HarmonyOS NEXT）对音视频应用开发的影响与适配要点 | 中立 |
| 第 2 周 | 周六 | 行业应用 | B2B 网络研讨会（Webinar）获客全流程：报名、直播、留资到线索跟进 | 中立 |
| 第 3 周 | 周二 | 技术教程 | 多码率自适应（ABR）原理：转码阶梯怎么设计更省流量 | 中立 |
| 第 3 周 | 周四 | 方案选型 | 点播平台选型清单：存储、转码、加密、播放器与数据能力怎么评估 | 中立 |
| 第 3 周 | 周六 | 行业应用 | 银行与证券私域直播怎么做：从合规审核到客户运营 | 中立 |
| 第 4 周 | 周二 | 技术教程 | 直播弱网优化：抗丢包、码率自适应与断线重连的工程实践 | 中立 |
| 第 4 周 | 周四 | 行业动态 | 数字人直播的合规要点：授权、标识与内容审核（结合 AI 内容标识办法） | 中立 |
| 第 4 周 | 周六 | 行业应用 | 出海直播：海外观众访问、跨境网络与多语言字幕的实践建议 | 中立 |

所有选题保持中立：不写任何厂商（包括保利威）的推广文章，不出现赞助或合作说明。

## 7. 域名

- 正式域名 `streamnotes.terryso.dev` 是 `streamnotes` Worker 的 Custom Domain（zone terryso.dev，同一 Cloudflare 账号）。DNS 记录和证书由 Cloudflare 自动创建并续期，不要手动修改。
- 站点 URL 统一配置在 `astro.config.mjs` 的 `site` 中；canonical、sitemap、robots、RSS、llms.txt、OG 都从这里生成。更换域名时，修改这里和 `scripts/gen-embedded-worker.py` 中的 `CANONICAL_HOST`，然后重新构建并部署。
- 用 wrangler 部署（方式 B）时，在 wrangler.jsonc 中加入 `"routes": [{ "pattern": "streamnotes.terryso.dev", "custom_domain": true }]`，保证 Custom Domain 设置一致；可以设置 `"workers_dev": false`，关闭 workers.dev 地址。

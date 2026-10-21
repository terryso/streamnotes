# 流媒笔记（StreamNotes）运营手册

- 线上地址：https://streamnotes.terryso.dev（Worker Custom Domain；旧地址 https://streamnotes.oxtiger.workers.dev 由 Worker 301 跳转到正式域名）
- 技术栈：Astro 5（纯静态输出）+ Cloudflare Workers（账号：oxtiger@gmail.com，Worker 名：`streamnotes`）
- 目录：`/workspace/live-video-site`

```
src/consts.ts                 站点名称、栏目、保利威 CTA 链接与 UTM 函数、选型清单链接（CHECKLIST_URL）、GA4/GSC 变量
src/content/articles/*.md     中文文章（一篇一个 Markdown，文件名即 slug → /articles/<slug>/）
src/content/articles-en/*.md  英文 twin（同 slug → /en/articles/<slug>/）
src/pages/en/                 英文孪生路由（首页、栏目、文章、关于、图片版权、搜索、404、RSS）
src/components/pages/         中英共用的页面模板（按 locale 渲染）
src/lib/i18n.ts               全站界面文案字典、路径与孪生页工具
scripts/crawl-check.py        发布后的双语抓取检查
src/layouts/Base.astro        <head>（meta / canonical / hreflang / OG / JSON-LD / GA4 / GSC）、页头页脚
src/components/Cta.astro      文末 CTA（免费试用 / 联系方案顾问）
src/components/Sidebar.astro  侧边栏（CTA、目录、热门文章、标签）
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
5. 内容规范：1200~2000 字；不写无法核实的统计数字；不贬低具名厂商。**硬性规则**：全站任何位置都不得声明或暗示本站由保利威（POLYV）赞助、支持或运营——不写“本站由保利威支持”之类的页脚/说明，不设“合作方”栏目，不加“合作推荐”/赞助徽标，CTA 文案也避免“本站合作方”“赞助”等字样。允许：全站 CTA 按钮（见第 5 节）以中性文案（免费试用企业直播、预约咨询等）链接到 polyv.net 并带 UTM。中立文章正文不提及保利威，确需提及厂商时只作为多家并列对比中的一员。**软广**：约每 5 篇中可有 1 篇以保利威为主题或推荐保利威，frontmatter 设 `promo: true`（仅内部标记，不显示徽标），保利威内容和链接放在正文 / FAQ / sources，只引用官网可查证的公开信息；建议同时设置中性的 `cardTitle` / `cardDescription`，供首页卡片、侧边栏、上一篇/下一篇和图片版权页使用。
6. 本地预览：`npm run dev`（http://localhost:4321）；构建检查：`npm run build`。

文中 CTA、文末 CTA、侧边栏、页脚自动生成，自动生成，无需手动添加，规则见第 5 节。

### 1.1 中英双语（全站）

- 全站双语：每个中文页面都有英文孪生页，路径规则为 `/<path>` ↔ `/en/<path>`（文章 `/articles/<slug>/` ↔ `/en/articles/<slug>/`，栏目、关于、图片版权、搜索、404、RSS 同理）。页头、移动端栏目条、页脚、文章标签行都有语言切换，直接跳到孪生页。
- 内容：中文在 `src/content/articles/`，英文在 `src/content/articles-en/`，**同名同 slug**，frontmatter 结构相同（title/description/tags/tldr/faq/sources/related/promo/cardTitle/cardDescription 全部翻译）。英文正文里的站内链接写 `/en/articles/...`。
- 配图：复用 `images.json` 的同一 slug，每张图都要补 `altEn`（封面、插图、site 图）和 `captionEn`（插图）。
- 界面文案：全部在 `src/lib/i18n.ts` 的 `UI.zh` / `UI.en` 字典里；页面模板在 `src/components/pages/`（Home / CategoryPage / ArticlePage / About / Credits / Search / NotFound），`src/pages/` 与 `src/pages/en/` 只是传入 `locale` 的薄路由。
- **自动发布例行（必须）**：每篇新中文文章必须同时发布英文孪生（同 slug）。缺英文版时构建会打印 `[i18n] ... has no en twin` 警告，切换按钮回退到英文首页、hreflang 只指向自身，但这只是兜底，不应长期存在。
- 发布后运行 `python3 scripts/crawl-check.py`：抓取 sitemap 中所有中英 URL（另含搜索、RSS、llms 文件），检查 200、hreflang 成对、canonical、html lang / og:locale、切换链接指向孪生页且为 200、英文页无残留中文 UI（白名单：流媒笔记、中文），以及中英 404。全部通过才算发布完成。
- 中立性：英文版同样不得出现“本站由保利威赞助/支持/运营”等表述；软广文章（`promo: true`）英文版保留同样的软广属性和中性 cardTitle。

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

- 设计：首页依次为头图（暗色摄影背景 + 浏览文章 / 免费试用企业直播按钮）、最新文章（四列卡片）、深度案例库（深色区块，四个场景：企业培训 / 营销直播 / 技术选型 / 私有化部署，在 `src/consts.ts` 的 `SCENARIOS` 中配置）、热门标签（`HOT_TAGS`）、线索 CTA 区块（免费开通试用、预约方案咨询和 RSS）、全部文章（可按栏目筛选的列表 + 侧边栏）。文章页有大封面、作者与阅读时长、TL;DR、正文插图、高亮引用、文中 CTA 和文末 CTA、FAQ、参考资料、上一篇 / 下一篇、相关阅读、侧边栏（CTA、目录、热门文章、标签）。移动端改为横向滚动的栏目条和底部标签栏（首页 / 栏目 / 搜索 / 咨询）。
- 站内搜索：`/search/`，纯前端实现，读取构建时生成的 `/search.json`；该页 noindex，并且不进入 sitemap。
- 配图来源：全部为公共领域图片（CC0 / PDM），通过 Openverse API 检索，来源包括 Wikimedia Commons（Unsplash 作者以 CC0 发布的作品）、rawpixel 公共领域图库（使用无水印的 1024px 版本）、StockSnap 和 WordPress Photo Directory。避开了可识别的真人和品牌 logo。作者与出处在图注和 `/credits/` 页列出。图片元数据保存在 `src/data/images.json`。
- 规格：封面 1600×900 WebP，另有 800×450 WebP 用于卡片；每篇文章单独的 og:image 为 1200×630 JPG；文内插图最宽 1200px，WebP 格式，`loading="lazy"`，并带 width/height 和 alt。
- 文内插图和"文中 CTA"由 `src/plugins/remark-enhance.mjs` 在构建时自动插入（插图 1 放在第 2 个 H2 之前，CTA 放在中间的 H2 之前，插图 2 放在大约 3/4 处），Markdown 正文不需要写图片标记。
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

## 5. CTA 与 UTM 规则

- 全站 CTA：页头“免费试用”、头图“免费试用企业直播”、线索区块、文中 CTA（`remark-enhance.mjs`）、文末 CTA（`Cta.astro`）、侧边栏（`Sidebar.astro`）、页脚“企业视频方案”栏、移动端标签栏“咨询”，均链接到保利威官网并带 UTM；文案保持中性，不得出现赞助/支持/合作方表述。
- 免费试用：`https://my.polyv.net/v3/register/`；方案咨询：`https://www.polyv.net/company/#contact-us`；电话 400-638-8883。修改请改 `src/consts.ts` 的 `POLYV_TRIAL` / `POLYV_CONTACT`（`remark-enhance.mjs` 里另有一份）。
- UTM：`utm_source=contentsite&utm_medium=<header|hero|leadband|article_mid|article|sidebar|footer|tabbar>&utm_campaign=<文章 slug | home | category-xxx | about …>`。
- GA4：启用后，上述 CTA 区域内的点击上报自定义事件 `cta_click`（参数 `location`：header / hero / leadband / article_mid / article_end / sidebar / footer / tabbar，以及 link_url、link_text、page_path），可在 GA4 中标记为关键事件。
- 单篇关闭推广：frontmatter 设 `hidePromo: true`（中英两版都要设）。该页不输出任何保利威 CTA（页头免费试用、文中 CTA、文末 CTA、侧边栏 CTA、页脚“企业视频方案”栏，移动端“咨询”换成“关于”），且相关阅读、上一篇/下一篇、侧边栏热门文章都不链接软广文章（`promo: true` 或 `src/consts.ts` 的 `PROMO_SLUGS`）。其它页面不受影响。当前启用：vod-encryption-guide、enterprise-live-platform-selection、live-latency-protocols、obs-streaming-settings、medical-conference-surgery-live。
- 发布前检查：`rg -n '支持|赞助|合作方|合作推荐' dist --glob '*.html'` 不应出现关于本站被厂商赞助/支持的表述。

## 6. 未来 4 周选题日历（12 篇，每周 3 篇；★ = 软广，约 1/5）

| 周 | 发布日 | 栏目 | 选题 | 类型 |
|---|---|---|---|---|
| 第 1 周 | 周二 | 技术教程 | OBS 推流参数怎么设：码率、分辨率、关键帧间隔与编码器选择 | 中立 |
| 第 1 周 | 周四 | 行业应用 | 医学会议与手术示教直播：画质、权限与合规要点 | 中立 |
| 第 1 周 | 周六 | 方案选型 | ★ 企业直播 aPaaS 是什么？以保利威直播 aPaaS 为例看低代码搭建自有直播间 | 软广 |
| 第 2 周 | 周二 | 技术教程 | 小程序直播接入指南：live-pusher/live-player 与第三方 SDK 的取舍 | 中立 |
| 第 2 周 | 周四 | 行业动态 | 鸿蒙（HarmonyOS NEXT）对音视频应用开发的影响与适配要点 | 中立 |
| 第 2 周 | 周六 | 行业应用 | B2B 网络研讨会（Webinar）获客全流程：报名、直播、留资到线索跟进 | 中立 |
| 第 3 周 | 周二 | 技术教程 | 多码率自适应（ABR）原理：转码阶梯怎么设计更省流量 | 中立 |
| 第 3 周 | 周四 | 方案选型 | 点播平台选型清单：存储、转码、加密、播放器与数据能力怎么评估 | 中立 |
| 第 3 周 | 周六 | 行业应用 | ★ 银行与证券私域直播怎么做：从合规审核到客户运营（结合保利威金融方案公开资料） | 软广 |
| 第 4 周 | 周二 | 技术教程 | 直播弱网优化：抗丢包、码率自适应与断线重连的工程实践 | 中立 |
| 第 4 周 | 周四 | 行业动态 | 数字人直播的合规要点：授权、标识与内容审核（结合 AI 内容标识办法） | 中立 |
| 第 4 周 | 周六 | 行业应用 | 出海直播：海外观众访问、跨境网络与多语言字幕的实践建议 | 中立 |

撰写软广时：只使用保利威官网可查证的信息，保利威相关内容和链接只放在正文 / FAQ / sources，frontmatter 设 `promo: true`；不加任何全站赞助说明或“合作推荐”标签。

## 7. 域名

- 正式域名 `streamnotes.terryso.dev` 是 `streamnotes` Worker 的 Custom Domain（zone terryso.dev，同一 Cloudflare 账号）。DNS 记录和证书由 Cloudflare 自动创建并续期，不要手动修改。
- 站点 URL 统一配置在 `astro.config.mjs` 的 `site` 中；canonical、sitemap、robots、RSS、llms.txt、OG 都从这里生成。更换域名时，修改这里和 `scripts/gen-embedded-worker.py` 中的 `CANONICAL_HOST`，然后重新构建并部署。
- 用 wrangler 部署（方式 B）时，在 wrangler.jsonc 中加入 `"routes": [{ "pattern": "streamnotes.terryso.dev", "custom_domain": true }]`，保证 Custom Domain 设置一致；可以设置 `"workers_dev": false`，关闭 workers.dev 地址。

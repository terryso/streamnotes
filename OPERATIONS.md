# 流媒笔记（StreamNotes）运营手册

- 线上地址：https://streamnotes.terryso.dev（Worker Custom Domain；旧地址 https://streamnotes.oxtiger.workers.dev 由 Worker 301 跳转到正式域名）
- 技术栈：Astro 5（纯静态输出）+ Cloudflare Workers（账号：oxtiger@gmail.com，Worker 名：`streamnotes`）
- 目录：`/workspace/live-video-site`

```
src/consts.ts                 站点名称、栏目、保利威 CTA 链接、UTM 生成函数、GA4/GSC 变量
src/content/articles/*.md     文章（一篇一个 Markdown 文件，文件名即 URL slug）
src/layouts/Base.astro        <head>（meta / canonical / hreflang / OG / JSON-LD / GA4 / GSC）、页头页脚
src/components/Cta.astro      文章内 CTA 区块
src/components/Sidebar.astro  侧边栏 CTA
src/pages/                    首页、栏目页、文章页、about、404、rss.xml、robots.txt、llms.txt、llms-full.txt
scripts/gen-embedded-worker.py  通过 Cloudflare MCP 部署用的脚本（当前线上使用的方式）
scripts/gen-mcp-deploy.py       Workers 静态资源直传方式（目前在 MCP 沙箱里不可用，见下文）
wrangler.jsonc                用 wrangler CLI 部署时的配置
```

## 1. 新增一篇文章

1. 在 `src/content/articles/` 新建 `<slug>.md`，slug 用英文小写加连字符（例：`webrtc-sfu-basics.md`），它会成为 URL `/articles/<slug>/` 以及 CTA 中的 `utm_campaign=<slug>`。
2. 按下面的 frontmatter 模板填写（字段由 `src/content.config.ts` 校验，缺失必填项会导致构建失败）：

```yaml
---
title: "标题（建议 25~35 字，包含核心关键词）"
description: "摘要（80~150 字，用于 meta description、OG、RSS、llms.txt）"
pubDate: 2026-10-20
updatedDate: 2026-10-25        # 可选
category: tutorial             # tutorial 技术教程 | selection 方案选型 | industry 行业应用 | news 行业动态
tags: [关键词1, 关键词2]
promo: false                   # 软广文章设为 true：页面会显示"合作推荐"标签和说明
tldr:                          # 必填，3~4 条要点，供读者和 AI 引擎快速摘要
  - "要点一"
faq:                           # 建议 3~4 条，会输出 FAQPage JSON-LD
  - q: "问题？"
    a: "回答。"
sources:                       # 参考资料（官方标准、文档、保利威官网页面）
  - title: "资料名称"
    url: https://example.com/
related: [other-slug]          # 可选，手动指定相关阅读；不足 4 篇会自动补同栏目文章
---
```

3. 正文用 Markdown，从 `##` 二级标题开始（页面 H1 自动取 title），可使用表格、代码块。
4. YAML 值里含英文冒号 `: ` 时必须加双引号。
5. 内容规范：1200~2000 字；不写无法核实的统计数字；不贬低具名竞品；涉及保利威能力时只引用官网公开信息，并在 sources 中附链接；软广约占 1/5，并设置 `promo: true`。
6. 本地预览：`npm run dev`（http://localhost:4321）；构建检查：`npm run build`。

文章内 CTA、侧边栏 CTA、页脚 CTA 自动生成，无需手动添加。修改 CTA 目标链接请改 `src/consts.ts` 里的 `POLYV_TRIAL` / `POLYV_CONTACT`。

## 2. 部署

注意：本机器不要使用任何 HTTP/HTTPS 代理（不要设置 http_proxy/https_proxy），直接连接。

### 方式 A（当前在用）：通过 Cloudflare MCP 连接器

```bash
cd /workspace/live-video-site
npm run build
python3 scripts/gen-embedded-worker.py > /workspace/agent-tools/deploy-embedded.js
```
然后调用 MCP `user-Cloudflare` → `execute`，参数 `code` 设为 `"$file:/workspace/agent-tools/deploy-embedded.js"`，`account_id` 设为 `e81e236cdb3646d4fe1cf15bcd834cff`。
脚本把 `dist/` 全部文件打包进一个 Worker 脚本（并内置 *.workers.dev → streamnotes.terryso.dev 的 301 跳转，主机名可用环境变量 CANONICAL_HOST 修改）（当前约 0.47 MB；Workers 免费版脚本上限为压缩后 3 MB，付费版 10 MB），覆盖同名 Worker 并确保 workers.dev 地址开启。缓存头和 404 处理写在脚本里（`/_astro/*` 长缓存，HTML 每次重新验证）。
站点变大（图片较多）时，建议改用方式 B。

> 为什么不用 Workers 静态资源直传：直传流程中的文件上传步骤需要用上传会话签发的 JWT 作为 Bearer 鉴权，而 MCP `execute` 沙箱里的 `cloudflare.request()` 不支持自定义请求头，直接 fetch 返回 401。`scripts/gen-mcp-deploy.py` 保留备用。

### 方式 B（推荐长期使用）：wrangler CLI

需要用户提供 Cloudflare API Token（权限：Account → Workers Scripts: Edit），或在本机交互式执行 `npx wrangler login`。
```bash
export CLOUDFLARE_ACCOUNT_ID=e81e236cdb3646d4fe1cf15bcd834cff
export CLOUDFLARE_API_TOKEN=<token>      # 不要提交到仓库
npm run deploy                           # = astro build + wrangler deploy（Workers Static Assets，读取 wrangler.jsonc）
```
`wrangler.jsonc` 已配置 `not_found_handling: 404-page`；`public/_headers` 中的缓存头规则会自动生效。

## 3. SEO / GEO 已实现内容

- 语义化 HTML（header/nav/main/article/aside/footer、面包屑），每页唯一 title/description、canonical、`hreflang="zh-CN"` 与 `x-default`。
- JSON-LD：全站 Organization + WebSite；文章页 Article（含 citation）+ BreadcrumbList + FAQPage；栏目页 BreadcrumbList + CollectionPage。
- OpenGraph / Twitter Card（默认分享图 `public/og-default.png`，1200×630）。
- `sitemap-index.xml`、`sitemap-0.xml`、`sitemap.xml`（副本）、`rss.xml`、`robots.txt`（明确允许 GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、Claude-Web、PerplexityBot、Google-Extended、Googlebot、Bingbot）。
- `/llms.txt`（站点结构与文章索引）、`/llms-full.txt`（全部文章全文 + TL;DR + FAQ + 参考资料），构建时自动生成。
- 每篇文章：TL;DR 要点、清晰的 H2/H3 结构、FAQ、参考资料、相关阅读（内链）。
- 性能：零客户端 JS（GA4 未启用时）、CSS 内联、无外部字体，单页 HTML 约 15~30 KB。

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
4. 启用 GA4 后，所有指向 polyv.net 的点击会额外上报自定义事件 `cta_click`（参数 link_url、page_path），可在 GA4 中标记为关键事件；保利威侧可通过 UTM（utm_source=contentsite）统计注册/咨询转化。

## 5. CTA 与 UTM 规则

- 免费试用：`https://my.polyv.net/v3/register/`（保利威官网"我要免费开通"按钮的目标地址）
- 方案咨询：`https://www.polyv.net/company/#contact-us`（保利威公司页"联系我们"）；电话 400-638-8883
- UTM：`utm_source=contentsite&utm_medium=<article|sidebar|footer|home>&utm_campaign=<文章 slug | home | category-xxx>`
  （文章内 CTA 的 medium 为 `article`；侧边栏和页脚分别为 `sidebar` / `footer`，便于区分点击位置。）

## 6. 未来 4 周选题日历（12 篇，每周 3 篇；★ = 软广，约 1/5~1/4）

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

撰写软广时：只使用保利威官网可查证的信息，文末 sources 附官网链接，frontmatter 设 `promo: true`。

## 7. 域名

- 正式域名 `streamnotes.terryso.dev` 是 `streamnotes` Worker 的 Custom Domain（zone terryso.dev，同一 Cloudflare 账号）。DNS 记录和证书由 Cloudflare 自动创建并续期，不要手动修改。
- 站点 URL 统一配置在 `astro.config.mjs` 的 `site` 中；canonical、sitemap、robots、RSS、llms.txt、OG 都从这里生成。更换域名时，修改这里和 `scripts/gen-embedded-worker.py` 中的 `CANONICAL_HOST`，然后重新构建并部署。
- 用 wrangler 部署（方式 B）时，在 wrangler.jsonc 中加入 `"routes": [{ "pattern": "streamnotes.terryso.dev", "custom_domain": true }]`，保证 Custom Domain 设置一致；可以设置 `"workers_dev": false`，关闭 workers.dev 地址。

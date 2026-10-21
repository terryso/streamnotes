import { CATEGORIES, HOT_TAGS, SITE_NAME, SITE_NAME_EN, SITE_TAGLINE, SITE_DESCRIPTION, AUTHOR, type CategoryKey } from '../consts';

export type Locale = 'zh' | 'en';
export const LOCALES: Locale[] = ['zh', 'en'];

export const CATEGORIES_EN: Record<CategoryKey, { name: string; desc: string }> = {
  tutorial: { name: 'Tutorials', desc: 'Hands-on guides to live streaming ingest, playback protocols, encoding, and encryption.' },
  selection: { name: 'Platform selection', desc: 'Methods and checklists for choosing SaaS, aPaaS, and private-deployment video platforms.' },
  industry: { name: 'Industry use cases', desc: 'Live and VOD in practice across training, marketing, healthcare, finance, and government.' },
  news: { name: 'Industry trends', desc: 'Observations on video technology and the enterprise live streaming market.' },
};

export const HOT_TAGS_EN = ['Corporate training', 'Marketing livestream', 'Private deployment', 'Low latency', 'Video encryption', 'WebRTC', 'HLS', 'AI captions', 'Platform selection', 'OBS'];

const zh = {
  locale: 'zh' as Locale,
  htmlLang: 'zh-CN',
  ogLocale: 'zh_CN',
  siteName: SITE_NAME,
  siteNameAlt: SITE_NAME_EN,
  tagline: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  author: AUTHOR,
  avatar: '流',
  hotTags: HOT_TAGS as readonly string[],
  homeTitle: (n: string, t: string) => `${n}：${t}`,
  // chrome
  skip: '跳到正文',
  homeAria: (n: string) => `${n} 首页`,
  navMain: '主导航', navTopics: '栏目', navHome: '首页', navFeatured: '推荐', navAbout: '关于', navQuick: '快捷导航',
  searchLabel: '搜索文章', searchPlaceholder: '搜索直播、点播、私有化…',
  headerTrial: '免费试用',
  switchLabel: 'English', switchHreflang: 'en', switchLang: 'en', switchAria: 'Read this page in English',
  tabHome: '首页', tabTopics: '栏目', tabSearch: '搜索', tabConsult: '咨询',
  footerTopics: '栏目', footerHot: '热门专题', footerSolutions: '企业视频方案',
  footerTrial: '免费开通保利威直播/点播', footerContact: '联系保利威方案顾问',
  phone: (p: string) => `咨询电话 ${p}`,
  footerAbout: '关于', footerAboutSite: '关于本站', footerCredits: '图片版权说明', footerSearch: '站内搜索',
  footerOther: 'English', footerOtherHref: '/en/', footerOtherLang: 'en',
  footerCopy: (y: number, n: string) => `© ${y} ${n}。专注直播与点播技术的独立内容站。`,
  // CTA blocks
  ctaAria: '方案咨询', ctaEyebrow: '下一步', ctaTitle: '正在规划企业直播或点播平台？',
  ctaBody: '可以先免费开通保利威（POLYV）账号，实测直播、点播、互动与视频加密等功能；也可以联系方案顾问，结合培训、营销或私有化等业务场景做评估。',
  ctaTrial: '免费开通试用', ctaContact: '联系方案顾问',
  sideEyebrow: '企业视频方案', sideTitle: '直播、点播、私有化，一站式试用', sideBody: '在真实网络和终端上先测一测，再做决定。',
  sideTrial: '免费开通保利威', sideContact: '预约方案咨询', tocAria: '文章目录', toc: '目录', popular: '热门文章', tagsTitle: '热门标签',
  leadAria: '获取企业视频方案', leadEyebrow: '企业直播 · 点播 · 私有化', leadTitle: '把直播用在培训、营销与客户服务上',
  leadBody: '免费开通保利威账号，用真实业务场景测试开播、互动、权限与加密；需要定制或私有化部署，可预约方案顾问一对一沟通。',
  leadTrial: '免费开通试用', leadContact: '预约方案咨询', leadRss: '通过 RSS 订阅新文章',
  // cards / article
  minsShort: (n: number) => `${n} 分钟`, minsLong: (n: number) => `${n} 分钟阅读`,
  crumbAria: '面包屑', crumbHome: '首页', crumbArticle: '正文',
  updated: (d: string) => `更新于 ${d}`, coverCredit: '封面图片：',
  tldrAria: '要点速览', tldrTitle: 'TL;DR 要点速览', faqTitle: '常见问题（FAQ）', sourcesTitle: '参考资料',
  prevnextAria: '上一篇和下一篇', prev: '上一篇', next: '下一篇', related: '相关阅读',
  // home
  heroEyebrow: '企业直播 · 视频点播 · 技术选型',
  heroLead: '面向企业技术与业务团队的直播点播知识库——协议与延迟、视频加密、平台选型、企业培训与营销直播实践，讲清原理，也给出可落地的清单。',
  heroBrowse: '浏览全部文章', heroTrial: '免费试用企业直播', statsAria: '栏目',
  latest: '最新文章', viewAll: '查看全部',
  caseEyebrow: '深度案例库', caseTitle: '按场景找答案', caseLead: '围绕企业最常见的四类视频场景，整理原理、方法与选型清单。',
  hotTagsTitle: '热门标签', allTitle: '全部文章', filterAria: '按栏目筛选', filterAll: '全部', noscriptBrowse: '按栏目浏览：',
  emptyCategory: '本栏目文章即将上线。',
  // search
  searchTitle: '站内搜索', searchDesc: '搜索流媒笔记的直播、点播、选型与行业实践文章。', searchInputLabel: '关键词',
  searchBigPlaceholder: '输入关键词，例如：低延迟、私有化、企业培训', searchButton: '搜索',
  searchFound: '“{q}” 共找到 {n} 篇文章', searchAll: '全部文章 {n} 篇',
  // 404
  nfTitle: '页面未找到', nfDesc: '页面不存在或已移动。', nfBody: '你访问的页面不存在或已移动，', nfHome: '返回首页',
  // credits
  credTitle: '图片版权说明', credPageTitle: '图片版权说明：站内配图来源、作者与授权许可', credDesc: '流媒笔记站内图片的来源、作者与授权许可说明。',
  credIntro: '本站配图均来自公共领域（CC0 / Public Domain Mark）图片，经 Openverse 检索，来源包括 Wikimedia Commons（含 Unsplash 作者以 CC0 发布的作品）、rawpixel 公共领域图库、StockSnap 与 WordPress Photo Directory。CC0 不要求署名，我们仍在此列出作者与原始出处以示感谢。',
  credWhere: '使用位置', credAuthor: '作者', credSource: '来源', credLicense: '许可',
  credHero: '首页头图', credBand: '首页案例库背景', credCover: (t: string) => `${t}（封面）`, credInline: (t: string, i: number) => `${t}（插图 ${i}）`,
  // about
  homeAboutTitle: '关于流媒笔记',
  homeAbout: `${SITE_NAME}是一个独立的中英双语编辑型网站，由${AUTHOR}撰写和维护。我们写直播与视频点播（VOD）技术、平台选型方法和行业落地实践，面向企业技术负责人、产品经理，以及培训、市场与运营团队；法规部分以中国大陆的规定为主。按编辑日历，每周二、周四、周六发布新文章，中英文同步上线。`,
  homeTrustStandards: '编辑标准与独立性声明', homeTrustSources: '每篇文章都列出参考资料（标准、官方文档、法规原文）', homeTrustUpdated: (d: string) => `最近更新：${d}`,
  aboutTitle: '关于本站：定位、编辑标准与独立性声明', aboutDesc: `关于${SITE_NAME}：站点定位、编辑标准、资料来源与更新更正规则、中立与独立性声明，以及如何通过 GitHub 反馈问题。`,
  homeSeoTitle: undefined as string | undefined,
};

type Dict = typeof zh;

const en: Dict = {
  locale: 'en',
  htmlLang: 'en',
  ogLocale: 'en_US',
  siteName: SITE_NAME_EN,
  siteNameAlt: SITE_NAME,
  tagline: 'Live streaming & VOD technology, platform selection, and industry practice',
  description:
    'StreamNotes covers live streaming and video on demand (VOD): protocols and latency, video encryption, platform selection, corporate training and marketing livestreams, and industry trends—practical references for technical and business teams.',
  author: 'StreamNotes Editorial',
  avatar: 'SN',
  hotTags: HOT_TAGS_EN,
  homeTitle: (n, t) => `${n}: ${t}`,
  skip: 'Skip to content',
  homeAria: (n) => `${n} home`,
  navMain: 'Main', navTopics: 'Topics', navHome: 'Home', navFeatured: 'Featured', navAbout: 'About', navQuick: 'Quick navigation',
  searchLabel: 'Search articles', searchPlaceholder: 'Search live, VOD, private deployment…',
  headerTrial: 'Free trial',
  switchLabel: '中文', switchHreflang: 'zh-CN', switchLang: 'zh-CN', switchAria: '阅读本页中文版',
  tabHome: 'Home', tabTopics: 'Topics', tabSearch: 'Search', tabConsult: 'Contact',
  footerTopics: 'Topics', footerHot: 'Popular topics', footerSolutions: 'Enterprise video',
  footerTrial: 'Start a free POLYV live/VOD trial', footerContact: 'Talk to a POLYV solutions advisor',
  phone: (p) => `Phone (China): ${p}`,
  footerAbout: 'About', footerAboutSite: 'About this site', footerCredits: 'Image credits', footerSearch: 'Site search',
  footerOther: '中文', footerOtherHref: '/', footerOtherLang: 'zh-CN',
  footerCopy: (y, n) => `© ${y} ${n}. An independent publication on live streaming and VOD technology.`,
  ctaAria: 'Next steps', ctaEyebrow: 'Next step', ctaTitle: 'Planning an enterprise live streaming or VOD platform?',
  ctaBody: 'You can open a free POLYV account to test live streaming, VOD, interaction, and video encryption hands-on, or talk to a solutions advisor about training, marketing, or private-deployment scenarios.',
  ctaTrial: 'Start a free trial', ctaContact: 'Talk to an advisor',
  sideEyebrow: 'Enterprise video', sideTitle: 'Live, VOD, and private deployment—try them in one place', sideBody: 'Test on real networks and devices before you decide.',
  sideTrial: 'Try POLYV free', sideContact: 'Book a consultation', tocAria: 'Table of contents', toc: 'Contents', popular: 'Popular articles', tagsTitle: 'Popular tags',
  leadAria: 'Enterprise video options', leadEyebrow: 'Enterprise live · VOD · private deployment', leadTitle: 'Put live video to work in training, marketing, and customer service',
  leadBody: 'Open a free POLYV account and test go-live, interaction, access control, and encryption against real business scenarios. Need customization or private deployment? Book a one-on-one session with a solutions advisor.',
  leadTrial: 'Start a free trial', leadContact: 'Book a consultation', leadRss: 'Subscribe to new articles via RSS',
  minsShort: (n) => `${n} min`, minsLong: (n) => `${n} min read`,
  crumbAria: 'Breadcrumb', crumbHome: 'Home', crumbArticle: 'Article',
  updated: (d) => `Updated ${d}`, coverCredit: 'Cover image: ',
  tldrAria: 'Key takeaways', tldrTitle: 'TL;DR: key takeaways', faqTitle: 'Frequently asked questions', sourcesTitle: 'Sources',
  prevnextAria: 'Previous and next articles', prev: 'Previous', next: 'Next', related: 'Related reading',
  heroEyebrow: 'Enterprise live · Video on demand · Platform selection',
  heroLead: 'A live streaming and VOD knowledge base for enterprise technical and business teams—protocols and latency, video encryption, platform selection, and corporate training and marketing livestreams. We explain the principles and give you checklists you can act on.',
  heroBrowse: 'Browse all articles', heroTrial: 'Try enterprise live streaming free', statsAria: 'Topics',
  latest: 'Latest articles', viewAll: 'View all',
  caseEyebrow: 'Scenario library', caseTitle: 'Find answers by scenario', caseLead: 'Principles, methods, and selection checklists for the four most common enterprise video scenarios.',
  hotTagsTitle: 'Popular tags', allTitle: 'All articles', filterAria: 'Filter by topic', filterAll: 'All', noscriptBrowse: 'Browse by topic: ',
  emptyCategory: 'Articles in this topic are coming soon.',
  searchTitle: 'Site search', searchDesc: 'Search StreamNotes articles on live streaming, VOD, platform selection, and industry practice.', searchInputLabel: 'Keywords',
  searchBigPlaceholder: 'Enter keywords, e.g. low latency, private deployment, training', searchButton: 'Search',
  searchFound: '{n} article(s) found for “{q}”', searchAll: 'All articles: {n}',
  nfTitle: 'Page not found', nfDesc: 'This page does not exist or has moved.', nfBody: 'The page you requested does not exist or has moved. ', nfHome: 'Back to home',
  credTitle: 'Image credits', credPageTitle: 'Image Credits & Licenses', credDesc: 'Sources, creators, and licenses for images used on StreamNotes.',
  credIntro: 'All images on this site are public-domain works (CC0 / Public Domain Mark) found via Openverse, from sources including Wikimedia Commons (including CC0 works by Unsplash photographers), the rawpixel public-domain library, StockSnap, and the WordPress Photo Directory. CC0 does not require attribution, but we list creators and original sources here with thanks.',
  credWhere: 'Used on', credAuthor: 'Creator', credSource: 'Source', credLicense: 'License',
  credHero: 'Home page hero', credBand: 'Home page scenario band background', credCover: (t) => `${t} (cover)`, credInline: (t, i) => `${t} (figure ${i})`,
  homeAboutTitle: 'About StreamNotes',
  homeAbout: 'StreamNotes (流媒笔记) is an independent, bilingual Chinese–English editorial site written and maintained by StreamNotes Editorial. We cover live streaming and video-on-demand (VOD) technology, platform selection methods, and industry practice for enterprise technology leads, product managers, and training, marketing, and operations teams; regulatory content focuses mainly on rules in mainland China. Following our editorial calendar, new articles are published every Tuesday, Thursday, and Saturday, in Chinese and English at the same time.',
  homeTrustStandards: 'Editorial standards & independence', homeTrustSources: 'Every article lists its sources (standards, official docs, original legal texts)', homeTrustUpdated: (d) => `Last updated: ${d}`,
  aboutTitle: 'About StreamNotes: Standards & Independence', aboutDesc: 'About StreamNotes: what the site covers, editorial standards, sourcing and update policy, independence statement, and how to send feedback via GitHub.',
  homeSeoTitle: 'StreamNotes – Live Streaming & VOD Technology Guides',
};

export const UI: Record<Locale, Dict> = { zh, en };
export const ui = (locale: Locale = 'zh') => UI[locale];

export function categoryLabel(key: CategoryKey, locale: Locale = 'zh') {
  return locale === 'en' ? CATEGORIES_EN[key] : CATEGORIES[key];
}

const prefix = (locale: Locale) => (locale === 'en' ? '/en' : '');
export const homePath = (locale: Locale = 'zh') => (locale === 'en' ? '/en/' : '/');
export const articlePath = (slug: string, locale: Locale = 'zh') => `${prefix(locale)}/articles/${slug}/`;
export const categoryPath = (key: string, locale: Locale = 'zh') => `${prefix(locale)}/category/${key}/`;
export const pagePath = (p: string, locale: Locale = 'zh') => `${prefix(locale)}${p}`;

/** Twin path of a site path in the other locale. Every page has a twin. */
export function twinPath(pathname: string): { zh: string; en: string; current: Locale } {
  let p = pathname.replace(/index\.html$/, '').replace(/\.html$/, '/');
  if (!p.endsWith('/')) p += '/';
  if (p === '/en/' || p.startsWith('/en/')) {
    const zhP = p.slice(3) || '/';
    return { zh: zhP, en: p, current: 'en' };
  }
  return { zh: p, en: '/en' + p, current: 'zh' };
}

/** Localize credit strings that contain Chinese proper names of sources. */
export function creditText(s: string | undefined, locale: Locale = 'zh') {
  if (!s || locale === 'zh') return s ?? '';
  return s.replace('rawpixel 公共领域图库', 'rawpixel Public Domain');
}

export interface Scenario { key: string; name: string; desc: string; href: string; image: string }
export function scenarios(locale: Locale): Scenario[] {
  const zhList = [
    { key: 'training', name: '企业培训', desc: '内训、经销商赋能与知识沉淀', href: articlePath('corporate-training-live', locale), image: 'corporate-training-live' },
    { key: 'marketing', name: '营销直播', desc: '研讨会获客、报名留资与转化', href: articlePath('enterprise-live-platform-selection', locale), image: 'enterprise-live-platform-selection' },
    { key: 'tech', name: '技术选型', desc: '协议、延迟、加密与架构取舍', href: categoryPath('tutorial', locale), image: 'live-latency-protocols' },
    { key: 'private', name: '私有化部署', desc: '金融政企的安全合规与集成', href: articlePath('private-deployment-polyv', locale), image: 'private-deployment-polyv' },
  ];
  if (locale === 'zh') return zhList;
  const enText: Record<string, [string, string]> = {
    training: ['Corporate training', 'Internal training, partner enablement, and knowledge capture'],
    marketing: ['Marketing livestreams', 'Webinar lead generation, registration, and conversion'],
    tech: ['Technical choices', 'Trade-offs in protocols, latency, encryption, and architecture'],
    private: ['Private deployment', 'Security, compliance, and integration for finance and government'],
  };
  return zhList.map((s) => ({ ...s, name: enText[s.key][0], desc: enText[s.key][1] }));
}

/**
 * Popular tags link to a real (non-parameter) landing page where one fits, so crawlers
 * don't follow /search/?q=… variants. Targets are never promo articles (safe on hidePromo pages).
 * Tags without a good landing page fall back to a nofollow search link.
 */
const HOT_TAG_TARGETS: (string | null)[] = [
  'articles/corporate-training-live/',            // 企业培训 / Corporate training
  null,                                           // 营销直播 / Marketing livestream
  'articles/enterprise-live-platform-selection/', // 私有化部署 / Private deployment
  'articles/live-latency-protocols/',             // 低延迟直播 / Low latency
  'articles/vod-encryption-guide/',               // 视频加密 / Video encryption
  'articles/live-latency-protocols/',             // WebRTC
  'articles/live-latency-protocols/',             // HLS
  'articles/ai-in-live-vod/',                     // AI字幕 / AI captions
  'articles/enterprise-live-platform-selection/', // 直播平台选型 / Platform selection
  'articles/obs-streaming-settings/',             // OBS
];
export function searchTagHref(tag: string, locale: Locale = 'zh') {
  return `${prefix(locale)}/search/?q=${encodeURIComponent(tag)}`;
}
export function tagLink(tag: string, locale: Locale = 'zh'): { href: string; rel?: string } {
  const list = locale === 'en' ? HOT_TAGS_EN : (HOT_TAGS as readonly string[]);
  const i = list.indexOf(tag);
  const target = i >= 0 ? HOT_TAG_TARGETS[i] : null;
  return target ? { href: `${prefix(locale)}/${target}` } : { href: searchTagHref(tag, locale), rel: 'nofollow' };
}

export const SITE_NAME = '流媒笔记';
export const SITE_NAME_EN = 'StreamNotes';
export const SITE_TAGLINE = '直播与点播技术、选型与行业实践';
export const SITE_DESCRIPTION =
  '流媒笔记专注直播与视频点播（VOD）技术：协议与延迟、视频加密、平台选型、企业培训与营销直播实践、行业动态，为技术与业务团队提供实用参考。';

export const CATEGORIES = {
  tutorial: { name: '技术教程', desc: '直播推流、播放协议、编码、加密等音视频技术实操讲解。' },
  selection: { name: '方案选型', desc: 'SaaS、aPaaS、私有化部署等企业视频方案的选型方法与清单。' },
  industry: { name: '行业应用', desc: '培训、营销、医疗、金融、政企等场景的直播点播落地实践。' },
  news: { name: '行业动态', desc: '音视频技术与企业直播行业的趋势观察。' },
} as const;
export type CategoryKey = keyof typeof CATEGORIES;

// Neutral in-site checklist used by CTAs
export const CHECKLIST_URL = '/articles/enterprise-live-platform-selection/';

// Real POLYV (保利威) destination pages, verified on polyv.net
export const POLYV_TRIAL = 'https://my.polyv.net/v3/register/';
export const POLYV_CONTACT = 'https://www.polyv.net/company/';
export const POLYV_CONTACT_HASH = '#contact-us';
export const POLYV_PHONE = '400-638-8883';

export function utm(base: string, campaign: string, medium = 'article', hash = '') {
  const u = new URL(base);
  u.searchParams.set('utm_source', 'contentsite');
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', campaign);
  return u.toString() + hash;
}

// Analytics / Search Console placeholders: set as env vars at build time (see OPERATIONS.md)
export const GA4_ID = (import.meta.env.PUBLIC_GA4_ID || '').trim();
export const GSC_VERIFICATION = (import.meta.env.PUBLIC_GSC_VERIFICATION || '').trim();

export const AUTHOR = '流媒笔记编辑部';

// Scenario topics for the "深度案例库" band (enterprise live/VOD focus)
export const SCENARIOS = [
  { key: 'training', name: '企业培训', desc: '内训、经销商赋能与知识沉淀', href: '/articles/corporate-training-live/', image: 'corporate-training-live' },
  { key: 'marketing', name: '营销直播', desc: '研讨会获客、报名留资与转化', href: '/articles/enterprise-live-platform-selection/', image: 'enterprise-live-platform-selection' },
  { key: 'tech', name: '技术选型', desc: '协议、延迟、加密与架构取舍', href: '/category/tutorial/', image: 'live-latency-protocols' },
  { key: 'private', name: '私有化部署', desc: '金融政企的安全合规与集成', href: '/articles/private-deployment-polyv/', image: 'private-deployment-polyv' },
] as const;

export const HOT_TAGS = ['企业培训', '营销直播', '私有化部署', '低延迟直播', '视频加密', 'WebRTC', 'HLS', 'AI字幕', '直播平台选型', 'OBS'];

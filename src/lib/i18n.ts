import { CATEGORIES, type CategoryKey } from '../consts';

export type Locale = 'zh' | 'en';

export const CATEGORIES_EN: Record<CategoryKey, { name: string; desc: string }> = {
  tutorial: { name: 'Tutorials', desc: 'Hands-on guides for live streaming protocols, encoding, encryption, and playback.' },
  selection: { name: 'Platform selection', desc: 'How to evaluate SaaS, aPaaS, and private-deployment video platforms.' },
  industry: { name: 'Industry use cases', desc: 'Live and VOD practices for training, marketing, healthcare, finance, and government.' },
  news: { name: 'Industry notes', desc: 'Trends in video technology and enterprise live streaming.' },
};

export const SITE_EN = {
  name: 'StreamNotes',
  nameZh: '流媒笔记',
  tagline: 'Live streaming & VOD technology, selection, and industry practice',
  description:
    'StreamNotes covers live streaming and video-on-demand: protocols and latency, encryption, platform selection, corporate training and marketing livestreams—practical references for technical and business teams.',
  author: 'StreamNotes Editorial',
  navHome: 'Home',
  navAbout: 'About',
  navSearch: 'Search',
  skipToContent: 'Skip to content',
  searchPlaceholder: 'Search live, VOD, private deploy…',
  searchLabel: 'Search articles',
  freeTrial: 'Free trial',
  contactAdvisor: 'Talk to an advisor',
  footerColumns: 'Topics',
  footerHot: 'Popular topics',
  footerSolutions: 'Enterprise video',
  footerAbout: 'About',
  footerTrial: 'Start a free live/VOD trial',
  footerContact: 'Contact a solutions advisor',
  footerPhone: 'Phone',
  footerAboutSite: 'About this site',
  footerCredits: 'Image credits',
  footerSearch: 'Site search',
  footerCopy: 'Independent coverage of live streaming and VOD technology.',
  tabHome: 'Home',
  tabTopics: 'Topics',
  tabSearch: 'Search',
  tabConsult: 'Consult',
  breadcrumbHome: 'Home',
  breadcrumbArticle: 'Article',
  tldr: 'TL;DR',
  faq: 'FAQ',
  sources: 'Sources',
  related: 'Related reading',
  prev: 'Previous',
  next: 'Next',
  coverCredit: 'Cover image:',
  readingMins: (n: number) => `${n} min read`,
  updated: 'Updated',
  langSwitchToZh: '中文',
  langSwitchToEn: 'English',
  emptyCategory: 'Articles in this topic will appear here as English editions ship.',
  homeEyebrow: 'Enterprise live · VOD · selection',
  homeLead:
    'A practical knowledge base for enterprise live streaming and VOD—protocols, latency, encryption, platform selection, and training/marketing practices.',
  browseAll: 'Browse articles',
  latest: 'Latest',
  viewAll: 'View all',
  allArticles: 'All English articles',
  filterAll: 'All',
  enEditionNote: 'English edition',
  hotTags: ['Corporate training', 'Marketing livestream', 'Private deployment', 'Low-latency live', 'Video encryption', 'WebRTC', 'HLS', 'AI captions', 'Platform selection', 'OBS'],
} as const;

export function categoryLabel(key: CategoryKey, locale: Locale) {
  return locale === 'en' ? CATEGORIES_EN[key] : CATEGORIES[key];
}

export function articlePath(slug: string, locale: Locale = 'zh') {
  return locale === 'en' ? `/en/articles/${slug}/` : `/articles/${slug}/`;
}

export function categoryPath(key: CategoryKey, locale: Locale = 'zh') {
  return locale === 'en' ? `/en/category/${key}/` : `/category/${key}/`;
}

export function homePath(locale: Locale = 'zh') {
  return locale === 'en' ? '/en/' : '/';
}

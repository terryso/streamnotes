import type { CategoryKey } from '../consts';
import type { Locale } from '../lib/i18n';

/**
 * Category hub copy. Every guide entry must point to a real article in that category,
 * and every takeaway must restate facts already in that article (no new numbers).
 * `href` in steps: a path without the locale prefix (it is added at render time), or a full URL.
 */
export interface GuideItem { slug: string; q: string; a: string }
export interface Step { text: string; href?: string; link?: string }
export interface FaqItem { q: string; a: string }
export interface Hub {
  seoTitle: string;
  /** Meta description for the category page (who + concrete questions). */
  metaDesc: string;
  lead: string;
  guide: GuideItem[];
  steps: Step[];
  about: string[];
  /** Optional “what changed / what to do” fact boxes and FAQ (used heavily on news). */
  changes?: string[];
  faq?: FaqItem[];
  upcoming?: string[];
}

export const HUB_LABELS: Record<Locale, {
  start: string; steps: string; about: string; all: (n: number) => string; read: string;
  changes: string; faq: string; upcoming: string;
}> = {
  zh: {
    start: '从这里开始：哪篇文章回答哪个问题',
    steps: '现在可以做什么',
    about: '关于本栏目',
    all: (n) => `本栏目全部文章（${n} 篇）`,
    read: '阅读全文',
    changes: '最近值得关注的变化（可单独引用）',
    faq: '常见问题',
    upcoming: '编辑日历中已排期的行业动态选题',
  },
  en: {
    start: 'Start here: which article answers which question',
    steps: 'What to do now',
    about: 'About this topic',
    all: (n) => `All articles in this topic (${n})`,
    read: 'Read the article',
    changes: 'Recent changes worth quoting',
    faq: 'FAQ',
    upcoming: 'Industry-trend topics already on the editorial calendar',
  },
};

export const CATEGORY_PAGE: Record<Locale, Record<CategoryKey, Hub>> = {
  zh: {
    tutorial: {
      seoTitle: '技术教程：直播延迟、视频加密与 OBS 推流实操',
      metaDesc: '面向直播保障工程师、产品经理和自己开播的培训市场团队：直播延迟从哪里来、点播怎么加密防盗、OBS 码率分辨率与关键帧间隔怎么设。',
      lead: '「技术教程」用三篇实操文章回答直播与点播最常见的三个技术问题：延迟从哪里来、点播视频怎么防盗、OBS 推流参数怎么设。每篇都先给结论，再给可以照着做的检查清单。',
      guide: [
        { slug: 'live-latency-protocols', q: '为什么观众总比主播慢几秒？该选哪种协议？', a: '直播延迟是采集、编码、推流、转码、CDN 分发、播放缓冲各环节延迟的叠加，其中“切片等待 + 播放缓冲”往往占大头。传统 HLS 一般在十秒级，LL-HLS 可做到数秒，WebRTC 可做到亚秒级，但成本与并发扩展难度依次上升。' },
        { slug: 'vod-encryption-guide', q: '课程视频怎样防止被下载和转卖？', a: '没有“绝对防录屏”的方案，内容保护的目标是提高盗用成本，并能在泄露后追溯来源。推荐组合是：分片加密 + 带鉴权的密钥服务 + URL 签名防盗链 + 用户信息水印。' },
        { slug: 'obs-streaming-settings', q: 'OBS 的码率、分辨率和关键帧间隔怎么设？', a: '推流总码率（视频 + 音频）建议不超过稳定上行带宽的 60%～70%；关键帧间隔设为 2 秒是多数平台的通用要求；码率不够时，清晰稳定的 720p 往往比又糊又卡的 1080p 更好。' },
      ],
      steps: [
        { text: '第一次开播：先读 OBS 推流参数一文，按“先定码率、再定画面、最后定编码器”的顺序配置，再完整彩排一次。' },
        { text: '观众反馈延迟大：读直播延迟解析，先从分片时长和播放器缓冲入手，而不是先升级带宽。' },
        { text: '要上线付费课程或内部课程：读点播加密指南，确认密钥下发有鉴权，再决定是否需要商业 DRM。' },
        { text: '想比较平台而不是调参数：转到', link: '「方案选型」栏目', href: '/category/selection/' },
      ],
      about: [
        '本栏目适合负责直播保障的工程师、需要判断方案可行性的产品经理，以及自己动手开播的培训和市场团队。参考资料以公开标准和官方文档为主，例如 HLS 规范 RFC 8216、W3C 的 WebRTC 与 Encrypted Media Extensions、Apple 的 LL-HLS 与 FairPlay 开发文档，以及 OBS 官方帮助中心。',
      ],
    },
    selection: {
      seoTitle: '方案选型：企业直播与视频平台选型方法和清单',
      metaDesc: '面向 IT、采购与业务负责人：企业直播该选 SaaS、aPaaS、PaaS 还是私有化，评估看哪六个维度，金融政企是否一定要私有化。',
      lead: '「方案选型」不给厂商排名，只帮你回答一个问题：你的业务该用哪种交付模式——SaaS、aPaaS、PaaS（云服务 SDK）还是私有化部署，以及上线前怎样逐项验证。',
      guide: [
        { slug: 'enterprise-live-platform-selection', q: '企业直播平台怎么选？要比较哪些维度？', a: '先定场景再选平台。交付模式按“上线速度”到“控制力”排序依次为 SaaS、aPaaS、PaaS（云服务 SDK）、私有化部署；评估重点看场景匹配、集成能力、安全合规、并发与稳定性、互动与营销工具、总体拥有成本六项，并一定要用真实场景试播压测。' },
        { slug: 'enterprise-live-apaas', q: 'aPaaS 和 SaaS、PaaS 有什么区别？什么时候值得用？', a: 'aPaaS 介于标准 SaaS 与自研 SDK 之间：复用成熟直播能力，同时用低代码或组件把直播嵌进自有网站、App、小程序。它适合品牌定制要求高、需要与 CRM/OA/会员体系打通、又不想从零自研音视频底座的企业。' },
        { slug: 'private-deployment-polyv', q: '金融与政企单位建视频平台，一定要私有化吗？', a: '不一定。这类单位的核心诉求是安全合规、身份权限、内容可控和系统集成；建设路径从轻到重依次是标准 SaaS、SDK/API 深度集成、视频中台、完全私有化部署，应按数据驻留要求和业务规模逐级选择。' },
      ],
      steps: [
        { text: '先读选型清单，把培训、营销、会议、带货等场景排出优先级，再按六个维度写下需求。' },
        { text: '需要把直播嵌进自有 App、网站或小程序时，再读 aPaaS 一文，重点评估组件覆盖度、API/SDK 完整度和身份与数据对接能力。' },
        { text: '有数据驻留或内网要求时，读金融与政企一文，判断需要走到哪一级建设路径。' },
        { text: '验收时用真实场景试播压测，并让 IT、业务、法务一起参与；技术参数可参考', link: '「技术教程」栏目', href: '/category/tutorial/' },
      ],
      about: [
        '本栏目适合 IT 与信息安全负责人、采购和项目负责人，以及需要向管理层说明选型理由的业务团队。交付模式的划分参考 NIST SP 800-145 对云服务模式的定义。部分文章以某一厂商官网公开的资料为例说明评估方法，这类文章会在标题中注明，并只引用官网可查证的信息。',
      ],
    },
    industry: {
      seoTitle: '行业应用：企业培训与医学直播的落地实践',
      metaDesc: '面向培训、会务与医学教育团队：培训直播怎样避免听完就忘，手术示教画面怎么采集，医学直播的权限与合规要注意什么。',
      lead: '「行业应用」回答“直播在我的行业里具体怎么做”。目前覆盖企业培训和医学会议 / 手术示教两个场景，给出按时间线排列的执行流程、观众权限分级方法和需要核对的合规要点。',
      guide: [
        { slug: 'corporate-training-live', q: '培训直播怎样避免“开了播、没人听、听完没记住”？', a: '培训直播的成败一半在课前：明确目标学员、设计互动节点、提前彩排设备和网络。课中每 10～15 分钟设置一次提问、投票或小测，比单向讲授更能维持注意力；效果用柯氏四级模型（反应、学习、行为、结果）评估，而不只看观看人数。' },
        { slug: 'medical-conference-surgery-live', q: '手术示教直播的画面怎么采集？', a: '手术示教的画面主角是术野和腔镜、显微镜等医疗设备的视频信号，通常需要通过 SDI/HDMI 采集卡接入，而不是只靠一台摄像机拍屏幕；解说音频要单独拾音。' },
        { slug: 'medical-conference-surgery-live', q: '医学直播的权限和合规要注意什么？', a: '权限按“公开会议 / 注册医务人员 / 指定院内人员”分级，配合实名、白名单、水印和回放期限控制。患者的医疗健康信息属于敏感个人信息，示教前要取得知情同意并对画面去标识化；涉及处方药的内容只能面向医学药学专业人士。' },
      ],
      steps: [
        { text: '做内部培训：按企业培训一文的课前、课中、课后清单分工，明确讲师、主持 / 助教、技术支持和问答管理员。' },
        { text: '做医学会议或手术示教：先和手术室、设备科确认设备接口，再按观众类型设置权限分级。' },
        { text: '涉及法规的内容，执行前对照文末参考资料中的法规原文（如个人信息保护法、广告法）核实最新版本。' },
        { text: '需要推流、延迟或加密参数时，回到', link: '「技术教程」栏目', href: '/category/tutorial/' },
      ],
      about: [
        '本栏目适合培训负责人、活动与市场运营人员，以及医学教育和会务团队。效果评估方法引用柯氏模型的官方说明，法规部分链接到中国人大网、中国政府网等发布渠道的原文。',
      ],
    },
    news: {
      seoTitle: '行业动态：AI 字幕、内容标识与后续选题',
      metaDesc: '面向企业技术、产品与合规团队的行业动态：AI 字幕与摘要是否成熟、生成合成内容如何标识；已排期鸿蒙（HarmonyOS NEXT）音视频适配与数字人直播合规。',
      lead: '「行业动态」只回答一类问题：音视频技术或监管规则变了，企业直播和点播要不要改、怎么改。目前已发布 1 篇，讲清 AI 在直播与点播里哪些能力已经成熟、哪些仍需人工把关，以及生成合成内容标识怎么落实。编辑日历里还排了鸿蒙（HarmonyOS NEXT）对音视频应用开发的影响，以及数字人直播的授权、标识与审核要点。',
      guide: [
        { slug: 'ai-in-live-vod', q: 'AI 在直播和点播里，哪些能力已经可以上线？', a: '已经比较成熟、收益也清晰的，是语音识别字幕、内容摘要和章节划分，能明显降低把回放整理成可检索课程的成本。数字人主播、AI 助播和智能问答正在进入培训、客服和电商等场景，但内容质量仍需要人工把关。' },
        { slug: 'ai-in-live-vod', q: '直播或回放里用了 AI 生成合成内容，要不要标识？', a: '要。自 2025 年 9 月 1 日起施行的《人工智能生成合成内容标识办法》要求按规定添加标识。多模态审核可以对画面、语音和文字做自动筛查，适合做大规模直播的第一道合规防线，边界案例和申诉仍需人工复核。' },
        { slug: 'ai-in-live-vod', q: '企业第一次引入 AI 视频能力，建议从哪里开始？', a: '建议从收益明确、风险较低的环节入手：先上线回放自动字幕、智能章节和摘要，再逐步尝试 AI 助播、智能问答和数字人；数字人还需确认形象与声音授权，并对脚本做人工审核。' },
      ],
      changes: [
        '语音识别（ASR）仍是 AI 在视频领域最早、也最成熟的落地：直播实时字幕、多语言字幕，以及回放的 WebVTT / SRT 字幕文件。',
        '在字幕文本之上，大模型可以生成智能摘要、按主题划分章节时间轴，并把“看完就忘”的直播回放变成可检索的知识资产。',
        '多模态审核能对画面、语音和文字自动识别，适合做大规模直播的第一道筛查；AI 负责快速拦截，人工负责复核和边界判断，是目前更稳妥的组合。',
        '《人工智能生成合成内容标识办法》自 2025 年 9 月 1 日起施行；涉及数字人直播时，还需确保形象和声音获得合法授权，并对脚本内容进行人工审核，避免虚假宣传。',
        '实践建议（摘自已发布文章）：对外发布的回放字幕安排人工校对；提前导入行业术语、产品名称、嘉宾姓名等热词，可以减少识别错误；拾音质量决定识别上限，一支好麦克风往往比算法调参更有效。',
      ],
      faq: [
        { q: '这个栏目多久更新一次？', a: '全站按编辑日历每周二、周四、周六发布新文章，中英双语同步上线；行业动态文章穿插其中，不是每天转载新闻。' },
        { q: '和「行业应用」栏目有什么区别？', a: '「行业动态」写技术或规则变化对企业意味着什么；「行业应用」写培训、医学等场景里直播怎么落地。需要执行手册时转到行业应用，需要判断要不要改方案时看本栏目。' },
        { q: 'AI 实时字幕准确率够用吗？', a: '在发音清晰、背景噪音小的场景下通常可用，但专业术语、人名和方言容易出错。重要场合建议预先导入热词表，并安排人工校对回放字幕。' },
        { q: 'AI 能完全替代人工审核吗？', a: '目前不能。AI 适合做第一道快速筛查和实时拦截，对边界案例和申诉仍需要人工复核。' },
      ],
      upcoming: [
        '鸿蒙（HarmonyOS NEXT）对音视频应用开发的影响与适配要点——应用侧在推流、播放和权限上需要核对哪些变化。',
        '数字人直播的合规要点：授权、标识与内容审核——在《人工智能生成合成内容标识办法》背景下，形象与声音授权、内容标识和脚本审核分别怎么做。',
      ],
      steps: [
        { text: '评估要不要上 AI 字幕、摘要或数字人：先读已发布的 AI 一文，优先上线成熟能力，探索中的能力保留人工复核。' },
        { text: '负责合规或内容审核：对照文中链接的国家网信办通知原文，确认标识要求如何落到你的直播和回放流程。' },
        { text: '想第一时间看到新文章（含已排期的鸿蒙与数字人选题）：订阅', link: 'RSS', href: '/rss.xml' },
        { text: '需要培训或医学直播的执行清单，而不是趋势判断：转到', link: '「行业应用」栏目', href: '/category/industry/' },
      ],
      about: [
        '选题标准：只写对企业直播、点播有实际影响的技术或规则变化，不做新闻快讯转载；写法上区分已经成熟的能力和仍在特定场景中探索的能力。',
        '资料来源：已发布文章引用了国家网信办等四部门关于《人工智能生成合成内容标识办法》的通知原文，以及 W3C 的 WebVTT 字幕格式规范；凡涉及政策法规，都链接到发布机构原文，执行前请以最新官方文本为准。',
        '读者对象：需要规划技术路线的负责人、关注合规变化的法务与内容审核团队，以及想快速判断“这件事要不要改方案”的产品和运营人员。',
      ],
    },
  },
  en: {
    tutorial: {
      seoTitle: 'Live Streaming & VOD Tutorials',
      metaDesc: 'For live-ops engineers, product managers, and teams who stream themselves: where latency comes from, how to protect VOD, and how to set OBS bitrate, resolution, and keyframes.',
      lead: 'Tutorials answers the three most common technical questions in live streaming and VOD with three hands-on articles: where latency comes from, how to protect on-demand video, and how to configure OBS. Each one gives the conclusion first, then a checklist you can follow.',
      guide: [
        { slug: 'live-latency-protocols', q: 'Why are viewers always a few seconds behind, and which protocol should I use?', a: 'Live latency is the sum of delays from capture, encoding, ingest, transcoding, CDN delivery, and player buffering; segmenting plus player buffering is usually the biggest share. Traditional HLS typically runs at ten seconds or more, LL-HLS can get down to a few seconds, and WebRTC can reach sub-second latency—but cost and difficulty of scaling rise in that order.' },
        { slug: 'vod-encryption-guide', q: 'How do I stop course videos from being downloaded and resold?', a: 'No solution is truly screen-recording-proof; the goal is to raise the cost of piracy and make leaks traceable. The recommended combination is segment encryption + an authenticated key service + signed URLs for hotlink protection + user-identifying watermarks.' },
        { slug: 'obs-streaming-settings', q: 'How should I set bitrate, resolution, and keyframe interval in OBS?', a: 'Keep total streaming bitrate (video + audio) at or below 60–70% of your stable upload bandwidth; a 2-second keyframe interval is a common requirement across most platforms; and when bitrate is limited, sharp and stable 720p usually beats blurry, stuttering 1080p.' },
      ],
      steps: [
        { text: 'First broadcast: read the OBS settings guide and configure in the order bitrate, then picture, then encoder—then do a full rehearsal.' },
        { text: 'Viewers complain about delay: read the latency explainer and start with segment duration and player buffering, not more bandwidth.' },
        { text: 'Launching paid or internal courses: read the VOD encryption guide, make sure key delivery is authenticated, then decide whether you need commercial DRM.' },
        { text: 'Comparing platforms rather than tuning settings? Go to', link: 'Platform selection', href: '/category/selection/' },
      ],
      about: [
        "This topic is for engineers who keep live events running, product managers judging feasibility, and training or marketing teams who run their own streams. Sources are mainly public standards and official documentation—for example the HLS specification RFC 8216, W3C WebRTC and Encrypted Media Extensions, Apple's LL-HLS and FairPlay developer documentation, and the official OBS Help Portal.",
      ],
    },
    selection: {
      seoTitle: 'Video Platform Selection Guides & Checklists',
      metaDesc: 'For IT, procurement, and business owners: choose SaaS, aPaaS, PaaS, or private deployment; the six evaluation areas; whether finance and government must deploy privately.',
      lead: "Platform selection doesn't rank vendors. It helps you answer one question: which delivery model fits your business—SaaS, aPaaS, PaaS (cloud service SDKs), or private deployment—and how to verify it item by item before launch.",
      guide: [
        { slug: 'enterprise-live-platform-selection', q: 'How do I choose an enterprise live streaming platform, and what should I compare?', a: 'Define the scenario before choosing the platform. Ordered from fastest to launch to most control, the delivery models are SaaS, aPaaS, PaaS (cloud service SDKs), and private deployment. Evaluate six areas—scenario fit, integration, security and compliance, concurrency and stability, interaction and marketing tools, and total cost of ownership—and always run a trial broadcast and load test with a real scenario.' },
        { slug: 'enterprise-live-apaas', q: 'How is aPaaS different from SaaS and PaaS, and when is it worth it?', a: 'aPaaS sits between standard SaaS and an in-house SDK build: it reuses mature live streaming capabilities while low-code tools or components embed live video in your own website, app, or mini program. It suits companies with high branding requirements that need to connect CRM, OA, or membership systems without building an audio/video foundation from scratch.' },
        { slug: 'private-deployment-polyv', q: 'Do finance and government organizations have to deploy privately?', a: 'Not necessarily. Their core needs are security and compliance, identity and permissions, content control, and system integration. From lightest to heaviest, the build paths are standard SaaS, deep SDK/API integration, a video middle platform, and full private deployment—step up according to data-residency requirements and business scale.' },
      ],
      steps: [
        { text: 'Start with the selection checklist: rank your scenarios (training, marketing, meetings, live commerce) and write requirements against the six areas.' },
        { text: 'If live video must live inside your own app, website, or mini program, read the aPaaS article and focus on component coverage, API/SDK completeness, and identity and data integration.' },
        { text: 'If you have data-residency or intranet requirements, read the finance and government article to decide how far along the build path you need to go.' },
        { text: 'For acceptance, run a real-scenario trial and load test with IT, business, and legal involved; for technical parameters see', link: 'Tutorials', href: '/category/tutorial/' },
      ],
      about: [
        "This topic is for IT and security leads, procurement and project owners, and business teams who need to justify a choice to management. The delivery-model definitions follow NIST SP 800-145, the NIST definition of cloud service models. Some articles use one vendor's officially published materials as a worked example; those articles say so in the title and cite only information that can be verified on the vendor's own site.",
      ],
    },
    industry: {
      seoTitle: 'Live Streaming Use Cases: Training & Healthcare',
      metaDesc: 'For training, event, and medical-education teams: how to run a training livestream that sticks, how surgical teaching video is captured, and medical access and compliance rules.',
      lead: 'Industry use cases answers “how do we actually run live video in our field?” It currently covers corporate training and medical conferences / surgical teaching, with step-by-step workflows, viewer access tiers, and the compliance points to check.',
      guide: [
        { slug: 'corporate-training-live', q: 'How do we avoid “we went live, nobody listened, and nobody remembered anything”?', a: "Half of a training livestream's success is decided before it starts: define the target learners, design interaction points, and rehearse equipment and network. Adding an interaction every 10–15 minutes (questions, polls, quick quizzes) holds attention far better than one-way lecturing, and impact should be measured with the Kirkpatrick four-level model—reaction, learning, behavior, results—not just headcount." },
        { slug: 'medical-conference-surgery-live', q: 'How is surgical teaching video captured?', a: 'Surgical teaching is driven by OR and device video—endoscope, microscope, ultrasound—usually brought in through SDI/HDMI capture, not by pointing a camera at a monitor. Commentary audio should be miked separately.' },
        { slug: 'medical-conference-surgery-live', q: 'What access control and compliance do medical livestreams need?', a: 'Tier access by public / verified clinicians / named in-hospital staff, plus identity checks, allowlists, watermarks, and limited replay windows. Health data is sensitive personal information: obtain informed consent and de-identify the frame before teaching, and keep prescription-drug content limited to medical and pharmacy professionals.' },
      ],
      steps: [
        { text: 'Internal training: use the before / during / after checklists in the training article and assign the instructor, host or TA, technical support, and Q&A moderator.' },
        { text: 'Medical conference or surgical teaching: confirm device interfaces with the OR and equipment teams first, then set access tiers by audience type.' },
        { text: "Anything involving regulation: check the original legal texts linked in the article's sources (such as China's Personal Information Protection Law and Advertising Law) for the latest version before acting." },
        { text: 'Need ingest, latency, or encryption settings? Go back to', link: 'Tutorials', href: '/category/tutorial/' },
      ],
      about: [
        'This topic is for training managers, event and marketing operations staff, and medical education and conference teams. The evaluation method cites the official description of the Kirkpatrick Model, and regulatory points link to the original texts on official Chinese government publishing sites.',
      ],
    },
    news: {
      seoTitle: 'AI Captions, Content Labeling & Upcoming Topics',
      metaDesc: "For enterprise tech, product, and compliance teams: which AI video capabilities are mature (captions, summaries, chapters), how China's AI-generated content labeling rules apply, and upcoming HarmonyOS NEXT and digital-human livestream topics.",
      lead: "Industry trends answers one kind of question: when video technology or regulation changes, does your live streaming or VOD setup need to change, and how? One article is live today—it separates AI capabilities that are already mature in live streaming and VOD from those that still need human oversight, and explains how AI-generated content labeling works in practice. The editorial calendar also schedules HarmonyOS NEXT's impact on audio/video apps, and compliance points for digital-human livestreams (authorization, labeling, and review).",
      guide: [
        { slug: 'ai-in-live-vod', q: 'Which AI capabilities in live streaming and VOD are ready to ship?', a: 'The mature, clear-ROI options are speech-recognition captions, content summaries, and chapter segmentation—they cut the cost of turning replays into searchable courses. Digital-human hosts, AI co-hosts, and intelligent Q&A are entering training, customer service, and e-commerce, but content quality still needs human oversight.' },
        { slug: 'ai-in-live-vod', q: 'Must AI-generated or synthetic content in a livestream be labeled?', a: 'In China, yes. The Measures for Labeling AI-Generated and Synthetic Content, in force since September 1, 2025, require prescribed labeling. Multimodal moderation can auto-screen images, speech, and text as a first compliance line for large-scale live streaming; edge cases and appeals still need human review.' },
        { slug: 'ai-in-live-vod', q: 'Where should a company start with AI video features?', a: 'Start where payoff is clear and risk is lower: roll out automatic captions, smart chapters, and summaries on replays first, then try AI co-hosts, Q&A, and digital humans. For digital humans, confirm legal authorization of likeness and voice, and review scripts by hand.' },
      ],
      changes: [
        'Speech recognition (ASR) is still the earliest and most mature AI landing in video: live real-time captions, multilingual captions, and WebVTT / SRT caption files for replays.',
        'On top of caption text, large models can produce summaries and chapter timelines, turning “watch and forget” replays into searchable knowledge assets.',
        'Multimodal moderation can screen images, speech, and text automatically—useful as a first pass for large-scale live streams. The safer combination today is AI for fast interception and humans for review and edge cases.',
        "China's Measures for Labeling AI-Generated and Synthetic Content took effect on September 1, 2025. Digital-human livestreams also need lawful authorization of likeness and voice, plus human review of scripts to avoid false advertising.",
        'Practical tips from the published article: have humans proofread captions before public release; preload hotwords (product names, guest names, jargon) to cut recognition errors; microphone quality often caps accuracy more than algorithm tuning.',
      ],
      faq: [
        { q: 'How often does this topic update?', a: 'The site publishes new articles every Tuesday, Thursday, and Saturday on the editorial calendar, in Chinese and English at the same time. Trend pieces are mixed into that cadence; we do not republish daily news briefs.' },
        { q: 'How is this different from Industry use cases?', a: 'Industry trends explains what a technology or rule change means for the business. Industry use cases explains how to run livestreams in training, medicine, and similar scenarios. Use use cases for playbooks; use this topic to decide whether to change your approach.' },
        { q: 'Are AI live captions accurate enough?', a: 'They are usually usable when speech is clear and background noise is low, but jargon, names, and dialects still fail often. For important events, preload a hotword list and proofread replay captions.' },
        { q: 'Can AI fully replace human moderation?', a: 'Not yet. AI is suited to a fast first pass and real-time interception; edge cases and appeals still need human review.' },
      ],
      upcoming: [
        'How HarmonyOS NEXT affects audio/video app development and what to check on the app side for ingest, playback, and permissions.',
        'Compliance for digital-human livestreams—authorization, labeling, and content review—under the AI-generated content labeling measures: how likeness/voice authorization, content labels, and script review each work.',
      ],
      steps: [
        { text: 'Deciding on AI captions, summaries, or digital humans: read the published AI article first; ship mature capabilities, keep human review on experimental ones.' },
        { text: 'If you own compliance or moderation: check the Cyberspace Administration of China notice linked in the article and map labeling onto your live and replay workflows.' },
        { text: 'To catch new articles (including the scheduled HarmonyOS and digital-human topics), subscribe via', link: 'RSS', href: '/rss.xml' },
        { text: 'Need a training or medical playbook rather than a trend read? Go to', link: 'Industry use cases', href: '/category/industry/' },
      ],
      about: [
        'What we pick: only technology or rule changes with a practical effect on enterprise live streaming and VOD—no repackaged news briefs. Articles separate mature capabilities from those still being explored in specific scenarios.',
        "Sources: the published article cites the Cyberspace Administration of China notice on the Measures for Labeling AI-Generated and Synthetic Content, and the W3C WebVTT specification. Policy points link to the issuing body's original text; always check the latest official version before acting.",
        'Who it is for: leaders planning a technology roadmap, legal and content-review teams watching regulatory change, and product and operations staff who need a quick read on whether to change course.',
      ],
    },
  },
};

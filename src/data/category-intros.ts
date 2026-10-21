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
  changes?: (string | { text: string; slug: string })[];
  faq?: FaqItem[];
  upcoming?: string[];
  /** Side-by-side comparison table and per-article checklists (facts from the linked articles only). */
  table?: { caption: string; head: string[]; rows: string[][] };
  checklists?: { title: string; slug: string; items: string[] }[];
}

export const HUB_LABELS: Record<Locale, {
  start: string; steps: string; about: string; all: (n: number) => string; read: string;
  changes: string; faq: string; upcoming: string; source: string;
}> = {
  zh: {
    start: '从这里开始：哪篇文章回答哪个问题',
    steps: '现在可以做什么',
    about: '关于本栏目',
    all: (n) => `本栏目全部文章（${n} 篇）`,
    read: '阅读全文',
    changes: '关键要点与近期变化（可单独引用）',
    source: '来源',
    faq: '常见问题',
    upcoming: '编辑日历中已排期的行业动态选题',
  },
  en: {
    start: 'Start here: which article answers which question',
    steps: 'What to do now',
    about: 'About this topic',
    all: (n) => `All articles in this topic (${n})`,
    read: 'Read the article',
    changes: 'Key takeaways and recent changes',
    source: 'Source',
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
      seoTitle: "行业应用：企业培训与医学直播的落地实践",
      metaDesc: "面向企业培训负责人、会务与医学教育团队：培训直播怎样避免听完就忘、怎么评估效果，手术示教画面怎么采集，医学直播权限如何分级、患者隐私与药品内容有哪些合规要求。",
      lead: "「行业应用」的结论很直接：直播在具体行业里做不好，问题通常不在推流，而在流程、权限和合规。本栏目目前有 2 篇按时间线写成的执行指南——企业培训直播讲“设计—交付—沉淀—评估”的完整闭环，医学会议与手术示教直播讲画质、权限、合规三关；编辑日历里还排了 B2B 网络研讨会获客、金融私域直播和出海直播三个场景。",
      changes: [{"text": "培训直播不是把线下课搬到镜头前，而是一套“设计—交付—沉淀—评估”的完整流程；成败一半在课前：明确目标学员、设计互动节点、提前彩排设备和网络。", "slug": "corporate-training-live"}, {"text": "培训目标要先回答三个问题：谁来学、学完要会什么、如何衡量。课中建议每 10～15 分钟安排一次投票、随堂小测或连麦提问，比单向讲授更能维持注意力。", "slug": "corporate-training-live"}, {"text": "柯氏四级模型（反应、学习、行为、结果）是常用的培训评估框架；线上直播的前两层数据可以自动采集，后两层需要与业务部门合作持续追踪。", "slug": "corporate-training-live"}, {"text": "手术示教的画面主角是腔镜、显微镜、超声、DSA 等设备的视频信号，常见接口是 SDI 或 HDMI；用采集卡直接接入，比用摄像机对着屏幕拍清晰得多，也没有反光和摩尔纹。", "slug": "medical-conference-surgery-live"}, {"text": "医学直播常常是“同一场活动、不同的观众”：按公开、专业人士、指定人员三级授权，再叠加观看者信息水印、回放有效期、关闭下载和加密播放。", "slug": "medical-conference-surgery-live"}, {"text": "按《个人信息保护法》第二十八条，医疗健康信息属于敏感个人信息，第二十九条要求取得个人单独同意；《广告法》第十五条规定其他处方药只能在指定的医学、药学专业刊物上作广告，产品相关环节应只对已核验身份的专业人士开放。", "slug": "medical-conference-surgery-live"}],
      guide: [{"slug": "corporate-training-live", "q": "培训直播怎样避免“开了播、没人听、听完没记住”？", "a": "课前明确目标学员并彩排设备和网络，开播前一天和开播前 15 分钟各提醒一次；课中每 10～15 分钟安排一次互动；课后把回放剪成按知识点划分、带章节和字幕的短视频，放进知识库，并安排测验或实践作业。"}, {"slug": "corporate-training-live", "q": "培训直播的效果怎么评估？看哪些数据？", "a": "用柯氏四级模型分层评估，而不只看观看人数。直播可直接拿到到课率、平均观看时长、观看完成率、互动参与率、测验正确率及错题分布、满意度评分；行为层和结果层需要主管观察和业务数据跟踪。"}, {"slug": "corporate-training-live", "q": "内部培训视频怎样防止外泄？", "a": "设置企业身份授权或白名单等观看权限，开启水印与防录屏等内容保护功能，回放采用加密播放并限制下载。"}, {"slug": "medical-conference-surgery-live", "q": "手术示教直播一定要 4K 吗？画面和声音怎么保证？", "a": "不一定。设备本身输出 1080p 时强行升到 4K 没有意义，多数场景下稳定的 1080p 加充足码率更实用；术野机位要手动锁定曝光和白平衡，主刀和解说人员佩戴无线领夹或头戴麦克风，重要示教准备主备两条网络、两路编码并本地全程录制。"}, {"slug": "medical-conference-surgery-live", "q": "医学会议直播可以完全公开吗？患者信息怎么处理？", "a": "学术报告、科普讲座可以公开；含真实病例、手术画面或处方药相关内容的环节，只对经过身份核验的医务人员开放。示教前取得患者知情同意，遮挡监护仪、影像系统、病历屏幕上的姓名、住院号、床号，患者面部原则上不入镜。"}],
      faq: [{"q": "「行业应用」和「技术教程」「方案选型」有什么区别？", "a": "技术教程讲参数和原理（延迟、加密、OBS 设置），方案选型讲交付模式和平台怎么比，行业应用讲某个场景里一场直播从筹备到复盘具体怎么执行。三者可以配合读：先用本栏目确定流程和权限要求，再到另外两个栏目找技术参数和选型维度。"}, {"q": "涉及法规的内容怎么处理？", "a": "只写法规原文里明确的要求，并在文末链接中国人大网、中国政府网等发布渠道的原文，例如《个人信息保护法》《广告法》和药品医疗器械广告审查办法。本站不提供法律意见，具体边界请由医院或企业的法务、合规部门把关，执行前以最新官方文本为准。"}, {"q": "本栏目会给直播平台或服务商排名吗？", "a": "不会。文章只给出流程、检查清单和评估要点，例如培训平台是否具备权限控制、互动工具、回放加密和学习数据能力；具体选哪家，建议结合自身流程挑选几家试用对比。"}, {"q": "多久更新一次？", "a": "全站按编辑日历每周二、周四、周六发布新文章，中英双语同步上线，行业应用文章穿插其中；下方列出了已排期的选题。"}],
      table: {"caption": "两个场景对照（摘自两篇文章）", "head": ["对比项", "企业培训直播", "医学会议与手术示教"], "rows": [["核心目标", "学员学会并用上，而不只是看完", "看得清、谁能看、什么能播"], ["主要画面", "讲师、课件分享、嘉宾连麦", "腔镜、显微镜等设备信号（SDI / HDMI），术野与全景机位，解说画面"], ["观看权限", "企业身份授权或白名单，只允许内部员工或指定名单", "公开 / 专业人士（实名 + 执业核验或机构白名单）/ 指定人员（院内账号、IP 或单位白名单）"], ["互动方式", "投票、随堂小测、案例讨论、连麦提问", "大规模观看用 HLS / FLV，嘉宾实时问答用 WebRTC 低延迟连线"], ["合规重点", "培训视频防外泄：水印、加密播放、限制下载", "敏感个人信息与单独同意、画面去标识化、处方药内容只对专业人士"], ["效果评估", "柯氏四级：反应、学习、行为、结果", "观看记录留存，便于学分统计和事后追溯"]]},
      checklists: [{"title": "培训直播开播前检查", "slug": "corporate-training-live", "items": ["目标：谁来学、学完要会什么、如何衡量", "报名链接设置观看权限", "开播前一天、前 15 分钟各提醒一次", "提前发布大纲和预习材料", "推流电脑走有线网络，备 4G / 5G 热点", "麦克风优先于摄像头", "至少提前一天完整彩排", "分工：讲师、主持 / 助教、技术支持、问答管理员", "约定断流、讲师掉线、课件无法播放的应急流程"]}, {"title": "医学直播开播前检查", "slug": "medical-conference-surgery-live", "items": ["与手术室、设备科确认 SDI / HDMI 接口", "设备和线缆摆放提前沟通，不临场搭建", "画中画：设备画面为主、术野为辅", "术野机位手动锁定曝光和白平衡", "主刀与解说佩戴领夹或头戴麦克风", "主备两条网络、两路编码，本地全程录制", "按三级设置权限，加观看者信息水印", "回放设有效期并关闭下载", "患者知情同意书已签署", "遮挡姓名、住院号、床号，面部不入镜", "产品相关环节只对已核验专业人士开放"]}],
      upcoming: ["B2B 网络研讨会（Webinar）获客全流程：报名、直播、留资到线索跟进。", "银行与证券私域直播怎么做：从合规审核到客户运营。", "出海直播：海外观众访问、跨境网络与多语言字幕的实践建议。"],
      steps: [{"text": "下周要办内部培训：按企业培训一文的课前清单，用一句话写下“谁来学、学完要会什么、如何衡量”，分好讲师、主持 / 助教、技术支持、问答管理员四个角色，并至少提前一天完整彩排一次。"}, {"text": "培训结束后：把到课率、观看完成率、互动参与率和测验错题分布整理成复盘表，对照柯氏四级模型补上行为层和结果层的跟踪计划。"}, {"text": "筹备医学会议或手术示教：先和手术室、设备科确认 SDI/HDMI 接口和设备摆放，再按公开、专业人士、指定人员三级设置权限，把患者知情同意和画面去标识化写进开播检查清单。"}, {"text": "需要码率、延迟或回放加密参数时，转到", "link": "「技术教程」栏目", "href": "/category/tutorial/"}],
      about: ["本栏目适合培训负责人、活动与市场运营人员，以及医学教育和会务团队。效果评估方法引用柯氏模型（Kirkpatrick Partners）的官方说明，法规部分链接到中国人大网、中国政府网等发布渠道的原文。"],
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
      seoTitle: "Live Streaming Use Cases: Training & Healthcare",
      metaDesc: "For corporate training leads, event teams, and medical educators: how to run training livestreams people remember and measure them, how surgical teaching video is captured, how to tier medical viewer access, and patient-privacy and drug-content rules.",
      lead: "The short version: when live video fails in a real industry setting, the problem is rarely the stream itself—it is the workflow, access control, and compliance. This topic currently holds two step-by-step guides: corporate training livestreams (the full design, delivery, capture, and evaluation loop) and medical conferences / surgical teaching (image quality, access control, and compliance). The editorial calendar also schedules B2B webinar lead generation, private-domain livestreams for banks and securities firms, and cross-border livestreaming.",
      changes: [{"text": "A training livestream is not an in-person class moved in front of a camera; it is a full design, delivery, capture, and evaluation process. Half of its success is decided before it starts: define the learners, design interaction points, and rehearse equipment and network.", "slug": "corporate-training-live"}, {"text": "Start training design with three questions: who is learning, what should they be able to do afterward, and how will you measure it. During the session, add a poll, quick quiz, or co-streamed question every 10–15 minutes.", "slug": "corporate-training-live"}, {"text": "The Kirkpatrick four-level model (reaction, learning, behavior, results) is a common evaluation framework; livestreams capture the first two levels automatically, while the last two need tracking with business teams.", "slug": "corporate-training-live"}, {"text": "Surgical teaching is driven by device video—endoscope, microscope, ultrasound, DSA—usually via SDI or HDMI. Capturing it directly is far sharper than pointing a camera at a monitor, with no glare or moiré.", "slug": "medical-conference-surgery-live"}, {"text": "Medical livestreams are often “one event, different audiences”: tier access as public, verified professionals, and named staff, then add viewer-identifying watermarks, replay expiry, disabled downloads, and encrypted playback.", "slug": "medical-conference-surgery-live"}, {"text": "Under China’s Personal Information Protection Law, health information is sensitive personal information and generally requires separate consent; China’s Advertising Law limits prescription-drug ads to designated medical/pharmacy publications, so product segments should be gated to verified professionals.", "slug": "medical-conference-surgery-live"}],
      guide: [{"slug": "corporate-training-live", "q": "How do we avoid “we went live, nobody listened, and nobody remembered anything”?", "a": "Define the learners and rehearse equipment and network beforehand, and send reminders the day before and 15 minutes before the start. Add an interaction every 10–15 minutes. Afterwards, cut the replay into short, chaptered, captioned clips by topic for the knowledge base, and assign a quiz or practical task."}, {"slug": "corporate-training-live", "q": "How do we measure a training livestream, and which data matter?", "a": "Use the Kirkpatrick four levels rather than headcount alone. The stream gives you attendance, average watch time, completion rate, interaction rate, quiz accuracy and wrong-answer spread, and satisfaction scores; behavior and results need manager observation and business data over time."}, {"slug": "corporate-training-live", "q": "How do we keep internal training videos from leaking?", "a": "Restrict viewing with enterprise identity or allowlists, turn on watermarks and anti-recording protection, use encrypted playback for replays, and limit downloads."}, {"slug": "medical-conference-surgery-live", "q": "Does surgical teaching need 4K, and how do we protect picture and sound?", "a": "Not necessarily. Upscaling a 1080p device feed to 4K adds nothing; stable 1080p with ample bitrate is more practical in most cases. Lock exposure and white balance on the surgical-field camera, put wireless lavalier or headset mics on the surgeon and commentator, and for important sessions run primary and backup networks and encoders while recording locally."}, {"slug": "medical-conference-surgery-live", "q": "Can a medical conference be fully public, and how is patient information handled?", "a": "Academic talks and public-education sessions can be public; segments with real cases, surgical footage, or prescription-drug content should be limited to verified clinicians. Obtain patient consent, mask names and record or bed numbers on monitors, imaging systems, and chart screens, and keep the patient’s face out of frame."}],
      faq: [{"q": "How is this topic different from Tutorials and Platform selection?", "a": "Tutorials covers parameters and principles (latency, encryption, OBS settings); Platform selection covers delivery models and how to compare platforms; Industry use cases covers how one event in a given setting runs from planning to review. Use this topic for workflow and access requirements, then the other two for technical settings and selection criteria."}, {"q": "How are compliance topics handled?", "a": "We describe only requirements stated in the original legal texts and link to them on official publishing sites, such as China’s Personal Information Protection Law, Advertising Law, and drug and medical-device advertising review measures. This is not legal advice: let hospital or company legal and compliance teams set boundaries, and check the latest official text before acting."}, {"q": "Do you rank platforms or vendors here?", "a": "No. Articles give workflows, checklists, and evaluation points—for example whether a training platform offers access control, engagement tools, replay encryption, and learning data. To choose a provider, shortlist a few and run trials against your own workflow."}, {"q": "How often is it updated?", "a": "The site publishes new articles every Tuesday, Thursday, and Saturday on the editorial calendar, in Chinese and English at the same time, with use-case pieces mixed in; scheduled topics are listed below."}],
      table: {"caption": "The two scenarios side by side (from the two articles)", "head": ["Aspect", "Corporate training livestream", "Medical conference & surgical teaching"], "rows": [["Core goal", "Learners can apply it, not just finish watching", "Clear picture, right audience, permitted content"], ["Main video", "Instructor, shared slides, co-streamed guests", "Device feeds such as endoscope or microscope (SDI / HDMI), surgical-field and overview cameras, commentary"], ["Viewer access", "Enterprise identity or allowlist; internal staff or named lists only", "Public / professionals (real-name plus license check or institution allowlist) / named staff (hospital accounts, IP or organization allowlist)"], ["Interaction", "Polls, quick quizzes, case discussion, co-streamed questions", "HLS / FLV for large audiences; WebRTC low-latency links for real-time guest Q&A"], ["Compliance focus", "Prevent leaks: watermarks, encrypted playback, limited downloads", "Sensitive personal information and separate consent, on-screen de-identification, prescription-drug content for professionals only"], ["Evaluation", "Kirkpatrick four levels: reaction, learning, behavior, results", "Keep viewing records for CME credits and later tracing"]]},
      checklists: [{"title": "Training livestream pre-flight", "slug": "corporate-training-live", "items": ["Goal: who learns, what they can do afterward, how it is measured", "Registration link with viewing permissions", "Reminders the day before and 15 minutes before", "Outline and prep materials published in advance", "Wired network for the streaming PC, plus a 4G / 5G hotspot backup", "Microphone before camera", "Full rehearsal at least a day ahead", "Roles: instructor, host or TA, technical support, Q&A moderator", "Agreed plan for stream drops, instructor disconnects, and slides failing"]}, {"title": "Medical livestream pre-flight", "slug": "medical-conference-surgery-live", "items": ["Confirm SDI / HDMI interfaces with the OR and equipment teams", "Agree equipment and cable placement in advance; no on-the-day setup", "Picture-in-picture: device feed main, surgical field secondary", "Lock exposure and white balance on the surgical-field camera", "Lavalier or headset mics for surgeon and commentator", "Primary and backup networks and encoders, plus full local recording", "Three access tiers and viewer-identifying watermarks", "Replay expiry set and downloads disabled", "Patient consent obtained", "Names and record or bed numbers masked; face out of frame", "Product segments limited to verified professionals"]}],
      upcoming: ["B2B webinar lead generation, end to end: registration, the live session, lead capture, and follow-up.", "Private-domain livestreams for banks and securities firms: from compliance review to customer engagement.", "Cross-border livestreaming: overseas viewer access, cross-border networking, and multilingual captions."],
      steps: [{"text": "Running internal training next week: following the pre-session checklist in the training article, write one sentence on who is learning, what they should be able to do, and how you will measure it; assign instructor, host or TA, technical support, and Q&A moderator; and do a full rehearsal at least a day ahead."}, {"text": "After the session: put attendance, completion rate, interaction rate, and quiz wrong-answer spread into a review sheet, and add a tracking plan for the Kirkpatrick behavior and results levels."}, {"text": "Preparing a medical conference or surgical teaching session: confirm SDI/HDMI interfaces and equipment placement with the OR and equipment teams, set the three access tiers, and add patient consent and on-screen de-identification to your go-live checklist."}, {"text": "Need bitrate, latency, or replay-encryption settings? Go to", "link": "Tutorials", "href": "/category/tutorial/"}],
      about: ["This topic is for training managers, event and marketing operations staff, and medical education and conference teams. The evaluation method cites the official description of the Kirkpatrick Model (Kirkpatrick Partners), and regulatory points link to the original texts on official Chinese government publishing sites."],
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

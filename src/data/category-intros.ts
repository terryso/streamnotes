import type { CategoryKey } from '../consts';
import type { Locale } from '../lib/i18n';

/**
 * Category landing-page copy: a longer <title> text and an intro that describes
 * what the category actually contains (keep in sync with the real articles).
 */
export const CATEGORY_PAGE: Record<Locale, Record<CategoryKey, { seoTitle: string; intro: string[] }>> = {
  zh: {
    tutorial: {
      seoTitle: '技术教程：直播延迟、视频加密与 OBS 推流实操',
      intro: [
        '「技术教程」收录直播与点播链路上可以动手验证的技术讲解，重点回答两个问题：为什么要这样设置，以及怎样检查设置是否生效。目前的文章围绕三条主线展开。',
        '一是直播延迟：从采集、编码、推流、转码、分发到播放逐段拆解延迟来源，对比 RTMP、HLS、LL-HLS、WebRTC、SRT 等协议的典型延迟与适用场景。二是点播内容保护：说明传输与存储加密、HLS AES-128 与 SAMPLE-AES、商业 DRM、URL 鉴权防盗链和数字水印分别防范什么风险，以及不同业务怎样组合使用。三是推流端配置：以 OBS 为例，讲解如何按上行带宽确定码率、分辨率与帧率怎么取舍、关键帧间隔为何常设为 2 秒，以及软件编码与硬件编码器的选择。',
        '本栏目适合负责直播保障的工程师、需要判断方案可行性的产品经理，以及自己动手开播的培训和市场团队。每篇文章都附有要点摘要、常见问题和参考资料，参考资料以公开标准与官方文档为主，便于对照原文核实。',
      ],
    },
    selection: {
      seoTitle: '方案选型：企业直播与视频平台选型方法和清单',
      intro: [
        '「方案选型」帮助企业在采购或自建直播、点播平台之前，把需求说清楚、把方案比明白。这里的文章不给出“哪家最好”的排名，而是提供可以直接拿去评审的维度和问题清单。',
        '目前收录的内容包括：一份企业直播平台选型清单，从业务场景、集成深度、数据安全、并发与稳定性、互动与营销能力、成本六个维度展开，并对比 SaaS、aPaaS、PaaS 与私有化部署四种交付模式；一篇 aPaaS 解读，说明它与 SaaS、PaaS 的区别，以及低代码搭建自有品牌直播间的适用场景、评估要点和接入步骤；一篇面向金融与政企单位的指南，梳理安全合规、身份权限、内容可控与系统集成等诉求，比较标准 SaaS、SDK 集成、视频中台与完全私有化四种建设路径。',
        '本栏目适合 IT 与信息安全负责人、采购和项目负责人，以及需要向管理层说明选型理由的业务团队。涉及具体厂商时，只引用其官网公开、可查证的信息，并在标题或正文中注明。',
      ],
    },
    industry: {
      seoTitle: '行业应用：企业培训与医学直播的落地实践',
      intro: [
        '「行业应用」关注直播和点播在具体业务场景中怎样落地：一场活动从筹备到复盘需要做哪些事，哪些环节最容易出问题，行业规范对直播提出了哪些额外要求。',
        '目前收录两篇实操指南。企业培训直播一文按时间顺序梳理培训需求与形式设计、课前报名与设备彩排、课中互动与控场、课后回放与知识沉淀，并介绍如何用柯氏四级模型评估培训效果。医学会议与手术示教直播一文面向医院、学会和医学教育机构，讲解手术示教信号如何采集、画质与色彩怎样保证、观众权限如何分级，以及患者隐私、知情同意和处方药推广内容在直播中需要注意的合规要点。',
        '本栏目适合培训负责人、活动与市场运营人员、医学教育和会务团队。文章中的流程和清单可以直接改写为内部执行手册；涉及法规的部分附有原文出处，执行前请以最新官方文本为准。',
      ],
    },
    news: {
      seoTitle: '行业动态：音视频技术与企业直播趋势观察',
      intro: [
        '「行业动态」记录音视频技术和企业直播领域值得关注的变化，包括新技术进入实际应用的程度，以及新出台的规范对直播、点播业务的影响。与新闻快讯不同，这里的文章更关注“这件事对企业意味着什么、需要提前做哪些准备”。',
        '目前收录的文章梳理了 AI 在直播与点播中的主要落地方向：语音识别字幕与翻译、内容摘要与章节、智能剪辑、数字人主播、多模态内容审核与智能问答，并提醒企业关注生成合成内容标识等合规要求。文章区分了已较成熟的能力（如语音识别字幕、摘要与章节）和仍在特定场景中探索的能力（如数字人与智能问答）。',
        '本栏目适合需要规划年度技术路线的负责人、关注合规变化的法务与内容审核团队，以及想快速了解行业方向的产品和运营人员。趋势类文章同样列出参考资料，凡涉及政策法规，都链接到发布机构的原文。',
      ],
    },
  },
  en: {
    tutorial: {
      seoTitle: 'Live Streaming & VOD Tutorials',
      intro: [
        'Tutorials collects hands-on explanations of the live streaming and video-on-demand pipeline that you can verify yourself. Each guide answers two questions: why a setting is recommended, and how to check that it is actually working. The current articles follow three threads.',
        'The first is live latency: we break down where delay comes from at each stage—capture, encoding, ingest, transcoding, delivery, and playback—and compare the typical latency and best-fit use cases of RTMP, HLS, LL-HLS, WebRTC, and SRT. The second is VOD content protection: what transport and storage encryption, HLS AES-128 and SAMPLE-AES, commercial DRM, signed-URL hotlink protection, and watermarking each defend against, and how to combine them. The third is encoder setup: using OBS as the example, how to size bitrate to your upload bandwidth, trade off resolution and frame rate, why a 2-second keyframe interval is the common recommendation, and when to choose software or hardware encoders.',
        'These guides are written for engineers who keep live events running, product managers judging technical feasibility, and training or marketing teams who run their own streams. Every article includes a TL;DR, an FAQ, and a source list based mainly on public standards and official documentation.',
      ],
    },
    selection: {
      seoTitle: 'Video Platform Selection Guides & Checklists',
      intro: [
        'Platform selection helps organizations define their requirements and compare options before buying or building a live streaming or VOD platform. Instead of ranking vendors, these articles give you evaluation criteria and question lists you can take straight into a review meeting.',
        'The current articles include an enterprise live streaming selection checklist covering six dimensions—business scenario, integration depth, data security, concurrency and stability, engagement and marketing features, and cost—with a comparison of SaaS, aPaaS, PaaS, and private deployment. An aPaaS explainer covers how it differs from SaaS and PaaS, and when a low-code, branded live room makes sense, what to evaluate, and how integration works. A guide for finance and government organizations walks through security and compliance, identity and permissions, content control, and system integration, and compares standard SaaS, SDK integration, a video middle platform, and full private deployment.',
        'This section is for IT and security leads, procurement and project owners, and business teams who need to justify a choice to management. When an article discusses a specific vendor, it uses only information that vendor publishes officially, and says so in the title or body.',
      ],
    },
    industry: {
      seoTitle: 'Live Streaming Use Cases: Training & Healthcare',
      intro: [
        'Industry use cases looks at how live streaming and VOD work in real business settings: what needs to happen from planning to review, which steps most often go wrong, and what extra requirements industry rules place on a live event.',
        'Two practical guides are available now. The corporate training article walks through the whole workflow in order—needs analysis and format design, registration and equipment rehearsal, engagement and moderation during the session, and replays and knowledge capture afterwards—and shows how to measure results with the Kirkpatrick four-level model. The medical conference and surgical teaching article is written for hospitals, medical societies, and medical education providers. It covers capturing surgical video signals, keeping image quality and color accurate, tiering viewer access, and the compliance points around patient privacy, informed consent, and prescription-drug promotion.',
        'This section suits training managers, event and marketing operations staff, and medical education and conference teams. Where regulations are involved, we link to the original text; always check the latest official version before acting.',
      ],
    },
    news: {
      seoTitle: 'Video Tech & Enterprise Live Streaming Trends',
      intro: [
        'Industry trends tracks changes in video technology and enterprise live streaming that are worth paying attention to: how far new technology has moved into real-world use, and how new rules affect live and on-demand video. Rather than breaking news, these articles focus on what a change means for an organization and what to prepare in advance.',
        'The current article maps the main ways AI is being applied to live streaming and VOD: speech-recognition captions and translation, content summaries and chapters, smart editing, digital-human presenters, multimodal content moderation, and Q&A assistants. It also flags compliance requirements such as labeling AI-generated content, and separates the more mature capabilities (speech-recognition captions, summaries, and chapters) from those still finding their place in specific scenarios (digital humans and Q&A assistants).',
        'This section is for leaders planning a technology roadmap, legal and content-review teams following regulatory change, and product and operations staff who want a quick read on where the industry is heading. Trend articles list their sources too, and anything about policy links to the issuing body’s original text.',
      ],
    },
  },
};

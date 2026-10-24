---
title: "鸿蒙 HarmonyOS NEXT 对音视频应用开发的影响与适配要点"
seoTitle: "HarmonyOS NEXT 音视频适配：AVPlayer、权限与迁移清单"
description: "面向已有 Android/跨端音视频应用的团队，梳理 HarmonyOS NEXT（纯血鸿蒙）在应用模型、Media Kit、相机麦克风权限与流媒体协议上的变化：AVPlayer/AVRecorder/Camera Kit 怎么分工，HLS/HTTP-FLV 等原生支持边界，以及从 Android 迁移时的检查清单。"
pubDate: 2026-10-24
category: news
tags: [HarmonyOS NEXT, 鸿蒙音视频, AVPlayer, Media Kit, 音视频适配]
tldr:
  - "HarmonyOS NEXT 面向应用侧以 Stage 模型 + ArkTS 为主：UIAbility 承载页面生命周期，音视频能力集中在 Media Kit、Camera Kit、Audio Kit，而不是沿用 Android 的 MediaPlayer/Camera2 接口。"
  - "播放优先用 AVPlayer：官方文档明确支持的网络流媒体包括 HLS、DASH、HTTP/HTTPS、HTTP-FLV；直播场景常用 HLS 与 HTTP-FLV。RTMP、WebRTC 不在该协议表中，需单独评估方案。"
  - "录制与采集走 AVRecorder + Camera Kit：麦克风、相机权限为 user_grant，须在 module.json5 声明并在运行时向用户申请；网络播放还需 ohos.permission.INTERNET。"
  - "迁移重点不是「换包名」，而是重写采集—编码—传输—播放链路、权限文案与真机验证；先盘点现有协议与第三方 SDK 是否已有鸿蒙版本。"
faq:
  - q: "HarmonyOS NEXT 的 AVPlayer 能直接播 RTMP 直播流吗？"
    a: "按 OpenHarmony / 华为开发者文档中 AVPlayer 支持的流媒体协议表，网络侧列出的是 HLS、DASH、HTTP/HTTPS、HTTP-FLV，未包含 RTMP。若业务强依赖 RTMP，需要改推拉流协议，或评估可在鸿蒙侧集成的第三方播放库 / Native 方案，并以真机验证为准。"
  - q: "做手机开播（采集摄像头+麦克风）该用哪些 Kit？"
    a: "常见组合是 Camera Kit 负责预览与视频帧输出，AVRecorder 负责编码写文件或与后续推流模块衔接；麦克风采集需 ohos.permission.MICROPHONE，相机需 ohos.permission.CAMERA，二者均为用户授权权限，声明后还要在使用场景中动态申请。"
  - q: "从 Android 音视频 App 迁到鸿蒙，MediaPlayer / ExoPlayer 有直接对应物吗？"
    a: "没有一一对应的「兼容层」可把现有 Java/Kotlin 播放代码原样跑在 NEXT 上。官方推荐路径是用 ArkTS 调用 Media Kit 的 AVPlayer（端到端播放）或更底层的 AVCodec 能力；Android Activity 生命周期也需映射到 UIAbility / WindowStage。"
  - q: "点播加密或 DRM 内容在鸿蒙上怎么播？"
    a: "官方流媒体指南写明 HLS、DASH 可结合 DRM Kit 做内容保护；HTTP-FLV 在协议表中标注不支持该列内容保护。具体加密方案（如 HLS AES、商业 DRM）要以当前 API 版本文档和设备能力为准，并做多机型验证。"
sources:
  - title: "OpenHarmony Docs - Introduction to Media Kit"
    url: https://github.com/openharmony/docs/blob/master/en/application-dev/media/media/media-kit-intro.md
  - title: "华为开发者文档 - 使用 AVPlayer 播放流媒体（ArkTS）"
    url: https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/streaming-media-playback-development-guide
  - title: "华为开发者文档 - 使用 AVPlayer 播放视频（ArkTS）"
    url: https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/video-playback
  - title: "华为开发者文档 - Camera Kit（相机服务）"
    url: https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/camera-kit
  - title: "华为开发者文档 - 声明权限"
    url: https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/declare-permissions
  - title: "华为开发者文档 - 开放权限（用户授权）"
    url: https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/permissions-for-all-user
  - title: "RFC 8216 - HTTP Live Streaming"
    url: https://www.rfc-editor.org/rfc/rfc8216
related: [miniprogram-live-guide, live-latency-protocols, obs-streaming-settings]
---

HarmonyOS NEXT（常称「纯血鸿蒙」）对音视频团队的实质影响，不只是换一套 UI 框架，而是**应用模型、媒体 API、权限模型和可依赖的流媒体协议**一起变了。原先跑在 Android 兼容层上的播放器、推流 SDK、连麦方案，不能默认「还能用」；需要按官方 Media Kit / Camera Kit 能力重新对齐。

> 先用官方协议表和权限列表做差距分析，再决定改协议、换 SDK，还是自研 ArkTS/Native 封装——比一上来移植代码更省时间。

## 一、变化到底在哪：模型与 Kit 边界

在 NEXT 上，应用侧主流是 **Stage 模型**：入口是 `UIAbility`，页面通过 `WindowStage.loadContent` 加载；语言侧以 **ArkTS** 为主。音视频相关能力大致按 Kit 拆分：

| 能力 | 主要 Kit / 模块 | 典型用途 |
|---|---|---|
| 端到端播放 | Media Kit · AVPlayer | 本地/网络音视频、流媒体点播与直播观看 |
| 录制写文件 | Media Kit · AVRecorder | 麦克风录音、相机画面编码落盘 |
| 相机预览与采集 | Camera Kit | 开播预览、拍照、向录制模块提供 surface |
| 短音效 | Media Kit · SoundPool | 提示音、按键音等短音频 |
| 编解码管线 | AVCodec 相关接口 | 需要自管 demux/decode/encode 时 |

OpenHarmony 文档对 Media Kit 的定位很清楚：AVPlayer 负责把媒体资源解封装、解码并输出到图形/音频通路；AVRecorder 负责采集、编码并写入容器。业务代码通常 `import { media } from '@kit.MediaKit'`，用 `createAVPlayer` / `createAVRecorder` 创建实例。

对直播/点播产品经理和架构师而言，这意味着：**「播放器」和「采集器」要按鸿蒙 Kit 重新选型**，不能假设 ExoPlayer、Camera2、旧版第三方 AAR 可直接复用。

## 二、播放侧：AVPlayer 支持什么协议

做企业直播、培训回放、活动转播时，第一个问题往往是：观众端还能不能用现在的拉流地址？

按官方「使用 AVPlayer 播放流媒体」文档中的协议表（以文档当前表述为准）：

| 协议 | 网络点播 | 网络直播 | 内容保护（文档标注） |
|---|---|---|---|
| HLS（m3u8） | 支持 | 支持 | 可结合 DRM Kit |
| DASH（mpd） | 支持 | — | 可结合 DRM Kit |
| HTTP/HTTPS（如 mp4） | 支持 | — | — |
| HTTP-FLV | 支持 | 支持 | — |

据此可得出几个务实结论：

1. **观看端优先准备 HLS，必要时加 HTTP-FLV。** 二者都覆盖直播；HLS 还方便多码率（文档提供 `availableBitrates` / `setBitrate`）。延迟与切片的关系可参考本站的[直播延迟与协议选择](/articles/live-latency-protocols/)。
2. **仅提供 RTMP 拉流的源站，不能默认被原生 AVPlayer 直接播放。** 官方协议表未列出 RTMP；需要转封装/转协议，或评估第三方播放能力。
3. **WebRTC 双向通话、连麦**同样不在上述 AVPlayer 流媒体表中。低延迟互动要单独做能力调研（系统 WebRTC 相关指南、自研 NAPI、或已适配鸿蒙的 RTC SDK），并纳入真机与弱网测试。
4. 使用网络地址播放需声明 **`ohos.permission.INTERNET`**；设置 `url` 或 `MediaSource` 前应在 idle 状态注册 `stateChange` / `error` 监听，避免丢事件。

点播场景下，mp4/mkv/ts 等容器与 H.264/H.265 等编码在 Media Kit 介绍中有更细的格式表；上线前仍建议按目标机型做一次格式矩阵抽测。

## 三、采集与录制：Camera + AVRecorder + 权限

手机开播、本地录课后上传、手术示教采集等场景，链路通常是：

1. 在 `module.json5` 的 `requestPermissions` 中声明权限；
2. 在用户触发拍摄/直播的交互里调用 `requestPermissionsFromUser`；
3. Camera Kit 打开相机、配置预览；
4. AVRecorder 取 surface、设置编码参数（如 AVC/HEVC、AAC）与输出路径，再 start/pause/stop。

官方权限文档写明：

- **`ohos.permission.CAMERA`**、**`ohos.permission.MICROPHONE`** 均为 **user_grant**（用户授权），仅声明不够，必须运行时申请；
- 申请 `user_grant` 时，`reason` 与 `usedScene` 需按上架规范填写，文案要说明真实使用场景（例如「用于视频通话/直播画面采集」），避免空泛的「需要相机权限」。

录制侧还要注意：设备音频通路同一时间通常只能有一路有效录音；官方 AVRecorder 说明也提示多实例录音可能因音频通路冲突失败。后台播放、播控中心、画中画等则要再对接 AVSession、Background Tasks 等能力，本文不展开，但应写入产品的「鸿蒙差异清单」。

采集参数（分辨率、关键帧、码率）若对标 OBS 推流习惯，可对照[OBS 推流参数设置](/articles/obs-streaming-settings/)中的思路，再映射到 AVRecorder / 推流模块的可配置项。

## 四、从 Android 迁移时的现实差距

把现有 Android App「搬到」NEXT，音视频部分常见落差包括：

- **语言与组件**：Java/Kotlin + Activity/Fragment → ArkTS + UIAbility + ArkUI；媒体回调、线程模型都要重写。
- **播放器**：MediaPlayer / ExoPlayer / IJK 等 → AVPlayer 或自管 AVCodec；缓存策略、字幕、DRM 插件接口均不同。
- **采集**：Camera2 / CameraX → Camera Kit；预览 surface 与录制、推流模块的衔接方式按鸿蒙示例重做。
- **推流与连麦**：大量 Android 推流 SDK 依赖系统私有或 JNI 实现；需确认厂商是否提供 HarmonyOS NEXT / OpenHarmony 版本，否则预留自研或换协议的时间。
- **分发形态**：除传统安装包外，还要关注元服务/原子化服务若涉及媒体能力时的 API 可用性（部分接口标注了 Atomic service API 版本）。

小程序侧若仍是重要入口，可与本站[小程序直播接入指南](/articles/miniprogram-live-guide/)对照：鸿蒙手机浏览器/应用与微信小程序是不同运行时，协议与组件能力不要混用同一套假设。

## 五、适配检查清单（直播 / 点播 App）

- **协议盘点**：现网推流、拉流、录制回放各用什么协议？AVPlayer 能否原生覆盖？不能覆盖的是否已有转码或备选地址？
- **SDK 盘点**：播放、美颜、连麦、IM、日志上报是否已有官方鸿蒙适配说明与示例工程？
- **权限与隐私**：CAMERA / MICROPHONE / INTERNET 等已声明；reason 文案通过合规评审；拒绝授权与系统全局关闭相机/麦克风时有降级提示。
- **状态机**：按官方推荐处理 AVPlayer / AVRecorder 状态迁移；切后台、来电、音频焦点打断有明确策略。
- **真机矩阵**：覆盖主流鸿蒙机型与系统版本；至少验证 HLS 直播、HTTP-FLV（若使用）、本地 mp4 点播、断网恢复、锁屏/多任务。
- **内容安全**：若使用 DRM / 加密点播，确认协议列支持情况，并做授权失败、过期、换机的用例。
- **工程节奏**：UI 可先用 Video 组件做原型，但正式直播间建议尽早切到 AVPlayer 全流程，避免后期两套状态机并存。

鸿蒙 NEXT 对音视频业务是一次**平台级适配**，不是简单换皮肤。把协议、Kit 边界和权限三类问题先写进里程碑，再动大规模移植，通常比「先编译通过再补洞」更可控。

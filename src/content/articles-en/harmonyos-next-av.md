---
title: "HarmonyOS NEXT for Audio/Video Apps: Impact and Adaptation Checklist"
seoTitle: "HarmonyOS NEXT AV adaptation: AVPlayer, permissions, migration"
description: "For teams with Android or cross-platform live/VOD apps, a practical map of what changes on HarmonyOS NEXT: Stage model and ArkTS, Media Kit vs Camera Kit, camera/mic user_grant permissions, which streaming protocols AVPlayer documents, and a migration checklist."
pubDate: 2026-10-24
category: news
tags: [HarmonyOS NEXT, HarmonyOS audio video, AVPlayer, Media Kit, AV adaptation]
tldr:
  - "On HarmonyOS NEXT, apps are built primarily on the Stage model and ArkTS: UIAbility owns the page lifecycle, and audio/video capability lives in Media Kit, Camera Kit, and Audio Kit—not Android MediaPlayer/Camera2 APIs."
  - "Prefer AVPlayer for playback. Official docs list HLS, DASH, HTTP/HTTPS, and HTTP-FLV for network streaming; live viewing commonly uses HLS and HTTP-FLV. RTMP and WebRTC are not in that table and need a separate plan."
  - "Capture and recording typically combine Camera Kit with AVRecorder. CAMERA and MICROPHONE are user_grant permissions: declare them in module.json5 and request them at runtime; network playback also needs ohos.permission.INTERNET."
  - "Migration is not a package rename. Rebuild the capture–encode–transport–playback path, rewrite permission copy, and verify on real devices; inventory protocols and third-party SDKs for HarmonyOS builds first."
faq:
  - q: "Can AVPlayer on HarmonyOS NEXT play an RTMP live URL directly?"
    a: "According to the streaming-protocol table in the OpenHarmony / Huawei AVPlayer guides, the listed network protocols are HLS, DASH, HTTP/HTTPS, and HTTP-FLV—RTMP is not included. If your product depends on RTMP, plan a protocol conversion or evaluate a third-party / Native player, and confirm on device."
  - q: "Which kits do we use for phone-side publishing (camera + microphone)?"
    a: "A common pattern is Camera Kit for preview and video frames, plus AVRecorder for encoding to a file or handing frames to a publish module. Microphone access needs ohos.permission.MICROPHONE and camera access needs ohos.permission.CAMERA; both are user_grant and must be requested at runtime after declaration."
  - q: "Is there a drop-in replacement for Android MediaPlayer / ExoPlayer?"
    a: "There is no compatibility layer that runs existing Java/Kotlin player code unchanged on NEXT. The documented path is ArkTS against Media Kit’s AVPlayer for end-to-end playback, or lower-level AVCodec APIs when you manage the pipeline yourself. Android Activity lifecycle also maps to UIAbility / WindowStage."
  - q: "How do encrypted or DRM protected VOD streams play?"
    a: "Official streaming guides note that HLS and DASH can use DRM Kit for content protection; HTTP-FLV is marked without that protection column in the same table. Exact schemes (HLS AES, commercial DRM, and so on) depend on the API version and device capability—validate on target hardware."
sources:
  - title: "OpenHarmony Docs - Introduction to Media Kit"
    url: https://github.com/openharmony/docs/blob/master/en/application-dev/media/media/media-kit-intro.md
  - title: "Huawei Docs - Using AVPlayer to Play Streaming Media (ArkTS)"
    url: https://developer.huawei.com/consumer/en/doc/harmonyos-guides/streaming-media-playback-development-guide
  - title: "Huawei Docs - Using AVPlayer to Play Videos (ArkTS)"
    url: https://developer.huawei.com/consumer/en/doc/harmonyos-guides/video-playback
  - title: "Huawei Docs - Camera Kit"
    url: https://developer.huawei.com/consumer/en/doc/harmonyos-guides/camera-kit
  - title: "Huawei Docs - Declaring Permissions"
    url: https://developer.huawei.com/consumer/en/doc/harmonyos-guides/declare-permissions
  - title: "Huawei Docs - Permissions for All User (user_grant)"
    url: https://developer.huawei.com/consumer/en/doc/harmonyos-guides/permissions-for-all-user
  - title: "RFC 8216 - HTTP Live Streaming"
    url: https://www.rfc-editor.org/rfc/rfc8216
related: [miniprogram-live-guide, live-latency-protocols, obs-streaming-settings]
---

HarmonyOS NEXT is not just a new UI toolkit for audio/video teams. The **application model, media APIs, permission model, and the streaming protocols you can rely on natively** all shift together. Players, publishers, and co-hosting stacks that assumed an Android compatibility layer should not be treated as “still fine by default”—you need to realign against Media Kit and Camera Kit.

> Start with a gap analysis against the official protocol table and permission list, then decide whether to change protocols, swap SDKs, or wrap ArkTS/Native yourself. That usually beats jumping straight into a code port.

## 1. What actually changed: model and kit boundaries

On NEXT, the mainstream app shape is the **Stage model**: entry is a `UIAbility`, pages load through `WindowStage.loadContent`, and the language is primarily **ArkTS**. Audio/video capability is split across kits roughly like this:

| Capability | Main kit / module | Typical use |
|---|---|---|
| End-to-end playback | Media Kit · AVPlayer | Local/network A/V, streaming VOD and live viewing |
| Record to file | Media Kit · AVRecorder | Mic recording, camera encode to disk |
| Camera preview & capture | Camera Kit | Publish preview, stills, surface into recorder |
| Short sounds | Media Kit · SoundPool | Clicks, alerts, short SFX |
| Codec pipeline | AVCodec-related APIs | When you own demux/decode/encode |

OpenHarmony’s Media Kit intro positions AVPlayer as the component that demuxes/decodes and feeds graphics/audio paths, and AVRecorder as capture → encode → container. App code typically `import { media } from '@kit.MediaKit'` and creates instances with `createAVPlayer` / `createAVRecorder`.

For live/VOD product and architecture owners, that means **the player and the capturer must be re-selected against HarmonyOS kits**—do not assume ExoPlayer, Camera2, or older Android AARs drop in.

## 2. Playback: which protocols AVPlayer documents

For enterprise live, training replay, and event distribution, the first question is usually: can the viewer still use today’s pull URL?

Per the protocol table in the official “Using AVPlayer to Play Streaming Media” guide (always re-check the current doc):

| Protocol | Network VOD | Network live | Content protection (as marked) |
|---|---|---|---|
| HLS (m3u8) | Supported | Supported | Can use DRM Kit |
| DASH (mpd) | Supported | — | Can use DRM Kit |
| HTTP/HTTPS (e.g. mp4) | Supported | — | — |
| HTTP-FLV | Supported | Supported | — |

Practical takeaways:

1. **Prefer HLS for viewing, add HTTP-FLV when needed.** Both cover live; HLS also fits multi-bitrate (`availableBitrates` / `setBitrate` in the docs). For latency vs. segment size, see [Live latency and protocol choice](/en/articles/live-latency-protocols/).
2. **An RTMP-only origin should not be assumed playable by native AVPlayer.** RTMP is not listed in that table—plan remux/reprotocol or a third-party player.
3. **WebRTC two-way calling / co-hosting** is likewise outside the AVPlayer streaming table. Treat low-latency interaction as a separate capability track (system WebRTC guides, custom NAPI, or an RTC SDK that already targets HarmonyOS), with real-device and weak-network tests.
4. Network playback requires **`ohos.permission.INTERNET`**. Register `stateChange` / `error` listeners while the player is idle, before setting `url` or `MediaSource`, so you do not miss early events.

For VOD files, Media Kit’s intro has finer container/codec tables (mp4/mkv/ts, H.264/H.265, and so on). Still run a format matrix on your target devices before launch.

## 3. Capture and recording: Camera + AVRecorder + permissions

Phone-side publishing, local lecture capture, and similar flows usually look like:

1. Declare permissions under `requestPermissions` in `module.json5`;
2. Call `requestPermissionsFromUser` when the user starts capture/live;
3. Open the camera and configure preview with Camera Kit;
4. Obtain a surface from AVRecorder, set encode params (e.g. AVC/HEVC, AAC) and output path, then start/pause/stop.

Official permission docs state:

- **`ohos.permission.CAMERA`** and **`ohos.permission.MICROPHONE`** are **user_grant**—declaration alone is not enough; you must request at runtime;
- For `user_grant`, `reason` and `usedScene` must meet store review rules; the reason string should name the real scenario (e.g. “for video calls / live camera capture”), not a vague “need camera permission.”

Also note recording contention: devices typically share one effective audio capture path; AVRecorder docs warn that a second audio-recording instance may fail. Background playback, the media controller, and PiP pull in AVSession / Background Tasks—out of scope here, but they belong on your HarmonyOS delta list.

If you mirror OBS-style encode habits, reuse the thinking in [OBS streaming settings](/en/articles/obs-streaming-settings/), then map knobs onto AVRecorder / your publish module.

## 4. Realistic gaps when migrating from Android

Moving an existing Android app to NEXT, the audio/video gaps usually include:

- **Language and components**: Java/Kotlin + Activity/Fragment → ArkTS + UIAbility + ArkUI; media callbacks and threading rewrite.
- **Players**: MediaPlayer / ExoPlayer / IJK → AVPlayer or self-managed AVCodec; caching, subtitles, and DRM plug-in surfaces all differ.
- **Capture**: Camera2 / CameraX → Camera Kit; rewire preview surface into record/publish following HarmonyOS samples.
- **Publish and co-hosting**: many Android SDKs rely on private/JNI stacks—confirm a HarmonyOS NEXT / OpenHarmony build exists, or budget protocol change / in-house work.
- **Distribution shape**: beyond classic installables, check whether atomic-service constrained APIs matter if you ship media there (some APIs note Atomic service API versions).

If WeChat Mini Programs remain a major entry, compare with the [Mini Program live streaming guide](/en/articles/miniprogram-live-guide/): HarmonyOS apps and Mini Programs are different runtimes—do not share one protocol assumption.

## 5. Adaptation checklist (live / VOD apps)

- **Protocols**: What do publish, pull, and VOD replay use today? Does AVPlayer cover them natively? If not, is there a transcoder or alternate URL?
- **SDKs**: Do player, beauty filters, co-hosting, IM, and telemetry already document HarmonyOS samples?
- **Permissions & privacy**: CAMERA / MICROPHONE / INTERNET declared; reason copy reviewed; clear UX when the user denies or the system globally mutes camera/mic.
- **State machines**: Follow documented AVPlayer / AVRecorder transitions; define behavior for backgrounding, calls, and audio focus loss.
- **Device matrix**: Cover mainstream HarmonyOS models and OS versions; at least HLS live, HTTP-FLV if used, local mp4 VOD, reconnect after network loss, lock screen / multitasking.
- **Content security**: For DRM / encrypted VOD, match the protection column in the protocol table and test auth failure, expiry, and device switch.
- **Engineering rhythm**: The ArkUI Video component can prototype UI, but production live rooms should move to the full AVPlayer flow early to avoid dual state machines.

NEXT is a **platform-level** adaptation for audio/video products, not a skin change. Put protocol, kit boundaries, and permissions into the milestone plan before a large port—usually more controllable than “compile first, patch later.”

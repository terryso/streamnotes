---
title: "Where Does Live Streaming Latency Come From? RTMP, HLS, LL-HLS, and WebRTC Low-Latency Options Explained"
description: "A stage-by-stage breakdown of live streaming latency—capture, encoding, ingest, transcoding, delivery, and playback—with a comparison of typical latency and use cases for RTMP, HLS, LL-HLS, WebRTC, and SRT, plus a practical checklist for reducing delay."
pubDate: 2026-10-06
category: tutorial
tags: [Live latency, HLS, WebRTC, RTMP, Low latency]
tldr:
  - "Live latency is the sum of delays from capture, encoding, ingest, transcoding, CDN delivery, and player buffering. Segmenting plus player buffering is usually the biggest share."
  - "Traditional HLS typically runs at ten seconds or more, LL-HLS can get down to a few seconds, and WebRTC can reach sub-second latency—but cost and difficulty of scaling rise in that order."
  - "Pick the protocol based on the use case: HLS/LL-HLS for large one-way audiences; WebRTC only for strongly real-time scenarios such as co-streaming, interactive quizzes, and live auctions."
  - "General ways to cut latency: shorten the GOP and segment duration, reduce transcoding layers, shrink the player buffer, and plan a fallback for poor networks."
faq:
  - q: "How many seconds of live latency is normal?"
    a: "It depends on the protocol and the use case. Live streams based on traditional HLS usually have more than ten seconds of latency, RTMP/HTTP-FLV playback generally has a few seconds, LL-HLS can reach a few seconds, and WebRTC can get under one second. There is no universal standard; what matters is meeting your interaction needs."
  - q: "Why is latency higher in mobile browsers?"
    a: "Many mobile browsers cannot play FLV and usually fall back to HLS, which has to generate several segments before playback starts, so latency is higher. Consider LL-HLS or WebRTC playback."
  - q: "Is a smaller GOP always better?"
    a: "No. A smaller GOP means more keyframes, so at the same bitrate picture quality drops, or the bitrate has to rise. A common practice in live streaming is a GOP of one to two seconds, aligned with the segment duration."
  - q: "Can WebRTC handle large audiences?"
    a: "Yes, but it usually requires cascaded SFUs and edge nodes, and cost and operational complexity are higher than with HLS. Many platforms use a hybrid architecture: WebRTC for presenters and co-streaming guests, and CDN-based low-latency protocols for the large audience."
sources:
  - title: "RFC 8216 - HTTP Live Streaming"
    url: https://www.rfc-editor.org/rfc/rfc8216
  - title: "Apple Developer - Enabling Low-Latency HTTP Live Streaming (HLS)"
    url: https://developer.apple.com/documentation/http-live-streaming/enabling-low-latency-http-live-streaming-hls
  - title: "W3C - WebRTC: Real-Time Communication in Browsers"
    url: https://www.w3.org/TR/webrtc/
  - title: "RFC 9725 - WebRTC-HTTP Ingestion Protocol (WHIP)"
    url: https://www.rfc-editor.org/rfc/rfc9725
  - title: "Haivision SRT open-source project"
    url: https://github.com/Haivision/srt
related: [vod-encryption-guide, enterprise-live-platform-selection]
---

One of the most common complaints in enterprise live streaming is: "Why does it take several seconds for viewers to hear what I just said?" To fix latency, you first need to know where it comes from.

> When optimizing latency, start with segment waiting and player buffering—not with buying more bandwidth.

## 1. Six sources of delay along the live pipeline

A typical live pipeline breaks down into six stages, and each one adds some delay:

1. **Capture and pre-processing**: cameras, capture cards, beauty filters, or scene compositing—usually tens to a few hundred milliseconds.
2. **Encoding**: the encoder buffers several frames for motion estimation. Enabling B-frames or using slower encoding presets adds delay.
3. **Ingest (the first mile)**: network transport from the broadcaster to the ingest node, affected by upstream bandwidth and jitter.
4. **Transcoding and packaging**: the server produces multiple renditions and packages them as HLS, FLV, and other formats. The more transcoding layers, the more delay.
5. **CDN delivery**: edge nodes fetching from origin and caching tier by tier. This is rarely the main bottleneck, but slow origin fetches inflate time to first frame.
6. **Player buffering**: the player pre-buffers content to absorb jitter, and this is often the largest chunk of delay.

In practice, **segment waiting in segmented protocols plus player buffering** is the main source of latency. Start optimizing there instead of simply upgrading bandwidth.

## 2. Latency and use cases of the main protocols

| Protocol | Typical latency (order of magnitude) | Strengths | Limitations | Use cases |
|---|---|---|---|---|
| RTMP / HTTP-FLV | A few seconds | Mature ingest ecosystem, relatively low latency | Browsers don't support FLV natively and need a JS player; poor compatibility in iOS browsers | Ingest, desktop playback |
| HLS | Ten seconds or more | Best compatibility, CDN-friendly, easy to scale | Must wait for segments to be produced; high latency | Large one-way audiences, replays |
| LL-HLS | A few seconds | Keeps HLS compatibility and CDN scalability | Needs end-to-end support from server, CDN, and player | Large events with moderate interaction needs |
| WebRTC | Sub-second | Best real-time performance, native browser support | Costly to deliver at scale; needs SFUs and edge deployment | Co-streaming, interactive classrooms, auctions |
| SRT | Configurable, usually hundreds of milliseconds to a few seconds | Strong packet-loss resilience, good for long-haul transport over the public internet | Mainly for contribution links, not delivery to viewers | Remote feed backhaul, cross-region ingest |

The figures above are common orders of magnitude. Real-world results depend on configuration and network conditions and are not any vendor's guaranteed values.

### Why HLS is slow

HLS cuts the live stream into TS or fMP4 segments, and the player only starts pulling segments after downloading the playlist (m3u8). Following RFC 8216, clients generally do not start at the last segment but near the third-to-last one. With six-second segments, that alone can add more than ten seconds of latency.

### How LL-HLS speeds things up

Apple's Low-Latency HLS introduces partial segments, blocking playlist reload, and preload hints. The player can fetch smaller chunks without waiting for a full segment to be produced, bringing latency down to a few seconds. The prerequisite is that the origin, the CDN, and the player all support these extensions.

### WebRTC trade-offs

WebRTC runs over UDP with built-in congestion control and loss recovery, enabling sub-second interaction. With the standardization of WHIP (the WebRTC-HTTP Ingestion Protocol), ingest has also become simpler. But every viewer needs a real-time connection to a server, and large-scale delivery depends on cascaded SFUs, so it costs noticeably more than CDN delivery.

## 3. A practical checklist for lowering latency

- **Align the GOP with segments**: set the GOP to 1–2 seconds and make the segment duration a whole multiple of it, so misaligned keyframes don't slow the first frame.
- **Reduce or disable B-frames**: for highly interactive scenarios, use low-latency tuning such as `zerolatency` in the encoder.
- **Shorten segments**: HLS segments can drop from six seconds to about two, but request volume rises, so evaluate CDN cost.
- **Shrink the player buffer**: if few users are on poor networks, lower the startup and maximum buffer, and pair it with a catch-up strategy (playing slightly faster when the buffer grows too large).
- **Use a hybrid architecture by role**: presenters and co-streaming guests on WebRTC, regular viewers on CDN-based low-latency protocols, balancing experience and cost.
- **Measure end-to-end latency**: overlay a timestamp on the picture or carry the ingest time in SEI, compute real latency on the player side, and let the data drive optimization.

## 4. How to choose

If your livestreams are mostly one-way viewing—launch events, lectures, annual meetings—keeping latency within a few seconds is usually enough, and stability and reach should come first. For co-streaming in online classes, interactive quizzes, or live auctions, you need WebRTC-level real-time performance.

Teams that don't want to build the whole pipeline themselves can use a mature enterprise live streaming platform. Many offer low-latency live and multi-party co-streaming. Shortlist a few, measure latency on your own network, and then decide on the architecture.

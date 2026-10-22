---
title: "Live Streaming in WeChat Mini Programs: live-pusher/live-player vs. Third-Party SDKs"
seoTitle: "WeChat Mini Program Live Streaming: Components vs. SDKs"
description: "A guide for enterprise dev teams adding live video to a WeChat Mini Program: the category requirements and enablement steps for the live-pusher and live-player components, alternatives such as playing HLS in the video component or embedding an H5 player in web-view, the trade-offs between building on native components and adopting a third-party live SDK, and a pre-launch checklist."
pubDate: 2026-10-22
category: tutorial
tags: [Mini Program live streaming, live-pusher, live-player, Live SDK, WeChat Mini Programs]
tldr:
  - "live-pusher (publishing) and live-player (playback) are the native components for low-latency live video in Mini Programs, but they are only available to specific categories: you must pass category review first, then enable them under Interface Settings in the Mini Program admin console."
  - "If viewers only need to watch and can accept a few to over ten seconds of delay, playing HLS (m3u8) in the video component is simpler and has no live-streaming category requirement; embedding an H5 player in web-view reuses an existing web live room, but personal-entity Mini Programs can't use web-view."
  - "Third-party live SDKs or plugins save you the server, transcoding, CDN, engagement, and admin work, but on the Mini Program side they usually still rely on the native components, so the category requirement doesn't go away."
  - "Suggested order: confirm the account entity and category first, then decide between building and buying along four dimensions: latency needs, engagement depth, team capacity, and data ownership."
faq:
  - q: "Can a Mini Program play RTMP or FLV live streams directly?"
    a: "Yes, through the live-player component. According to the official WeChat documentation, live-player's src currently supports only flv and rtmp, and the component is only open to Mini Programs in designated categories, which must pass category review and then enable the permission in the admin console."
  - q: "Can a Mini Program without a live-streaming category still show live video?"
    a: "A common approach is to have the server also output the stream as HLS (m3u8) and play it with the video component. The cost is higher latency, typically several seconds or more, which suits launches, lectures, and other watch-only events. Mini Programs owned by an organization can also open an H5 live page on a configured business domain through web-view."
  - q: "If we adopt a third-party live SDK, do we still need to apply for a category?"
    a: "Usually yes. On the Mini Program side, SDKs and plugins are generally built on native components such as live-pusher, live-player, or video, and the component permissions apply to your Mini Program itself. Check the SDK provider's integration docs and WeChat's official rules for specifics."
  - q: "What is the difference between live-player's live mode and RTC mode?"
    a: "The official docs list two values for mode: live (live streaming) and RTC (real-time calling). RTC mode has lower latency and suits two-way scenarios such as co-hosting and video customer service; ordinary one-to-many streams can use live mode."
sources:
  - title: "WeChat Open Docs - live-player component"
    url: https://developers.weixin.qq.com/miniprogram/dev/component/live-player.html
  - title: "WeChat Open Docs - live-pusher component"
    url: https://developers.weixin.qq.com/miniprogram/dev/component/live-pusher.html
  - title: "WeChat Open Docs - video component"
    url: https://developers.weixin.qq.com/miniprogram/dev/component/video.html
  - title: "WeChat Open Docs - web-view component"
    url: https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html
  - title: "WeChat Open Docs - wx.createLivePlayerContext"
    url: https://developers.weixin.qq.com/miniprogram/dev/api/media/live/wx.createLivePlayerContext.html
  - title: "RFC 8216 - HTTP Live Streaming"
    url: https://www.rfc-editor.org/rfc/rfc8216
related: [live-latency-protocols, obs-streaming-settings, enterprise-live-platform-selection]
---

For many companies in China, the live audience lives inside WeChat: trainees tap in from a group chat, customers arrive from an Official Account menu, and sales reps forward the live room to clients. So "can we put the livestream in our Mini Program?" is a question engineering teams hear a lot. The answer is yes, but there is more than one path, and the paths differ widely in eligibility requirements, latency, and development effort. This guide works through it in order: eligibility first, then components, then whether to build or adopt an SDK.

> The first hurdle for Mini Program live streaming isn't code, it's your account entity and category. Confirm which components you can use before you pick a technical approach.

## 1. Know the gate first: categories and permissions

Two native Mini Program components deal directly with live video:

- **live-pusher**: real-time audio/video capture, i.e., recording from the phone's camera and microphone and pushing the stream to a server.
- **live-player**: real-time audio/video playback, pulling a live stream and playing it in the page.

Not every Mini Program can use them. According to the official WeChat documentation, they are open only to specific categories, such as live streaming under Social, online video courses under Education, healthcare, finance, automotive, government accounts, and multi-party communication under IT & Technology (see the official docs for the full list). The process is to add or change your category in the Mini Program admin console and pass review, then self-enable the component permission under Development > Interface Settings.

Two points are often overlooked:

1. **The Social > Live category takes longer.** The docs state that after you select the Social "Live" or "Live Performance" category, your first code submission must also be reviewed by the local internet regulator, which takes about 7 days. Build that into your schedule.
2. **Personal accounts face more limits.** Many categories require a company or organization entity, and the web-view component explicitly doesn't support personal-type Mini Programs.

So before writing code, confirm three things with operations and legal: the Mini Program's entity type, its existing categories, and whether your content maps to a category that can be enabled.

## 2. Four integration paths compared

Once you know the gate, choose from four paths:

| Path | Viewer latency | Category gate | Effort | Good for |
|---|---|---|---|---|
| live-player playback (RTMP/FLV) | Low, usually within a few seconds | Designated category plus permission | Medium | Interactive streams, live commerce, in-class quizzes |
| live-pusher + live-player (incl. RTC mode) | Lower, suited to two-way | Same as above | High | Going live from a phone, co-hosting, video customer service |
| video component playing HLS (m3u8) | Higher, commonly a few to over ten seconds | No live-streaming category needed | Low | Launches, lectures, watch-only events |
| web-view embedding an H5 live page | Depends on the H5 player and protocol | Non-personal entity, business domain configured | Low (reuses existing web page) | Extending an existing web live room into the Mini Program quickly |

A few notes:

- Per the official docs, live-player's src currently supports only **flv** and **rtmp**, so your server must output one of those. Its mode can be live or RTC, and RTC mode has lower latency. Since v2.9.1 it supports same-layer rendering, so chat overlays, product cards, and similar elements can sit on top of the video as ordinary views.
- The video component is meant for VOD but can also play HLS live streams. HLS is segment-based, so its latency is inherently higher than RTMP/FLV, and longer segments and player buffers mean more delay (see our guide to [live latency and protocols](/en/articles/live-latency-protocols/) for the differences).
- web-view opens a web page, so playback depends on the H5 player and the system WebView. Verify autoplay, fullscreen, and background playback on real devices one by one.

## 3. What building on native components involves

If your team builds directly on the native components, the Mini Program code itself is small: drop in a live-player, bind the stream URL, handle state events, and use wx.createLivePlayerContext to control play, pause, mute, and fullscreen. The real work happens outside the Mini Program:

- **Ingest and origin**: hosts push RTMP from OBS, a hardware switcher, or live-pusher (see [OBS streaming settings](/en/articles/obs-streaming-settings/)), and the server receives, authenticates, and distributes it.
- **Transcoding and multi-format output**: each stream needs at least FLV (for live-player) and HLS (for the video component, web pages, and fallback), usually in several quality levels.
- **CDN delivery and hotlink protection**: sign stream URLs with expiry times to prevent unauthorized rebroadcasting.
- **Engagement and business logic**: chat, likes, polls, giveaways, products, and check-ins all need your own backend and admin console.
- **Replays and data**: recording, VOD conversion, watch-time and audience stats, and integration with your CRM or learning system.
- **Error handling**: reconnecting after stream drops, weak-network prompts, pausing and resuming on backgrounding or incoming calls, and device compatibility.

Building in-house makes sense if you have a mature audio/video backend or strong customization needs around data and workflows. If you just want live video in your Mini Program, this work often far exceeds expectations.

## 4. The trade-offs of a third-party live SDK

Most cloud providers and live-streaming vendors offer Mini Program SDKs, plugins, or ready-made viewer page templates. What they mainly save you is the server, transcoding, CDN, engagement, and admin work listed in section 3; on the Mini Program side, a few lines of configuration gets you running.

But be clear about a few things:

- **The category gate doesn't disappear.** On the Mini Program side, SDKs are usually still built on live-pusher, live-player, or video, and the component permissions apply to your Mini Program itself.
- **Data ownership and export.** Viewing records, lead forms, and engagement data live with the provider. Before signing, confirm whether you can export them in real time via API and what happens to the data when the account is closed.
- **Customization limits.** Find out how far you can change the UI and engagement features: just reskinning, or access to low-level events so you can build your own pages.
- **Cross-platform consistency.** The same event is often watched on the web, in apps, and in WeCom too. Check whether the SDK covers those surfaces and whether the experience stays consistent.
- **Pricing model.** Billing by traffic, concurrency, duration, or plan; estimate peak costs for large events in advance.

For a fuller set of evaluation criteria, see [choosing an enterprise live streaming platform](/en/articles/enterprise-live-platform-selection/).

## 5. How to decide: a simple order of questions

1. **Entity and category**: Can you enable live-player/live-pusher? If not, launch with HLS in the video component or with web-view while you apply for the category.
2. **Latency**: Real-time Q&A, co-hosting, or flash sales require live-player (RTC mode if needed); for watch-only events, HLS is enough.
3. **Engagement depth**: The more complex your engagement and workflows, the more an SDK or mature platform is worth.
4. **Team capacity and timeline**: Without audio/video backend experience or with a tight launch date, start with an SDK; for long-term, large-scale, heavily customized needs, evaluate building in-house.
5. **Data and compliance**: When trainee, patient, or financial-customer data is involved, write data storage location, access control, and audit requirements into the spec.

## 6. Pre-launch checklist

- Category review passed and component permissions enabled; both the trial and release versions tested on real devices.
- Stream URLs are authenticated with sensible expiry times; both FLV and HLS outputs play correctly.
- Playback recovers, or shows a clear message, after network loss, backgrounding, incoming calls, and screen lock.
- At least one mainstream device tested on each of Android, iOS, WeChat for Windows, and WeChat for Mac.
- A fallback plan: switch to HLS if live-player fails, and keep a web viewing URL in case the Mini Program has problems.
- A full end-to-end rehearsal before going live, covering publishing, engagement, and replay generation.

The technology behind Mini Program live streaming isn't complicated; the hard part is balancing eligibility, latency, and business features. Sort out your eligibility first, then pick a path that fits the scenario, and you'll avoid a lot of detours.

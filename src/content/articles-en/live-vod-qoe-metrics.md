---
title: "Reading Live and VOD Metrics: Concurrency, Watch Time, Completion Rate, Rebuffering, and Startup Time"
seoTitle: "Live and VOD Metrics: Concurrency, Completion, Rebuffering, Startup"
description: "Live and VOD dashboards are full of numbers, and they are easy to misread when definitions differ. This guide separates business metrics from quality-of-experience (QoE) metrics, defines concurrency, watch time, completion rate, rebuffering, and startup time, shows which player events to instrument, and explains how CMCD lines up client data with CDN logs."
pubDate: 2026-11-21
category: tutorial
tags: [video metrics, QoE, rebuffering ratio, startup time, player analytics]
tldr:
  - "Split metrics into two groups: concurrency, watch time, and completion rate tell you whether people watched and for how long; startup time, rebuffering, bitrate, and errors tell you whether playback was smooth. Both must join on the same playback session."
  - "Every metric needs an explicit numerator, denominator, and time window. Peak concurrency is not total viewers, and mean watch time tells a different story from the median."
  - "Measure QoE in the player: time it from HTMLMediaElement events such as playing and waiting, separate startup wait, post-seek buffering, and mid-playback stalls, and never count a user-initiated pause as a stall."
  - "CTA-5004 (CMCD) lets the player attach a session ID, buffer length, bitrate, a buffer-starvation flag, and other fields to requests or event reports, so client experience and CDN logs can be matched to the same event and session."
faq:
  - q: "What is the difference between concurrency and viewers?"
    a: "Concurrency is the number of sessions playing at the same moment, usually sampled at a fixed interval (for example every minute) and reported as a peak or a curve. Viewers (unique viewers) is the de-duplicated count of people over a period. A two-hour live event may have a modest peak but noticeably more total viewers, because people come and go. Use peak concurrency for capacity planning and unique viewers for reach; one cannot stand in for the other."
  - q: "How should the rebuffering ratio be calculated?"
    a: "Two definitions are common. One is time-based: total mid-playback buffering time divided by (playing time + buffering time). The other is session-based: sessions with at least one mid-playback stall divided by all sessions. The first reflects overall smoothness, the second how many viewers were affected. Whichever you choose, exclude the startup wait, short buffering right after a seek, and user pauses, and state the definition on the report."
  - q: "When does startup time start counting?"
    a: "Agree on the starting point first. Measuring from the moment the user presses play (or autoplay is initiated) to the moment the first frame is actually rendered (approximated with the playing event or requestVideoFrameCallback) is closest to what the viewer experiences. Starting from page open also includes page load and authorization, which is useful for end-to-end troubleshooting but not comparable with other systems."
  - q: "Can live and VOD use the same completion-rate formula?"
    a: "VOD has a fixed duration, so completion rate is usually the share of sessions that reach the end (or a threshold such as 90% progress). Live has no common end point for every viewer; average time online, the retention curve, and the audience size during key segments (a product demo, a giveaway, Q&A) are more useful. Forcing the VOD formula onto live usually produces a meaningless number."
sources:
  - title: "CTA-5004-B Common Media Client Data (CMCD), CTA WAVE"
    url: https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html
  - title: "HTML Living Standard: Media elements (WHATWG)"
    url: https://html.spec.whatwg.org/multipage/media.html
  - title: "HTMLMediaElement: waiting event (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/waiting_event
  - title: "HTMLVideoElement: getVideoPlaybackQuality() method (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/getVideoPlaybackQuality
  - title: "Beacon (W3C)"
    url: https://www.w3.org/TR/beacon/
  - title: "ITU-T P.1203: Parametric bitstream-based quality assessment of progressive download and adaptive audiovisual streaming services"
    url: https://www.itu.int/rec/T-REC-P.1203
related: [live-weak-network-optimization, abr-ladder-design, live-latency-protocols, vod-platform-selection]
---

After an event, the business side usually asks "how did the stream do?", and the engineering side usually gets asked "why did some people say it stuttered?" The dashboard has concurrency, watch time, rebuffering, and startup time, but if the definition behind each number is not written down, two reports can contradict each other: for the same event one team reports a peak in the thousands while another says only a few hundred were online, or the rebuffering ratio looks low while support is fielding complaints.

> The value of metrics is not in having many of them, but in consistent definitions and the ability to drill down to individual sessions. Define the numerator, denominator, and time window first, then argue about whether a number is high or low.

## 1. Split metrics into two groups

Live and VOD data roughly falls into layers that answer different questions:

| Type | Typical metrics | Question answered | Main data source |
|---|---|---|---|
| Business metrics | Peak concurrency, unique viewers, watch time, completion rate, retention curve | Did people watch, for how long, and where did they leave? | Player heartbeats, page analytics |
| Experience metrics (QoE) | Startup time, stall count and duration, average bitrate and switches, playback failure rate | Was playback smooth, and how good was the picture? | Player event instrumentation |
| Service metrics (QoS) | CDN hit ratio, origin bandwidth, request error codes, contribution bitrate and dropped frames | Are the delivery path and servers healthy? | CDN logs, origin and ingest monitoring |

QoS is "how the servers and network look"; QoE is "what the viewer actually experiences". The CDN can be perfectly healthy while viewers stall on a weak network or underpowered decoder; conversely, a misbehaving origin path is not necessarily felt by every viewer. At a minimum, your reports should link the business data and experience data of a single playback session, and ideally match them to CDN logs for the same time window.

## 2. Business metrics: state the numerator, denominator, and window

**Concurrency** is the number of sessions playing at a given moment. A common approach is for the player to send a heartbeat at a fixed interval (say every 30 or 60 seconds), count active sessions per minute, and derive the concurrency curve and peak. Distinguish "page open" from "actually playing": decide in advance whether a session in a background tab or a paused video counts. The browser's Page Visibility API helps tell whether the page is visible.

**Viewers** are usually de-duplicated by user ID or device identifier. Enterprise live events often require sign-in or registration, which yields fairly reliable user IDs; anonymous viewing can only be estimated per device or cookie, and cross-device viewing is double-counted.

For **watch time**, look at both the mean and the median. A handful of sessions left running for hours will inflate the mean; the median better represents how long a typical viewer stayed.

**Completion rate** mainly applies to VOD: the share of sessions that reach the end or an agreed threshold. Live has no shared end point, so a **retention curve** is more useful: plot viewers online per minute against the agenda and see how numbers move around the product demo, guest interview, or giveaway. For corporate training replays, use chapters as segments and measure how many viewers reach each chapter.

## 3. Experience metrics: instrument the player

Experience metrics have to be measured on the client, because the server cannot see what happens on the viewer's screen. The HTML standard defines a set of media element events that make a good foundation:

- **Startup time**: start the clock when the user presses play (or autoplay is initiated) and stop it when the `playing` event fires and the picture starts advancing. For more precision, `requestVideoFrameCallback` reports when the first frame is actually presented. Always include the start point in the definition; measuring from page open versus from pressing play can differ a lot.
- **Stalls**: when playback pauses because the buffer runs dry, the `waiting` event fires, and `playing` fires again when playback resumes. The time between them is one stall. Exclude three cases: the wait during startup (it belongs to startup time), buffering right after the user seeks (track it separately as seek wait), and user-initiated pauses.
- **Bitrate and switches**: adaptive bitrate players usually expose the current rendition. Recording time spent at each rendition and the number of switches shows whether viewers are stuck at the low end. For how to design the ladder itself, see [ABR transcoding ladder design](/en/articles/abr-ladder-design/).
- **Dropped frames**: `getVideoPlaybackQuality()` returns total and dropped frame counts. Many dropped frames usually mean the device cannot keep up with decoding or rendering, not that the network is at fault.
- **Playback failures**: record `error` events and error codes such as authorization or manifest-load failures, and compute the share of sessions that requested playback but never rendered a first frame.

When reporting, aggregate events locally and send them in batches with the heartbeat; before the page closes, send the last batch with `navigator.sendBeacon()`. The W3C Beacon specification exists precisely so that these requests are delivered reliably even while the page is unloading.

The **rebuffering ratio** has two common definitions: time-based (mid-playback buffering time ÷ (playing time + buffering time)) and session-based (sessions with at least one stall ÷ all sessions). The first shows overall smoothness, the second how widely viewers were affected; report both and label them. For reducing stalls on weak networks, see [live streaming weak-network optimization](/en/articles/live-weak-network-optimization/).

## 4. Use CMCD to line up client data with CDN logs

Even with complete player instrumentation, troubleshooting often needs one more answer: when this viewer stalled, which CDN node served the request, and what state was that node in? CTA-5004, Common Media Client Data (CMCD), published by CTA WAVE, was designed for this. The player attaches a set of standardized fields to each media request (as headers or query parameters), such as the session ID (`sid`), content ID (`cid`), buffer length (`bl`), encoded bitrate (`br`), measured throughput (`mtp`), stream type (`st`, distinguishing VOD, live, and low-latency live), and the buffer-starvation flag (`bs`). The CTA-5004-B revision also adds an event reporting mode that sends data to third-party collection services on a time interval or when the playback state changes.

With a shared session ID, CDN logs can be joined with player data per session, letting you drill down from "rebuffering is up in one region" to specific nodes and time ranges. Before enabling it, confirm that the player, the CDN, and the log pipeline all recognize these fields, and check whether the query parameters affect the cache key (if they do, exclude the CMCD parameters from the cache key on the CDN so the hit ratio does not drop).

## 5. Putting the metrics to work

- **Before the event**: verify instrumentation during rehearsal, confirm that startup, stall, and heartbeat data show up in the dashboard, and check that every definition matches the previous event.
- **During the event**: watch the concurrency curve, the stalled-session share, and the playback failure rate, with alert thresholds set from your own history rather than numbers borrowed from someone else. If viewers widely report high delay, work through [live latency and protocol choices](/en/articles/live-latency-protocols/).
- **After the event**: the business report covers unique viewers, median watch time, and the retention curve; the engineering review breaks experience metrics down by region, network type, device, and rendition.

Standards bodies are also combining these parameters into models closer to subjective perception; ITU-T P.1203, for example, estimates a quality score for adaptive streaming from bitrate, resolution, stalling, and similar inputs. For most enterprise teams, getting the definitions and instrumentation of the basic metrics right matters more than chasing a single composite score.
